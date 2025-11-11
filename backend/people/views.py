"""people api views"""

from urllib.parse import quote

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from movie.models import Movie
from movie.src.movie_search import MoviePersonSearch
from people.models import Credit, Person
from people.serializers import CreditSerializer, PersonSerializer
from people.src.person_search import SearchMoviePerson, SearchTvPerson
from people.tasks import refresh_single_person
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from tv.models import TVShow
from tv.src.show_search import ShowPersonSearch

from autot.tasks import download_thumbnails
from autot.views import StandardResultsSetPagination


class PersonViewSet(viewsets.ModelViewSet):
    """viewset for persons"""

    serializer_class = PersonSerializer
    queryset = Person.objects.none()
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """get queryset"""
        queryset = Person.objects.all().order_by("name")
        query = self.request.GET.get("q")
        if query:
            queryset = queryset.filter(name__icontains=query)

        return queryset

    def create(self, request, *args, **kwargs):
        """overwrite, refresh immediately on create through API"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)

        instance = serializer.instance
        person_task = refresh_single_person.delay(person_id=instance.id)
        download_thumbnails.delay(depends_on=person_task)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

    @method_decorator(cache_page(settings.CACHE_TTL))
    @action(detail=True, methods=["get"])
    def search_shows(self, request, **kwargs):
        """search shows in remote index"""
        person = self.get_object()
        if not person.tvmaze_id:
            return Response({"message": "Person has not tvmazeid"}, status=400)

        options = ShowPersonSearch().search(tvmaze_person_id=person.tvmaze_id)
        return Response(options)

    @method_decorator(cache_page(settings.CACHE_TTL))
    @action(detail=True, methods=["get"])
    def search_movies(self, request, **kwargs):
        """search movies in remote index"""
        person = self.get_object()
        if not person.the_moviedb_id:
            return Response({"message": "Person has not the_moviedb_id"}, status=400)

        options = MoviePersonSearch().search(the_moviedb_person_id=person.the_moviedb_id)
        return Response(options)


class CreditViewSet(viewsets.ReadOnlyModelViewSet):
    """viewset for credits"""

    serializer_class = CreditSerializer
    queryset = Credit.objects.none()

    def get_queryset(self):
        """filter on credit"""
        queryset = Credit.objects.all()

        person = self.request.GET.get("person")
        if person:
            queryset = queryset.filter(person__id=person)

        show_id = self.request.GET.get("show_id")
        if show_id:
            content_type = ContentType.objects.get_for_model(TVShow)
            queryset = queryset.filter(content_type=content_type, object_id=show_id)

        movie_id = self.request.GET.get("movie_id")
        if movie_id:
            content_type = ContentType.objects.get_for_model(Movie)
            queryset = queryset.filter(content_type=content_type, object_id=movie_id)

        return queryset


class PersonRemoteSearch(APIView):
    """search for persons remotely"""

    @method_decorator(cache_page(settings.CACHE_TTL))
    def get(self, request):
        """make request"""
        query_raw = request.GET.get("q")
        if not query_raw:
            return Response({"message": "missing query string"}, status=400)

        query_encoded = quote(query_raw)

        response = {
            "tv": SearchTvPerson().search(query_encoded),
            "movie": SearchMoviePerson().search(query_encoded),
        }

        return Response(response)

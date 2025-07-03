"""all movie views"""

import json

from django.core.exceptions import FieldError
from django.db.models import F, Q, Value
from django.db.models.functions import Replace
from movie.models import Collection, Movie, MovieRelease, MovieReleaseTarget
from movie.serializers import (
    CollectionSerializer,
    MovieReleaseSerializer,
    MovieReleaseTargetSerializer,
    MovieSerializer,
)
from movie.src.collection import CollectionMissing, MovieDBCollection
from movie.src.movie import MovieDBMovie
from movie.src.movie_search import CollectionId, MovieId
from movie.tasks import import_collection, import_movie, refresh_status
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from autot.models import SearchWord
from autot.src.redis_con import AutotRedis
from autot.src.search import Jackett
from autot.static import MovieProductionState, MovieStatus


class CollectionViewSet(viewsets.ModelViewSet):
    """views for collection"""

    serializer_class = CollectionSerializer
    queryset = Collection.objects.all().order_by("name")

    def create(self, request, *args, **kwargs):
        """import show"""
        data = request.data
        if not data:
            return Response({"message": "missing request body"}, status=400)

        the_moviedb_id = data.get("the_moviedb_id")
        if not the_moviedb_id:
            return Response({"message": "missing the_moviedb_id key"}, status=400)

        tracking = data.get("tracking")
        if tracking is None:
            return Response({"message": "missing tracking key"}, status=400)

        collection = MovieDBCollection(the_moviedb_id=the_moviedb_id).get_collection(tracking=tracking)
        import_collection.delay(the_moviedb_id=the_moviedb_id, tracking=True)
        serializer = CollectionSerializer(collection)

        return Response(serializer.data)

    def get_queryset(self):
        """implement filters"""
        queryset = queryset = Collection.objects.annotate(
            name_sort=Replace(F("name"), Value("The "), Value(""))
        ).order_by("name_sort")

        tracking = self.request.GET.get("tracking")
        if tracking:
            if tracking.lower() == "true":
                queryset = queryset.filter(tracking=True)
            elif tracking.lower() == "false":
                queryset = queryset.filter(tracking=False)

        query = self.request.GET.get("q")
        if query:
            queryset = queryset.filter(name__icontains=query)

        return queryset

    @action(detail=True, methods=["get"])
    def missing(self, request, **kwargs):
        """get missing from collection"""
        collection = self.get_object()
        missing = CollectionMissing(collection).get_missing()
        return Response(missing)


class MovieViewSet(viewsets.ModelViewSet):
    """views for movies"""

    UPDATABLE_FIELDS = {"is_active", "search_keywords", "target_bitrate"}
    VALID_STATUS = [i.name for i in MovieStatus]
    VALID_PRODUCTION = [i.name for i in MovieProductionState]

    serializer_class = MovieSerializer
    queryset = Movie.objects.all().order_by("name")

    def create(self, request, *args, **kwargs):
        """import show"""
        data = request.data
        if not data:
            return Response({"message": "missing request body"}, status=400)

        the_moviedb_id = data.get("the_moviedb_id")
        if not the_moviedb_id:
            return Response({"message": "missing the_moviedb_id key"}, status=400)

        movie, _ = MovieDBMovie(the_moviedb_id=the_moviedb_id).get_movie()
        serializer = MovieSerializer(movie)
        import_movie.delay(the_moviedb_id)

        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """handle update"""
        instance = self.get_object()
        data = request.data

        if set(data.keys()) - self.UPDATABLE_FIELDS:
            message = {"error": "One or more fields cannot be updated."}
            return Response(message, status=400)

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)

        if "search_keywords" in data.keys():
            self._update_m2m(instance)
        else:
            self.perform_update(serializer)

        return Response(serializer.data)

    def _update_m2m(self, instance: Movie) -> None:
        """handle search_keywords"""
        data = self.request.data
        direction = self.request.GET.get("direction")
        ids = [int(i) for i in data["search_keywords"]]
        to_process = SearchWord.objects.filter(id__in=ids)

        if direction == "add":
            for to_add in to_process:
                instance.add_keyword(instance, to_add)

        elif direction == "remove":
            for to_remove in to_process:
                instance.remove_keyword(instance, to_remove)

    def get_queryset(self):
        """get movie queryset"""
        queryset = Movie.objects.all()

        status_query = self.request.GET.get("status")
        if status_query:
            query = Q()
            status_list = status_query.split(",")

            for status_item in status_list:
                if status_item not in self.VALID_STATUS:
                    message = {"error": f"Invalid status field: {status_item}."}
                    raise ValidationError(message)

                if status_item == "n":
                    query |= Q(status__isnull=True)
                else:
                    query |= Q(status=status_item)

            queryset = queryset.filter(query)

        production_state = self.request.GET.get("production_state")
        if production_state:
            if production_state not in self.VALID_PRODUCTION:
                message = {"error": f"Invalid production state field: {production_state}."}
                raise ValidationError(message)

            queryset = queryset.filter(production_state=production_state)

        query = self.request.GET.get("q")
        if query:
            queryset = queryset.filter(name__icontains=query)

        collection = self.request.GET.get("collection")
        if collection:
            queryset = queryset.filter(collection=collection)

        queryset = self._handle_order_by(queryset)

        return queryset

    def _handle_order_by(self, queryset):
        """handle orderby"""
        order_by = self.request.GET.get("order-by")
        if order_by:
            try:
                queryset = queryset.order_by(order_by)
            except FieldError:
                message = {"error": f"Invalid order-by field: {order_by}."}
                raise ValidationError(message)
        else:
            queryset = queryset.annotate(name_sort=Replace(F("name"), Value("The "), Value(""))).order_by(
                "name_sort", "release_date"
            )

        return queryset

    @action(detail=True, methods=["get"])
    def releases(self, request, **kwargs):
        """get movie release"""
        movie = self.get_object()
        movie_releases = MovieRelease.objects.filter(movie=movie)
        if movie_releases:
            serializer = MovieReleaseSerializer(movie_releases, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=True, methods=["post"])
    def torrent(self, request, **kwargs) -> Response:
        """overwrite torrent on episode"""
        movie: Movie = self.get_object()
        data = request.data
        if not data:
            return Response({"message": "missing request body"}, status=400)

        search_id = data.get("search_id")
        if not search_id:
            return Response({"message": "missing search_id"}, status=400)

        search_result = AutotRedis().get_message(f"search:{search_id}")
        if not search_result:
            return Response({"message": "did not find search result"}, status=404)

        result = json.loads(search_result)
        magnet, title = Jackett().extract_magnet(result)
        if not magnet:
            return Response({"message": "failed to extract magnet url"}, status=400)

        movie.add_magnet(magnet, title)
        refresh_status.delay()

        return Response(result)


class MovieReleaseTargetView(APIView):
    """handle movie release targets"""

    def get(self, request):
        """get targets, fallback to default"""

        config = MovieReleaseTarget.objects.first()

        if config:
            target = config.target
        else:
            target = MovieReleaseTarget.DEFAULT

        serializer = MovieReleaseTargetSerializer(target, many=True)
        return Response(serializer.data)

    def post(self, request):
        """update target"""

        serializer = MovieReleaseTargetSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        config = MovieReleaseTarget.objects.first()
        if config:
            config.target = serializer.data
            config.save()
        else:
            MovieReleaseTarget.objects.create(target=serializer.data)

        return Response(serializer.data)


class MovieRemoteSearch(APIView):
    """search for movies"""

    def get(self, request):
        """get request"""
        query = request.GET.get("q")
        if not query:
            return Response({"message": "missing query string"}, status=400)

        response = MovieId().search(query)

        return Response(response)


class CollectionRemoteSearch(APIView):
    """search for collections"""

    def get(self, request):
        """make get request"""
        query = request.GET.get("q")
        if not query:
            return Response({"message": "missing query string"}, status=400)

        response = CollectionId().search(query)

        return Response(response)

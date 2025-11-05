"""people api views"""

from django.contrib.contenttypes.models import ContentType
from movie.models import Movie
from people.models import Credit, Person
from people.serializers import CreditSerializer, PersonSerializer
from rest_framework import viewsets
from tv.models import TVShow

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

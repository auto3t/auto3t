"""people api views"""

from people.models import Credit, Person
from people.serializers import CreditSerializer, PersonSerializer
from rest_framework import viewsets

from autot.views import StandardResultsSetPagination


class PersonViewSet(viewsets.ReadOnlyModelViewSet):
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

        return queryset

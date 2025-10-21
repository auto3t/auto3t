"""people api views"""

from people.models import Credit, Person
from people.serializers import CreditSerializer, PersonSerializer
from rest_framework import viewsets

from autot.views import StandardResultsSetPagination


class PersonViewSet(viewsets.ReadOnlyModelViewSet):
    """viewset for persons"""

    serializer_class = PersonSerializer
    queryset = Person.objects.all()
    pagination_class = StandardResultsSetPagination


class CreditViewSet(viewsets.ReadOnlyModelViewSet):
    """viewset for credits"""

    serializer_class = CreditSerializer
    queryset = Credit.objects.all()

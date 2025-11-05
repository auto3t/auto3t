"""person serializers"""

from artwork.serializers import ArtworkSerializer
from people.models import Credit, Person
from rest_framework import serializers


class PersonSerializer(serializers.ModelSerializer):
    """serialize person"""

    image_person = ArtworkSerializer()
    tvmaze_url = serializers.CharField(required=False)
    the_moviedb_url = serializers.CharField(required=False)
    imdb_url = serializers.CharField(required=False)

    class Meta:
        model = Person
        fields = "__all__"


class CreditSerializer(serializers.ModelSerializer):
    """serialize credit"""

    person = PersonSerializer()
    content_type_display = serializers.CharField(source="content_type.name")
    content_type_str = serializers.CharField(source="content_type.model")
    role_display = serializers.CharField(source="get_role_display")

    class Meta:
        model = Credit
        fields = "__all__"

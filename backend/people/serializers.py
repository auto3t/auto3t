"""person serializers"""

from artwork.serializers import ArtworkSerializer
from people.models import Credit, Person
from rest_framework import serializers
from tv.serializers import TVShowSerializer


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

    SERIALIZER_MAP = {
        ("tv", "tvshow"): TVShowSerializer,
    }

    person = PersonSerializer()
    content_type_display = serializers.CharField(source="content_type.name")
    content_type_str = serializers.CharField(source="content_type.model")
    content_object = serializers.SerializerMethodField()

    class Meta:
        model = Credit
        fields = "__all__"

    def get_content_object(self, obj):
        """dynamic content object serializer"""
        ct = obj.content_type
        key = (ct.app_label, ct.model)
        serializer_class = self.SERIALIZER_MAP.get(key)

        if serializer_class and obj.content_object:
            return serializer_class(obj.content_object, context=self.context).data

        return {"app_label": ct.app_label, "model": ct.model, "id": obj.object_id}

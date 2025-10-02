from rest_framework import serializers
from .models import ContactMessage
from .models import CallRequest

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ("created_at",)




class CallRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallRequest
        fields = ["id", "name", "mobile", "email", "services", "created_at"]
        read_only_fields = ["id", "created_at"]

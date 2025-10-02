# electric_products/serializers_detail.py
from rest_framework import serializers
from .models import Service_Installation, FAQ, Review

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ["id", "question", "answer"]

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "stars", "text", "author", "image"]

class ServiceListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Service_Installation
        fields = ["id", "title", "price", "duration", "rating", "reviews_count", "offer", "image"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

class ServiceDetailSerializer(serializers.ModelSerializer):
    faqs = FAQSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Service_Installation
        fields = [
            "id", "title", "image", "rating", "reviews_count",
            "price", "duration", "offer", "faqs", "reviews"
        ]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

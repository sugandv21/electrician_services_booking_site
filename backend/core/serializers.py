from rest_framework import serializers
from .models import HomeHeroBanner, HomeStatsSection, StatItem

from .models import HomeStepsSection
from .models import HomeReviewsSection, Review
from .models import HomeBrandsSection, BrandLogo
from .models import HomeFAQSection, FAQItem
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "title", "subtitle", "image", "order", "created_at"]

class FAQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQItem
        fields = ["id", "question", "answer"]

class HomeFAQSectionSerializer(serializers.ModelSerializer):
    faqs = FAQItemSerializer(many=True, read_only=True)

    class Meta:
        model = HomeFAQSection
        fields = ["id", "heading", "subheading", "faqs"]


class BrandLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandLogo
        fields = ["id", "image", "name"]

class HomeBrandsSectionSerializer(serializers.ModelSerializer):
    logos = BrandLogoSerializer(many=True, read_only=True)

    class Meta:
        model = HomeBrandsSection
        fields = ["id", "heading", "cta_text", "phone_number", "logos"]


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "stars", "text", "person_image", "person_name", "service"]

class HomeReviewsSectionSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = HomeReviewsSection
        fields = ["id", "heading", "subheading", "created_at", "reviews"]




class HomeStepsSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeStepsSection
        fields = [
            "id",
            "heading",
            "step1_number",
            "step1_title",
            "step1_description",
            "step2_number",
            "step2_title",
            "step2_description",
            "step3_number",
            "step3_title",
            "step3_description",
            "created_at",
        ]



class StatItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatItem
        fields = ["id", "value", "title", "description"]

class HomeStatsSectionSerializer(serializers.ModelSerializer):
    stats = StatItemSerializer(many=True, read_only=True)

    class Meta:
        model = HomeStatsSection
        fields = ["id", "heading", "title", "image1", "image2", "image3", "image4", "stats"]

class HomeHeroBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeHeroBanner
        fields = ["id", "bg_img", "hero_img", "hero_title", "hero_subtitle"]


#--------------------------------
#Callback page
#--------------------------------


from rest_framework import serializers
from .models import CallbackSection1

class CallbackSection1Serializer(serializers.ModelSerializer):
    banner = serializers.SerializerMethodField()
    call_image = serializers.SerializerMethodField()

    class Meta:
        model = CallbackSection1
        fields = [
            "id",
            "banner",
            "title",
            "subtitle",
            "stars_count",
            "reviews_text",
            "call_image",
            "phone_number",
            "feature_cards",
            "updated_at",
        ]

    def get_banner(self, obj):
        request = self.context.get("request")
        if obj.banner:
            return request.build_absolute_uri(obj.banner.url) if request else obj.banner.url
        return None

    def get_call_image(self, obj):
        request = self.context.get("request")
        if obj.call_image:
            return request.build_absolute_uri(obj.call_image.url) if request else obj.call_image.url
        return None


from .models import CallbackSection2

class CallbackSection2Serializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = CallbackSection2
        fields = ["id", "title", "paragraphs", "phone", "image", "updated_at"]
        read_only_fields = ["id", "updated_at"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image:
            try:
                return request.build_absolute_uri(obj.image.url) if request else obj.image.url
            except Exception:
                return obj.image.url
        return None

from .models import CallbackSection3

class CallbackSection3Serializer(serializers.ModelSerializer):
    class Meta:
        model = CallbackSection3
        fields = ["id", "banner_title", "phone", "section_title", "intro", "points", "updated_at"]
        read_only_fields = ["id", "updated_at"]

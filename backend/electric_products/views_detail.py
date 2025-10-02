# electric_products/views_detail.py
from rest_framework import generics
from .models import Service_Installation, FAQ, Review
from .serializers_detail import ServiceListSerializer, ServiceDetailSerializer, FAQSerializer, ReviewSerializer

class ServiceListView(generics.ListAPIView):
    queryset = Service_Installation.objects.all().order_by("id")
    serializer_class = ServiceListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update({"request": self.request})
        return ctx

class ServiceDetailView(generics.RetrieveAPIView):
    queryset = Service_Installation.objects.all()
    serializer_class = ServiceDetailSerializer
    lookup_field = "id"

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update({"request": self.request})
        return ctx

class FAQListView(generics.ListAPIView):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer

class ReviewListView(generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

from rest_framework.routers import DefaultRouter
from .views import SectionViewSet, ServiceViewSet, ContactMessageViewSet
from django.urls import path, include
from .views_detail import ServiceListView, ServiceDetailView, FAQListView, ReviewListView

router = DefaultRouter()
router.register(r"sections", SectionViewSet, basename="section")
router.register(r"services", ServiceViewSet, basename="service")
router.register(r"contacts", ContactMessageViewSet, basename="contact")

urlpatterns = [
    path("", include(router.urls)),
    path("servicesdetail/", ServiceListView.as_view(), name="service-detail"),
    path("servicesinfo/<int:id>/", ServiceDetailView.as_view(), name="service-info"),
    path("faqs/", FAQListView.as_view(), name="faq-list"),
    path("reviews/", ReviewListView.as_view(), name="review-list"),
]
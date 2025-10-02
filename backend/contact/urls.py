from django.urls import path
from .views import ContactMessageCreateView
from .views import CallRequestCreateAPIView

urlpatterns = [
    path("messages/", ContactMessageCreateView.as_view(), name="contact-messages"),
     path("call-requests/", CallRequestCreateAPIView.as_view(), name="call-requests-create"),
]

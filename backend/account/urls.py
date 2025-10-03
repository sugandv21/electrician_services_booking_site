from django.urls import path
from .views import RegisterView, LoginRequestView, VerifyOtpView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login-request/", LoginRequestView.as_view(), name="login_request"),
    path("verify-otp/", VerifyOtpView.as_view(), name="verify_otp"),
]

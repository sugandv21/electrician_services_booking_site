from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
import random
from rest_framework_simplejwt.tokens import RefreshToken

from .models import LoginOTP
from .serializers import RegisterSerializer, LoginRequestSerializer, VerifyOtpSerializer


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        if User.objects.filter(username=phone).exists():
            return Response({"error": "User with this phone already exists"}, status=400)

        user = User.objects.create_user(username=phone, email=email, password=password)

        try:
            send_mail(
                "Registration Successful",
                f"Welcome {email.split('@')[0].capitalize()}! Your registration was successful.",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": f"User created but email failed: {str(e)}"}, status=500)

        return Response({"message": "Registration successful. Check your email."}, status=201)


class LoginRequestView(APIView):
    def post(self, request):
        serializer = LoginRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]

        # ✅ Find user by phone (stored in username)
        try:
            user = User.objects.get(username=phone)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Generate OTP
        otp_code = "%04d" % random.randint(0, 9999)
        LoginOTP.objects.create(phone=phone, otp=otp_code)

        # Send OTP to registered email
        try:
            send_mail(
                "Your OTP Code",
                f"Hello {user.email.split('@')[0].capitalize()},\n\nYour login OTP is: {otp_code}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": f"Failed to send OTP: {str(e)}"}, status=500)

        return Response({"message": f"OTP sent to {user.email}"}, status=200)


class VerifyOtpView(APIView):
    def post(self, request):
        serializer = VerifyOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]
        otp = serializer.validated_data["otp"]

        qs = LoginOTP.objects.filter(phone=phone).order_by("-created_at")
        if not qs.exists():
            return Response({"error": "OTP not found"}, status=404)

        latest = qs.first()
        if not latest.is_valid():
            return Response({"error": "OTP expired"}, status=400)
        if latest.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        latest.delete()

        # Issue tokens
        user = User.objects.get(username=phone)
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login success",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "email": user.email,  # ✅ Include email in response
        }, status=200)

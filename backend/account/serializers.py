from rest_framework import serializers

class RegisterSerializer(serializers.Serializer):
    phone = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class LoginRequestSerializer(serializers.Serializer):
    phone = serializers.CharField()

class VerifyOtpSerializer(serializers.Serializer):
    phone = serializers.CharField()
    otp = serializers.CharField()

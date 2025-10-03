from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from .models import LoginOTP


# Customize the User admin
class CustomUserAdmin(UserAdmin):
    # override list display
    list_display = ("get_mobile", "email", "date_joined", "is_active", "is_staff")
    search_fields = ("username", "email")
    ordering = ("-date_joined",)

    # custom method to rename "username" to "Mobile No"
    def get_mobile(self, obj):
        return obj.username
    get_mobile.short_description = "Mobile No"


# replace default User admin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# OTP admin — also show user email for quick reference
@admin.register(LoginOTP)
class LoginOTPAdmin(admin.ModelAdmin):
    list_display = ("phone", "get_user_email", "otp", "created_at", "expires_at")
    search_fields = ("phone", "otp")

    def get_user_email(self, obj):
        try:
            user = User.objects.get(username=obj.phone)
            return user.email
        except User.DoesNotExist:
            return "-"
    get_user_email.short_description = "User Email"

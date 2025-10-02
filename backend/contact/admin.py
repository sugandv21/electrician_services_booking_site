from django.contrib import admin
from .models import ContactMessage
# contact/admin.py  (or core/admin.py depending on where the model lives)
from django.contrib import admin
from .models import CallRequest   # adjust import if model is in core.models

@admin.register(CallRequest)
class CallRequestAdmin(admin.ModelAdmin):
    list_display = ("name", "mobile", "email", "services", "created_at", "processed")
    list_filter = ("processed", "created_at")
    search_fields = ("name", "mobile", "email", "services")
    readonly_fields = ("created_at",)

    fieldsets = (
        ("Customer Info", {
            "fields": ("name", "mobile", "email")
        }),
        ("Request Details", {
            "fields": ("services", "processed", "created_at")
        }),
    )


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "phone", "created_at")
    readonly_fields = ("created_at",)
    search_fields = ("first_name", "last_name", "email", "phone")

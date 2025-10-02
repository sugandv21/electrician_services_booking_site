# electric_products/admin.py
from django.contrib import admin
from .models import Section, Service, ContactMessage, Service_Installation, FAQ, Review

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("title", "contact_phone")

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("title", "order")

@admin.register(Service_Installation)
class ServiceInstallationAdmin(admin.ModelAdmin):
    list_display = ("title", "price", "rating", "reviews_count")
    search_fields = ("title",)

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("question",)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("author", "stars", "service_display", "short_text")
    search_fields = ("author", "service__title", "service_name")
    list_filter = ("stars",)

    def service_display(self, obj):
        """
        Show a friendly service column that works whether Review has
        - a ForeignKey `service` to Service_Installation (preferred), or
        - a legacy `service_name` CharField.
        """
        # if FK exists and is set, show the related title
        if hasattr(obj, "service") and getattr(obj, "service"):
            # try to show the related object's title safely
            try:
                return getattr(obj.service, "title", str(obj.service))
            except Exception:
                return str(obj.service)
        # fallback to string field `service_name` if present
        if hasattr(obj, "service_name") and getattr(obj, "service_name"):
            return obj.service_name
        return "-"

    service_display.short_description = "Service"

    def short_text(self, obj):
        txt = (obj.text or "")[:75]
        return txt + ("…" if len(txt) > 75 else "")

    short_text.short_description = "Review excerpt"

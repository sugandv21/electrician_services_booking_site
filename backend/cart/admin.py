from django.contrib import admin
from .models import CartItem

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "service", "quantity", "total_price_display")
    list_filter = ("user", "service")
    search_fields = ("user__username", "service__title")
    ordering = ("-id",)

    def total_price_display(self, obj):
        return obj.total_price()
    total_price_display.short_description = "Total Price"


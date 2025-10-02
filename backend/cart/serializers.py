from rest_framework import serializers
from .models import CartItem
from electric_products.serializers_detail import ServiceListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    service = ServiceListSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "service", "quantity", "total_price"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request:
            self.fields["service"].context.update({"request": request})
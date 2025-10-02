# views.py
from django.db import transaction
from rest_framework import generics, status
from rest_framework.response import Response
from .models import CartItem
from .serializers import CartItemSerializer
from electric_products.models import Service_Installation


class CartListCreateView(generics.ListCreateAPIView):
    serializer_class = CartItemSerializer

    def get_queryset(self):
        # If logged in → filter by user
        if self.request.user.is_authenticated:
            return CartItem.objects.filter(user=self.request.user)
        # Guest user → NOTE: this returns all rows with user=None — not per-guest.
        # You should instead use a session key or guest token to separate guest carts.
        return CartItem.objects.filter(user=None)

    def create(self, request, *args, **kwargs):
        service_id = request.data.get("service_id")
        quantity_raw = request.data.get("quantity", 1)

        # Validate service_id
        if not service_id:
            return Response({"error": "service_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate/parse quantity
        try:
            quantity = int(quantity_raw)
        except (ValueError, TypeError):
            return Response({"error": "quantity must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            return Response({"error": "quantity must be >= 1"}, status=status.HTTP_400_BAD_REQUEST)

        # Lookup service
        try:
            service = Service_Installation.objects.get(id=service_id)
        except Service_Installation.DoesNotExist:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

        # Identify owner: authenticated user or guest (None). WARNING: all guests currently share user=None rows.
        owner = request.user if request.user.is_authenticated else None

        # Use atomic block to reduce race conditions
        with transaction.atomic():
            # Try to get or create the cart item
            cart_item, created = CartItem.objects.get_or_create(
                service=service,
                user=owner,
                defaults={"quantity": quantity}
            )

            if not created:
                # Lock the row for update and increment quantity safely
                # Note: select_for_update requires the queryset to include the row; we re-fetch the instance with lock.
                locked_item = CartItem.objects.select_for_update().get(pk=cart_item.pk)
                locked_item.quantity = (locked_item.quantity or 0) + quantity
                locked_item.save()
                serializer = self.get_serializer(locked_item)
                return Response(serializer.data, status=status.HTTP_200_OK)

        # If created
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartItemUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    lookup_field = "id"

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return CartItem.objects.filter(user=self.request.user)
        return CartItem.objects.filter(user=None)

    def update(self, request, *args, **kwargs):
        # Allow partial updates
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

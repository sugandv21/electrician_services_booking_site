# orders/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction

from .models import Order
from .serializers import OrderSerializer

from cart.models import CartItem
from electric_products.models import Service_Installation

@method_decorator(csrf_exempt, name="dispatch")  # keep for local debugging; remove in prod
class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    queryset = Order.objects.all()

    def create(self, request, *args, **kwargs):
        """
        Accepts either:
          - cart_item (pk of CartItem), OR
          - service_id (pk of Service_Installation) + optional quantity

        Uses the serializer only for validating customer fields, then constructs
        the Order object explicitly so we can set snapshot fields reliably.
        """
        data = request.data.copy()

        # Validate customer fields via serializer (this ensures required fields / types)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        cart_item_pk = data.get("cart_item")
        service_id = data.get("service_id")
        quantity_in = data.get("quantity")

        # We'll create the Order inside a transaction where needed
        try:
            with transaction.atomic():
                # If cart_item provided, try to resolve that first
                if cart_item_pk:
                    try:
                        cart_item = CartItem.objects.select_related("service").get(pk=cart_item_pk)
                    except CartItem.DoesNotExist:
                        return Response(
                            {"cart_item": [f'Invalid pk "{cart_item_pk}" - object does not exist.']},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    svc = cart_item.service
                    qty = cart_item.quantity or 1

                    order = Order.objects.create(
                        cart_item=cart_item,
                        service_title=getattr(svc, "title", str(svc)),
                        service_price=getattr(svc, "price", ""),
                        quantity=qty,
                        first_name=validated.get("first_name", ""),
                        last_name=validated.get("last_name", ""),
                        email=validated.get("email", ""),
                        phone=validated.get("phone", ""),
                        address=validated.get("address", ""),
                        service_date=validated.get("service_date"),
                    )

                    # Remove the cart item after snapshot so it's not reusable
                    cart_item.delete()

                    out = OrderSerializer(order)
                    return Response(out.data, status=status.HTTP_201_CREATED)

                # Else try service_id path (guest/local-cart flow)
                if service_id:
                    try:
                        svc = Service_Installation.objects.get(pk=service_id)
                    except Service_Installation.DoesNotExist:
                        return Response(
                            {"service_id": [f'Invalid service_id "{service_id}" - object does not exist.']},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    try:
                        qty = int(quantity_in) if quantity_in is not None else 1
                    except (ValueError, TypeError):
                        qty = 1

                    order = Order.objects.create(
                        cart_item=None,
                        service_title=getattr(svc, "title", str(svc)),
                        service_price=getattr(svc, "price", ""),
                        quantity=qty,
                        first_name=validated.get("first_name", ""),
                        last_name=validated.get("last_name", ""),
                        email=validated.get("email", ""),
                        phone=validated.get("phone", ""),
                        address=validated.get("address", ""),
                        service_date=validated.get("service_date"),
                    )

                    out = OrderSerializer(order)
                    return Response(out.data, status=status.HTTP_201_CREATED)

                # Neither provided -> validation error
                return Response(
                    {"non_field_errors": ["Either 'cart_item' or 'service_id' is required."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except Exception as exc:
            # Log the exception to server console for debugging (you can replace with logger)
            print("OrderCreateView exception:", repr(exc))
            return Response(
                {"detail": "Internal server error while creating order."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

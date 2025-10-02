from django.db import models
from django.contrib.auth.models import User
from electric_products.models import Service_Installation


class CartItem(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="cart_items"
    )
    service = models.ForeignKey(Service_Installation, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def get_price_digits(self):
        """
        Extract numeric value from service.price string.
        Returns 0 if invalid.
        """
        try:
            digits = "".join(c for c in str(self.service.price) if c.isdigit())
            return int(digits) if digits else 0
        except Exception:
            return 0

    def total_price(self):
        """
        Total price = service price * quantity
        """
        return self.get_price_digits() * self.quantity

    def __str__(self):
        return f"{self.service.title} (x{self.quantity})"

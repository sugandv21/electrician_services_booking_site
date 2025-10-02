# electric_products/models.py
from decimal import Decimal, InvalidOperation
from django.db import models

class Section(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.TextField(blank=True)
    image = models.ImageField(upload_to="section_images/", null=True, blank=True)
    contact_phone = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.title

class Service(models.Model):
    section = models.ForeignKey(Section, related_name="services", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    excerpt = models.TextField(blank=True)
    image = models.ImageField(upload_to="service_images/", null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

class ContactMessage(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.created_at}"

class Service_Installation(models.Model):
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to="services/")
    rating = models.FloatField(default=0)
    reviews_count = models.IntegerField(default=0)
    # Keep char price for backward compatibility (e.g. "₹2000") but add a numeric helper
    price = models.CharField(max_length=100)
    duration = models.CharField(max_length=100, blank=True, null=True)
    offer = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.title

    @property
    def price_amount(self):
        """
        Return Decimal numeric value parsed from `price` string.
        Example: "₹2,000" -> Decimal('2000')
        Safe: returns Decimal('0') on parse failure.
        """
        raw = str(self.price or "")
        digits = "".join(ch for ch in raw if (ch.isdigit() or ch == "."))
        try:
            return Decimal(digits) if digits else Decimal("0")
        except (InvalidOperation, ValueError):
            return Decimal("0")

# electric_products/models.py (snippet)

class FAQ(models.Model):
    service = models.ForeignKey(
        Service_Installation,
        related_name="faqs",
        on_delete=models.CASCADE,
        null=True,   # allow null for existing rows
        blank=True,
    )
    question = models.CharField(max_length=255)
    answer = models.TextField()

    def __str__(self):
        return self.question

class Review(models.Model):
    service = models.ForeignKey(
        Service_Installation,
        related_name="reviews",
        on_delete=models.CASCADE,
        null=True,   # allow null for existing rows
        blank=True,
    )
    stars = models.IntegerField(default=5)
    text = models.TextField()
    author = models.CharField(max_length=100)
    image = models.ImageField(upload_to="reviews/", blank=True, null=True)

    def __str__(self):
        return f"{self.author} ({self.stars}⭐)"

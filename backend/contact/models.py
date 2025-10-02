from django.db import models

class ContactMessage(models.Model):
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField()
    address = models.CharField(max_length=255, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.email}"


class CallRequest(models.Model):
    name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=50)
    email = models.EmailField()
    services = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.mobile} ({self.email})"

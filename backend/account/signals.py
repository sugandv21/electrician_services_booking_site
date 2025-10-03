from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def after_user_created(sender, instance, created, **kwargs):
    if created:
        print(f"New user registered: {instance.username}")

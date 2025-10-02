from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from .serializers import ContactMessageSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from .serializers import CallRequestSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class CallRequestSafeAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        logger.info("CallRequestSafe payload: %s", request.data)
        serializer = CallRequestSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning("Serializer invalid: %s", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            obj = serializer.save()
        except Exception as e:
            logger.exception("DB save failed: %s", e)
            return Response({"detail": "db save failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # DO NOT send emails here — this isolates the issue
        return Response({"ok": True, "id": obj.id}, status=status.HTTP_201_CREATED)

class CallRequestCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CallRequestSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save()

            # Prepare email to admin
            admin_email = getattr(settings, "ADMIN_EMAIL", None) or settings.DEFAULT_FROM_EMAIL
            subject_admin = f"New Call Request from {obj.name}"
            message_admin = (
                f"New call request received.\n\n"
                f"Name: {obj.name}\n"
                f"Mobile: {obj.mobile}\n"
                f"Email: {obj.email}\n"
                f"Services: {obj.services}\n"
                f"Received at: {obj.created_at}\n"
            )
            try:
                send_mail(
                    subject=subject_admin,
                    message=message_admin,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[admin_email],
                    fail_silently=False,
                )
            except Exception as e:
                # Log the error - but do not fail the API if email fails
                print("Error sending admin email:", e)

            # Send confirmation email to user (HTML + plain text)
            try:
                subject_user = "We received your call request"
                context = {
                    "name": obj.name,
                    "mobile": obj.mobile,
                    "services": obj.services,
                }
                # render HTML template if you keep one in templates/emails/
                try:
                    html_body = render_to_string("emails/call_request_user.html", context)
                except Exception:
                    html_body = None

                text_body = (
                    f"Hi {obj.name},\n\n"
                    f"Thanks for requesting a callback. We have received your request and will contact you shortly.\n\n"
                    f"Requested services: {obj.services}\n\n"
                    "If you'd like to reach us sooner, reply to this email or call our support.\n\n"
                    "Best regards,\nSupport Team"
                )

                if html_body:
                    email_msg = EmailMessage(
                        subject_user,
                        html_body,
                        settings.DEFAULT_FROM_EMAIL,
                        [obj.email],
                    )
                    email_msg.content_subtype = "html"
                    email_msg.send(fail_silently=True)
                else:
                    send_mail(
                        subject_user,
                        text_body,
                        settings.DEFAULT_FROM_EMAIL,
                        [obj.email],
                        fail_silently=True,
                    )
            except Exception as e:
                print("Error sending user email:", e)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactMessageCreateView(APIView):
    """
    POST endpoint to create ContactMessage, send emails:
    - Notify admin (from user's email; reply_to user's email)
    - Acknowledge user
    """
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save()

            # prepare admin notification email
            admin_subject = f"New contact message from {obj.first_name} {obj.last_name}"
            admin_body = (
                f"New message received:\n\n"
                f"Name: {obj.first_name} {obj.last_name}\n"
                f"Email: {obj.email}\n"
                f"Phone: {obj.phone}\n"
                f"Address: {obj.address}\n\n"
                f"Message:\n{obj.message}\n\n"
                f"Received at: {obj.created_at}\n"
            )

            try:
                # send to admin; set reply_to so admin can reply directly to user
                email_to_admin = EmailMessage(
                    subject=admin_subject,
                    body=admin_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[settings.ADMIN_EMAIL],
                    reply_to=[obj.email],
                )
                email_to_admin.send(fail_silently=False)
            except Exception as e:
                # Log / handle in production. Return partial success if needed.
                return Response(
                    {"detail": "Saved but failed to send admin email", "error": str(e)},
                    status=status.HTTP_201_CREATED
                )

            # send acknowledgement to user
            ack_subject = "We received your message"
            ack_body = (
                f"Hi {obj.first_name},\n\n"
                "Thanks for reaching out. We have received your message and will reply shortly.\n\n"
                "Your message:\n"
                f"{obj.message}\n\n"
                "Regards,\nSupport Team"
            )
            try:
                send_mail(
                    subject=ack_subject,
                    message=ack_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[obj.email],
                    fail_silently=False,
                )
            except Exception:
                # don't fail the whole request if ack mail fails
                pass

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        unread_count = queryset.filter(is_read=False).count()
        return Response({
            'success': True,
            'unread_count': unread_count,
            'data': serializer.data
        })

class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        try:
            notification = Notification.objects.get(id=id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({
                'success': True,
                'message': 'Notification marked as read.',
                'data': NotificationSerializer(notification).data
            })
        except Notification.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Notification not found.'
            }, status=status.HTTP_404_NOT_FOUND)

class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({
            'success': True,
            'message': 'All notifications marked as read.'
        })

class NotificationDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({
            'success': True,
            'message': 'Notification deleted.'
        })


from apps.audit.models import AuditLog
from django.contrib.auth import get_user_model

User = get_user_model()

class SendAdvisorRecommendationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        advisor = request.user
        if advisor.role not in ['FINANCIAL_ADVISOR', 'ADMINISTRATOR'] and not advisor.is_superuser:
            return Response({
                'success': False,
                'message': 'Only financial advisors and administrators can issue recommendations.'
            }, status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get('user_id')
        title = request.data.get('title', 'Advisor Strategic Recommendation')
        message = (request.data.get('message') or '').strip()
        notification_type = request.data.get('notification_type', 'Advisor')

        if not user_id or not message:
            return Response({
                'success': False,
                'message': 'Client ID and recommendation message are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Target client not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        notification = Notification.objects.create(
            user=target_user,
            title=title,
            message=message,
            notification_type=notification_type
        )

        AuditLog.objects.create(
            user=advisor,
            action='ADVISOR_RECOMMENDATION',
            details=f"Advisor {advisor.full_name} issued guidance to {target_user.full_name}: {title}"
        )

        return Response({
            'success': True,
            'message': f'Strategic recommendation dispatched to {target_user.full_name} successfully!',
            'data': NotificationSerializer(notification).data
        }, status=status.HTTP_201_CREATED)

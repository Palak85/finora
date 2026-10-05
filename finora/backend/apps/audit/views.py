from rest_framework import generics
from rest_framework.response import Response
from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.users.permissions import IsAdminUser

class AuditLogListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        return AuditLog.objects.all().select_related('user')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

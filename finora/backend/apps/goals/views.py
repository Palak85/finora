from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Goal
from .serializers import GoalSerializer
from apps.users.permissions import IsOwnerOrAdvisorOrAdmin

class GoalListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = GoalSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or user.is_superuser:
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return Goal.objects.filter(user_id=user_id)
            return Goal.objects.all()
        return Goal.objects.filter(user=user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Financial goal created successfully.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Goal creation failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class GoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdvisorOrAdmin]
    serializer_class = GoalSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or user.is_superuser:
            return Goal.objects.all()
        return Goal.objects.filter(user=user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Goal updated successfully.',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({
            'success': True,
            'message': 'Goal deleted successfully.'
        })

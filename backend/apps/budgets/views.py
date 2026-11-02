from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Budget
from .serializers import BudgetSerializer
from apps.users.permissions import IsOwnerOrAdvisorOrAdmin
from apps.users.models import AdvisorAssignment
from datetime import datetime

class BudgetListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BudgetSerializer

    def _base_qs(self, user, month, year):
        """Return budget queryset for the given month/year, respecting role."""
        if user.role == 'ADMINISTRATOR' or user.is_superuser:
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return Budget.objects.filter(user_id=user_id, month=month, year=year)
            return Budget.objects.filter(month=month, year=year)
        elif user.role == 'FINANCIAL_ADVISOR':
            user_id = self.request.query_params.get('user_id')
            if user_id:
                if AdvisorAssignment.objects.filter(advisor=user, customer_id=user_id).exists():
                    return Budget.objects.filter(user_id=user_id, month=month, year=year)
                return Budget.objects.none()
            assigned_ids = AdvisorAssignment.objects.filter(advisor=user).values_list('customer_id', flat=True)
            return Budget.objects.filter(user_id__in=assigned_ids, month=month, year=year)
        return Budget.objects.filter(user=user, month=month, year=year)

    def get_queryset(self):
        user = self.request.user
        now = datetime.now()
        month = int(self.request.query_params.get('month', now.month))
        year = int(self.request.query_params.get('year', now.year))

        qs = self._base_qs(user, month, year)

        # If no budgets exist for the requested month and no explicit month was
        # provided, fall back to the most recent month that has budget data.
        explicit_month = self.request.query_params.get('month')
        if not qs.exists() and not explicit_month:
            if user.role == 'ADMINISTRATOR' or user.is_superuser:
                user_id = self.request.query_params.get('user_id')
                scope = Budget.objects.filter(user_id=user_id) if user_id else Budget.objects.all()
            elif user.role == 'FINANCIAL_ADVISOR':
                user_id = self.request.query_params.get('user_id')
                if user_id:
                    scope = Budget.objects.filter(user_id=user_id) if AdvisorAssignment.objects.filter(advisor=user, customer_id=user_id).exists() else Budget.objects.none()
                else:
                    assigned_ids = AdvisorAssignment.objects.filter(advisor=user).values_list('customer_id', flat=True)
                    scope = Budget.objects.filter(user_id__in=assigned_ids)
            else:
                scope = Budget.objects.filter(user=user)

            latest = scope.order_by('-year', '-month').first()
            if latest:
                qs = self._base_qs(user, latest.month, latest.year)

        return qs

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
                'message': 'Budget created successfully.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Budget creation failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdvisorOrAdmin]
    serializer_class = BudgetSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMINISTRATOR' or user.is_superuser:
            return Budget.objects.all()
        elif user.role == 'FINANCIAL_ADVISOR':
            assigned_ids = AdvisorAssignment.objects.filter(advisor=user).values_list('customer_id', flat=True)
            return Budget.objects.filter(user_id__in=assigned_ids)
        return Budget.objects.filter(user=user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Budget updated successfully.',
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
            'message': 'Budget deleted successfully.'
        })

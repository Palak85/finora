from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Transaction
from .serializers import TransactionSerializer
from .filters import TransactionFilter
from apps.users.permissions import IsOwnerOrAdvisorOrAdmin

class TransactionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TransactionFilter
    search_fields = ['description', 'reference_id', 'notes', 'category']
    ordering_fields = ['transaction_date', 'amount', 'created_at']
    ordering = ['-transaction_date', '-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or user.is_superuser:
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return Transaction.objects.filter(user_id=user_id).select_related('account', 'user')
            return Transaction.objects.all().select_related('account', 'user')
        return Transaction.objects.filter(user=user).select_related('account', 'user')

    def create(self, request, *args, **kwargs):
        if request.user.role == 'ADMINISTRATOR':
            return Response({
                'success': False,
                'message': 'Security Protection: Administrators cannot add transactions. Transactions can only be viewed.'
            }, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            txn = serializer.save()
            from apps.notifications.models import Notification
            if txn.transaction_type == 'EXPENSE':
                Notification.objects.create(
                    user=request.user,
                    title=f'💳 Expense Recorded: ₹{txn.amount}',
                    message=f'{txn.description} paid via {txn.payment_method} from {txn.account.account_name}.',
                    notification_type='Transaction'
                )
            elif txn.transaction_type == 'INCOME':
                Notification.objects.create(
                    user=request.user,
                    title=f'💰 Income Credited: ₹{txn.amount}',
                    message=f'{txn.description} deposited into {txn.account.account_name}.',
                    notification_type='Transaction'
                )
            return Response({
                'success': True,
                'message': 'Transaction recorded successfully.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Transaction creation failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdvisorOrAdmin]
    serializer_class = TransactionSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or user.is_superuser:
            return Transaction.objects.all().select_related('account', 'user')
        return Transaction.objects.filter(user=user).select_related('account', 'user')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Transaction updated successfully.',
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
            'message': 'Transaction deleted successfully.'
        })

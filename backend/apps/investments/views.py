from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, F
from decimal import Decimal
from django.db import transaction as db_transaction
from django.utils import timezone
from .models import Investment
from .serializers import InvestmentSerializer
from apps.users.permissions import IsOwnerOrAdvisorOrAdmin
from apps.accounts.models import Account
from apps.transactions.models import Transaction
from apps.notifications.models import Notification
from apps.users.models import AdvisorAssignment

class InvestmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InvestmentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMINISTRATOR' or user.is_superuser:
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return Investment.objects.filter(user_id=user_id).select_related('user')
            return Investment.objects.exclude(user__role='ADMINISTRATOR').select_related('user')
        elif user.role == 'FINANCIAL_ADVISOR':
            user_id = self.request.query_params.get('user_id')
            if user_id:
                if AdvisorAssignment.objects.filter(advisor=user, customer_id=user_id).exists():
                    return Investment.objects.filter(user_id=user_id).select_related('user')
                return Investment.objects.none()
            assigned_ids = AdvisorAssignment.objects.filter(advisor=user).values_list('customer_id', flat=True)
            return Investment.objects.filter(user_id__in=assigned_ids).select_related('user')
        return Investment.objects.filter(user=user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        account_id = request.data.get('account') or request.data.get('account_id')
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            qty = Decimal(str(serializer.validated_data['quantity']))
            buy_price = Decimal(str(serializer.validated_data['average_buy_price']))
            total_cost = qty * buy_price

            account = None
            if account_id:
                try:
                    account = Account.objects.get(id=account_id, user=request.user)
                except Account.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'Selected bank account was not found.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                if account.status != 'Active':
                    return Response({
                        'success': False,
                        'message': 'Selected bank account is not active.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                if account.balance < total_cost:
                    return Response({
                        'success': False,
                        'message': f'Insufficient balance in {account.account_name}. Available: ₹{account.balance}, Required: ₹{total_cost}'
                    }, status=status.HTTP_400_BAD_REQUEST)

            with db_transaction.atomic():  # type: ignore
                investment = serializer.save()

                if account:
                    Transaction.objects.create(
                        user=request.user,
                        account=account,
                        transaction_type='INVESTMENT',
                        category='Investment',
                        amount=total_cost,
                        description=f"Purchased {qty} units of {investment.asset_name} ({investment.asset_type})",
                        transaction_date=investment.purchase_date or timezone.now().date(),
                        payment_method='Net Banking'
                    )
                    Notification.objects.create(
                        user=request.user,
                        title='📈 Asset Purchase Executed',
                        message=f'Invested ₹{total_cost} in {investment.asset_name} deducted from {account.account_name}.',
                        notification_type='Investment'
                    )

            return Response({
                'success': True,
                'message': 'Asset purchased and investment added successfully.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Failed to add investment.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class InvestmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdvisorOrAdmin]
    serializer_class = InvestmentSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMINISTRATOR' or user.is_superuser:
            return Investment.objects.all().select_related('user')
        elif user.role == 'FINANCIAL_ADVISOR':
            assigned_ids = AdvisorAssignment.objects.filter(advisor=user).values_list('customer_id', flat=True)
            return Investment.objects.filter(user_id__in=assigned_ids).select_related('user')
        return Investment.objects.filter(user=user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Investment updated successfully.',
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
            'message': 'Investment deleted successfully.'
        })

class PortfolioSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'ADMINISTRATOR' or user.is_superuser:
            user_id = request.query_params.get('user_id')
            if user_id:
                investments = Investment.objects.filter(user_id=user_id)
            else:
                investments = Investment.objects.exclude(user__role='ADMINISTRATOR')
        elif user.role == 'FINANCIAL_ADVISOR':
            user_id = request.query_params.get('user_id')
            if user_id:
                if AdvisorAssignment.objects.filter(advisor=user, customer_id=user_id).exists():
                    investments = Investment.objects.filter(user_id=user_id)
                else:
                    investments = Investment.objects.none()
            else:
                assigned_ids = AdvisorAssignment.objects.filter(advisor=user).values_list('customer_id', flat=True)
                investments = Investment.objects.filter(user_id__in=assigned_ids)
        else:
            investments = Investment.objects.filter(user=user)

        total_invested = investments.aggregate(total=Sum('invested_amount'))['total'] or Decimal('0.00')
        current_value = investments.aggregate(total=Sum('current_value'))['total'] or Decimal('0.00')
        total_profit_loss = current_value - total_invested

        if total_invested > 0:
            return_percentage = round(float((total_profit_loss / total_invested) * Decimal('100.0')), 2)
        else:
            return_percentage = 0.0

        # Allocation breakdown by asset_type
        allocation = []
        asset_types = ['Stocks', 'Mutual Funds', 'Gold', 'Fixed Deposits', 'Cryptocurrency', 'ETF']
        for asset in asset_types:
            val = investments.filter(asset_type=asset).aggregate(total=Sum('current_value'))['total'] or Decimal('0.00')
            pct = round(float((val / current_value) * Decimal('100.0')), 1) if current_value > 0 else 0.0
            allocation.append({
                'asset_type': asset,
                'value': str(val),
                'percentage': pct
            })

        return Response({
            'success': True,
            'data': {
                'total_invested': str(total_invested),
                'current_value': str(current_value),
                'total_profit_loss': str(total_profit_loss),
                'return_percentage': return_percentage,
                'allocation': allocation
            }
        }, status=status.HTTP_200_OK)

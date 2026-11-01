from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from decimal import Decimal
from django.db import transaction as db_transaction
from django.utils import timezone
from .models import Goal
from .serializers import GoalSerializer
from apps.users.permissions import IsOwnerOrAdvisorOrAdmin
from apps.accounts.models import Account
from apps.transactions.models import Transaction
from apps.notifications.models import Notification

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
        account_id = request.data.get('account') or request.data.get('account_id')
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            initial_amount = Decimal(str(serializer.validated_data.get('current_amount', 0)))
            account = None
            if initial_amount > Decimal('0.00') and account_id:
                try:
                    account = Account.objects.get(id=account_id, user=request.user)
                except Account.DoesNotExist:
                    return Response({
                        'success': False,
                        'message': 'Selected funding bank account was not found.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                if account.status != 'Active':
                    return Response({
                        'success': False,
                        'message': 'Selected bank account is not active.'
                    }, status=status.HTTP_400_BAD_REQUEST)

                if account.balance < initial_amount:
                    return Response({
                        'success': False,
                        'message': f'Insufficient balance in {account.account_name}. Available: ₹{account.balance}, Required: ₹{initial_amount}'
                    }, status=status.HTTP_400_BAD_REQUEST)

            with db_transaction.atomic():
                goal = serializer.save()

                if account and initial_amount > Decimal('0.00'):
                    Transaction.objects.create(
                        user=request.user,
                        account=account,
                        transaction_type='EXPENSE',
                        category='Other',
                        amount=initial_amount,
                        description=f"Initial Funding for Goal: {goal.name}",
                        transaction_date=timezone.now().date(),
                        payment_method='Bank Transfer'
                    )
                    Notification.objects.create(
                        user=request.user,
                        title=f'🎯 Goal Established: {goal.name}',
                        message=f'Initial allocation of ₹{initial_amount} funded from {account.account_name}.',
                        notification_type='Goal'
                    )

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


class GoalContributeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        try:
            goal = Goal.objects.get(id=id, user=request.user)
        except Goal.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Financial goal not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        account_id = request.data.get('account') or request.data.get('account_id')
        amount_raw = request.data.get('amount')

        if not account_id or not amount_raw:
            return Response({
                'success': False,
                'message': 'Please select a bank account and enter an amount to contribute.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(str(amount_raw))
            if amount <= Decimal('0.00'):
                return Response({
                    'success': False,
                    'message': 'Contribution amount must be greater than zero.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({
                'success': False,
                'message': 'Invalid contribution amount.'
            }, status=status.HTTP_400_BAD_REQUEST)

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

        if account.balance < amount:
            return Response({
                'success': False,
                'message': f'Insufficient balance in {account.account_name}. Available: ₹{account.balance}, Required: ₹{amount}'
            }, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction.atomic():
            # Deducts from account.balance via Transaction.save()
            Transaction.objects.create(
                user=request.user,
                account=account,
                transaction_type='EXPENSE',
                category='Other',
                amount=amount,
                description=f"Funded Goal: {goal.name}",
                transaction_date=timezone.now().date(),
                payment_method='Bank Transfer'
            )

            goal.current_amount += amount
            if goal.current_amount >= goal.target_amount:
                goal.status = 'ACHIEVED'
            goal.save()

            Notification.objects.create(
                user=request.user,
                title=f'🎯 Goal Funded: {goal.name}',
                message=f'Contributed ₹{amount} from {account.account_name}. Current progress: ₹{goal.current_amount} / ₹{goal.target_amount}.',
                notification_type='Goal'
            )

        account.refresh_from_db()
        return Response({
            'success': True,
            'message': f'Successfully contributed ₹{amount} to {goal.name} from {account.account_name}.',
            'data': {
                'goal': GoalSerializer(goal).data,
                'account_balance': str(account.balance)
            }
        }, status=status.HTTP_200_OK)

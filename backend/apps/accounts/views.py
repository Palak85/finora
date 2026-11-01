from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from decimal import Decimal
from django.db import transaction as db_transaction
from django.utils import timezone
from .models import Account
from .serializers import AccountSerializer
from apps.users.permissions import IsOwnerOrAdvisorOrAdmin
from apps.transactions.models import Transaction
from apps.notifications.models import Notification

class AccountListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AccountSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or user.is_superuser:
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return Account.objects.filter(user_id=user_id)
            return Account.objects.all()
        return Account.objects.filter(user=user)

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
                'message': 'Bank account created successfully.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Account creation failed.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class AccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdvisorOrAdmin]
    serializer_class = AccountSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or user.is_superuser:
            return Account.objects.all()
        return Account.objects.filter(user=user)

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
                'message': 'Account updated successfully.',
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
            'message': 'Account deleted successfully.'
        })


class AccountTransferView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from_account_id = request.data.get('from_account')
        to_account_id = request.data.get('to_account')
        amount_raw = request.data.get('amount')
        description = request.data.get('description', '')

        if not from_account_id or not to_account_id or not amount_raw:
            return Response({
                'success': False,
                'message': 'from_account, to_account, and amount are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if str(from_account_id) == str(to_account_id):
            return Response({
                'success': False,
                'message': 'Cannot transfer money to the same account. Select two different accounts.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(str(amount_raw))
            if amount <= Decimal('0.00'):
                return Response({
                    'success': False,
                    'message': 'Transfer amount must be greater than zero.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({
                'success': False,
                'message': 'Invalid transfer amount.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            from_acc = Account.objects.get(id=from_account_id, user=request.user)
            to_acc = Account.objects.get(id=to_account_id, user=request.user)
        except Account.DoesNotExist:
            return Response({
                'success': False,
                'message': 'One or both accounts do not exist or do not belong to you.'
            }, status=status.HTTP_404_NOT_FOUND)

        if from_acc.status != 'Active' or to_acc.status != 'Active':
            return Response({
                'success': False,
                'message': 'Both accounts must be Active to complete a transfer.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if from_acc.balance < amount:
            return Response({
                'success': False,
                'message': f'Insufficient balance in {from_acc.account_name}. Available: ₹{from_acc.balance}, Required: ₹{amount}'
            }, status=status.HTTP_400_BAD_REQUEST)

        with db_transaction.atomic():
            txn_date = request.data.get('date') or timezone.now().date()
            # Outgoing transaction on from_account (Transaction.save automatically deducts amount)
            Transaction.objects.create(
                user=request.user,
                account=from_acc,
                transaction_type='TRANSFER',
                category='Other',
                amount=amount,
                description=description or f"Transfer to {to_acc.account_name} ({to_acc.masked_account_number})",
                transaction_date=txn_date,
                payment_method='Bank Transfer'
            )

            # Incoming transaction on to_account (Transaction.save with INCOME automatically adds amount)
            Transaction.objects.create(
                user=request.user,
                account=to_acc,
                transaction_type='INCOME',
                category='Other',
                amount=amount,
                description=description or f"Transfer from {from_acc.account_name} ({from_acc.masked_account_number})",
                transaction_date=txn_date,
                payment_method='Bank Transfer'
            )

            Notification.objects.create(
                user=request.user,
                title='🔄 Inter-Account Transfer Completed',
                message=f'Successfully transferred ₹{amount} from {from_acc.account_name} to {to_acc.account_name}.',
                notification_type='Transaction'
            )

        from_acc.refresh_from_db()
        to_acc.refresh_from_db()
        return Response({
            'success': True,
            'message': f'Successfully transferred ₹{amount} from {from_acc.account_name} to {to_acc.account_name}.',
            'data': {
                'from_account': AccountSerializer(from_acc).data,
                'to_account': AccountSerializer(to_acc).data,
            }
        }, status=status.HTTP_200_OK)

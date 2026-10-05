from rest_framework import serializers
from .models import Transaction
from apps.accounts.models import Account
from apps.accounts.serializers import AccountSerializer

class TransactionSerializer(serializers.ModelSerializer):
    account_detail = AccountSerializer(source='account', read_only=True)
    account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all())

    class Meta:
        model = Transaction
        fields = (
            'id', 'user', 'account', 'account_detail',
            'transaction_type', 'amount', 'category',
            'description', 'payment_method', 'transaction_date',
            'notes', 'reference_id', 'is_recurring',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'reference_id', 'created_at', 'updated_at')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Transaction amount must be greater than 0.")
        return value

    def validate_account(self, account):
        user = self.context['request'].user
        if user.role not in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] and not user.is_superuser:
            if account.user != user:
                raise serializers.ValidationError("You do not own this bank account.")
        return account

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return Transaction.objects.create(**validated_data)

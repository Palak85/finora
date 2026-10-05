from rest_framework import serializers
from .models import Budget
from apps.transactions.models import Transaction
from django.db.models import Sum
from decimal import Decimal

class BudgetSerializer(serializers.ModelSerializer):
    spent_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    usage_percentage = serializers.SerializerMethodField()
    overspending_amount = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = (
            'id', 'user', 'category', 'monthly_limit',
            'spent_amount', 'remaining_amount', 'usage_percentage',
            'overspending_amount', 'status', 'month', 'year',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def _get_actual_spent(self, obj):
        # Calculate actual spent sum from user transactions matching category, month, year
        spent = Transaction.objects.filter(
            user=obj.user,
            category__iexact=obj.category,
            transaction_type='EXPENSE',
            transaction_date__month=obj.month,
            transaction_date__year=obj.year
        ).aggregate(total=Sum('amount'))['total']
        return spent or Decimal('0.00')

    def get_spent_amount(self, obj):
        return str(self._get_actual_spent(obj))

    def get_remaining_amount(self, obj):
        spent = self._get_actual_spent(obj)
        remaining = Decimal(str(obj.monthly_limit)) - spent
        return str(max(Decimal('0.00'), remaining))

    def get_usage_percentage(self, obj):
        spent = self._get_actual_spent(obj)
        limit = Decimal(str(obj.monthly_limit))
        if limit <= 0:
            return 0.0
        pct = (spent / limit) * 100
        return round(float(pct), 1)

    def get_overspending_amount(self, obj):
        spent = self._get_actual_spent(obj)
        limit = Decimal(str(obj.monthly_limit))
        over = spent - limit
        return str(max(Decimal('0.00'), over))

    def get_status(self, obj):
        pct = self.get_usage_percentage(obj)
        if pct <= 80.0:
            return 'SAFE'
        elif pct <= 100.0:
            return 'WARNING'
        else:
            return 'EXCEEDED'

    def validate_monthly_limit(self, value):
        if value <= 0:
            raise serializers.ValidationError("Monthly limit must be greater than 0.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return Budget.objects.create(**validated_data)

from rest_framework import serializers
from .models import Goal
from decimal import Decimal

class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = (
            'id', 'user', 'name', 'target_amount',
            'current_amount', 'target_date', 'monthly_contribution',
            'status', 'progress_percentage', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def get_progress_percentage(self, obj):
        target = Decimal(str(obj.target_amount))
        current = Decimal(str(obj.current_amount))
        if target <= 0:
            return 0.0
        pct = (current / target) * Decimal('100.0')
        return round(float(pct), 1)

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than 0.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return Goal.objects.create(**validated_data)

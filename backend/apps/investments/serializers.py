from rest_framework import serializers
from .models import Investment

class InvestmentSerializer(serializers.ModelSerializer):
    user_full_name = serializers.ReadOnlyField(source='user.full_name')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Investment
        fields = (
            'id', 'user', 'user_full_name', 'user_email', 'asset_name', 'asset_type',
            'quantity', 'average_buy_price', 'invested_amount',
            'current_value', 'profit_loss', 'profit_loss_percentage',
            'purchase_date', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'user_full_name', 'user_email', 'invested_amount', 'profit_loss', 'profit_loss_percentage', 'created_at', 'updated_at')

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value

    def validate_average_buy_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Average buy price must be greater than 0.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return Investment.objects.create(**validated_data)

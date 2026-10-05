from rest_framework import serializers
from .models import Account

class AccountSerializer(serializers.ModelSerializer):
    account_number_input = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Account
        fields = (
            'id', 'user', 'account_name', 'account_type',
            'masked_account_number', 'bank_name', 'balance',
            'currency', 'status', 'created_at', 'updated_at',
            'account_number_input'
        )
        read_only_fields = ('id', 'user', 'masked_account_number', 'created_at', 'updated_at')

    def create(self, validated_data):
        acc_num = validated_data.pop('account_number_input', None)
        user = self.context['request'].user
        if acc_num:
            validated_data['account_number'] = acc_num
        return Account.objects.create(user=user, **validated_data)

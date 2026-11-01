from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    user_name = serializers.ReadOnlyField(source='user.full_name')
    module = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = (
            'id', 'user', 'user_email', 'user_name',
            'action', 'module', 'description', 'status',
            'ip_address', 'details', 'timestamp'
        )

    def get_module(self, obj):
        if isinstance(obj.details, dict) and obj.details.get('module'):
            return obj.details['module']
        action = (obj.action or '').upper()
        if 'USER' in action or 'ROLE' in action:
            return 'User Management'
        elif 'LOGIN' in action or 'LOGOUT' in action:
            return 'Authentication'
        elif 'PASSWORD' in action or 'SECURITY' in action:
            return 'Security'
        elif 'ACCOUNT' in action:
            return 'Accounts'
        elif 'TRANSACTION' in action:
            return 'Transactions'
        elif 'BUDGET' in action:
            return 'Budgets'
        elif 'INVESTMENT' in action:
            return 'Investments'
        elif 'REPORT' in action:
            return 'Reports'
        return 'System Administration'

    def get_description(self, obj):
        if isinstance(obj.details, dict) and obj.details.get('description'):
            return obj.details['description']
        user_name = (obj.user.full_name if obj.user and obj.user.full_name else (obj.user.email if obj.user else 'System'))
        action = obj.action
        return f"{user_name} performed {action}"

    def get_status(self, obj):
        if isinstance(obj.details, dict) and obj.details.get('status'):
            return obj.details['status']
        return 'Success'

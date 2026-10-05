from django.contrib import admin
from .models import Account

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('account_name', 'user', 'account_type', 'masked_account_number', 'balance', 'currency', 'status', 'created_at')
    list_filter = ('account_type', 'status', 'currency')
    search_fields = ('account_name', 'bank_name', 'user__email', 'user__full_name')

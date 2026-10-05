from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('reference_id', 'user', 'account', 'transaction_type', 'amount', 'category', 'transaction_date')
    list_filter = ('transaction_type', 'category', 'payment_method', 'is_recurring')
    search_fields = ('reference_id', 'description', 'notes', 'user__email', 'user__full_name')
    date_hierarchy = 'transaction_date'

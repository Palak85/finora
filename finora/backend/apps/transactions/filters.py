import django_filters
from .models import Transaction

class TransactionFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name='transaction_date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='transaction_date', lookup_expr='lte')
    min_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    category = django_filters.CharFilter(field_name='category', lookup_expr='iexact')
    transaction_type = django_filters.CharFilter(field_name='transaction_type', lookup_expr='iexact')
    account = django_filters.NumberFilter(field_name='account__id')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Transaction
        fields = ['category', 'transaction_type', 'payment_method', 'account', 'is_recurring']

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            django_filters.rest_framework.compat.Q(description__icontains=value) |
            django_filters.rest_framework.compat.Q(reference_id__icontains=value) |
            django_filters.rest_framework.compat.Q(notes__icontains=value)
        )

from django.urls import path
from .views import TransactionListCreateView, TransactionDetailView

urlpatterns = [
    path('', TransactionListCreateView.as_view(), name='transaction_list_create'),
    path('<int:id>/', TransactionDetailView.as_view(), name='transaction_detail'),
]

from django.urls import path
from .views import AccountListCreateView, AccountDetailView, AccountTransferView

urlpatterns = [
    path('', AccountListCreateView.as_view(), name='account_list_create'),
    path('transfer/', AccountTransferView.as_view(), name='account_transfer'),
    path('<int:id>/', AccountDetailView.as_view(), name='account_detail'),
]

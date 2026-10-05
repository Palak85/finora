from django.urls import path
from .views import AccountListCreateView, AccountDetailView

urlpatterns = [
    path('', AccountListCreateView.as_view(), name='account_list_create'),
    path('<int:id>/', AccountDetailView.as_view(), name='account_detail'),
]

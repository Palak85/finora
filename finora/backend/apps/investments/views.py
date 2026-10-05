from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, F
from decimal import Decimal
from .models import Investment
from .serializers import InvestmentSerializer
from apps.users.permissions import IsOwnerOrAdvisorOrAdmin

class InvestmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InvestmentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or user.is_superuser:
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return Investment.objects.filter(user_id=user_id)
            return Investment.objects.all()
        return Investment.objects.filter(user=user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Investment added successfully.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Failed to add investment.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class InvestmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdvisorOrAdmin]
    serializer_class = InvestmentSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or user.is_superuser:
            return Investment.objects.all()
        return Investment.objects.filter(user=user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Investment updated successfully.',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({
            'success': True,
            'message': 'Investment deleted successfully.'
        })

class PortfolioSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role in ['ADMINISTRATOR', 'FINANCIAL_ADVISOR'] or user.is_superuser:
            user_id = request.query_params.get('user_id')
            if user_id:
                investments = Investment.objects.filter(user_id=user_id)
            else:
                investments = Investment.objects.filter(user=user)
        else:
            investments = Investment.objects.filter(user=user)

        total_invested = investments.aggregate(total=Sum('invested_amount'))['total'] or Decimal('0.00')
        current_value = investments.aggregate(total=Sum('current_value'))['total'] or Decimal('0.00')
        total_profit_loss = current_value - total_invested

        if total_invested > 0:
            return_percentage = round(float((total_profit_loss / total_invested) * Decimal('100.0')), 2)
        else:
            return_percentage = 0.0

        # Allocation breakdown by asset_type
        allocation = []
        asset_types = ['Stocks', 'Mutual Funds', 'Gold', 'Fixed Deposits', 'Cryptocurrency', 'ETF']
        for asset in asset_types:
            val = investments.filter(asset_type=asset).aggregate(total=Sum('current_value'))['total'] or Decimal('0.00')
            pct = round(float((val / current_value) * Decimal('100.0')), 1) if current_value > 0 else 0.0
            allocation.append({
                'asset_type': asset,
                'value': str(val),
                'percentage': pct
            })

        return Response({
            'success': True,
            'data': {
                'total_invested': str(total_invested),
                'current_value': str(current_value),
                'total_profit_loss': str(total_profit_loss),
                'return_percentage': return_percentage,
                'allocation': allocation
            }
        }, status=status.HTTP_200_OK)

from django.urls import path
from .views import GoalListCreateView, GoalDetailView, GoalContributeView

urlpatterns = [
    path('', GoalListCreateView.as_view(), name='goal_list_create'),
    path('<int:id>/', GoalDetailView.as_view(), name='goal_detail'),
    path('<int:id>/contribute/', GoalContributeView.as_view(), name='goal_contribute'),
]

from django.urls import path
from .views import SignUpAPIView , UserProfileView

urlpatterns = [   
    path('',SignUpAPIView.as_view()),
    path('userProfile/',UserProfileView.as_view()),
    
]
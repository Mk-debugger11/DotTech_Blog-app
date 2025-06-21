from django.urls import path
from .views import BlogPostAPIView , DetailBlogAPIView

urlpatterns = [   
    path('',BlogPostAPIView.as_view()),
    path('<slug:slug>',DetailBlogAPIView.as_view()),
]
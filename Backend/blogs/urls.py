from django.urls import path
from .views import BlogPostAPIView , DetailBlogAPIView , CommentsAPIView

urlpatterns = [   
    path('',BlogPostAPIView.as_view()),
    path('<slug:slug>',DetailBlogAPIView.as_view()),
    path('<slug:slug>/comments/',CommentsAPIView.as_view()),
    path('<slug:slug>/comments/post',CommentsAPIView.as_view()),
]
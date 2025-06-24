from django.urls import path
from .views import BlogPostAPIView , DetailBlogAPIView , CommentsAPIView , LikeAPIView , BookMarkAPIView , LoginAPI

urlpatterns = [   
    path('',BlogPostAPIView.as_view()),
    path('<slug:slug>',DetailBlogAPIView.as_view()),
    path('<slug:slug>/comments/',CommentsAPIView.as_view()),
    path('<slug:slug>/like/',LikeAPIView.as_view()),
    path('<slug:slug>/bookmark/',BookMarkAPIView.as_view()),
    path('login/',LoginAPI.as_view()),
] 
from django.urls import path
from .views import BlogPostAPIView , DetailBlogAPIView , CommentsAPIView , LikeAPIView , BookMarkAPIView , LoginAPI, PostViewAPIView, ShareAPIView, CommentDetailAPIView, TrendingAPIView, CategoryListAPIView, CategoryDetailAPIView, SearchAPIView

urlpatterns = [   
    path('',BlogPostAPIView.as_view()),
    path('categories/', CategoryListAPIView.as_view()),
    path('categories/<slug:slug>/', CategoryDetailAPIView.as_view()),
    path('search/', SearchAPIView.as_view()),
    path('trending/', TrendingAPIView.as_view()),
    path('<slug:slug>',DetailBlogAPIView.as_view()),
    path('<slug:slug>/view/',PostViewAPIView.as_view()),
    path('<slug:slug>/share/',ShareAPIView.as_view()),
    path('<slug:slug>/comments/',CommentsAPIView.as_view()),
    path('comments/<int:id>/', CommentDetailAPIView.as_view()),
    path('<slug:slug>/like/',LikeAPIView.as_view()),
    path('<slug:slug>/bookmark/',BookMarkAPIView.as_view()),
    path('login/',LoginAPI.as_view()),
] 
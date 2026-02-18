from django.urls import path
from .views import SignUpAPIView , UserProfileView, PublicUserProfileView, FollowUserView, UserBlogsView, UserBookmarksView, TopWritersAPIView

urlpatterns = [
    path('',SignUpAPIView.as_view(),name='sign-up'),
    path('top-writers/', TopWritersAPIView.as_view(), name='top-writers'),
    path('userProfile/',UserProfileView.as_view(),name='user-profile'),
    path('<int:pk>/profile/', PublicUserProfileView.as_view(), name='public-profile'),
    path('<int:pk>/follow/', FollowUserView.as_view(), name='follow-user'),
    path('<int:pk>/blogs/', UserBlogsView.as_view(), name='user-blogs'),
    path('<int:pk>/bookmarks/', UserBookmarksView.as_view(), name='user-bookmarks'),
]
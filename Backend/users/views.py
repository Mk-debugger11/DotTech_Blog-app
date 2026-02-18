from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import response , status
from .serializers import SignUp , GetUserProfile
from .models import CustomUser
from rest_framework.permissions import IsAuthenticated

class SignUpAPIView(APIView):
    def get(self, request):
        users = CustomUser.objects.all()
        serializer = SignUp(users, many=True)  # many = True because query has multiple items
        return response.Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = SignUp(data = request.data)
        if serializer.is_valid():
            user = serializer.save()
            return response.Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = GetUserProfile(user)
        return response.Response(serializer.data)

    def patch(self, request):
        from .serializers import UpdateProfileSerializer
        user = request.user
        serializer = UpdateProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class SignUpAPIView(generics.CreateAPIView):
# #  permission_classes = (IsAuthorOrReadonly,) since our model does not have any author field we cant use this permission
#    queryset = CustomUser.objects.all()
#    serializer_class = SignUp

from django.shortcuts import get_object_or_404
from .models import Follow
from .serializers import PublicUserProfileSerializer

class PublicUserProfileView(APIView):
    def get(self, request, pk):
        user = get_object_or_404(CustomUser, pk=pk)
        serializer = PublicUserProfileSerializer(user, context={'request': request})
        return response.Response(serializer.data)

class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        target_user = get_object_or_404(CustomUser, pk=pk)
        if request.user == target_user:
            return response.Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)
            
        follow_obj = Follow.objects.filter(follower=request.user, following=target_user).first()
        if follow_obj:
            # Unfollow
            follow_obj.delete()
            return response.Response({"detail": "Unfollowed successfully", "is_following": False}, status=status.HTTP_200_OK)
        else:
            # Follow
            Follow.objects.create(follower=request.user, following=target_user)
            return response.Response({"detail": "Followed successfully", "is_following": True}, status=status.HTTP_201_CREATED)

from blogs.models import BlogPost
from blogs.serializer import BlogPostSerializer

from blogs.views import StandardResultsSetPagination
from django.db.models import Count

class UserBlogsView(APIView):
    def get(self, request, pk):
        target_user = get_object_or_404(CustomUser, pk=pk)
        
        base_query = BlogPost.objects.select_related('author').prefetch_related('categories').annotate(
            likes_c=Count('likes', distinct=True),
            comments_c=Count('comments', distinct=True),
            bookmarks_c=Count('bookmark', distinct=True)
        )
        
        if request.user.is_authenticated and request.user == target_user:
            blogs = base_query.filter(author=target_user).order_by('-created_at')
        else:
            blogs = base_query.filter(author=target_user, is_published=True).order_by('-created_at')
            
        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(blogs, request)
        serializer = BlogPostSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

from blogs.models import BookMark
class UserBookmarksView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        target_user = get_object_or_404(CustomUser, pk=pk)
        if request.user != target_user:
            return response.Response({"detail": "You do not have permission to view these bookmarks."}, status=status.HTTP_403_FORBIDDEN)
            
        bookmarks = BookMark.objects.filter(author=target_user).select_related('post__author').order_by('-created_at')
        
        posts = []
        for b in bookmarks:
            if b.post:
                posts.append(b.post.id)
                
        # Fetch posts with annotations
        bookmarked_posts = BlogPost.objects.filter(id__in=posts).select_related('author').prefetch_related('categories').annotate(
            likes_c=Count('likes', distinct=True),
            comments_c=Count('comments', distinct=True),
            bookmarks_c=Count('bookmark', distinct=True)
        ).order_by('-created_at')
        
        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(bookmarked_posts, request)
        serializer = BlogPostSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

from datetime import timedelta
from django.utils import timezone
from django.db.models import Count

class TopWritersAPIView(APIView):
    def get(self, request):
        limit = int(request.GET.get('limit', 5))
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        recent_posts = BlogPost.objects.filter(
            is_published=True,
            created_at__gte=thirty_days_ago
        ).annotate(
            likes_c=Count('likes', distinct=True),
            comments_c=Count('comments', distinct=True),
            bookmarks_c=Count('bookmark', distinct=True)
        ).select_related('author')
        
        author_scores = {}
        
        for p in recent_posts:
            author = p.author
            if author.id not in author_scores:
                author_scores[author.id] = {
                    'author': author,
                    'posts_count': 0,
                    'total_views': 0,
                    'total_shares': 0,
                    'total_likes': 0,
                    'total_comments': 0,
                    'total_bookmarks': 0,
                }
            stats = author_scores[author.id]
            stats['posts_count'] += 1
            stats['total_views'] += p.views
            stats['total_shares'] += p.shares
            stats['total_likes'] += p.likes_c
            stats['total_comments'] += p.comments_c
            stats['total_bookmarks'] += p.bookmarks_c
            
        top_writers = []
        for stats in author_scores.values():
            score = (
                stats['total_views'] * 1 +
                stats['total_likes'] * 3 +
                stats['total_comments'] * 5 +
                stats['total_bookmarks'] * 4 +
                stats['total_shares'] * 2 +
                stats['posts_count'] * 10
            )
            stats['writer_score'] = score
            top_writers.append(stats)
            
        top_writers.sort(key=lambda x: x['writer_score'], reverse=True)
        
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('limit', 5))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_writers_stats = top_writers[start:end]
        
        paginated_writers = []
        for i, stats in enumerate(paginated_writers_stats):
            author = stats['author']
            
            is_following = False
            if request.user.is_authenticated:
                is_following = Follow.objects.filter(follower=request.user, following=author).exists()
            
            avatar_url = author.avatar.url if author.avatar else None
            if avatar_url and request:
                avatar_url = request.build_absolute_uri(avatar_url)
                
            paginated_writers.append({
                'id': author.id,
                'name': author.name or 'Anonymous',
                'avatar': avatar_url,
                'bio': author.bio,
                'posts_count': author.UserPost.filter(is_published=True).count(),
                'followers_count': author.followers.count(),
                'total_views': stats['total_views'],
                'writer_score': stats['writer_score'],
                'is_following': is_following,
                'rank': start + i + 1
            })
            
        data = {
            'count': len(top_writers),
            'next': f"?page={page+1}&limit={page_size}" if end < len(top_writers) else None,
            'previous': f"?page={page-1}&limit={page_size}" if page > 1 else None,
            'results': paginated_writers
        }
        return response.Response(data)

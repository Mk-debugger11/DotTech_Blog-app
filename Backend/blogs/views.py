from django.shortcuts import render
from .models import BlogPost , Comments, Likes, BookMark, PostView, Category
from users.models import CustomUser
from rest_framework.views import APIView
from rest_framework import response , status
from .serializer import BlogPostSerializer , CommentSerializer , LikeSerializer ,  BookMarkSerializer ,LoginSerializer, CategorySerializer, AuthorSerializer
from django.shortcuts import get_object_or_404
from .filters import ProductFilter
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
#jwt view
class LoginAPI(APIView):
    def post(self,request):
        data = request.data
        serializer = LoginSerializer(data=data)
        if serializer.is_valid():
            email = serializer.data['email']
            password = serializer.data['password']
            user = authenticate(email = email , password = password)
            if user is None:
                return response.Response({'error: User Not Found'})
        refresh = RefreshToken.for_user(user)
        return response.Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
        

from django.db.models import Q

class CategoryListAPIView(APIView):
    def get(self, request):
        categories = Category.objects.filter(is_active=True).order_by('name')
        serializer = CategorySerializer(categories, many=True)
        return response.Response(serializer.data)

class CategoryDetailAPIView(APIView):
    def get(self, request, slug):
        category = get_object_or_404(Category, slug=slug, is_active=True)
        serializer = CategorySerializer(category)
        return response.Response(serializer.data)

class SearchAPIView(APIView):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return response.Response({"posts": [], "writers": [], "categories": []})

        # Search Posts
        posts = BlogPost.objects.filter(
            Q(is_published=True) & (
                Q(title__icontains=query) |
                Q(content__icontains=query) |
                Q(author__name__icontains=query) |
                Q(categories__name__icontains=query)
            )
        ).distinct()[:10]

        # Search Writers
        writers = CustomUser.objects.filter(
            Q(name__icontains=query) | Q(email__icontains=query) | Q(bio__icontains=query)
        ).distinct()[:5]

        # Search Categories
        categories = Category.objects.filter(
            Q(is_active=True) & (
                Q(name__icontains=query) | Q(description__icontains=query)
            )
        ).distinct()[:5]

        return response.Response({
            "posts": BlogPostSerializer(posts, many=True, context={'request': request}).data,
            "writers": AuthorSerializer(writers, many=True).data,
            "categories": CategorySerializer(categories, many=True).data
        })

from django.db.models import Count
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BlogPostAPIView(APIView):
    def get(self,request):
        posts = BlogPost.objects.filter(is_published=True).select_related('author').prefetch_related('categories').annotate(
            likes_c=Count('likes', distinct=True),
            comments_c=Count('comments', distinct=True),
            bookmarks_c=Count('bookmark', distinct=True)
        ).order_by('-created_at')
        
        search_query = request.GET.get('search', '').strip()
        if search_query:
            posts = posts.filter(
                Q(title__icontains=search_query) |
                Q(categories__name__icontains=search_query) |
                Q(categories__slug__iexact=search_query) |
                Q(author__name__icontains=search_query)
            ).distinct()
            
        filtered_query = ProductFilter(request.GET , queryset = posts).qs
        
        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(filtered_query, request)
        serializer = BlogPostSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def post(self,request):
        if not request.user.is_authenticated:
            return response.Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        serializer = BlogPostSerializer(data = request.data, context={'request':request})
        if serializer.is_valid():
            blog = serializer.save()  # the create method defined in the serializer is called
            return response.Response({"message": "Blog created successfully", "slug": blog.slug}, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def post(self,request):
class DetailBlogAPIView(APIView):
    def get(self,request,slug):
        blog = get_object_or_404(BlogPost,slug = slug)
        serializer = BlogPostSerializer(blog, context={'request': request})
        return response.Response(serializer.data)

    def patch(self, request, slug):
        if not request.user.is_authenticated:
            return response.Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        blog = get_object_or_404(BlogPost, slug=slug)
        if blog.author != request.user:
            return response.Response({"detail": "You do not have permission to edit this post."}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = BlogPostSerializer(blog, data=request.data, partial=True, context={'request':request})
        if serializer.is_valid():
            updated_blog = serializer.save()
            return response.Response({"message": "Blog updated successfully", "slug": updated_blog.slug}, status=status.HTTP_200_OK)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentsAPIView(APIView):
    def get(self, request , slug):
        post = get_object_or_404(BlogPost, slug = slug)
        comments = Comments.objects.filter(post = post)
        serializer = CommentSerializer(comments,many = True)
        return response.Response(serializer.data)
    
    def post(self, request ,slug):
        post = get_object_or_404(BlogPost, slug = slug)
        serializer = CommentSerializer(data = request.data, context = {'request':request, 'post':post})
        if serializer.is_valid():
            serializer.save()
            return response.Response({"message": "User created successfully"})
        return response.Response(serializer.errors)
    
class LikeAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request,slug):
        post = get_object_or_404(BlogPost, slug = slug)
        user = request.user
        like_obj = Likes.objects.filter(post=post, author=user).first()
        if like_obj:
            like_obj.delete()
            likes_count = Likes.objects.filter(post=post).count()
            return response.Response({'liked': False, 'likes_count': likes_count}, status=status.HTTP_200_OK)
        else:
            Likes.objects.create(post=post, author=user)
            likes_count = Likes.objects.filter(post=post).count()
            return response.Response({'liked': True, 'likes_count': likes_count}, status=status.HTTP_201_CREATED)
    
class BookMarkAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request,slug):
        post = get_object_or_404(BlogPost, slug = slug)
        user = request.user
        bookmark_obj = BookMark.objects.filter(post=post, author=user).first()
        if bookmark_obj:
            bookmark_obj.delete()
            bookmarks_count = BookMark.objects.filter(post=post).count()
            return response.Response({'bookmarked': False, 'bookmarks_count': bookmarks_count}, status=status.HTTP_200_OK)
        else:
            BookMark.objects.create(post=post, author=user)
            bookmarks_count = BookMark.objects.filter(post=post).count()
            return response.Response({'bookmarked': True, 'bookmarks_count': bookmarks_count}, status=status.HTTP_201_CREATED)

from .models import PostView
from django.utils import timezone
from datetime import timedelta

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class PostViewAPIView(APIView):
    def post(self, request, slug):
        post = get_object_or_404(BlogPost, slug=slug)
        ip_address = get_client_ip(request)
        user = request.user if request.user.is_authenticated else None

        time_threshold = timezone.now() - timedelta(hours=24)
        
        # Check if view already exists within last 24h
        if user:
            recent_view = PostView.objects.filter(post=post, user=user, created_at__gte=time_threshold).exists()
        else:
            recent_view = PostView.objects.filter(post=post, ip_address=ip_address, created_at__gte=time_threshold).exists()

        if not recent_view:
            PostView.objects.create(post=post, user=user, ip_address=ip_address)
            post.views += 1
            post.save(update_fields=["views"])
            return response.Response({'success': True, 'views_count': post.views}, status=status.HTTP_201_CREATED)
            
        return response.Response({'success': False, 'views_count': post.views, 'detail': 'View already counted recently'}, status=status.HTTP_200_OK)

class ShareAPIView(APIView):
    def post(self, request, slug):
        post = get_object_or_404(BlogPost, slug=slug)
        post.shares += 1
        post.save(update_fields=["shares"])
        return response.Response({'shares_count': post.shares}, status=status.HTTP_200_OK)

class CommentDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, id):
        comment = get_object_or_404(Comments, id=id)
        if comment.author != request.user:
            return response.Response({"detail": "You do not have permission to edit this comment."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CommentSerializer(comment, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return response.Response(serializer.data, status=status.HTTP_200_OK)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        comment = get_object_or_404(Comments, id=id)
        if comment.author != request.user:
            return response.Response({"detail": "You do not have permission to delete this comment."}, status=status.HTTP_403_FORBIDDEN)
        
        comment.delete()
        return response.Response({"detail": "Comment deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

from django.db.models import Count
from django.utils import timezone

class TrendingAPIView(APIView):
    def get(self, request):
        limit = int(request.GET.get('limit', 5))
        
        recent_posts = BlogPost.objects.filter(is_published=True).annotate(
            likes_c=Count('likes', distinct=True),
            comments_c=Count('comments', distinct=True),
            bookmarks_c=Count('bookmark', distinct=True)
        ).order_by('-created_at')[:100]
        
        now = timezone.now()
        scored_posts = []
        
        for p in recent_posts:
            # hours passed since published
            hours = (now - p.created_at).total_seconds() / 3600.0
            hours = max(0, hours)
            
            # Formula: (views + likes*3 + comments*5 + bookmarks*4 + shares*2) / ((hours + 2) ^ 1.5)
            raw_score = (p.views * 1) + (p.likes_c * 3) + (p.comments_c * 5) + (p.bookmarks_c * 4) + (p.shares * 2)
            score = raw_score / ((hours + 2) ** 1.5)
            
            scored_posts.append({'post': p, 'score': score})
            
        scored_posts.sort(key=lambda x: x['score'], reverse=True)
        
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('limit', 5))
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_posts = [item['post'] for item in scored_posts[start:end]]
        
        serializer = BlogPostSerializer(paginated_posts, many=True, context={'request': request})
        
        data = serializer.data
        for i, item in enumerate(data):
            item['rank'] = start + i + 1
            item['trending_score'] = round(scored_posts[start + i]['score'], 2)
            
        res_data = {
            'count': len(scored_posts),
            'next': f"?page={page+1}&limit={page_size}" if end < len(scored_posts) else None,
            'previous': f"?page={page-1}&limit={page_size}" if page > 1 else None,
            'results': data
        }
        return response.Response(res_data)



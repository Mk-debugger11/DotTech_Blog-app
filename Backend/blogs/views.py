from django.shortcuts import render
from .models import BlogPost , Comments
from rest_framework.views import APIView
from rest_framework import response , status
from .serializer import BlogPostSerializer , CommentSerializer , LikeSerializer ,  BookMarkSerializer ,LoginSerializer
from django.shortcuts import get_object_or_404
from .filters import ProductFilter
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
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
        

class BlogPostAPIView(APIView):
    def get(self,request):
        posts = BlogPost.objects.all()
        filtered_query = ProductFilter(request.GET , queryset = posts).qs
        serializer = BlogPostSerializer(filtered_query,many = True)
        return response.Response(serializer.data)
    
    def post(self,request):
        serializer = BlogPostSerializer(data = request.data, context={'request':request})
        if serializer.is_valid():
            serializer.save()  # the create method defined in the serializer is called
            return response.Response({"message": "Blog created successfully"})
        return response.Response(serializer.errors)

    # def post(self,request):
class DetailBlogAPIView(APIView):
    def get(self,request,slug):
        blog = get_object_or_404(BlogPost,slug = slug)
        blog.views+=1
        blog.save(update_fields=["views"])
        serializer = BlogPostSerializer(blog)
        return response.Response(serializer.data)

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
    def post(self,request,slug):
        post = get_object_or_404(BlogPost, slug = slug)
        serializer = LikeSerializer(data = request.data, context = {'request':request, 'post':post})
        if serializer.is_valid():
            serializer.save()
            return response.Response({'message':'Post Like Successfully'})
        return response.Response(serializer.errors)
    
class BookMarkAPIView(APIView):
    def post(self,request,slug):
        post = get_object_or_404(BlogPost, slug = slug)
        serializer = BookMarkSerializer(data = request.data, context = {'request':request, 'post':post})
        if serializer.is_valid():
            serializer.save()
            return response.Response({'message':'Post BookMarked Successfully'})
        return response.Response(serializer.errors)



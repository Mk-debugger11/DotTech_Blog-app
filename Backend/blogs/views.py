from django.shortcuts import render
from .models import BlogPost
from rest_framework.views import APIView
from rest_framework import response , status
from .serializer import BlogPostSerializer
from django.shortcuts import get_object_or_404

class BlogPostAPIView(APIView):
    def get(self,request):
        posts = BlogPost.objects.all()
        serializer = BlogPostSerializer(posts,many = True)
        return response.Response(serializer.data)
    
    def post(self,request):
        serializer = BlogPostSerializer(data = request.data, context={'request':request})
        if serializer.is_valid():
            serializer.save()  # the create method defined in the serializer is called
            return response.Response({"message": "User created successfully"})
        return response.Response(serializer.errors)

    # def post(self,request):
class DetailBlogAPIView(APIView):
    def get(self,request,slug):
        blog = get_object_or_404(BlogPost,slug = slug)
        blog.views+=1
        blog.save(update_fields=["views"])
        serializer = BlogPostSerializer(blog)
        return response.Response(serializer.data)
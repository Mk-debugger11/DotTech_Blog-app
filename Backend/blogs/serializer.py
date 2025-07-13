from rest_framework import serializers
from .models import BlogPost , Comments , Likes , BookMark , Category
from users.models import CustomUser
from django.utils.text import slugify
from rest_framework.response import Response

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id' , 'name')
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
class BlogPostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only = True)
    # created_at = serializers.DateTimeField(format="%d %b %Y")
    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ('author','slug','views')
    
    def create(self,validated_data): # we have to pass the request as a context to the serializer
        user = self.context['request'].user # simple dictionary method
        title = validated_data.get('title')

        newBlog = BlogPost(**validated_data)  # ** converts the dictionary into key-value pairs
        newBlog.author = user
        # adding slug to the database
        base_slug = slugify(title)
        slug = base_slug
        num = 1
        while BlogPost.objects.filter(slug = slug).exists():
            slug = f"{base_slug}-{num}"
            num+=1
        newBlog.slug = slug
        
        # saving the blog
        newBlog.save()
        return newBlog

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comments
        fields = ["author" , "comment" , "created_at"]
        read_only_fields = ['author','post']

    def create(self , validated_data):
        user = self.context['request'].user ## to get the author of the comment
        post = self.context['post']
        #setting the author and post of comment
        new_comment = Comments(**validated_data)
        new_comment.author = user
        new_comment.post = post

        new_comment.save()
        return new_comment
    
class LikeSerializer(serializers.ModelSerializer):
    post = BlogPostSerializer(read_only = True)
    class Meta:
        model = Likes
        fields = "__all__"
        read_only_fields = ['author' , 'post']
    def create(self , validated_data):
        user = self.context['request'].user ## to get the author of the comment
        post = self.context['post']
        if Likes.objects.filter(post=post, author=user).exists():
            return Response({'detail': 'Already liked'}, status=400)
        #setting the author and post of comment
        newLike = Likes(**validated_data)

        newLike.author = user
        newLike.post = post

        newLike.save()
        return newLike

class BookMarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookMark
        fields = "__all__"
        read_only_fields = ['author' , 'post']
    def create(self , validated_data):
        user = self.context['request'].user ## to get the author of the comment
        post = self.context['post']
        if BookMark.objects.filter(post=post, author=user).exists():
            return Response({'detail': 'Already liked'}, status=400)
        #setting the author and post of comment
        newBookMark = BookMark(**validated_data)

        newBookMark.author = user
        newBookMark.post = post

        newBookMark.save()
        return newBookMark

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


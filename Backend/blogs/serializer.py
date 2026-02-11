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
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    bookmarks_count = serializers.SerializerMethodField()
    is_liked_by_user = serializers.SerializerMethodField()
    is_bookmarked_by_user = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_active=True), 
        source='categories', 
        write_only=True, 
        required=False,
        many=True
    )

    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ('author','slug','views', 'shares')
    
    def get_likes_count(self, obj):
        if hasattr(obj, 'likes_c'):
            return obj.likes_c
        return Likes.objects.filter(post=obj).count()

    def get_comments_count(self, obj):
        if hasattr(obj, 'comments_c'):
            return obj.comments_c
        return Comments.objects.filter(post=obj).count()

    def get_bookmarks_count(self, obj):
        if hasattr(obj, 'bookmarks_c'):
            return obj.bookmarks_c
        return BookMark.objects.filter(post=obj).count()

    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Likes.objects.filter(post=obj, author=request.user).exists()
        return False

    def get_is_bookmarked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return BookMark.objects.filter(post=obj, author=request.user).exists()
        return False
    
    def create(self,validated_data):
        user = self.context['request'].user
        title = validated_data.get('title')
        categories = validated_data.pop('categories', [])

        newBlog = BlogPost(**validated_data)
        newBlog.author = user
        # adding slug to the database
        base_slug = slugify(title)
        slug = base_slug
        num = 1
        while BlogPost.objects.filter(slug=slug).exists():
            slug = f'{base_slug}-{num}'
            num += 1
            
        newBlog.slug = slug
        # saving the blog
        newBlog.save()
        
        if categories:
            newBlog.categories.set(categories)
            
        return newBlog

    def update(self, instance, validated_data):
        categories = validated_data.pop('categories', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.save()
        
        if categories is not None:
            instance.categories.set(categories)
            
        return instance

class CommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    
    class Meta:
        model = Comments
        fields = ["id", "author" , "comment" , "created_at"]
        read_only_fields = ['id', 'author','post']

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


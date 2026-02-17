from rest_framework import serializers
from .models import CustomUser, Follow
from blogs.models import Likes , BookMark , BlogPost
from blogs.serializer import BlogPostSerializer
class SignUp(serializers.ModelSerializer):  # for sign up api  
    password = serializers.CharField(write_only=True)
    class Meta:
        model = CustomUser
        fields = '__all__'
        extra_kwargs = {
            'email': {'required': True}
        }
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

class BookMarkedPost(serializers.ModelSerializer):
    post = BlogPostSerializer(read_only = True)
    class Meta:
        model = BookMark
        fields = ["post","author"]

class LikedPost(serializers.ModelSerializer):
    post = BlogPostSerializer(read_only = True)
    class Meta:
        model = Likes
        fields = ["post" , "created_at"]

class GetUserProfile(serializers.ModelSerializer):
    likes = LikedPost(many = True , read_only = True)
    bookmark = BookMarkedPost(many = True, read_only = True)
    UserPost = BlogPostSerializer(many = True , read_only = True)
    class Meta:
        model = CustomUser
        fields = ["id", "name", "email","socialLink" , "dateJoined" , "avatar" ,"password" , "likes" , "bookmark" , "UserPost"]

class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['follower', 'following', 'created_at']

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['name', 'bio', 'website', 'github', 'linkedin', 'avatar']

class PublicUserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    total_likes_received = serializers.SerializerMethodField()
    total_views = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id", "email", "name", "bio", "website", "github", "linkedin", 
            "dateJoined", "avatar", "followers_count", "following_count", 
            "total_likes_received", "total_views", "is_following"
        ]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_total_likes_received(self, obj):
        # Count likes on posts authored by this user
        return sum(post.likes.count() for post in obj.UserPost.all())

    def get_total_views(self, obj):
        return sum(post.views for post in obj.UserPost.all())

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False
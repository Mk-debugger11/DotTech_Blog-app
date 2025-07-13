from rest_framework import serializers
from .models import CustomUser
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
        user = CustomUser(validated_data)
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
        fields = ["email","socialLink" , "dateJoined" , "avatar" ,"password" , "likes" , "bookmark" , "UserPost"]

    # expects data in json format 
    # {
    #     "email": "john.doe@example.com",
    #     "name": "John Doe",
    #      "password": "user@123",
    #     "socialLink": "https://twitter.com/johndoe",
    # }
        
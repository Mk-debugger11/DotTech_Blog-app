from rest_framework import serializers
from .models import BlogPost , Comments
from django.utils.text import slugify
class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ('author','slug')
    
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
        fields = '__all__'
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




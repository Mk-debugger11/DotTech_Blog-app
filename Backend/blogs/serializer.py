from rest_framework import serializers
from .models import BlogPost
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





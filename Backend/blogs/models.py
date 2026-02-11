from django.db import models
# from users.models import CustomUser use the user model directly from settings
from django.utils.text import slugify
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
class BlogPost(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name="UserPost")
    slug = models.SlugField(blank=True,db_default='BlogPost')
    title = models.CharField(max_length=50)
    thumbnail = models.URLField(max_length=500, blank=True, null=True)
    content = models.TextField()
    categories = models.ManyToManyField(Category, blank=True, related_name="posts")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    views = models.IntegerField(default=0)
    shares = models.IntegerField(default=0)

    def __str__(self):
        return self.slug

class Comments(models.Model):
    post = models.ForeignKey(BlogPost,on_delete=models.CASCADE ,related_name='comments') # auto select
    comment = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE) # auto select
    def __str__(self):
        return self.comment

class Likes(models.Model):
    post = models.ForeignKey(BlogPost,on_delete=models.CASCADE ,related_name='likes') # auto select
    author = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name='likes') # auto select
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'author')

class BookMark(models.Model):
    post = models.ForeignKey(BlogPost,on_delete=models.CASCADE ,related_name='bookmark') # auto select
    author = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='bookmark') # auto select
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'author')

class PostView(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='post_views')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['post', 'ip_address', 'created_at']),
            models.Index(fields=['post', 'user', 'created_at']),
        ]


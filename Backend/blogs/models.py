from django.db import models
# from users.models import CustomUser use the user model directly from settings
from django.utils.text import slugify
from django.conf import settings
class BlogPost(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    slug = models.SlugField(blank=True,db_default='BlogPost')
    title = models.CharField(max_length=50)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    views = models.IntegerField()
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
    author = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE) # auto select
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'author')

class BookMark(models.Model):
    post = models.ForeignKey(BlogPost,on_delete=models.CASCADE ,related_name='bookmark') # auto select
    author = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE) # auto select
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'author')


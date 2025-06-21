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

    # save method of Models :-
    # def save(self,*args, **kwargs):   # Logic for creating a unique slug
    #     if not self.slug:
    #         base_slug = slugify(self.title)
    #         slug = base_slug
    #         num = 1
    #         while BlogPost.objects.filter(slug = slug).exists():
    #             slug = f"{base_slug}-{num}"
    #             num+=1
    #         self.slug = slug
    #     super().save(*args, **kwargs)



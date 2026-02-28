import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from blogs.models import BlogPost
from blogs.serializer import BlogPostSerializer

post = BlogPost.objects.first()
if post:
    print(BlogPostSerializer(post).data)
else:
    print("No posts found")

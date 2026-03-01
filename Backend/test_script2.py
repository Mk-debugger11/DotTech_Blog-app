import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from blogs.models import Category
from blogs.serializer import BlogPostSerializer
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.post('/blogs/')
from users.models import CustomUser
request.user = CustomUser.objects.first()

data = {
    'title': 'Test Multiple Categories',
    'content': 'Hello world',
    'category_ids': [Category.objects.first().id]
}

serializer = BlogPostSerializer(data=data, context={'request': request})
if serializer.is_valid():
    blog = serializer.save()
    print("Saved blog categories:", blog.categories.all())
    print("Serializer output:", serializer.data)
else:
    print("Errors:", serializer.errors)

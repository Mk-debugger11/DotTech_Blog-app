from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Category, BlogPost

class BlogModelsTest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            email='author@example.com',
            password='testpassword123',
            name='Test Author'
        )
        
        self.category = Category.objects.create(
            name='Technology',
            slug='technology',
            description='Tech stuff'
        )

    def test_create_category(self):
        self.assertEqual(self.category.name, 'Technology')
        self.assertEqual(self.category.slug, 'technology')

    def test_create_blog_post(self):
        post = BlogPost.objects.create(
            author=self.user,
            title='My First Blog',
            slug='my-first-blog',
            content='This is a test blog post content.'
        )
        post.categories.add(self.category)
        
        self.assertEqual(post.title, 'My First Blog')
        self.assertEqual(post.author.email, 'author@example.com')
        self.assertEqual(post.categories.count(), 1)
        self.assertEqual(post.categories.first().name, 'Technology')

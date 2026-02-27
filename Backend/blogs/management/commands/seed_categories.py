from django.core.management.base import BaseCommand
from blogs.models import Category
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seeds the database with professional categories'

    def handle(self, *args, **kwargs):
        categories = [
            "Web Development",
            "Mobile Development",
            "Artificial Intelligence",
            "Machine Learning",
            "Data Science",
            "Cybersecurity",
            "Cloud Computing",
            "DevOps",
            "System Design",
            "Software Engineering",
            "Programming",
            "Open Source",
            "Startups",
            "Career Growth",
            "Product Management",
            "UI/UX Design",
            "Blockchain",
            "Tech News",
            "Productivity",
            "Entrepreneurship"
        ]

        # First, ensure all existing categories are deleted to start fresh
        self.stdout.write('Wiping existing categories...')
        Category.objects.all().delete()
        
        self.stdout.write('Seeding professional categories...')
        
        for name in categories:
            cat, created = Category.objects.get_or_create(
                name=name,
                defaults={
                    'slug': slugify(name),
                    'description': f'Articles and resources about {name}.',
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Category already exists: {name}'))

        self.stdout.write(self.style.SUCCESS('Successfully seeded categories!'))

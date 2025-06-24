import django_filters
from .models import BlogPost
class ProductFilter(django_filters.FilterSet):
    class Meta:
        model = BlogPost
        fields = {
            'category__name': ['iexact'],
            'title' : ['icontains']
        }
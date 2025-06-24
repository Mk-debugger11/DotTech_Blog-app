from django.contrib import admin

from .models import BlogPost , Comments , Likes , Category

class CommentInline(admin.TabularInline): # this class is saying that comments should be displayed in tabular form
    model = Comments
    extra = 0
class LikeInline(admin.StackedInline):
    model = Likes
    extra = 0

class BlogAdmin(admin.ModelAdmin): # this is modifying the blogpost admin page and adding CommentInline to its inline
    inlines = [LikeInline,CommentInline]

admin.site.register(BlogPost , BlogAdmin)
admin.site.register(Comments)
admin.site.register(Likes)
admin.site.register(Category)
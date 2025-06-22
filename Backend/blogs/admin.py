from django.contrib import admin

from .models import BlogPost , Comments

class CommentInline(admin.TabularInline): # this class is saying that comments should be displayed in tabular form
    model = Comments
    extra = 0

class BlogAdmin(admin.ModelAdmin): # this is modifying the blogpost admin page and adding CommentInline to its inline
    inlines = [CommentInline]

admin.site.register(BlogPost , BlogAdmin)
admin.site.register(Comments)

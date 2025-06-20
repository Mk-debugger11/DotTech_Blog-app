from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser
from .forms import CustomUserChangeForm , CustomUserCreationForm

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    ordering = ('email'), # as we changed the username field we have to reorder the list of fields
    list_display = ("email", "name","socialLink","dateJoined","avatar")
    add_fieldsets = ( # the custom admin was giving error in fieldsets so they needed to be explicitly defined
    ("Adding new User", {
        "fields": ("email", "password1", "password2",'name','socialLink','avatar'),
    })
    ),
    
admin.site.register(CustomUser,CustomUserAdmin)

# sign in means accessing your account 
# while log in means authenticate into existing account

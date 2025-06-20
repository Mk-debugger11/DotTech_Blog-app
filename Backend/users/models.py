from django.db import models
from django.contrib.auth.models import AbstractUser
from .manager import CustomUserManager

class CustomUser(AbstractUser):
    username = None,
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=50, null=True)
    socialLink = models.URLField(null=True, help_text='Connect your social accounts')
    dateJoined = models.DateTimeField(auto_now_add=True)
    avatar = models.ImageField(null=True, upload_to='images/')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # optional

    objects = CustomUserManager()

    def __str__(self):
        return self.email 
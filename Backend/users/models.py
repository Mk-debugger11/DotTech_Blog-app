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

    bio = models.TextField(blank=True, null=True, help_text='Tell us about yourself')
    website = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # optional

    objects = CustomUserManager()

    def __str__(self):
        return self.email 

class Follow(models.Model):
    follower = models.ForeignKey(CustomUser, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(CustomUser, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.email} follows {self.following.email}" 
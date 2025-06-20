from rest_framework import serializers
from .models import CustomUser

class SignUp(serializers.ModelSerializer):  # for sign up api  
    password = serializers.CharField(write_only=True)
    class Meta:
        model = CustomUser
        fields = '__all__'
        extra_kwargs = {
            'email': {'required': True}
        }

    def create(self, validated_data):
        return CustomUser.objects.create(**validated_data)

    # expects data in json format 
    # {
    #     "email": "john.doe@example.com",
    #     "name": "John Doe",
    #      "password": "user@123",
    #     "socialLink": "https://twitter.com/johndoe",
    # }
        
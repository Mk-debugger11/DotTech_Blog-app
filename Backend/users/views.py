from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import response , status
from .serializers import SignUp
from .models import CustomUser

class SignUpAPIView(APIView):
    def get(self, request):
        users = CustomUser.objects.all()
        serializer = SignUp(users, many=True)  # many = True because query has multiple items
        return response.Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = SignUp(data = request.data)
        if serializer.is_valid():
            user = serializer.save()
            return response.Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class SignUpAPIView(generics.CreateAPIView):
# #  permission_classes = (IsAuthorOrReadonly,) since our model does not have any author field we cant use this permission
#    queryset = CustomUser.objects.all()
#    serializer_class = SignUp

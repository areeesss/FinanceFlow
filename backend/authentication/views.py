from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .serializers import UserSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')


class RegisterView(APIView):
    def post(self, request):
        try:
            # Parse JSON data from the request body
            data = request.data
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            # Validate required fields
            if not username or not email or not password:
                return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the username or email already exists
            if User.objects.filter(username=username).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

            # Create the user
            user = User.objects.create_user(username=username, email=email, password=password)
            return Response({
                'message': 'User created successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer

# Set up logging
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """
    Create user account.
    This endpoint is explicitly public - no authentication required.
    """
    logger.info("Signup view called")
    logger.info(f"Request data: {request.data}")
    
    try:
        # Check content type and format of the incoming request
        logger.info(f"Request content type: {request.content_type}")
        logger.info(f"Request headers: {request.headers}")
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            logger.info("Serializer is valid, creating user")
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            logger.info(f"User created successfully with ID: {user.id}")
            
            response_data = {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'full_name': user.full_name
                },
                'access': access_token,
                'refresh': refresh_token,
                'message': 'User registered successfully',
            }
            
            response = Response(response_data, status=status.HTTP_201_CREATED)
            
            return response
        else:
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Exception in signup_view: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
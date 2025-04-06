import logging
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)

class ExemptableJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that can be bypassed for specific endpoints.
    """
    
    def authenticate(self, request):
        # Check if the request is marked as exempt from JWT authentication
        if request.META.get('JWT_AUTH_EXEMPT', False):
            logger.info("Bypassing JWT authentication for exempt endpoint")
            return None
        
        # Proceed with normal JWT authentication
        return super().authenticate(request) 
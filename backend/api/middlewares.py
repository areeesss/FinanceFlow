import logging
from django.conf import settings
from django.http import HttpRequest

logger = logging.getLogger(__name__)

class ExemptJWTAuthenticationMiddleware:
    """
    Custom middleware to exempt specific endpoints from JWT authentication.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Endpoints that should bypass authentication
        self.exempt_urls = getattr(settings, 'REST_FRAMEWORK_EXEMPT_ENDPOINTS', [])
        logger.info(f"JWT authentication exemption middleware initialized with exempt URLs: {self.exempt_urls}")
    
    def __call__(self, request: HttpRequest):
        # Check if the current path matches any exempt URL
        path = request.path.strip('/')
        
        # Log the current path for debugging
        logger.debug(f"Checking path for authentication exemption: {path}")
        
        # Check if the path contains any of our exempt endpoints
        is_exempt = any(exempt_url in path for exempt_url in self.exempt_urls)
        
        if is_exempt:
            logger.info(f"Path {path} is exempt from JWT authentication")
            # Mark this request as not requiring authentication
            request.META['JWT_AUTH_EXEMPT'] = True
        
        response = self.get_response(request)
        return response 
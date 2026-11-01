from rest_framework_simplejwt.authentication import JWTAuthentication

class QueryParamOrHeaderJWTAuthentication(JWTAuthentication):
    """
    Extends JWTAuthentication to accept JWT either via standard Authorization header
    OR via 'token' query parameter (critical for browser file downloads & window.open).
    """
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        token = request.query_params.get('token') if hasattr(request, 'query_params') else request.GET.get('token')
        
        if not auth_header and token:
            try:
                validated_token = self.get_validated_token(token)
                return self.get_user(validated_token), validated_token
            except Exception:
                return None
                
        return super().authenticate(request)


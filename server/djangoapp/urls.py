# Uncomment the imports before you add the code
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

app_name = 'djangoapp'
urlpatterns = [
    # ... (paths for get_cars, get_dealers, etc.) ...
    
    # path for dealer reviews view
    path(route='reviews/dealer/<int:dealer_id>', view=views.get_dealer_reviews, name='dealer_reviews'),

    # path for add a review view
    path(route='add_review', view=views.add_review, name='add_review'),

    # # path for registration

    # path for login
    # path(route='login', view=views.login_user, name='login'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
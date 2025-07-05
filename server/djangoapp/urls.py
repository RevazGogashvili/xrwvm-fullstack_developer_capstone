# djangoapp/urls.py

# Uncomment the imports below before you add the code
from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views # This import is correct for djangoapp/views.py

app_name = 'djangoapp'
urlpatterns = [
    # Path for fetching car models
    path('get_cars', views.get_cars, name='get_cars'),

    # Paths for getting all dealers and dealers by state
    path('get_dealers', views.get_dealerships, name='get_dealers'),
    path('get_dealers/<str:state>', views.get_dealerships, name='get_dealers_by_state'),

    # Path for getting a specific dealer's details (ADDED/CORRECTED)
    path(route='dealer/<int:dealer_id>', view=views.get_dealer_details, name='dealer_details'),

    # Path for dealer reviews view
    path(route='reviews/dealer/<int:dealer_id>', view=views.get_dealer_reviews, name='dealer_details'),

    # Path for add a review view
    path(route='add_review', view=views.add_review, name='add_review'),

    # Path for registration
    path(route='register', view=views.registration, name='register'),

    # Path for login
    path(route='login', view=views.login_user, name='login'),

    # Path for logout (commonly added with login/register)
    path(route='logout', view=views.logout_request, name='logout'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
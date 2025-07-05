# djangoapp/urls.py

from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from . import views

app_name = 'djangoapp'
urlpatterns = [
    # Path for fetching car models
    path('get_cars', views.get_cars, name='get_cars'),

    # Paths for getting all dealers and dealers by state
    path('get_dealers', views.get_dealerships, name='get_dealers'),
    path('get_dealers/<str:state>', views.get_dealerships, name='get_dealers_by_state'),

    # Path for getting a specific dealer's details
    path('dealer/<int:dealer_id>', views.get_dealer_details, name='get_dealer_details'),

    # Path for dealer reviews view
    path('reviews/dealer/<int:dealer_id>', views.get_dealer_reviews, name='dealer_reviews'),

    # --- CORRECTED to point to the new 'post_review' view function ---
    path('add_review', views.add_review, name='add_review'),
    # --- END CORRECTION ---

    # Path for registration
    path('register', views.registration, name='register'),

    # Path for login
    path('login', views.login_user, name='login'),

    # Path for logout
    path('logout', view=views.logout_request, name='logout'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# djangoapp/views.py

from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import logout, login, authenticate
import json
from django.views.decorators.csrf import csrf_exempt
# from datetime import datetime # Only import if actually used

# Import all restapis functions
from .restapis import get_request, analyze_review_sentiments, post_review

# Assuming you have a populate.py with an initiate function
from .populate import initiate 

# Set up logging
import logging
logger = logging.getLogger(__name__)

# This is an example of how to use the `initiate` function
# You might call this from a management command or a specific URL for setup
# initiate() 

# --- Existing Views (Modified/Expanded with explicit status codes) ---

# Create a `get_dealer_reviews` view to render the reviews of a dealer
def get_dealer_reviews(request, dealer_id):
    # if dealer id has been provided
    if(dealer_id):
        endpoint = "/fetchReviews/dealer/"+str(dealer_id)
        reviews = get_request(endpoint)
        for review_detail in reviews:
            response = analyze_review_sentiments(review_detail['review'])
            # print(response) # For debugging, consider using logger.info. Use logger.debug instead.
            review_detail['sentiment'] = response['sentiment']
        return JsonResponse({"status":200,"reviews":reviews}, status=200) # Added status=200
    else:
        return JsonResponse({"status":400,"message":"Bad Request"}, status=400) # Added status=400

# Create a `add_review` view to submit a review
@csrf_exempt # Use this if your frontend doesn't send CSRF tokens or you manage CSRF differently
def add_review(request):
    if request.user.is_anonymous == False:
        data = json.loads(request.body)
        try:
            # Add user_id to the data if your API expects it
            data['id'] = request.user.id 
            response = post_review(data) # Assuming post_review can handle the new review data
            return JsonResponse({"status":200, "message": "Review posted successfully"}, status=200) # Added status=200
        except Exception as e:
            logger.error(f"Error in posting review: {e}")
            return JsonResponse({"status":401,"message":"Error in posting review"}, status=401) # Added status=401
    else:
        return JsonResponse({"status":403,"message":"Unauthorized"}, status=403) # Added status=403

# --- NEWLY ADDED/IMPLEMENTED VIEWS (with explicit status codes and logging) ---

# Get Dealers View
def get_dealers(request, state=""):
    """
    Fetches dealers, optionally filtered by state.
    Assumes your external API has endpoints like /fetchDealers and /fetchDealers/<state>
    """
    try:
        if state:
            endpoint = "/fetchDealers/state/" + str(state)
        else:
            endpoint = "/fetchDealers"
        
        dealers = get_request(endpoint)
        if dealers:
            return JsonResponse({"status": 200, "dealers": dealers}, status=200) # Added status=200
        else:
            return JsonResponse({"status": 404, "message": "No dealers found."}, status=404) # Added status=404
    except Exception as e:
        logger.error(f"Error fetching dealers: {e}")
        return JsonResponse({"status": 500, "message": "Failed to fetch dealers from external API."}, status=500) # Added status=500

# Login User View
@csrf_exempt
def login_user(request):
    logger.debug(f"Login request received: {request.body}") # Added for debugging
    try:
        data = json.loads(request.body)
        username = data.get('userName') # Use .get() for safer access
        password = data.get('password') # Use .get() for safer access

        if not username or not password:
            logger.warning("Missing username or password in login request.")
            # Return HTTP 400 for a bad request (missing data)
            return JsonResponse({"status": 400, "message": "Username and password are required."}, status=400)

        logger.debug(f"Attempting to authenticate user: {username}") # Added for debugging
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            logger.info(f"User {username} authenticated and logged in successfully.") # Added for debugging
            # Return HTTP 200 for success
            return JsonResponse({"status": 200, "userName": username, "message": "Login successful"}, status=200)
        else:
            logger.warning(f"Authentication failed for user: {username}") # Added for debugging
            # Return HTTP 401 for unauthorized when authentication fails
            return JsonResponse({"status": 401, "message": "Invalid credentials"}, status=401) # <-- **CRITICAL FIX HERE**
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in login request: {e}", exc_info=True) # Added for debugging
        return JsonResponse({"status": 400, "message": "Invalid JSON format in request body."}, status=400)
    except Exception as e:
        logger.error(f"An unexpected error occurred during login: {e}", exc_info=True) # Added for debugging
        return JsonResponse({"status": 500, "message": "An internal server error occurred."}, status=500)

# Logout User View
def logout_request(request):
    # Log out the user
    logout(request)
    # Return HTTP 200 for success
    return JsonResponse({"status": 200, "message": "Logged out successfully"}, status=200) # Added status=200

# Registration View
@csrf_exempt
def registration(request):
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    first_name = data['firstName']
    last_name = data['lastName']
    email = data['email']

    if User.objects.filter(username=username).exists():
        # Return HTTP 409 for conflict (username already exists)
        return JsonResponse({"status": 409, "message": "Username already exists"}, status=409) # Added status=409
    
    try:
        user = User.objects.create_user(username=username, password=password, 
                                        first_name=first_name, last_name=last_name, email=email)
        login(request, user) # Optionally log in the user immediately after registration
        # Return HTTP 200 for success
        return JsonResponse({"status": 200, "message": "User successfully registered and logged in"}, status=200) # Added status=200
    except Exception as e:
        logger.error(f"Error during registration: {e}")
        # Return HTTP 500 for server error
        return JsonResponse({"status": 500, "message": "Error during registration."}, status=500) # Added status=500

# --- NEW FUNCTION ADDED HERE ---
def get_cars(request):
    """
    Fetches car models from the external API.
    """
    logger.debug("get_cars view called.")
    try:
        # Assuming your external API has an endpoint like /cars or /fetchCars
        # Adjust this endpoint to what your external API actually expects for car data
        endpoint = "/cars" # <-- VERIFY THIS EXTERNAL API ENDPOINT!
        cars = get_request(endpoint) # This calls your restapis.py function

        if cars:
            # Your frontend expects the key 'CarModels' in the response JSON
            # Ensure the structure matches what 'get_request' returns from the external API
            # For example, if external API returns a list of car objects:
            # [{"id":1, "CarMake": "Toyota", "CarModel": "Camry"}, ...]
            # Then you'll need to wrap it if your frontend specifically wants {"CarModels": [...]}.
            # If the external API already gives {"CarModels": [...]}, then just return it.
            
            # Assuming 'cars' is already a list of car objects like:
            # [{"id": 1, "CarMake": "Toyota", "CarModel": "Camry", ...}, ...]
            # And you want to return {"CarModels": [ ... ]}
            return JsonResponse({"status": 200, "CarModels": cars}, status=200)
        else:
            logger.warning("No car models found from external API.")
            return JsonResponse({"status": 404, "message": "No car models found."}, status=404)
    except Exception as e:
        logger.error(f"Error fetching car models: {e}", exc_info=True)
        return JsonResponse({"status": 500, "message": "Failed to fetch car models from external API."}, status=500)

# --- Other potential views like 'get_dealers_by_id' would also go here ---
# def get_dealer_details(request, dealer_id):
#     endpoint = "/fetchDealer/" + str(dealer_id)
#     dealer = get_request(endpoint)
#     if dealer:
#         return JsonResponse({"status": 200, "dealer": dealer}, status=200)
#     else:
#         return JsonResponse({"status": 404, "message": "Dealer not found."}, status=404)
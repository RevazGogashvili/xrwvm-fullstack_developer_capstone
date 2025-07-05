# djangoapp/views.py

from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import logout, login, authenticate
import json
from django.views.decorators.csrf import csrf_exempt
from .models import CarMake, CarModel

# Import all restapis functions
from .restapis import get_request, analyze_review_sentiments, post_review

# Assuming you have a populate.py with an initiate function
from .populate import initiate 

# Set up logging
import logging
logger = logging.getLogger(__name__)

# --- Existing Views ---

def get_dealer_reviews(request, dealer_id):
    # if dealer id has been provided
    if(dealer_id):
        endpoint = "/fetchReviews/dealer/"+str(dealer_id)
        reviews = get_request(endpoint)
        for review_detail in reviews:
            response = analyze_review_sentiments(review_detail['review'])
            print(response)
            review_detail['sentiment'] = response['sentiment']
        return JsonResponse({"status":200,"reviews":reviews})
    else:
        return JsonResponse({"status":400,"message":"Bad Request"})

# --- add_review function replaced exactly as requested ---
def add_review(request):
    if(request.user.is_anonymous == False):
        data = json.loads(request.body)
        try:
            response = post_review(data)
            return JsonResponse({"status":200})
        except:
            return JsonResponse({"status":401,"message":"Error in posting review"})
    else:
        return JsonResponse({"status":403,"message":"Unauthorized"})
# --- End of replaced function ---


def get_dealerships(request, state="All"):
    if(state == "All"):
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/"+state
    dealerships = get_request(endpoint)
    return JsonResponse({"status":200,"dealers":dealerships})

# Login User View
@csrf_exempt
def login_user(request):
    try:
        data = json.loads(request.body)
        username = data.get('userName')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"status": 200, "userName": username, "message": "Login successful"}, status=200)
        else:
            return JsonResponse({"status": 401, "message": "Invalid credentials"}, status=401)
    except Exception as e:
        logger.error(f"An unexpected error occurred during login: {e}", exc_info=True)
        return JsonResponse({"status": 500, "message": "An internal server error occurred."}, status=500)

# Logout User View
def logout_request(request):
    logout(request)
    return JsonResponse({"status": 200, "message": "Logged out successfully"}, status=200)

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
        return JsonResponse({"status": 409, "message": "Username already exists"}, status=409)
    try:
        user = User.objects.create_user(username=username, password=password, 
                                        first_name=first_name, last_name=last_name, email=email)
        login(request, user)
        return JsonResponse({"status": 200, "message": "User successfully registered and logged in"}, status=200)
    except Exception as e:
        logger.error(f"Error during registration: {e}")
        return JsonResponse({"status": 500, "message": "Error during registration."}, status=500)

# get_cars function
def get_cars(request):
    count = CarMake.objects.filter().count()
    if(count == 0):
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = []
    for car_model in car_models:
        cars.append({"CarModel": car_model.name, "CarMake": car_model.car_make.name})
    return JsonResponse({"CarModels":cars})

# get_dealer_details function
def get_dealer_details(request, dealer_id):
    if(dealer_id):
        endpoint = "/fetchDealer/"+str(dealer_id)
        dealership = get_request(endpoint)
        return JsonResponse({"status":200,"dealer":dealership})
    else:
        return JsonResponse({"status":400,"message":"Bad Request"})
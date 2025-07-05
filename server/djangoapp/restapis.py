# djangoapp/restapis.py

import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# This 'backend_url' should be the base URL of your *EXTERNAL MICROSERVICE*
backend_url = os.getenv('backend_url', default="http://localhost:3030")

# Debugging print to confirm the loaded backend_url
print(f"DEBUG (restapis.py): Loaded backend_url for external API: '{backend_url}'")

# Sentiment analyzer URL (assuming this is a separate service)
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/")

# get_request function
def get_request(endpoint, **kwargs):
    params = ""
    if(kwargs):
        for key,value in kwargs.items():
            params=params+key+"="+value+"&"

    request_url = backend_url+endpoint+"?"+params

    print("GET from {} ".format(request_url))
    try:
        # Call get method of requests library with URL and parameters
        response = requests.get(request_url)
        return response.json()
    except Exception as e:
    # If any error occurs
    print(f"Network exception occurred: {e}")
    return None # Explicitly return None on failure


# --- analyze_review_sentiments function with the fix ---
def analyze_review_sentiments(text):
    request_url = sentiment_analyzer_url+"analyze/"+text
    try:
        # Call get method of requests library with URL and parameters
        response = requests.get(request_url)
        return response.json()
    except Exception as err:
        print(f"Unexpected error in analyze_review_sentiments: {err}")
        # --- THIS IS THE FIX ---
        # Instead of returning None, return a default dictionary.
        # This prevents the TypeError in the calling view.
        return {"sentiment": "unknown"}
# --- End of corrected function ---


# post_review function
def post_review(data_dict):
    request_url = backend_url+"/insert_review"
    try:
        response = requests.post(request_url,json=data_dict)
        print(response.json())
        return response.json()
    except:
        print("Network exception occurred")

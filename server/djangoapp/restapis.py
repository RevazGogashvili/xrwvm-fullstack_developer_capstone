# djangoapp/restapis.py

import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# This 'backend_url' should be the base URL of your *EXTERNAL MICROSERVICE*
# (e.g., your IBM Cloud backend that serves dealers, cars, and accepts reviews)
# It is NOT your Django server's URL.
# Ensure there is NO SPACE after the '=' in your .env file
# e.g., backend_url=https://gogashvilire-3030.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai
backend_url = os.getenv('backend_url', default="http://localhost:3030")

# Debugging print to confirm the loaded backend_url
print(f"DEBUG (restapis.py): Loaded backend_url for external API: '{backend_url}'")

# Sentiment analyzer URL (assuming this is a separate service)
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/")

def get_request(endpoint, **kwargs):
    """
    Makes a GET request to the specified external API endpoint.
    :param endpoint: The API endpoint (e.g., "/cars", "/fetchDealers").
    :param kwargs: Optional query parameters.
    """
    params = ""
    if kwargs:
        # Build query parameters string (e.g., "key1=value1&key2=value2")
        for key, value in kwargs.items():
            params += f"{key}={value}&"
    
    request_url = backend_url + endpoint
    if params:
        # Remove trailing '&' if any
        request_url = request_url + "?" + params.rstrip('&')

    # Debugging print to show the full URL being requested from the external API
    print(f"DEBUG (restapis.py - get_request): Attempting GET from external API: '{request_url}'")
    
    try:
        # Call get method of requests library with URL and parameters
        response = requests.get(request_url)
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
        return response.json()
    except requests.exceptions.RequestException as e:
        # --- THIS IS THE LINE YOU ASKED FOR ---
        print(f"ERROR (restapis.py - get_request): Network exception occurred for '{request_url}': {e}")
        # --- ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ---
        return None # Return None on error

def analyze_review_sentiments(text):
    """
    Calls the sentiment analyzer service to get sentiment for a review text.
    """
    # Ensure the text is properly URL-encoded if it contains special characters
    # For simplicity, assuming text is clean or sentiment_analyzer_url handles it.
    request_url = sentiment_analyzer_url + "analyze/" + text
    print(f"DEBUG (restapis.py - analyze_review_sentiments): GET from sentiment analyzer: '{request_url}'")
    try:
        response = requests.get(request_url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"ERROR (restapis.py - analyze_review_sentiments): Network exception occurred for '{request_url}': {e}")
        return {"sentiment": "unknown"} # Return a default object on failure

def post_review(data_dict):
    """
    Posts a new review to the external API.
    :param data_dict: Dictionary containing review data.
    """
    request_url = backend_url + "/insert_review"
    print(f"DEBUG (restapis.py - post_review): Attempting POST to external API: '{request_url}' with data: {data_dict}")
    try:
        response = requests.post(request_url, json=data_dict)
        response.raise_for_status()
        print(f"DEBUG (restapis.py - post_review): Response from external API: {response.json()}")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"ERROR (restapis.py - post_review): Network exception occurred for '{request_url}': {e}")
        # Return a structured error response that can be handled by the caller
        return {"status": "error", "message": f"Network exception: {e}"}
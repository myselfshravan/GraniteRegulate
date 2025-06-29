import os
from ibm_watsonx_ai import APIClient
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference

# Correct instantiation of Credentials
credentials = Credentials(
    url="https://us-south.ml.cloud.ibm.com",  # Correct URL format
    api_key=os.environ.get("IBM_API_KEY", "default-api-key-if-not-set")  # Loaded from environment variable
)

# Initialize the API client with credentials
client = APIClient(credentials)

# Parameters for the inference
params = {
    "time_limit": 10000,
    "max_completion_tokens": 100  # Use max_completion_tokens instead of max_new_token
}

# Specify the model to use
model_id = "ibm/granite-3-3-8b-instruct"  
project_id = os.environ.get("IBM_PROJECT_ID", "default-project-id-if-not-set")  # Loaded from environment variable
space_id = None  # Optional, if not using a specific space
verify = False  # Option to disable SSL verification (optional)

# Instantiate ModelInference with the parameters and API client
model = ModelInference(
    model_id=model_id,
    api_client=client,
    params=params,
    project_id=project_id,
    space_id=space_id,
    verify=verify,
)

# Messages that you want to pass for inference
messages = [
    {
        "role": "system",
        "content": "You are a helpful assistant."
    },
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "How far is Paris from Bangalore?"
            }
        ]
    },
    {
        "role": "assistant",
        "content": "The distance between Paris, France, and Bangalore, India, is approximately 7,800 kilometers (4,850 miles)."
    },
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "What is the flight distance?"
            }
        ]
    }
]

# Perform the inference and capture the response
response = model.chat(messages=messages)

# Print the response (formatted output)
print("\nResponse from the model:")
for choice in response['choices']:
    print(f"Assistant: {choice['message']['content']}")
    
# Additional useful info for debugging
print("\nModel Information:")
print(f"Model ID: {response['model_id']}")
print(f"Usage Information: {response['usage']}")

import os
from dotenv import load_dotenv
from ibm_watsonx_ai.foundation_models import Model
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

# Load environment variables from .env file
load_dotenv()

# --- WatsonX AI Configuration ---
api_key = os.environ.get("IBM_API_KEY")
project_id = os.environ.get("IBM_PROJECT_ID")

if not api_key or not project_id:
    raise ValueError("IBM_API_KEY and IBM_PROJECT_ID must be set in your .env file.")

creds = {
    "url": "https://us-south.ml.cloud.ibm.com",
    "apikey": api_key
}

# --- Model Parameters ---
# It's better to define these once and reuse them
# Note: Increased max_tokens for more detailed analysis
params = {
    GenParams.MAX_NEW_TOKENS: 512,
    GenParams.TEMPERATURE: 0.1,
    GenParams.TOP_P: 1,
}

# --- Initialize the Model ---
# Using a supported Granite Instruct model from the available list
model = Model(
    model_id="ibm/granite-13b-instruct-v2",
    params=params,
    credentials=creds,
    project_id=project_id
)

# --- Reusable Function for Text Analysis ---
def analyze_text_for_violations(text_to_analyze: str) -> str:
    """
    Analyzes the given text for GDPR and HIPAA violations using the IBM WatsonX AI model.

    Args:
        text_to_analyze: The text content to be analyzed.

    Returns:
        A string containing the model's analysis of potential violations.
    """
    # A more specific prompt to guide the model's analysis
    prompt = f"""
    Analyze the following text for potential GDPR and HIPAA violations.
    Identify any Personally Identifiable Information (PII) like names, emails, phone numbers, addresses,
    and any Protected Health Information (PHI) like medical conditions, treatments, or patient data.
    For each potential violation found, describe it clearly. If no violations are found, state that.

    Text to analyze:
    ---
    {text_to_analyze}
    ---
    Analysis:
    """

    # Generate the response from the model
    response = model.generate(prompt=prompt)
    
    # The actual generated text is in the 'results' part of the response
    if response and 'results' in response and len(response['results']) > 0:
        return response['results'][0].get('generated_text', "No analysis result found.")
    else:
        return "Failed to get a valid response from the model."

# --- Example Usage (for testing) ---
if __name__ == "__main__":
    sample_text_with_violations = (
        "Patient John Doe, email john.doe@email.com, called to report a fever. "
        "His address is 123 Main St. Dr. Smith prescribed him medicine."
    )
    
    sample_text_without_violations = (
        "The meeting discussed the quarterly financial results and marketing strategies. "
        "No personal or health-related data was mentioned."
    )

    print("--- Testing with sample text containing violations ---")
    analysis1 = analyze_text_for_violations(sample_text_with_violations)
    print("Model Analysis:", analysis1)
    
    print("\n--- Testing with sample text without violations ---")
    analysis2 = analyze_text_for_violations(sample_text_without_violations)
    print("Model Analysis:", analysis2)

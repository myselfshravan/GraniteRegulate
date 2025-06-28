import os
from dotenv import load_dotenv
from ibm_watson import SpeechToTextV1
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

# Load environment variables from .env file
load_dotenv()

# Authenticate with IBM Cloud
api_key = os.environ.get("IBM_API_KEY")
service_url = os.environ.get("IBM_SPEECH_TO_TEXT_URL")

if not api_key or not service_url:
    raise ValueError("IBM_API_KEY and IBM_SPEECH_TO_TEXT_URL must be set in your .env file.")

authenticator = IAMAuthenticator(api_key)
speech_to_text = SpeechToTextV1(
    authenticator=authenticator
)
speech_to_text.set_service_url(service_url)

# Function to transcribe audio
def transcribe_audio(audio_file_path):
    with open(audio_file_path, 'rb') as audio_file:
        response = speech_to_text.recognize(
            audio=audio_file,
            content_type='audio/wav'  # Change content type based on your audio file format
        ).get_result()

    # Extract and return the transcribed text
    if response['results']:
        return response['results'][0]['alternatives'][0]['transcript']
    else:
        return "No transcription result found."

# Example of using the transcribe function
if __name__ == "__main__":
    audio_path = "audio.wav"  # Update this path to your audio file
    if os.path.exists(audio_path):
        transcribed_text = transcribe_audio(audio_path)
        print("Transcribed Text:", transcribed_text)
    else:
        print(f"Audio file not found at: {audio_path}")
        print("Please ensure the audio file exists and the path is correct.")

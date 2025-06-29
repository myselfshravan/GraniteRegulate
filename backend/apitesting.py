import requests
import os

# --- Configuration ---
BASE_URL = "http://localhost:8000"
ANALYZE_ENDPOINT = f"{BASE_URL}/api/analyze"

# Define the paths to the test files within the 'backend/test_files' directory
TEST_FILES_DIR = os.path.join("backend", "test_files")
CSV_FILE_PATH = os.path.join(TEST_FILES_DIR, "PII Data.csv")
WAV_FILE_PATH = os.path.join(TEST_FILES_DIR, "HIPAA Violation Meeting.wav")

# --- Helper Function to Test File Upload ---
def test_file_analysis(file_path, file_type):
    """
    Sends a file to the /api/analyze endpoint and prints the response.
    """
    if not os.path.exists(file_path):
        print(f"--- ERROR: Test file not found at {file_path} ---\n")
        return

    print(f"--- Testing file: {os.path.basename(file_path)} ---")
    
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f, file_type)}
        
        try:
            response = requests.post(ANALYZE_ENDPOINT, files=files, timeout=120) # Increased timeout for AI processing
            
            # Check the response
            if response.status_code == 200:
                print("Status Code: 200 OK")
                print("Response JSON:")
                print(response.json())
            else:
                print(f"Status Code: {response.status_code}")
                print("Error Response:")
                print(response.text)
                
        except requests.exceptions.RequestException as e:
            print(f"An error occurred during the request: {e}")
            
    print("-" * (len(os.path.basename(file_path)) + 16))
    print("\n")


# --- Main Execution ---
if __name__ == "__main__":
    print("=======================================")
    print("  Starting Backend API Endpoint Tests  ")
    print("=======================================\n")
    
    # Test 1: Upload the CSV file with PII data
    test_file_analysis(CSV_FILE_PATH, 'text/csv')
    
    # Test 2: Upload the WAV file with HIPAA violation data
    test_file_analysis(WAV_FILE_PATH, 'audio/wav')
    
    print("=======================================")
    print("          API Testing Complete         ")
    print("=======================================")

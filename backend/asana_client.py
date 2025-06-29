import os
import asana
from asana.rest import ApiException
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Asana Configuration ---
ASANA_PAT = os.environ.get("ASANA_PAT")
ASANA_PROJECT_GID = os.environ.get("ASANA_PROJECT_GID")

def create_asana_task(task_name: str, task_notes: str):
    """
    Creates a new task in Asana.

    Args:
        task_name: The name of the task.
        task_notes: The notes or description for the task.
    """
    if not ASANA_PAT or not ASANA_PROJECT_GID:
        print("Asana credentials not found. Skipping task creation.")
        return

    # Configure personal access token
    configuration = asana.Configuration()
    configuration.access_token = ASANA_PAT
    api_client = asana.ApiClient(configuration)

    # Construct resource API Instance
    tasks_api_instance = asana.TasksApi(api_client)
    
    body = {
        "data": {
            "name": task_name,
            "notes": task_notes,
            "projects": [ASANA_PROJECT_GID]
        }
    }
    
    try:
        # Create a new task
        tasks_api_instance.create_task(body, {})
        print(f"Successfully created Asana task: {task_name}")
    except ApiException as e:
        print(f"Exception when calling TasksApi->create_task: {e}\n")

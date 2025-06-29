import requests

url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29"

body = {
	"project_id": "your-project-id-here",
	"model_id": "ibm/granite-3-3-8b-instruct",
	"frequency_penalty": 0,
	"max_tokens": 200,
	"presence_penalty": 0,
	"temperature": 0,
	"top_p": 1
}

headers = {
	"Accept": "application/json",
	"Content-Type": "application/json",
	"Authorization": "Bearer YOUR_ACCESS_TOKEN"
}

response = requests.post(
	url,
	headers=headers,
	json=body
)

if response.status_code != 200:
	raise Exception("Non-200 response: " + str(response.text))

data = response.json()
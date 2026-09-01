import requests
import json

res = requests.post("http://localhost:8000/api/v1/auth/login", data={"username": "admin@churnguard.com", "password": "admin123"})
token = res.json()["access_token"]

files = {'file': ('test.csv', open('test.csv', 'rb'))}
headers = {'Authorization': f'Bearer {token}'}
res = requests.post("http://localhost:8000/api/v1/predict/batch/csv", files=files, headers=headers)
print("Status:", res.status_code)
print("Text:", res.text)

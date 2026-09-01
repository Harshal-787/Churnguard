import requests

# 1. Login to get token
# Try a default user like admin@churnguard.com or whatever is in db
res = requests.post("http://localhost:8000/api/v1/auth/login", data={"username": "admin@churnguard.com", "password": "password"})
print("Login status:", res.status_code)
if res.status_code == 200:
    token = res.json()["access_token"]
    
    # 2. Try export CSV
    res2 = requests.get("http://localhost:8000/api/v1/analytics/export?format=csv", headers={"Authorization": f"Bearer {token}"})
    print("CSV Export status:", res2.status_code)
    print("CSV body:", res2.text[:200])

    # 3. Try export PDF
    res3 = requests.get("http://localhost:8000/api/v1/analytics/export?format=pdf", headers={"Authorization": f"Bearer {token}"})
    print("PDF Export status:", res3.status_code)
    if res3.status_code != 200:
        print("PDF Error:", res3.text)
else:
    print(res.text)

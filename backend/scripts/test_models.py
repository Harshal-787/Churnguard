import asyncio
from httpx import AsyncClient
from app.database import SessionLocal
from app.auth import create_access_token

async def main():
    db = SessionLocal()
    token = create_access_token({"sub": "admin@example.com", "role": "Super Admin"})
    async with AsyncClient(base_url="http://localhost:8000") as client:
        res = await client.get("/api/v1/models", headers={"Authorization": f"Bearer {token}"})
        print(res.status_code, res.json())

asyncio.run(main())

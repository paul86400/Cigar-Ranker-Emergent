import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME')

async def check():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    total = await db.cigars.count_documents({})
    zero_rated = await db.cigars.count_documents({'average_rating': 0.0})
    user_rated = await db.cigars.count_documents({'rating_count': {'$gt': 0}})
    
    print(f'Total cigars: {total}')
    print(f'Cigars with 0.0 rating (no user ratings): {zero_rated}')
    print(f'Cigars with actual user ratings: {user_rated}')
    
    print(f'\nCigars with actual user ratings:')
    rated = await db.cigars.find({'rating_count': {'$gt': 0}}).to_list(20)
    for c in rated:
        print(f'  - {c.get("brand")} {c.get("name")}: {c.get("average_rating")} ({c.get("rating_count")} ratings)')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check())

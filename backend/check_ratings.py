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
    
    # Count cigars by rating
    total = await db.cigars.count_documents({})
    with_ratings = await db.cigars.count_documents({'average_rating': {'$gt': 0}})
    zero_ratings = await db.cigars.count_documents({'average_rating': 0.0})
    
    print(f'Total cigars: {total}')
    print(f'Cigars with ratings > 0: {with_ratings}')
    print(f'Cigars with 0.0 rating: {zero_ratings}')
    
    # Show all cigars and their ratings
    print(f'\nAll cigars:')
    all_cigars = await db.cigars.find({}).to_list(100)
    for c in all_cigars:
        rating = c.get('average_rating', 'NONE')
        count = c.get('rating_count', 0)
        print(f'  - {c.get("brand")} {c.get("name")}: {rating} ({count} ratings)')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check())

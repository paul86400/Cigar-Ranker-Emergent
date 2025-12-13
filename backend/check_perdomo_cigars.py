import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')

async def check_perdomo_cigars():
    """Find all Perdomo 30th Anniversary cigars"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.test_database
    
    # Search for all Perdomo cigars with "30" in the name
    cigars = await db.cigars.find({
        "brand": {"$regex": "Perdomo", "$options": "i"},
        "name": {"$regex": "30", "$options": "i"}
    }).to_list(100)
    
    print(f"Found {len(cigars)} Perdomo cigars with '30' in the name:\n")
    
    for i, cigar in enumerate(cigars, 1):
        print(f"{i}. Brand: {cigar.get('brand')}")
        print(f"   Name: {cigar.get('name')}")
        print(f"   ID: {cigar.get('_id')}")
        print(f"   Size: {cigar.get('size', 'N/A')}")
        print(f"   Image: {'[empty]' if not cigar.get('image') else '[has image]'}")
        print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_perdomo_cigars())

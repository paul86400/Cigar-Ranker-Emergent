import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')

async def update_perdomo_image():
    """Update Perdomo 30th Anniversary to use placeholder"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.test_database
    
    # Find and update Perdomo 30th Anniversary
    result = await db.cigars.update_one(
        {
            "brand": {"$regex": "Perdomo", "$options": "i"},
            "name": {"$regex": "30th Anniversary", "$options": "i"}
        },
        {"$set": {"image": ""}}
    )
    
    if result.modified_count > 0:
        print(f"✓ Updated Perdomo 30th Anniversary - image cleared")
        
        # Show the updated cigar
        cigar = await db.cigars.find_one({
            "brand": {"$regex": "Perdomo", "$options": "i"},
            "name": {"$regex": "30th Anniversary", "$options": "i"}
        })
        
        if cigar:
            print(f"  Brand: {cigar.get('brand')}")
            print(f"  Name: {cigar.get('name')}")
            print(f"  Image: {'[empty - will show placeholder]' if not cigar.get('image') else '[has image]'}")
    else:
        print("⊘ No Perdomo 30th Anniversary found to update")
    
    client.close()

if __name__ == "__main__":
    print("Updating Perdomo 30th Anniversary image...")
    asyncio.run(update_perdomo_image())

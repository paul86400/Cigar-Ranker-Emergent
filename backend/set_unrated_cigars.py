import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

async def set_unrated_cigars():
    """Set all unrated cigars to 0.0"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Finding cigars without ratings...")
    
    # Find cigars that don't have average_rating or have None/null
    unrated_cigars = await db.cigars.find({
        "$or": [
            {"average_rating": {"$exists": False}},
            {"average_rating": None}
        ]
    }).to_list(1000)
    
    print(f"Found {len(unrated_cigars)} unrated cigars")
    
    if len(unrated_cigars) > 0:
        # Update all unrated cigars
        result = await db.cigars.update_many(
            {
                "$or": [
                    {"average_rating": {"$exists": False}},
                    {"average_rating": None}
                ]
            },
            {
                "$set": {
                    "average_rating": 0.0,
                    "rating_count": 0
                }
            }
        )
        
        print(f"Updated {result.modified_count} cigars to have rating 0.0")
        
        # Show some examples
        print("\nExamples of updated cigars:")
        updated = await db.cigars.find({"average_rating": 0.0}).limit(5).to_list(5)
        for cigar in updated:
            print(f"  - {cigar.get('brand')} {cigar.get('name')}: {cigar.get('average_rating')} ({cigar.get('rating_count')} ratings)")
    else:
        print("All cigars already have ratings!")
    
    client.close()
    print("\nCompleted!")

if __name__ == "__main__":
    asyncio.run(set_unrated_cigars())

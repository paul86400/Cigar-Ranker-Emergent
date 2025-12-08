import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

async def set_unrated_cigars():
    """Set all cigars with no user ratings (rating_count = 0) to 0.0"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Finding cigars with no user ratings (rating_count = 0)...")
    
    # Find cigars that have rating_count = 0 (placeholder ratings, not actual user ratings)
    unrated_cigars = await db.cigars.find({
        "$or": [
            {"rating_count": 0},
            {"rating_count": {"$exists": False}}
        ]
    }).to_list(2000)
    
    print(f"Found {len(unrated_cigars)} cigars with no user ratings")
    
    if len(unrated_cigars) > 0:
        # Show some examples before update
        print("\nExamples (before update):")
        for cigar in unrated_cigars[:5]:
            print(f"  - {cigar.get('brand')} {cigar.get('name')}: {cigar.get('average_rating')} ({cigar.get('rating_count', 0)} ratings)")
        
        # Update all cigars with rating_count = 0
        result = await db.cigars.update_many(
            {
                "$or": [
                    {"rating_count": 0},
                    {"rating_count": {"$exists": False}}
                ]
            },
            {
                "$set": {
                    "average_rating": 0.0,
                    "rating_count": 0
                }
            }
        )
        
        print(f"\nUpdated {result.modified_count} cigars to have rating 0.0")
        
        # Show some examples after update
        print("\nExamples (after update):")
        updated = await db.cigars.find({"average_rating": 0.0, "rating_count": 0}).limit(5).to_list(5)
        for cigar in updated:
            print(f"  - {cigar.get('brand')} {cigar.get('name')}: {cigar.get('average_rating')} ({cigar.get('rating_count')} ratings)")
    else:
        print("All cigars have user ratings!")
    
    client.close()
    print("\nCompleted!")

if __name__ == "__main__":
    asyncio.run(set_unrated_cigars())

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')

async def clear_placeholder_images():
    """Clear all cigar images to show the new placeholder"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.test_database
    
    # Update all cigars to remove the image field (or set it to empty string)
    result = await db.cigars.update_many(
        {},  # All cigars
        {"$set": {"image": ""}}  # Set image to empty string
    )
    
    print(f"Updated {result.modified_count} cigars")
    print("All cigar images have been cleared. The new placeholder will now show.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(clear_placeholder_images())

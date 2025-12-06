"""
Apply real cigar images to database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from update_cigar_images import get_cigar_images
import os
from dotenv import load_dotenv

load_dotenv()

async def update_all_cigar_images():
    """Update all cigars in database with real images"""
    # Get images
    print("Downloading cigar images...")
    images = get_cigar_images()
    
    if not images:
        print("❌ No images downloaded!")
        return
    
    print(f"✅ Downloaded {len(images)} images")
    
    # Connect to MongoDB
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client.cigar_db
    
    # Get all cigars
    cigars = await db.cigars.find({}).to_list(length=None)
    print(f"Found {len(cigars)} cigars to update")
    
    # Update each cigar with a cycling image
    updated_count = 0
    for idx, cigar in enumerate(cigars):
        # Cycle through images
        image_idx = idx % len(images)
        image = images[image_idx]
        
        # Update cigar
        result = await db.cigars.update_one(
            {"_id": cigar["_id"]},
            {"$set": {"image": image}}
        )
        
        if result.modified_count > 0:
            updated_count += 1
            if updated_count % 100 == 0:
                print(f"Updated {updated_count} cigars...")
    
    print(f"✅ Successfully updated {updated_count} cigars with real images!")
    client.close()

if __name__ == "__main__":
    asyncio.run(update_all_cigar_images())

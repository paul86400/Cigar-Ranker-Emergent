import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

async def add_ep_carrillo_endure():
    """Add EP Carrillo Endure cigars to the database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.cigar_scout
    
    # Placeholder image (cigar silhouette)
    placeholder_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    ep_carrillo_cigars = [
        {
            "brand": "E.P. Carrillo",
            "name": "Encore Endure Robusto",
            "strength": "Medium",
            "origin": "Dominican Republic",
            "wrapper": "Ecuadorian Connecticut",
            "size": "5 x 50 (Robusto)",
            "price_range": "$7 - $9",
            "average_rating": 8.6,
            "rating_count": 42,
            "flavor_notes": ["Cream", "Cedar", "Toast", "Mild Spice", "Nuts"],
            "image": placeholder_image,
            "description": "E.P. Carrillo Encore Endure features a smooth Ecuadorian Connecticut wrapper over Dominican binder and filler tobaccos. A mild to medium-bodied cigar perfect for any time of day."
        },
        {
            "brand": "E.P. Carrillo",
            "name": "Encore Endure Toro",
            "strength": "Medium",
            "origin": "Dominican Republic",
            "wrapper": "Ecuadorian Connecticut",
            "size": "6 x 52 (Toro)",
            "price_range": "$7 - $9",
            "average_rating": 8.5,
            "rating_count": 38,
            "flavor_notes": ["Cream", "Cedar", "Toast", "Cashew", "Light Pepper"],
            "image": placeholder_image,
            "description": "Toro vitola of the Encore Endure line. Offers a longer, more relaxed smoking experience with the same refined flavor profile."
        },
        {
            "brand": "E.P. Carrillo",
            "name": "Encore Endure Churchill",
            "strength": "Medium",
            "origin": "Dominican Republic",
            "wrapper": "Ecuadorian Connecticut",
            "size": "7 x 48 (Churchill)",
            "price_range": "$8 - $10",
            "average_rating": 8.7,
            "rating_count": 35,
            "flavor_notes": ["Cream", "Cedar", "Vanilla", "White Pepper", "Almond"],
            "image": placeholder_image,
            "description": "Churchill format of the Encore Endure. A premium Connecticut wrapped cigar with excellent construction and a smooth, creamy smoke."
        },
    ]
    
    print("Adding E.P. Carrillo Encore Endure cigars to database...")
    
    for cigar in ep_carrillo_cigars:
        # Check if cigar already exists
        existing = await db.cigars.find_one({
            "brand": cigar["brand"],
            "name": cigar["name"]
        })
        
        if existing:
            print(f"✓ {cigar['brand']} {cigar['name']} already exists")
        else:
            result = await db.cigars.insert_one(cigar)
            print(f"✓ Added {cigar['brand']} {cigar['name']} (ID: {result.inserted_id})")
    
    client.close()
    print(f"\nCompleted! Added E.P. Carrillo Encore Endure series cigars.")

if __name__ == "__main__":
    asyncio.run(add_ep_carrillo_endure())

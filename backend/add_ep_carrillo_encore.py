import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

async def add_ep_carrillo_encore():
    """Add EP Carrillo Encore cigars to the database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.cigar_scout
    
    # Placeholder image (cigar silhouette)
    placeholder_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    ep_carrillo_cigars = [
        {
            "brand": "E.P. Carrillo",
            "name": "Encore Majestic",
            "strength": "Medium-Full",
            "origin": "Nicaragua",
            "wrapper": "Ecuadorian Connecticut",
            "size": "6 x 52 (Toro)",
            "price_range": "$10 - $13",
            "average_rating": 8.8,
            "rating_count": 45,
            "flavor_notes": ["Cream", "Cedar", "Coffee", "Spice", "Nuts"],
            "image": placeholder_image,
            "description": "The Encore line showcases E.P. Carrillo's expertise with Ecuadorian Connecticut wrappers. Smooth and refined with excellent construction."
        },
        {
            "brand": "E.P. Carrillo",
            "name": "Encore Edicion Especial",
            "strength": "Medium-Full",
            "origin": "Nicaragua",
            "wrapper": "Ecuadorian Connecticut",
            "size": "7 x 47 (Churchill)",
            "price_range": "$11 - $14",
            "average_rating": 8.9,
            "rating_count": 38,
            "flavor_notes": ["Vanilla", "Toast", "Pepper", "Leather", "Coffee"],
            "image": placeholder_image,
            "description": "Special edition of the Encore line featuring a beautiful Connecticut wrapper with a sophisticated flavor profile."
        },
        {
            "brand": "E.P. Carrillo",
            "name": "Encore Valientes",
            "strength": "Medium-Full",
            "origin": "Nicaragua",
            "wrapper": "Ecuadorian Connecticut",
            "size": "5.5 x 50 (Robusto)",
            "price_range": "$9 - $12",
            "average_rating": 8.7,
            "rating_count": 52,
            "flavor_notes": ["Cedar", "Cream", "White Pepper", "Nuts", "Caramel"],
            "image": placeholder_image,
            "description": "A shorter format in the Encore line that delivers the same refined experience in a compact smoke."
        },
    ]
    
    print("Adding E.P. Carrillo Encore cigars to database...")
    
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
    print(f"\nCompleted! Added E.P. Carrillo Encore series cigars.")

if __name__ == "__main__":
    asyncio.run(add_ep_carrillo_encore())

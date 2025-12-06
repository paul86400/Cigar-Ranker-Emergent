import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import base64
from io import BytesIO
from PIL import Image
import requests

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

async def add_padron_anniversary_cigars():
    """Add Padron Anniversary series cigars to the database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.cigar_scout
    
    # Placeholder image (cigar silhouette)
    placeholder_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    padron_cigars = [
        {
            "brand": "Padron",
            "name": "80th Anniversary",
            "strength": "Medium-Full",
            "origin": "Nicaragua",
            "wrapper": "Nicaraguan Natural",
            "size": "Various",
            "price_range": "$25 - $35",
            "average_rating": 9.5,
            "rating_count": 125,
            "flavor_notes": ["Cocoa", "Coffee", "Earth", "Leather", "Cedar"],
            "image": placeholder_image,
            "description": "Created to celebrate Padron's 80th anniversary, this exceptional cigar features a blend of aged Nicaraguan tobacco. Known for its complexity and balance."
        },
        {
            "brand": "Padron",
            "name": "50th Anniversary",
            "strength": "Full",
            "origin": "Nicaragua",
            "wrapper": "Nicaraguan Maduro",
            "size": "Various",
            "price_range": "$20 - $30",
            "average_rating": 9.3,
            "rating_count": 156,
            "flavor_notes": ["Dark Chocolate", "Espresso", "Black Pepper", "Cedar", "Nuts"],
            "image": placeholder_image,
            "description": "Celebrating half a century of Padron excellence. This limited edition features 10-year aged tobacco for an unforgettable smoking experience."
        },
        {
            "brand": "Padron",
            "name": "60th Anniversary Maduro",
            "strength": "Medium-Full",
            "origin": "Nicaragua",
            "wrapper": "Nicaraguan Maduro",
            "size": "Various",
            "price_range": "$22 - $32",
            "average_rating": 9.4,
            "rating_count": 98,
            "flavor_notes": ["Dark Cocoa", "Caramel", "Coffee", "Spice", "Leather"],
            "image": placeholder_image,
            "description": "Commemorating 60 years of Padron tradition. Features sun-grown Maduro wrapper with a complex, refined blend."
        },
        {
            "brand": "Padron",
            "name": "60th Anniversary Natural",
            "strength": "Medium-Full",
            "origin": "Nicaragua",
            "wrapper": "Nicaraguan Natural",
            "size": "Various",
            "price_range": "$22 - $32",
            "average_rating": 9.4,
            "rating_count": 87,
            "flavor_notes": ["Cedar", "Coffee", "Cream", "Nuts", "Spice"],
            "image": placeholder_image,
            "description": "Natural wrapper version of the 60th Anniversary. Smooth and creamy with exceptional balance."
        },
    ]
    
    print("Adding Padron Anniversary cigars to database...")
    
    for cigar in padron_cigars:
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
    print(f"\nCompleted! Added Padron Anniversary series cigars.")

if __name__ == "__main__":
    asyncio.run(add_padron_anniversary_cigars())

"""
Add Leaf by Oscar cigars to the database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Leaf by Oscar cigars to add
LEAF_CIGARS = [
    # Leaf by Oscar Corojo
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Corojo Toro",
        "strength": "medium-full",
        "origin": "Honduras",
        "wrapper": "Honduran Corojo",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 8.8,
        "rating_count": 0,
        "flavor_notes": ["Cedar", "Spice", "Coffee", "Leather"],
        "price_range": "5-8",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Corojo Robusto",
        "strength": "medium-full",
        "origin": "Honduras",
        "wrapper": "Honduran Corojo",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 8.7,
        "rating_count": 0,
        "flavor_notes": ["Cedar", "Spice", "Nuts", "Pepper"],
        "price_range": "5-7",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Corojo Sixty",
        "strength": "medium-full",
        "origin": "Honduras",
        "wrapper": "Honduran Corojo",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Gordo",
        "length": "6.0",
        "ring_gauge": "60",
        "average_rating": 8.9,
        "rating_count": 0,
        "flavor_notes": ["Spice", "Wood", "Coffee"],
        "price_range": "6-9",
        "barcode": "",
        "images": []
    },
    
    # Leaf by Oscar Maduro
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Maduro Toro",
        "strength": "full",
        "origin": "Honduras",
        "wrapper": "Honduran Maduro",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 9.0,
        "rating_count": 0,
        "flavor_notes": ["Chocolate", "Espresso", "Spice", "Earth"],
        "price_range": "5-8",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Maduro Robusto",
        "strength": "full",
        "origin": "Honduras",
        "wrapper": "Honduran Maduro",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 8.9,
        "rating_count": 0,
        "flavor_notes": ["Dark Chocolate", "Coffee", "Leather"],
        "price_range": "5-7",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Maduro Sixty",
        "strength": "full",
        "origin": "Honduras",
        "wrapper": "Honduran Maduro",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Gordo",
        "length": "6.0",
        "ring_gauge": "60",
        "average_rating": 9.1,
        "rating_count": 0,
        "flavor_notes": ["Cocoa", "Espresso", "Spice", "Cedar"],
        "price_range": "6-9",
        "barcode": "",
        "images": []
    },
    
    # Leaf by Oscar Connecticut
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Connecticut Toro",
        "strength": "mild-medium",
        "origin": "Honduras",
        "wrapper": "Ecuadorian Connecticut",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 8.5,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Cedar", "Nuts", "Grass"],
        "price_range": "5-8",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Connecticut Robusto",
        "strength": "mild-medium",
        "origin": "Honduras",
        "wrapper": "Ecuadorian Connecticut",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 8.4,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Toast", "Almond"],
        "price_range": "5-7",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Connecticut Sixty",
        "strength": "mild-medium",
        "origin": "Honduras",
        "wrapper": "Ecuadorian Connecticut",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Gordo",
        "length": "6.0",
        "ring_gauge": "60",
        "average_rating": 8.6,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Cedar", "Honey"],
        "price_range": "6-9",
        "barcode": "",
        "images": []
    },
    
    # Leaf by Oscar Sumatra
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Sumatra Toro",
        "strength": "medium",
        "origin": "Honduras",
        "wrapper": "Ecuadorian Sumatra",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 8.7,
        "rating_count": 0,
        "flavor_notes": ["Cedar", "Leather", "Spice", "Toast"],
        "price_range": "5-8",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Sumatra Robusto",
        "strength": "medium",
        "origin": "Honduras",
        "wrapper": "Ecuadorian Sumatra",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 8.6,
        "rating_count": 0,
        "flavor_notes": ["Cedar", "Leather", "Nuts"],
        "price_range": "5-7",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Sumatra Sixty",
        "strength": "medium",
        "origin": "Honduras",
        "wrapper": "Ecuadorian Sumatra",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Gordo",
        "length": "6.0",
        "ring_gauge": "60",
        "average_rating": 8.8,
        "rating_count": 0,
        "flavor_notes": ["Wood", "Spice", "Coffee"],
        "price_range": "6-9",
        "barcode": "",
        "images": []
    },
    
    # Leaf by Oscar Islero
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Islero Maduro Toro",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Maduro",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "54",
        "average_rating": 9.1,
        "rating_count": 0,
        "flavor_notes": ["Dark Chocolate", "Espresso", "Black Pepper", "Earth"],
        "price_range": "7-10",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Islero Maduro Robusto",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Maduro",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 9.0,
        "rating_count": 0,
        "flavor_notes": ["Chocolate", "Coffee", "Spice"],
        "price_range": "6-9",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Islero Natural Toro",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "54",
        "average_rating": 8.9,
        "rating_count": 0,
        "flavor_notes": ["Cedar", "Pepper", "Leather", "Coffee"],
        "price_range": "7-10",
        "barcode": "",
        "images": []
    },
    
    # Leaf by Oscar Habano
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Habano Toro",
        "strength": "medium-full",
        "origin": "Honduras",
        "wrapper": "Ecuadorian Habano",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 8.8,
        "rating_count": 0,
        "flavor_notes": ["Spice", "Cedar", "Pepper", "Coffee"],
        "price_range": "5-8",
        "barcode": "",
        "images": []
    },
    {
        "brand": "Leaf by Oscar",
        "name": "Leaf by Oscar Habano Robusto",
        "strength": "medium-full",
        "origin": "Honduras",
        "wrapper": "Ecuadorian Habano",
        "binder": "Honduran",
        "filler": "Honduran",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 8.7,
        "rating_count": 0,
        "flavor_notes": ["Spice", "Wood", "Leather"],
        "price_range": "5-7",
        "barcode": "",
        "images": []
    },
]


async def add_cigars():
    """Add Leaf by Oscar cigars to database"""
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "test_database")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 60)
    print("ADDING LEAF BY OSCAR CIGARS TO DATABASE")
    print("=" * 60)
    
    added_count = 0
    skipped_count = 0
    
    for cigar in LEAF_CIGARS:
        # Check if cigar already exists
        existing = await db.cigars.find_one({
            "brand": cigar["brand"],
            "name": cigar["name"]
        })
        
        if existing:
            print(f"⏭️  Skipped: {cigar['name']} (already exists)")
            skipped_count += 1
            continue
        
        # Format size field
        if "size" in cigar and "length" in cigar and "ring_gauge" in cigar:
            cigar["size"] = f"{cigar['size']} ({cigar['length']} x {cigar['ring_gauge']})"
        
        # Add created_at timestamp
        cigar["created_at"] = datetime.utcnow()
        
        # Add placeholder image (will be updated by image script)
        if "image" not in cigar:
            cigar["image"] = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        # Insert cigar
        result = await db.cigars.insert_one(cigar)
        print(f"✅ Added: {cigar['name']}")
        added_count += 1
    
    print(f"\n{'=' * 60}")
    print(f"✅ Added {added_count} new Leaf by Oscar cigars")
    print(f"⏭️  Skipped {skipped_count} existing cigars")
    print(f"{'=' * 60}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(add_cigars())

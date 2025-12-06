"""
Add EP Carrillo cigars to the database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# EP Carrillo cigars to add
EP_CARRILLO_CIGARS = [
    # EP Carrillo Encore
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Encore Majestic",
        "strength": "medium",
        "origin": "Dominican Republic",
        "wrapper": "Connecticut Shade",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 9.3,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Cedar", "Nuts", "Butter"],
        "price_range": "10-15",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Encore Valientes",
        "strength": "medium",
        "origin": "Dominican Republic",
        "wrapper": "Connecticut Shade",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 9.3,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Cedar", "Nuts", "Toast"],
        "price_range": "10-15",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Encore Celestial",
        "strength": "medium",
        "origin": "Dominican Republic",
        "wrapper": "Connecticut Shade",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Churchill",
        "length": "7.0",
        "ring_gauge": "48",
        "average_rating": 9.2,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Grass", "Almond"],
        "price_range": "12-17",
        "barcode": "",
        "images": []
    },
    
    # EP Carrillo Core Line
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Core Line Churchill Extra",
        "strength": "medium-full",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Habano",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Churchill",
        "length": "7.0",
        "ring_gauge": "47",
        "average_rating": 9.1,
        "rating_count": 0,
        "flavor_notes": ["Spice", "Cedar", "Coffee", "Pepper"],
        "price_range": "8-12",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Core Line Toro",
        "strength": "medium-full",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Habano",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 9.0,
        "rating_count": 0,
        "flavor_notes": ["Spice", "Wood", "Coffee", "Leather"],
        "price_range": "8-12",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Core Line Robusto",
        "strength": "medium-full",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Habano",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 9.0,
        "rating_count": 0,
        "flavor_notes": ["Spice", "Leather", "Cocoa"],
        "price_range": "7-11",
        "barcode": "",
        "images": []
    },
    
    # EP Carrillo Inch
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Inch No. 60",
        "strength": "medium",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Sumatra",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Gordito",
        "length": "5.0",
        "ring_gauge": "60",
        "average_rating": 8.9,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Nuts", "Spice", "Cedar"],
        "price_range": "10-14",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Inch No. 62",
        "strength": "medium",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Sumatra",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Gordito",
        "length": "5.0",
        "ring_gauge": "62",
        "average_rating": 8.9,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Toast", "Wood", "Honey"],
        "price_range": "10-15",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Inch No. 64",
        "strength": "medium",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Sumatra",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Gordito",
        "length": "5.0",
        "ring_gauge": "64",
        "average_rating": 8.8,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Cedar", "Coffee"],
        "price_range": "11-16",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Inch Maduro No. 60",
        "strength": "medium-full",
        "origin": "Dominican Republic",
        "wrapper": "Connecticut Broadleaf Maduro",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Gordito",
        "length": "5.0",
        "ring_gauge": "60",
        "average_rating": 9.0,
        "rating_count": 0,
        "flavor_notes": ["Cocoa", "Coffee", "Spice", "Leather"],
        "price_range": "11-15",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Inch Maduro No. 62",
        "strength": "medium-full",
        "origin": "Dominican Republic",
        "wrapper": "Connecticut Broadleaf Maduro",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Gordito",
        "length": "5.0",
        "ring_gauge": "62",
        "average_rating": 9.1,
        "rating_count": 0,
        "flavor_notes": ["Chocolate", "Espresso", "Pepper"],
        "price_range": "11-16",
        "barcode": "",
        "images": []
    },
    
    # EP Carrillo New Wave
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo New Wave Connecticut Divinos",
        "strength": "mild-medium",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Connecticut",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Robusto",
        "length": "4.5",
        "ring_gauge": "50",
        "average_rating": 8.9,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Vanilla", "Almond", "Hay"],
        "price_range": "8-12",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo New Wave Connecticut Toro",
        "strength": "mild-medium",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Connecticut",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 8.8,
        "rating_count": 0,
        "flavor_notes": ["Cream", "Cedar", "Cashew"],
        "price_range": "9-13",
        "barcode": "",
        "images": []
    },
    
    # EP Carrillo Dusk
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Dusk Robusto",
        "strength": "full",
        "origin": "Dominican Republic",
        "wrapper": "Nicaraguan Habano Oscuro",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 9.2,
        "rating_count": 0,
        "flavor_notes": ["Espresso", "Dark Chocolate", "Black Pepper", "Earth"],
        "price_range": "10-14",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Dusk Toro",
        "strength": "full",
        "origin": "Dominican Republic",
        "wrapper": "Nicaraguan Habano Oscuro",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 9.3,
        "rating_count": 0,
        "flavor_notes": ["Coffee", "Cocoa", "Spice", "Leather"],
        "price_range": "11-15",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Dusk Solidos",
        "strength": "full",
        "origin": "Dominican Republic",
        "wrapper": "Nicaraguan Habano Oscuro",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Corona",
        "length": "5.5",
        "ring_gauge": "46",
        "average_rating": 9.2,
        "rating_count": 0,
        "flavor_notes": ["Dark Chocolate", "Espresso", "Cedar"],
        "price_range": "9-13",
        "barcode": "",
        "images": []
    },
    
    # EP Carrillo Pledge
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Pledge Prequel Robusto",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 9.1,
        "rating_count": 0,
        "flavor_notes": ["Cedar", "Spice", "Cocoa", "Pepper"],
        "price_range": "11-15",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Pledge Prequel Toro",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 9.0,
        "rating_count": 0,
        "flavor_notes": ["Wood", "Coffee", "Leather", "Spice"],
        "price_range": "12-16",
        "barcode": "",
        "images": []
    },
    
    # EP Carrillo La Historia
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo La Historia E-III",
        "strength": "medium-full",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Habano",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 9.4,
        "rating_count": 0,
        "flavor_notes": ["Cedar", "Pepper", "Coffee", "Caramel"],
        "price_range": "12-16",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo La Historia El Senador",
        "strength": "medium-full",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Habano",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Churchill",
        "length": "7.0",
        "ring_gauge": "47",
        "average_rating": 9.4,
        "rating_count": 0,
        "flavor_notes": ["Spice", "Wood", "Cocoa", "Nuts"],
        "price_range": "13-17",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo La Historia Don Rubino",
        "strength": "medium-full",
        "origin": "Dominican Republic",
        "wrapper": "Ecuadorian Habano",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Robusto",
        "length": "4.5",
        "ring_gauge": "52",
        "average_rating": 9.3,
        "rating_count": 0,
        "flavor_notes": ["Cedar", "Cream", "Pepper", "Coffee"],
        "price_range": "11-15",
        "barcode": "",
        "images": []
    },
    
    # EP Carrillo Seleccion Oscuro
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Seleccion Oscuro Robusto",
        "strength": "medium-full",
        "origin": "Dominican Republic",
        "wrapper": "Mexican San Andres Maduro",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Robusto",
        "length": "5.0",
        "ring_gauge": "50",
        "average_rating": 9.1,
        "rating_count": 0,
        "flavor_notes": ["Chocolate", "Coffee", "Leather", "Spice"],
        "price_range": "9-13",
        "barcode": "",
        "images": []
    },
    {
        "brand": "EP Carrillo",
        "name": "EP Carrillo Seleccion Oscuro Toro",
        "strength": "medium-full",
        "origin": "Dominican Republic",
        "wrapper": "Mexican San Andres Maduro",
        "binder": "Nicaraguan",
        "filler": "Nicaraguan, Dominican",
        "size": "Toro",
        "length": "6.0",
        "ring_gauge": "52",
        "average_rating": 9.2,
        "rating_count": 0,
        "flavor_notes": ["Cocoa", "Espresso", "Earth", "Cedar"],
        "price_range": "10-14",
        "barcode": "",
        "images": []
    },
]


async def add_cigars():
    """Add EP Carrillo cigars to database"""
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "test_database")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 60)
    print("ADDING EP CARRILLO CIGARS TO DATABASE")
    print("=" * 60)
    
    added_count = 0
    skipped_count = 0
    
    for cigar in EP_CARRILLO_CIGARS:
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
    print(f"✅ Added {added_count} new EP Carrillo cigars")
    print(f"⏭️  Skipped {skipped_count} existing cigars")
    print(f"{'=' * 60}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(add_cigars())

"""
Add premium cigar lines to the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# Comprehensive list of cigars to add
CIGARS_TO_ADD = [
    # Montecristo 1935 Line
    {
        "name": "Montecristo 1935 Anniversary Nicaragua",
        "brand": "Montecristo",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Toro",
        "length": 6.0,
        "ring_gauge": 52,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Montecristo 1935 Anniversary Nicaragua Diamante",
        "brand": "Montecristo",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Robusto",
        "length": 5.5,
        "ring_gauge": 54,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Montecristo 1935 Anniversary Nicaragua Double Diamante",
        "brand": "Montecristo",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Gordo",
        "length": 6.0,
        "ring_gauge": 60,
        "rating": 0.0,
        "rating_count": 0,
    },
    
    # Plasencia Cigars
    {
        "name": "Plasencia Alma Fuerte",
        "brand": "Plasencia",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Sun Grown",
        "size": "Robusto",
        "length": 5.5,
        "ring_gauge": 52,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Plasencia Alma del Campo",
        "brand": "Plasencia",
        "strength": "medium",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Shade Grown",
        "size": "Toro",
        "length": 6.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Plasencia Cosecha 146",
        "brand": "Plasencia",
        "strength": "medium-full",
        "origin": "Honduras",
        "wrapper": "Honduran Corojo",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Plasencia Reserva Original",
        "brand": "Plasencia",
        "strength": "medium",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Corojo",
        "size": "Churchill",
        "length": 7.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Plasencia Year of the Tiger",
        "brand": "Plasencia",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "San Andres Maduro",
        "size": "Robusto",
        "length": 5.5,
        "ring_gauge": 54,
        "rating": 0.0,
        "rating_count": 0,
    },
    
    # Foundation Cigars
    {
        "name": "Foundation Tabernacle",
        "brand": "Foundation",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Broadleaf",
        "size": "Toro",
        "length": 6.0,
        "ring_gauge": 52,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Foundation The Wise Man Maduro",
        "brand": "Foundation",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Mexican San Andres",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 52,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Foundation Charter Oak",
        "brand": "Foundation",
        "strength": "medium",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Broadleaf",
        "size": "Rothschild",
        "length": 4.5,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Foundation Olmec",
        "brand": "Foundation",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Toro",
        "length": 6.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Foundation Menelik",
        "brand": "Foundation",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Broadleaf",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    
    # Oliva Cigars
    {
        "name": "Oliva Serie O",
        "brand": "Oliva",
        "strength": "mild-medium",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Shade",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Oliva Serie G",
        "brand": "Oliva",
        "strength": "medium",
        "origin": "Nicaragua",
        "wrapper": "Cameroon",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Oliva Serie G Maduro",
        "brand": "Oliva",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Broadleaf",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Oliva Serie V",
        "brand": "Oliva",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Torpedo",
        "length": 6.0,
        "ring_gauge": 52,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Oliva Master Blends 3",
        "brand": "Oliva",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Sun Grown",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Oliva Connecticut Reserve",
        "brand": "Oliva",
        "strength": "mild",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Shade",
        "size": "Churchill",
        "length": 7.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Nub Connecticut",
        "brand": "Oliva",
        "strength": "mild",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Shade",
        "size": "Nub",
        "length": 4.0,
        "ring_gauge": 60,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Nub Habano",
        "brand": "Oliva",
        "strength": "medium",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Nub",
        "length": 4.0,
        "ring_gauge": 60,
        "rating": 0.0,
        "rating_count": 0,
    },
    
    # My Father Cigars
    {
        "name": "My Father No. 1",
        "brand": "My Father",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano Rosado",
        "size": "Robusto",
        "length": 5.5,
        "ring_gauge": 52,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "My Father No. 4",
        "brand": "My Father",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano Rosado",
        "size": "Toro",
        "length": 6.5,
        "ring_gauge": 52,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "My Father The Judge",
        "brand": "My Father",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Broadleaf",
        "size": "Toro",
        "length": 6.0,
        "ring_gauge": 56,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "My Father S Special",
        "brand": "My Father",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Ecuadorian Habano",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "My Father Connecticut",
        "brand": "My Father",
        "strength": "mild-medium",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Shade",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "My Father La Opulencia",
        "brand": "My Father",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Rosado",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 52,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "My Father La Gran Oferta",
        "brand": "My Father",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Toro",
        "length": 6.0,
        "ring_gauge": 56,
        "rating": 0.0,
        "rating_count": 0,
    },
    
    # Padron Cigars
    {
        "name": "Padron 2000",
        "brand": "Padron",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Padron 3000",
        "brand": "Padron",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Toro",
        "length": 5.5,
        "ring_gauge": 52,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Padron 5000",
        "brand": "Padron",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Robusto",
        "length": 5.5,
        "ring_gauge": 56,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Padron 7000",
        "brand": "Padron",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Churchill",
        "length": 6.25,
        "ring_gauge": 60,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Padron 1964 Anniversary Exclusivo",
        "brand": "Padron",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Sun Grown",
        "size": "Robusto",
        "length": 5.5,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Padron 1964 Anniversary Principe",
        "brand": "Padron",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Sun Grown",
        "size": "Corona",
        "length": 4.5,
        "ring_gauge": 46,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Padron 1926 Serie No. 9",
        "brand": "Padron",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Robusto",
        "length": 5.25,
        "ring_gauge": 56,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Padron 1926 Serie No. 2",
        "brand": "Padron",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Habano",
        "size": "Torpedo",
        "length": 5.5,
        "ring_gauge": 52,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Padron Family Reserve 45 Years",
        "brand": "Padron",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Sun Grown",
        "size": "Robusto",
        "length": 5.25,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    
    # Perdomo Cigars
    {
        "name": "Perdomo Habano Connecticut",
        "brand": "Perdomo",
        "strength": "mild",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Shade",
        "size": "Robusto",
        "length": 5.5,
        "ring_gauge": 54,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Perdomo Habano Bourbon Barrel-Aged",
        "brand": "Perdomo",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Sun Grown",
        "size": "Robusto",
        "length": 5.5,
        "ring_gauge": 54,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Perdomo 10th Anniversary Champagne",
        "brand": "Perdomo",
        "strength": "mild-medium",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Shade",
        "size": "Epicure",
        "length": 6.0,
        "ring_gauge": 54,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Perdomo 20th Anniversary Maduro",
        "brand": "Perdomo",
        "strength": "full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Maduro",
        "size": "Gordo",
        "length": 6.0,
        "ring_gauge": 60,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Perdomo Lot 23",
        "brand": "Perdomo",
        "strength": "medium",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Shade",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 54,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Perdomo Reserve 10th Anniversary",
        "brand": "Perdomo",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Corojo",
        "size": "Super Toro",
        "length": 6.0,
        "ring_gauge": 60,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Perdomo Fresco Connecticut",
        "brand": "Perdomo",
        "strength": "mild",
        "origin": "Nicaragua",
        "wrapper": "Connecticut Shade",
        "size": "Robusto",
        "length": 5.0,
        "ring_gauge": 50,
        "rating": 0.0,
        "rating_count": 0,
    },
    {
        "name": "Perdomo ESV 1991",
        "brand": "Perdomo",
        "strength": "medium-full",
        "origin": "Nicaragua",
        "wrapper": "Nicaraguan Sun Grown",
        "size": "Robusto",
        "length": 5.5,
        "ring_gauge": 54,
        "rating": 0.0,
        "rating_count": 0,
    },
]

async def add_cigars():
    """Add cigars to database"""
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "test_database")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 60)
    print("ADDING PREMIUM CIGARS TO DATABASE")
    print("=" * 60)
    
    added_count = 0
    skipped_count = 0
    
    for cigar in CIGARS_TO_ADD:
        # Check if cigar already exists
        existing = await db.cigars.find_one({
            "brand": cigar["brand"],
            "name": cigar["name"]
        })
        
        if existing:
            print(f"⏭️  Skipped: {cigar['brand']} {cigar['name']} (already exists)")
            skipped_count += 1
            continue
        
        # Rename rating to average_rating and add missing fields
        cigar_doc = cigar.copy()
        if "rating" in cigar_doc:
            cigar_doc["average_rating"] = cigar_doc.pop("rating")
        
        # Add missing required fields
        if "flavor_notes" not in cigar_doc:
            cigar_doc["flavor_notes"] = ["Leather", "Wood", "Spice"]
        if "images" not in cigar_doc:
            cigar_doc["images"] = []
        if "image" not in cigar_doc:
            # Use a placeholder image (1x1 transparent pixel)
            cigar_doc["image"] = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        if "price_range" not in cigar_doc:
            cigar_doc["price_range"] = "15-20"
        if "barcode" not in cigar_doc:
            cigar_doc["barcode"] = ""
        if "binder" not in cigar_doc:
            cigar_doc["binder"] = "Mixed"
        if "filler" not in cigar_doc:
            cigar_doc["filler"] = "Mixed"
        
        # Format size field to match expected format
        if "size" in cigar_doc and "length" in cigar_doc and "ring_gauge" in cigar_doc:
            cigar_doc["size"] = f"{cigar_doc['size']} ({cigar_doc['length']} x {cigar_doc['ring_gauge']})"
        
        # Add created_at timestamp
        cigar_doc["created_at"] = datetime.utcnow()
        
        # Insert cigar
        result = await db.cigars.insert_one(cigar_doc)
        print(f"✅ Added: {cigar['brand']} {cigar['name']}")
        added_count += 1
    
    print(f"\n{'=' * 60}")
    print(f"✅ Added {added_count} new cigars")
    print(f"⏭️  Skipped {skipped_count} existing cigars")
    print(f"{'=' * 60}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_cigars())

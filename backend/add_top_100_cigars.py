import asyncio
import aiohttp
import base64
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from datetime import datetime
from bs4 import BeautifulSoup
import re

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')

# Top 100 most popular cigar brands (curated list based on industry popularity)
TOP_100_BRANDS = [
    "Padron", "Arturo Fuente", "Davidoff", "Cohiba", "Montecristo",
    "Romeo y Julieta", "Ashton", "My Father", "Drew Estate", "Oliva",
    "Rocky Patel", "CAO", "Perdomo", "Alec Bradley", "Tatuaje",
    "Liga Privada", "Acid", "Punch", "Macanudo", "Hoyo de Monterrey",
    "Partagas", "H. Upmann", "Bolivar", "Ramon Allones", "San Cristobal",
    "La Gloria Cubana", "Don Pepin Garcia", "Flor de las Antillas", "Undercrown",
    "Herrera Esteli", "Tabak Especial", "Java", "Nub", "Man O' War",
    "Diesel", "5 Vegas", "Gurkha", "Camacho", "La Aroma de Cuba",
    "Avo", "El Rey del Mundo", "Joya de Nicaragua", "Kristoff", "Illusione",
    "Crowned Heads", "Foundation", "Warped", "RoMa Craft", "Dunbarton",
    "Aging Room", "Quesada", "EP Carrillo", "La Palina", "Cornelius & Anthony",
    "601", "Casa Magna", "Curivari", "Emilio", "Espinosa",
    "Fonseca", "Henry Clay", "La Flor Dominicana", "Lechuga", "Macanudo Inspirado",
    "Nat Sherman", "Onyx", "Plasencia", "Royal Blunts", "San Lotano",
    "Torano", "Vegas Robaina", "Trinidad", "Flor de Oliva", "Baccarat",
    "Sancho Panza", "Excalibur", "La Unica", "Santa Clara", "Te-Amo",
    "Villiger", "Don Diego", "Quorum", "Makers Mark", "Brick House",
    "Nica Libre", "Graycliff", "La Palma", "Cusano", "Gran Habano",
    "Indian Tabac", "Jericho Hill", "Las Calaveras", "Leaf by Oscar",
    "Mi Querida", "Nick's Sticks", "Ortega", "Protocol", "Regius",
    "Southern Draw", "Still Smokin", "Umbagog", "Viaje", "Warpigs"
]

# Common cigar sizes/vitolas
COMMON_SIZES = [
    {"name": "Robusto", "size": "5 x 50"},
    {"name": "Toro", "size": "6 x 50"},
    {"name": "Churchill", "size": "7 x 48"},
    {"name": "Gordo", "size": "6 x 60"},
    {"name": "Corona", "size": "5.5 x 42"},
    {"name": "Petit Corona", "size": "4.5 x 40"},
    {"name": "Lancero", "size": "7 x 38"},
    {"name": "Torpedo", "size": "6 x 52"},
    {"name": "Belicoso", "size": "5.5 x 52"},
    {"name": "Panetela", "size": "6 x 34"},
]

# Strength variations
STRENGTHS = ["mild", "mild-medium", "medium", "medium-full", "full"]

# Common origins
ORIGINS = ["Nicaragua", "Dominican Republic", "Honduras", "Ecuador", "Cuba", "Mexico", "USA"]

# Common wrappers
WRAPPERS = ["Connecticut", "Habano", "Maduro", "Corojo", "Sumatra", "Cameroon", "Candela", "San Andres"]

async def generate_placeholder_image():
    """Generate a simple placeholder image (empty base64)"""
    return ""

async def add_cigars_to_db():
    """Add top 100 cigar brands with common sizes to database"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.test_database
    
    print(f"Starting to add top 100 cigar brands...")
    print(f"This will add approximately {len(TOP_100_BRANDS) * len(COMMON_SIZES)} cigars")
    
    added_count = 0
    skipped_count = 0
    
    for brand in TOP_100_BRANDS:
        print(f"\nProcessing brand: {brand}")
        
        # For each brand, add cigars with common sizes
        for size_info in COMMON_SIZES:
            # Create cigar name
            cigar_name = f"{brand} {size_info['name']}"
            
            # Check if already exists
            existing = await db.cigars.find_one({
                "brand": {"$regex": f"^{brand}$", "$options": "i"},
                "name": {"$regex": f"^{size_info['name']}$", "$options": "i"}
            })
            
            if existing:
                print(f"  ⊘ Skipped: {cigar_name} (already exists)")
                skipped_count += 1
                continue
            
            # Determine characteristics based on brand
            strength = "medium"  # Default
            origin = "Nicaragua"  # Default
            wrapper = "Habano"  # Default
            price_range = "10-15"  # Default
            
            # Customize based on brand (basic heuristics)
            if brand in ["Padron", "My Father", "Drew Estate", "Liga Privada"]:
                strength = "full"
                price_range = "15-25"
            elif brand in ["Davidoff", "Arturo Fuente", "Cohiba"]:
                strength = "medium-full"
                price_range = "20-40"
                origin = "Dominican Republic"
            elif brand in ["Acid", "Java", "Tabak Especial"]:
                strength = "mild-medium"
                price_range = "8-12"
                wrapper = "Connecticut"
            elif brand in ["Macanudo", "Ashton", "Avo"]:
                strength = "mild"
                price_range = "8-15"
                wrapper = "Connecticut"
                origin = "Dominican Republic"
            
            # Create cigar document
            cigar_doc = {
                "brand": brand,
                "name": size_info['name'],
                "size": size_info['size'],
                "strength": strength,
                "origin": origin,
                "wrapper": wrapper,
                "price_range": price_range,
                "image": await generate_placeholder_image(),
                "average_rating": 0.0,
                "rating_count": 0,
                "created_at": datetime.utcnow(),
                "user_submitted": False
            }
            
            # Insert into database
            result = await db.cigars.insert_one(cigar_doc)
            print(f"  ✓ Added: {brand} {size_info['name']} ({size_info['size']}) - {strength} - ${price_range}")
            added_count += 1
    
    print(f"\n{'='*60}")
    print(f"SUMMARY:")
    print(f"{'='*60}")
    print(f"✓ Successfully added: {added_count} cigars")
    print(f"⊘ Skipped (duplicates): {skipped_count} cigars")
    print(f"Total brands processed: {len(TOP_100_BRANDS)}")
    print(f"{'='*60}")
    
    client.close()

if __name__ == "__main__":
    print("="*60)
    print("ADDING TOP 100 CIGAR BRANDS TO DATABASE")
    print("="*60)
    asyncio.run(add_cigars_to_db())

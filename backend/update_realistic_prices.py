"""
Update cigars with realistic price ranges based on 2025 market research
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Price ranges based on brand, line, and market research
BRAND_PRICING = {
    # Premium Cuban/Dominican brands
    "Cohiba": {
        "default": "25-35",
        "Behike": "40-55",
        "Siglo": "20-30",
    },
    "Montecristo": {
        "default": "18-26",
        "No. 2": "20-27",
        "No. 4": "15-20",
        "1935": "12-17",
    },
    "Padron": {
        "default": "12-18",
        "1964": "16-20",
        "1926": "18-25",
        "Anniversary": "16-22",
    },
    "Davidoff": {
        "default": "20-30",
        "Millennium": "25-35",
        "Winston Churchill": "22-32",
    },
    "Arturo Fuente": {
        "default": "10-16",
        "Opus X": "30-50",
        "Don Carlos": "14-20",
        "Hemingway": "12-18",
    },
    
    # Mid-premium brands
    "Oliva": {
        "default": "7-12",
        "Serie V": "10-18",
        "Master Blends": "8-14",
        "Serie G": "6-10",
    },
    "My Father": {
        "default": "10-15",
        "Le Bijou": "11-16",
        "Flor de las Antillas": "8-12",
        "Don Pepin": "10-15",
    },
    "EP Carrillo": {
        "default": "9-14",
        "La Historia": "12-18",
        "Encore": "10-15",
        "Dusk": "8-13",
        "Inch": "10-15",
        "Pledge": "11-16",
    },
    "Romeo y Julieta": {
        "default": "12-20",
        "Churchill": "15-22",
        "Reserva": "14-20",
    },
    
    # Mid-range brands
    "Rocky Patel": {
        "default": "7-12",
        "Decade": "9-14",
        "Vintage": "7-11",
        "Sun Grown": "6-10",
    },
    "Perdomo": {
        "default": "6-11",
        "Reserve": "8-13",
        "Lot 23": "7-11",
        "Champagne": "6-10",
    },
    "Alec Bradley": {
        "default": "7-12",
        "Prensado": "8-13",
        "Black Market": "7-11",
    },
    "Plasencia": {
        "default": "8-14",
        "Reserva": "10-16",
        "Alma": "9-14",
    },
    "Foundation": {
        "default": "9-15",
        "El Gueguense": "10-16",
        "Tabernacle": "9-14",
    },
    
    # Popular accessible brands
    "Drew Estate": {
        "default": "7-12",
        "Liga Privada": "12-18",
        "Undercrown": "8-13",
        "Acid": "6-10",
    },
    "Partagas": {
        "default": "10-18",
        "Serie D": "15-22",
        "Black Label": "8-13",
    },
    "Hoyo de Monterrey": {
        "default": "12-18",
        "Epicure": "15-22",
        "Excellence": "10-16",
    },
    "Punch": {
        "default": "8-14",
        "Rare Corojo": "9-14",
    },
    "Macanudo": {
        "default": "7-12",
        "Inspirado": "9-14",
        "Vintage": "10-15",
    },
    
    # Value brands
    "Kristoff": {"default": "7-12"},
    "Man O' War": {"default": "6-10"},
    "Nub": {"default": "6-10"},
    "CAO": {"default": "7-12"},
    "Ashton": {"default": "9-15"},
    "Avo": {"default": "10-16"},
    "Joya de Nicaragua": {"default": "7-12"},
    "La Aroma de Cuba": {"default": "7-12"},
    "Camacho": {"default": "8-13"},
    "Diesel": {"default": "6-10"},
    "Eiroa": {"default": "9-15"},
    "San Cristobal": {"default": "10-16"},
    "Crowned Heads": {"default": "8-14"},
    "Warped": {"default": "9-15"},
    "RoMa Craft": {"default": "9-14"},
    "Illusione": {"default": "9-15"},
    "Tatuaje": {"default": "9-15"},
    "Sobremesa": {"default": "10-16"},
    "Aganorsa Leaf": {"default": "8-13"},
    "Southern Draw": {"default": "9-14"},
    "Fratello": {"default": "8-13"},
}


def get_price_for_cigar(brand, name):
    """Determine appropriate price range for a cigar"""
    
    # Check if brand has specific pricing
    if brand in BRAND_PRICING:
        brand_prices = BRAND_PRICING[brand]
        
        # Check for specific line pricing
        for line_name, price in brand_prices.items():
            if line_name != "default" and line_name.lower() in name.lower():
                return price
        
        # Use default for brand
        return brand_prices.get("default", "8-13")
    
    # Default pricing for unknown brands
    return "8-13"


async def update_prices():
    """Update all cigars with realistic price ranges"""
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "test_database")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 60)
    print("UPDATING CIGAR PRICES WITH REALISTIC 2025 MARKET RANGES")
    print("=" * 60)
    
    # Get all cigars
    cigars = await db.cigars.find({}).to_list(10000)
    
    updated_count = 0
    
    for cigar in cigars:
        brand = cigar.get("brand", "")
        name = cigar.get("name", "")
        current_price = cigar.get("price_range", "")
        
        # Get realistic price
        new_price = get_price_for_cigar(brand, name)
        
        # Only update if different
        if current_price != new_price:
            await db.cigars.update_one(
                {"_id": cigar["_id"]},
                {"$set": {"price_range": new_price}}
            )
            updated_count += 1
            if updated_count <= 20:  # Show first 20 updates
                print(f"✅ {brand} {name[:40]:40s} | ${current_price:8s} → ${new_price}")
    
    if updated_count > 20:
        print(f"   ... and {updated_count - 20} more")
    
    print(f"\n{'=' * 60}")
    print(f"✅ Updated {updated_count} cigars with realistic prices")
    print(f"{'=' * 60}")
    
    # Show price distribution
    all_cigars = await db.cigars.find({}, {"price_range": 1, "brand": 1}).to_list(10000)
    
    print("\nPrice distribution by range:")
    price_counts = {}
    for c in all_cigars:
        price = c.get("price_range", "unknown")
        price_counts[price] = price_counts.get(price, 0) + 1
    
    for price_range in sorted(price_counts.keys()):
        print(f"  ${price_range:12s}: {price_counts[price_range]:4d} cigars")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(update_prices())

"""
Update cigar images - one unique image per brand
36 brands = 36 unique images
"""
import requests
import base64
from io import BytesIO
from PIL import Image
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# 36 unique professional cigar images from Unsplash/Pexels
BRAND_IMAGES = [
    "https://images.unsplash.com/photo-1592862080230-fe0a3b380f21",
    "https://images.unsplash.com/photo-1694716479704-459f025d0793",
    "https://images.unsplash.com/photo-1694716429728-0956a334d3e8",
    "https://images.unsplash.com/photo-1720883656710-347f50fe3667",
    "https://images.pexels.com/photos/1637114/pexels-photo-1637114.jpeg",
    "https://images.unsplash.com/photo-1547652577-b4fe2f34d7ee",
    "https://images.unsplash.com/photo-1612659429327-8f59b894959b",
    "https://images.unsplash.com/photo-1603824256092-2b191e88da7f",
    "https://images.unsplash.com/photo-1749842484608-a8ac079988f0",
    "https://images.unsplash.com/photo-1547424450-a69b33b2cdc2",
    "https://images.unsplash.com/photo-1547402270-90bead7d3820",
    "https://images.unsplash.com/photo-1610561282847-64f89e27807a",
    "https://images.unsplash.com/photo-1493581059026-ef2f165a5c0d",
    "https://images.pexels.com/photos/18705403/pexels-photo-18705403.jpeg",
    "https://images.pexels.com/photos/18705404/pexels-photo-18705404.jpeg",
    "https://images.unsplash.com/photo-1694716490831-12bd5eb88f28",
    "https://images.pexels.com/photos/7403/pexels-photo.jpg",
    "https://images.pexels.com/photos/6713597/pexels-photo-6713597.jpeg",
    "https://images.pexels.com/photos/3975055/pexels-photo-3975055.jpeg",
    "https://images.unsplash.com/photo-1564316911608-6b51e3a3cf3d",
    "https://images.pexels.com/photos/34217309/pexels-photo-34217309.jpeg",
    "https://images.pexels.com/photos/34323703/pexels-photo-34323703.jpeg",
    "https://images.pexels.com/photos/11725476/pexels-photo-11725476.jpeg",
    "https://images.pexels.com/photos/14017014/pexels-photo-14017014.jpeg",
    "https://images.pexels.com/photos/10233497/pexels-photo-10233497.jpeg",
    "https://images.pexels.com/photos/26971408/pexels-photo-26971408.jpeg",
    "https://images.pexels.com/photos/18705412/pexels-photo-18705412.jpeg",
    "https://images.unsplash.com/photo-1612037100444-d9756f36ef7c",
    "https://images.unsplash.com/photo-1749841729944-f578b1413a2a",
    "https://images.unsplash.com/photo-1547654570-74d3950c45d6",
    "https://images.unsplash.com/photo-1606502011842-1b0d5af1cf75",
    "https://images.unsplash.com/photo-1612196808214-b8e1d0b9d6b5",
    "https://images.unsplash.com/photo-1694716430515-aa15c0e2e4c8",
    "https://images.unsplash.com/photo-1694716502847-2fb3a4cc0b29",
    "https://images.unsplash.com/photo-1694716581832-20175f4e89d1",
    "https://images.unsplash.com/photo-1612037100444-d9756f36ef7c",
]

def download_and_convert(url, size=(400, 400)):
    """Download image and convert to base64"""
    try:
        print(f"⬇️  Downloading: {url[:50]}...")
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            img = Image.open(BytesIO(response.content))
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.thumbnail(size, Image.Resampling.LANCZOS)
            buffered = BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            print(f"✅ Converted successfully")
            return img_base64
        else:
            print(f"❌ HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

async def update_brand_images():
    """Update all cigars with brand-specific images"""
    print("=" * 60)
    print("DOWNLOADING BRAND-SPECIFIC CIGAR IMAGES")
    print("=" * 60)
    
    # Download all images
    images = []
    for url in BRAND_IMAGES:
        img = download_and_convert(url)
        if img:
            images.append(img)
    
    print(f"\n✅ Downloaded {len(images)} images")
    
    if len(images) < 36:
        print(f"⚠️  Only got {len(images)} images, expected 36")
    
    # Connect to MongoDB
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client.cigar_db
    
    # Get all unique brands
    brands = await db.cigars.distinct("brand")
    brands = sorted(brands)
    
    print(f"\n📊 Found {len(brands)} unique brands")
    
    # Create brand -> image mapping
    brand_image_map = {}
    for idx, brand in enumerate(brands):
        if idx < len(images):
            brand_image_map[brand] = images[idx]
            print(f"   {idx+1}. {brand} -> Image {idx+1}")
        else:
            # Fallback to cycling through images if we don't have enough
            brand_image_map[brand] = images[idx % len(images)]
            print(f"   {idx+1}. {brand} -> Image {(idx % len(images))+1} (cycling)")
    
    # Update all cigars by brand
    print(f"\n🔄 Updating cigars...")
    total_updated = 0
    
    for brand, image in brand_image_map.items():
        result = await db.cigars.update_many(
            {"brand": brand},
            {"$set": {"image": image}}
        )
        total_updated += result.modified_count
        print(f"   ✅ {brand}: Updated {result.modified_count} cigars")
    
    print(f"\n🎉 Successfully updated {total_updated} cigars across {len(brands)} brands!")
    client.close()

if __name__ == "__main__":
    asyncio.run(update_brand_images())

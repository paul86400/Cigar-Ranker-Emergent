"""
Script to update cigar images with proper placeholder images
Since we can't use trademarked brand logos without permission,
we'll use generic cigar images from the vision agent results
"""
import requests
import base64
from io import BytesIO
from PIL import Image

# Generic cigar images from Pexels/Unsplash (royalty-free)
CIGAR_IMAGES = [
    "https://images.pexels.com/photos/1637114/pexels-photo-1637114.jpeg",
    "https://images.pexels.com/photos/34217309/pexels-photo-34217309.jpeg",
    "https://images.pexels.com/photos/34323703/pexels-photo-34323703.jpeg",
    "https://images.pexels.com/photos/11725476/pexels-photo-11725476.jpeg",
    "https://images.pexels.com/photos/14017014/pexels-photo-14017014.jpeg",
    "https://images.pexels.com/photos/10233497/pexels-photo-10233497.jpeg",
    "https://images.pexels.com/photos/26971408/pexels-photo-26971408.jpeg",
    "https://images.pexels.com/photos/18705412/pexels-photo-18705412.jpeg",
]

def download_and_convert_to_base64(url, size=(400, 400)):
    """Download image and convert to base64"""
    try:
        print(f"Downloading: {url}")
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            # Open image
            img = Image.open(BytesIO(response.content))
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize while maintaining aspect ratio
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Convert to base64
            buffered = BytesIO()
            img.save(buffered, format="JPEG", quality=85)
            img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
            
            print(f"✅ Converted successfully")
            return img_base64
        else:
            print(f"❌ Failed to download: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def get_cigar_images():
    """Download and convert all cigar images to base64"""
    base64_images = []
    
    for url in CIGAR_IMAGES:
        b64 = download_and_convert_to_base64(url)
        if b64:
            base64_images.append(b64)
    
    return base64_images

if __name__ == "__main__":
    print("=" * 50)
    print("DOWNLOADING CIGAR IMAGES")
    print("=" * 50)
    images = get_cigar_images()
    print(f"\n✅ Successfully downloaded {len(images)} images")
    print(f"Saved as base64 strings")

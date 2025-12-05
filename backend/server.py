from fastapi import FastAPI, APIRouter, Depends, HTTPException, File, UploadFile
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import base64
from io import BytesIO
from PIL import Image

# Import local modules
from models import (
    UserCreate, UserLogin, UserProfile, UserUpdate,
    CigarCreate, CigarResponse, RatingCreate, RatingResponse,
    CommentCreate, CommentResponse, SearchQuery,
    LabelScanRequest, BarcodeScanRequest, StorePrice
)
from auth import hash_password, verify_password, create_access_token, get_current_user

# Import AI integration
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

# Import cigar images
from cigar_images_data import MONTECRISTO_IMAGE, PADRON_IMAGE, ARTURO_IMAGE, COHIBA_IMAGE, LIGA_IMAGE

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Get Emergent LLM key
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Helper functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    del doc['_id']
    return doc


# ==================== Authentication Endpoints ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": hashed_password,
        "profile_pic": None,
        "preferences": {},
        "favorites": [],
        "created_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Create JWT token
    token = create_access_token(user_id)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "username": user_data.username,
            "email": user_data.email
        }
    }


@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login user"""
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user['_id'])
    token = create_access_token(user_id)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "username": user['username'],
            "email": user['email'],
            "profile_pic": user.get('profile_pic'),
            "preferences": user.get('preferences', {}),
            "favorites": user.get('favorites', [])
        }
    }


@api_router.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    """Get current user profile"""
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": str(user['_id']),
        "username": user['username'],
        "email": user['email'],
        "profile_pic": user.get('profile_pic'),
        "preferences": user.get('preferences', {}),
        "favorites": user.get('favorites', [])
    }


@api_router.put("/auth/profile")
async def update_profile(update_data: UserUpdate, user_id: str = Depends(get_current_user)):
    """Update user profile"""
    update_fields = {}
    if update_data.username:
        # Check if username is taken
        existing = await db.users.find_one({
            "username": update_data.username,
            "_id": {"$ne": ObjectId(user_id)}
        })
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        update_fields['username'] = update_data.username
    
    if update_data.profile_pic:
        update_fields['profile_pic'] = update_data.profile_pic
    
    if update_data.preferences:
        update_fields['preferences'] = update_data.preferences
    
    if update_fields:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return {
        "id": str(user['_id']),
        "username": user['username'],
        "email": user['email'],
        "profile_pic": user.get('profile_pic'),
        "preferences": user.get('preferences', {}),
        "favorites": user.get('favorites', [])
    }


# ==================== Cigar Endpoints ====================

@api_router.get("/cigars/search")
async def search_cigars(
    q: Optional[str] = None,
    strength: Optional[str] = None,
    origin: Optional[str] = None,
    size: Optional[str] = None,
    wrapper: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    """Search cigars with filters"""
    query = {}
    
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"brand": {"$regex": q, "$options": "i"}},
            {"flavor_notes": {"$regex": q, "$options": "i"}}
        ]
    
    if strength:
        query["strength"] = {"$regex": strength, "$options": "i"}
    
    if origin:
        query["origin"] = {"$regex": origin, "$options": "i"}
    
    if size:
        query["size"] = {"$regex": size, "$options": "i"}
    
    if wrapper:
        query["wrapper"] = {"$regex": wrapper, "$options": "i"}
    
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price_range"] = price_query
    
    # Optimized query with projection to fetch only necessary fields
    projection = {
        "name": 1, "brand": 1, "image": 1, "strength": 1, 
        "origin": 1, "average_rating": 1, "rating_count": 1, "price_range": 1
    }
    cigars = await db.cigars.find(query, projection).limit(50).to_list(50)
    return [serialize_doc(cigar) for cigar in cigars]


@api_router.get("/cigars/{cigar_id}")
async def get_cigar(cigar_id: str):
    """Get cigar details"""
    cigar = await db.cigars.find_one({"_id": ObjectId(cigar_id)})
    if not cigar:
        raise HTTPException(status_code=404, detail="Cigar not found")
    
    return serialize_doc(cigar)


@api_router.post("/cigars", response_model=CigarResponse)
async def create_cigar(cigar_data: CigarCreate, user_id: str = Depends(get_current_user)):
    """Create a new cigar entry (admin/authorized users)"""
    cigar_doc = cigar_data.model_dump()
    cigar_doc['average_rating'] = 0.0
    cigar_doc['rating_count'] = 0
    cigar_doc['created_at'] = datetime.utcnow()
    
    result = await db.cigars.insert_one(cigar_doc)
    cigar_doc['id'] = str(result.inserted_id)
    
    return cigar_doc


@api_router.post("/cigars/scan-label")
async def scan_label(request: LabelScanRequest):
    """Scan cigar label using AI vision"""
    try:
        # Use OpenAI Vision to identify the cigar
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"label_scan_{datetime.utcnow().timestamp()}",
            system_message="You are an expert cigar identifier. Analyze the image and extract: cigar brand, name, strength, and any visible details. Return ONLY a JSON object with these fields: {\"brand\": \"\", \"name\": \"\", \"strength\": \"\", \"details\": \"\"}. If you can't identify it, return {\"error\": \"Unable to identify cigar\"}."
        ).with_model("openai", "gpt-4o")
        
        image_content = ImageContent(image_base64=request.image_base64)
        
        user_message = UserMessage(
            text="Please identify this cigar from the label. Return only JSON.",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Try to find matching cigar in database
        # Parse response and search
        import json
        try:
            cigar_info = json.loads(response.strip())
            if "error" in cigar_info:
                return {"identified": False, "message": cigar_info["error"]}
            
            # Search for matching cigar
            brand = cigar_info.get("brand", "")
            name = cigar_info.get("name", "")
            
            if brand or name:
                query = {"$or": []}
                if brand:
                    query["$or"].append({"brand": {"$regex": brand, "$options": "i"}})
                if name:
                    query["$or"].append({"name": {"$regex": name, "$options": "i"}})
                
                cigar = await db.cigars.find_one(query)
                if cigar:
                    return {
                        "identified": True,
                        "cigar": serialize_doc(cigar),
                        "ai_info": cigar_info
                    }
            
            return {
                "identified": False,
                "ai_info": cigar_info,
                "message": "Cigar identified but not in database"
            }
        except json.JSONDecodeError:
            return {"identified": False, "message": "Unable to parse AI response", "raw": response}
            
    except Exception as e:
        logger.error(f"Error scanning label: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/cigars/scan-barcode")
async def scan_barcode(request: BarcodeScanRequest):
    """Scan barcode and find cigar"""
    cigar = await db.cigars.find_one({"barcode": request.barcode})
    if cigar:
        return {
            "found": True,
            "cigar": serialize_doc(cigar)
        }
    
    # Try to lookup barcode in external API (free tier)
    # For MVP, return not found
    return {
        "found": False,
        "message": "Cigar not found with this barcode"
    }


# ==================== Rating Endpoints ====================

@api_router.post("/ratings")
async def create_rating(rating_data: RatingCreate, user_id: str = Depends(get_current_user)):
    """Create or update a rating"""
    # Check if user already rated this cigar
    existing_rating = await db.ratings.find_one({
        "user_id": user_id,
        "cigar_id": rating_data.cigar_id
    })
    
    if existing_rating:
        # Update existing rating
        await db.ratings.update_one(
            {"_id": existing_rating['_id']},
            {"$set": {"rating": rating_data.rating, "updated_at": datetime.utcnow()}}
        )
    else:
        # Create new rating
        rating_doc = {
            "user_id": user_id,
            "cigar_id": rating_data.cigar_id,
            "rating": rating_data.rating,
            "created_at": datetime.utcnow()
        }
        await db.ratings.insert_one(rating_doc)
    
    # Recalculate average rating for the cigar
    pipeline = [
        {"$match": {"cigar_id": rating_data.cigar_id}},
        {"$group": {
            "_id": None,
            "avg_rating": {"$avg": "$rating"},
            "count": {"$sum": 1}
        }}
    ]
    
    result = await db.ratings.aggregate(pipeline).to_list(1)
    if result:
        avg_rating = round(result[0]['avg_rating'], 1)
        count = result[0]['count']
        
        await db.cigars.update_one(
            {"_id": ObjectId(rating_data.cigar_id)},
            {"$set": {"average_rating": avg_rating, "rating_count": count}}
        )
    
    return {"success": True, "rating": rating_data.rating}


@api_router.get("/ratings/cigar/{cigar_id}")
async def get_cigar_ratings(cigar_id: str):
    """Get all ratings for a cigar"""
    projection = {"user_id": 1, "rating": 1, "created_at": 1}
    ratings = await db.ratings.find({"cigar_id": cigar_id}, projection).limit(100).to_list(100)
    return [serialize_doc(rating) for rating in ratings]


@api_router.get("/ratings/user/{cigar_id}")
async def get_user_rating(cigar_id: str, user_id: str = Depends(get_current_user)):
    """Get user's rating for a specific cigar"""
    rating = await db.ratings.find_one({
        "user_id": user_id,
        "cigar_id": cigar_id
    })
    if rating:
        return serialize_doc(rating)
    return None


# ==================== Comment Endpoints ====================

@api_router.post("/comments")
async def create_comment(comment_data: CommentCreate, user_id: str = Depends(get_current_user)):
    """Create a comment"""
    comment_doc = comment_data.model_dump()
    comment_doc['user_id'] = user_id
    comment_doc['created_at'] = datetime.utcnow()
    
    result = await db.comments.insert_one(comment_doc)
    
    # Get user info
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    comment_doc['id'] = str(result.inserted_id)
    comment_doc['username'] = user['username']
    comment_doc['replies'] = []
    
    return comment_doc


@api_router.get("/comments/{cigar_id}")
async def get_comments(cigar_id: str):
    """Get all comments for a cigar (nested structure)"""
    # Get all comments for this cigar with projection
    projection = {"user_id": 1, "text": 1, "parent_id": 1, "images": 1, "created_at": 1}
    all_comments = await db.comments.find({"cigar_id": cigar_id}, projection).sort("created_at", -1).limit(100).to_list(100)
    
    # Get user info for all comments with projection
    user_ids = list(set([c['user_id'] for c in all_comments]))
    users = await db.users.find(
        {"_id": {"$in": [ObjectId(uid) for uid in user_ids]}}, 
        {"username": 1}
    ).to_list(len(user_ids))
    user_map = {str(u['_id']): u['username'] for u in users}
    
    # Build comment tree
    comment_map = {}
    root_comments = []
    
    for comment in all_comments:
        comment_obj = serialize_doc(comment)
        comment_obj['username'] = user_map.get(comment['user_id'], 'Unknown')
        comment_obj['replies'] = []
        comment_map[comment_obj['id']] = comment_obj
        
        if comment.get('parent_id'):
            # This is a reply
            parent = comment_map.get(comment['parent_id'])
            if parent:
                parent['replies'].append(comment_obj)
        else:
            # This is a root comment
            root_comments.append(comment_obj)
    
    return root_comments


# ==================== Favorites Endpoints ====================

@api_router.post("/favorites/{cigar_id}")
async def add_favorite(cigar_id: str, user_id: str = Depends(get_current_user)):
    """Add cigar to favorites"""
    # Check if cigar exists
    cigar = await db.cigars.find_one({"_id": ObjectId(cigar_id)})
    if not cigar:
        raise HTTPException(status_code=404, detail="Cigar not found")
    
    # Add to favorites if not already there
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"favorites": cigar_id}}
    )
    
    return {"success": True, "message": "Added to favorites"}


@api_router.delete("/favorites/{cigar_id}")
async def remove_favorite(cigar_id: str, user_id: str = Depends(get_current_user)):
    """Remove cigar from favorites"""
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"favorites": cigar_id}}
    )
    
    return {"success": True, "message": "Removed from favorites"}


@api_router.get("/favorites")
async def get_favorites(user_id: str = Depends(get_current_user)):
    """Get user's favorite cigars"""
    user = await db.users.find_one({"_id": ObjectId(user_id)}, {"favorites": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    favorite_ids = user.get('favorites', [])
    if not favorite_ids:
        return []
    
    # Get cigar details with projection
    projection = {
        "name": 1, "brand": 1, "image": 1, "strength": 1, 
        "origin": 1, "average_rating": 1, "rating_count": 1, "price_range": 1
    }
    cigars = await db.cigars.find({
        "_id": {"$in": [ObjectId(cid) for cid in favorite_ids]}
    }, projection).limit(100).to_list(100)
    
    return [serialize_doc(cigar) for cigar in cigars]


# ==================== Store Price Endpoints ====================

@api_router.get("/stores/{cigar_id}")
async def get_store_prices(cigar_id: str):
    """Get store prices for a cigar"""
    # For MVP, return mock data for the three stores
    cigar = await db.cigars.find_one({"_id": ObjectId(cigar_id)})
    if not cigar:
        raise HTTPException(status_code=404, detail="Cigar not found")
    
    cigar_name = cigar.get('name', '')
    brand = cigar.get('brand', '')
    
    # Mock store data (in production, this would scrape or use APIs)
    stores = [
        {
            "store_name": "Cigars International",
            "price": 8.99,
            "url": f"https://www.cigarsinternational.com/search/?q={cigar_name.replace(' ', '+')}",
            "in_stock": True
        },
        {
            "store_name": "Neptune Cigar",
            "price": 9.49,
            "url": f"https://www.neptunecigar.com/search?q={cigar_name.replace(' ', '+')}",
            "in_stock": True
        },
        {
            "store_name": "Atlantic Cigar",
            "price": 8.75,
            "url": f"https://www.atlanticcigar.com/search.asp?keyword={cigar_name.replace(' ', '+')}",
            "in_stock": False
        }
    ]
    
    return stores


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# Seed some sample cigars on startup
@app.on_event("startup")
async def seed_database():
    """Seed the database with sample cigars"""
    count = await db.cigars.count_documents({})
    if count == 0:
        logger.info("Seeding database with sample cigars...")
        sample_cigars = [
            {
                "name": "Montecristo No. 2",
                "brand": "Montecristo",
                "image": MONTECRISTO_IMAGE,
                "images": [],
                "strength": "Medium",
                "flavor_notes": ["Cocoa", "Coffee", "Cedar"],
                "origin": "Cuba",
                "wrapper": "Habano",
                "binder": "Cuban",
                "filler": "Cuban",
                "size": "Torpedo (6.1 x 52)",
                "price_range": "25-30",
                "barcode": "7501055300013",
                "average_rating": 9.2,
                "rating_count": 0,
                "created_at": datetime.utcnow()
            },
            {
                "name": "Padron 1964 Anniversary",
                "brand": "Padron",
                "image": PADRON_IMAGE,
                "images": [],
                "strength": "Full",
                "flavor_notes": ["Chocolate", "Coffee", "Nuts"],
                "origin": "Nicaragua",
                "wrapper": "Nicaraguan Maduro",
                "binder": "Nicaraguan",
                "filler": "Nicaraguan",
                "size": "Robusto (5 x 50)",
                "price_range": "15-20",
                "barcode": "7501055300020",
                "average_rating": 9.5,
                "rating_count": 0,
                "created_at": datetime.utcnow()
            },
            {
                "name": "Arturo Fuente Opus X",
                "brand": "Arturo Fuente",
                "image": ARTURO_IMAGE,
                "images": [],
                "strength": "Full",
                "flavor_notes": ["Spice", "Leather", "Pepper"],
                "origin": "Dominican Republic",
                "wrapper": "Dominican Sun Grown",
                "binder": "Dominican",
                "filler": "Dominican",
                "size": "Robusto (5.25 x 50)",
                "price_range": "20-25",
                "barcode": "7501055300037",
                "average_rating": 9.4,
                "rating_count": 0,
                "created_at": datetime.utcnow()
            },
            {
                "name": "Cohiba Behike 52",
                "brand": "Cohiba",
                "image": COHIBA_IMAGE,
                "images": [],
                "strength": "Medium-Full",
                "flavor_notes": ["Honey", "Wood", "Floral"],
                "origin": "Cuba",
                "wrapper": "Habano",
                "binder": "Cuban",
                "filler": "Cuban",
                "size": "Laguito No. 4 (4.3 x 52)",
                "price_range": "40-50",
                "barcode": "7501055300044",
                "average_rating": 9.6,
                "rating_count": 0,
                "created_at": datetime.utcnow()
            },
            {
                "name": "Drew Estate Liga Privada No. 9",
                "brand": "Drew Estate",
                "image": LIGA_IMAGE,
                "images": [],
                "strength": "Full",
                "flavor_notes": ["Cocoa", "Earth", "Espresso"],
                "origin": "Nicaragua",
                "wrapper": "Connecticut Broadleaf Maduro",
                "binder": "Honduran",
                "filler": "Nicaraguan",
                "size": "Toro (6 x 52)",
                "price_range": "12-15",
                "barcode": "7501055300051",
                "average_rating": 9.1,
                "rating_count": 0,
                "created_at": datetime.utcnow()
            }
        ]
        
        await db.cigars.insert_many(sample_cigars)
        logger.info(f"Seeded {len(sample_cigars)} sample cigars")

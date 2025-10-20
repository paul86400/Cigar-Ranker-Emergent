from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


# User Models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    profile_pic: Optional[str] = None
    preferences: Optional[dict] = None
    favorites: List[str] = []

class UserUpdate(BaseModel):
    username: Optional[str] = None
    profile_pic: Optional[str] = None
    preferences: Optional[dict] = None


# Cigar Models
class CigarCreate(BaseModel):
    name: str
    brand: str
    image: str
    images: List[str] = []
    strength: str
    flavor_notes: List[str] = []
    origin: str
    wrapper: Optional[str] = None
    binder: Optional[str] = None
    filler: Optional[str] = None
    size: Optional[str] = None
    price_range: Optional[str] = None
    barcode: Optional[str] = None

class CigarResponse(BaseModel):
    id: str
    name: str
    brand: str
    image: str
    images: List[str] = []
    strength: str
    flavor_notes: List[str] = []
    origin: str
    wrapper: Optional[str] = None
    binder: Optional[str] = None
    filler: Optional[str] = None
    size: Optional[str] = None
    price_range: Optional[str] = None
    barcode: Optional[str] = None
    average_rating: float = 0.0
    rating_count: int = 0


# Rating Models
class RatingCreate(BaseModel):
    cigar_id: str
    rating: float

class RatingResponse(BaseModel):
    id: str
    user_id: str
    cigar_id: str
    rating: float
    created_at: datetime


# Comment Models
class CommentCreate(BaseModel):
    cigar_id: str
    text: str
    parent_id: Optional[str] = None
    images: List[str] = []

class CommentResponse(BaseModel):
    id: str
    user_id: str
    username: str
    cigar_id: str
    text: str
    parent_id: Optional[str] = None
    images: List[str] = []
    created_at: datetime
    replies: List['CommentResponse'] = []


# Search Models
class SearchQuery(BaseModel):
    query: Optional[str] = None
    strength: Optional[str] = None
    origin: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    wrapper: Optional[str] = None
    size: Optional[str] = None


# Label Recognition Models
class LabelScanRequest(BaseModel):
    image_base64: str

class BarcodeScanRequest(BaseModel):
    barcode: str


# Store Models
class StorePrice(BaseModel):
    store_name: str
    price: float
    url: str
    in_stock: bool

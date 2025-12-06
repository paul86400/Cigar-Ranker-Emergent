import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from bson import ObjectId

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME')

async def test_my_comments_query():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    user_id = '69337504102251c4fcf2a492'
    
    print(f'Testing my-comments query for user: {user_id}\n')
    
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$sort": {"created_at": -1}},
        {
            "$addFields": {
                "cigar_oid": {"$toObjectId": "$cigar_id"}
            }
        },
        {
            "$lookup": {
                "from": "cigars",
                "localField": "cigar_oid",
                "foreignField": "_id",
                "as": "cigar_details"
            }
        },
        {"$unwind": "$cigar_details"},
        {
            "$project": {
                "text": 1,
                "created_at": 1,
                "cigar_id": {"$toString": "$cigar_oid"},
                "cigar_name": "$cigar_details.name",
                "cigar_brand": "$cigar_details.brand",
                "cigar_image": "$cigar_details.image",
            }
        }
    ]
    
    try:
        comments = await db.comments.aggregate(pipeline).to_list(1000)
        print(f'Found {len(comments)} comments')
        
        if len(comments) > 0:
            print(f'\nFirst comment:')
            print(f'  Brand: {comments[0].get("cigar_brand")}')
            print(f'  Name: {comments[0].get("cigar_name")}')
            print(f'  Text: {comments[0].get("text")}')
            print(f'  Has image: {comments[0].get("cigar_image") is not None}')
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_my_comments_query())

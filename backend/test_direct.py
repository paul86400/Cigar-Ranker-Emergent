import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME')

async def test():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get pmk9000 user
    user = await db.users.find_one({'username': 'pmk9000'})
    if not user:
        print("User pmk9000 not found!")
        client.close()
        return
    
    user_id = str(user['_id'])
    print(f"User pmk9000 ID: {user_id}")
    print(f"User ID length: {len(user_id)}")
    print(f"User ID type: {type(user_id)}")
    
    # Find comments with this exact user_id
    comments = await db.comments.find({'user_id': user_id}).to_list(100)
    print(f"\nComments with user_id '{user_id}': {len(comments)}")
    
    # Now let's check what user_ids actually exist in comments
    print("\nAll unique user_ids in comments:")
    all_user_ids = await db.comments.distinct('user_id')
    for uid in all_user_ids:
        count = await db.comments.count_documents({'user_id': uid})
        print(f"  '{uid}' (len={len(uid)}): {count} comments")
        if uid == user_id:
            print(f"    ^ THIS MATCHES pmk9000's ID!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test())

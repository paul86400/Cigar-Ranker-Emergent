import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME')

async def check_user_ids():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get the user 'pmd0000'
    user = await db.users.find_one({'username': 'pmd0000'})
    if user:
        user_id = str(user['_id'])
        print(f'User pmd0000 ID: {user_id}')
        
        # Check comments with this user_id
        comments = await db.comments.find({'user_id': user_id}).to_list(10)
        print(f'Comments for this user_id: {len(comments)}')
        
        # Check all unique user_ids in comments
        all_user_ids = await db.comments.distinct('user_id')
        print(f'\nAll unique user_ids in comments collection:')
        for uid in all_user_ids:
            count = await db.comments.count_documents({'user_id': uid})
            print(f'  {uid} : {count} comments')
    else:
        print('User pmd0000 not found!')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_user_ids())

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME')

async def check_avo():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Find Avo Connecticut
    avo = await db.cigars.find_one({'brand': 'Avo', 'name': {'$regex': 'Connecticut', '$options': 'i'}})
    
    if avo:
        print(f'Cigar: {avo.get("brand")} {avo.get("name")}')
        print(f'Current rating: {avo.get("average_rating")}')
        print(f'Rating count: {avo.get("rating_count")}')
        print(f'Cigar ID: {avo["_id"]}')
        
        # Check ratings for this cigar
        cigar_id = str(avo['_id'])
        ratings = await db.ratings.find({'cigar_id': cigar_id}).to_list(100)
        print(f'\nRatings in database: {len(ratings)}')
        for r in ratings:
            print(f'  - Rating: {r.get("rating")} by user {r.get("user_id")[:8]}...')
        
        # Check if the cigar appears in search results
        print('\n--- Checking search results ---')
        search_results = await db.cigars.find({}).sort('average_rating', -1).limit(20).to_list(20)
        
        avo_in_results = False
        for idx, cigar in enumerate(search_results):
            if str(cigar['_id']) == cigar_id:
                print(f'✓ Avo Connecticut found at position {idx + 1}')
                avo_in_results = True
            print(f'{idx + 1}. {cigar.get("brand")} {cigar.get("name")}: {cigar.get("average_rating")} ({cigar.get("rating_count")} ratings)')
        
        if not avo_in_results:
            print('\n❌ Avo Connecticut NOT in top 20!')
    else:
        print('Avo Connecticut not found!')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_avo())

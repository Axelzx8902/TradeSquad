import asyncio
from database import supabase

res = supabase.table("assets").select("*").execute()
for item in res.data:
    print(item['symbol'], item['id'])

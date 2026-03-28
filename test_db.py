from database import supabase
print("assets:", supabase.table("assets").select("*").limit(1).execute().data)
print("market_assets:", supabase.table("market_assets").select("*").limit(1).execute().data)

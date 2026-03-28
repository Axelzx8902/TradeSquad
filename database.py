import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Load environment variables from the .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials (SUPABASE_URL and SUPABASE_KEY) must be provided in the .env file.")

# Initialize the Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

security = HTTPBearer(auto_error=False)

class MockUser:
    def __init__(self, user_id: str):
        self.id = user_id

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    TEMPORARY AUTH BYPASS
    Automatically returns an authenticated MockUser object with the MVP_USER_ID
    to allow the frontend features to be built and tested without a real JWT.
    """
    # The MVP_USER_ID we previously populated the database with
    return MockUser(user_id="00000000-0000-0000-0000-000000000001")

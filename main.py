from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import supabase
from routes import router as trading_router

app = FastAPI(title="Trading App API", description="Gamified trading application backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # This allows your Netlify site to talk to Render
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trading_router)

@app.get("/")
def health_check():
    """
    Health check endpoint to verify that the API is running.
    """
    return {
        "status": "ok",
        "message": "Trading App API is up and running!"
    }

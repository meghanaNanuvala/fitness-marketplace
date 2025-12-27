# app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.interfaces.routes import listings, user, purchase, review, cart
from app.infrastructure.database import connect_to_mongo, close_mongo_connection

app = FastAPI(title="Fitness Marketplace API (v1)")

# ✅ Enable CORS for your React frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ✅ Database lifecycle events
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

# Serve dev uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(listings.router)
app.include_router(user.router)
app.include_router(purchase.router)
app.include_router(review.router)
app.include_router(cart.router) 


@app.get("/")
def root():
    return {"message": "Fitness Marketplace API is running"}
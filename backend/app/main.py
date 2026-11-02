import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .database import engine, Base
from .seed_data import seed_database
from .routers import auth, patients, calls, alerts, appointments, analytics, telephony

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Rural Healthcare Post-Discharge AI Follow-up & Medication Adherence Companion powered by Sarvam AI.",
    version="1.0.0"
)

# Enable CORS for local Vite development & network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database with realistic synthetic rural patient cohort on startup
@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception as e:
        print(f"[Startup] Seed database warning: {e}")

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(calls.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(appointments.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(telephony.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "sarvam_ai_configured": bool(settings.SARVAM_API_KEY),
        "telephony_mode": "Twilio/Exotel Live" if (settings.TWILIO_ACCOUNT_SID or settings.EXOTEL_SID) else "Simulated Voice Demo Mode"
    }

# Mount frontend dist if built
dist_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="frontend")


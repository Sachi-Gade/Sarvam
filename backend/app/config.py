import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Missed-Dose & Follow-Up Companion (AarogyaVani)"
    API_V1_STR: str = "/api"
    SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aarogya_companion.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aarogya-super-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Telephony Configurations
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    EXOTEL_SID: str = os.getenv("EXOTEL_SID", "")
    EXOTEL_TOKEN: str = os.getenv("EXOTEL_TOKEN", "")
    
    # Emergency & Escalation Protocols
    EMERGENCY_HELPLINE: str = "108"
    HOSPITAL_EMERGENCY_HOTLINE: str = "+91-1800-108-CARE"
    COORDINATOR_DESK_PHONE: str = "+91-98765-43210"

settings = Settings()


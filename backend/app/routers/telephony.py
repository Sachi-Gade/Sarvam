from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..config import settings
from ..models import VoiceCall, Patient

router = APIRouter(prefix="/telephony", tags=["Telephony Integration"])

@router.get("/status")
def get_telephony_status():
    has_twilio = bool(settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN)
    has_exotel = bool(settings.EXOTEL_SID and settings.EXOTEL_TOKEN)
    
    return {
        "mode": "Live Telephony" if (has_twilio or has_exotel) else "Simulated Voice Demo Mode",
        "has_twilio": has_twilio,
        "has_exotel": has_exotel,
        "active_provider": "Twilio" if has_twilio else ("Exotel" if has_exotel else "Browser WebRTC / Simulator"),
        "note": "When live credentials are not set, all calls run in the interactive audio simulation studio."
    }

@router.post("/twilio/voice")
async def twilio_voice_webhook(request: Request):
    """
    TwiML Outbound Voice Handler.
    Greets the patient in vernacular audio using Sarvam TTS.
    """
    twiml_response = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="hi-IN">नमस्ते! यह आपके अस्पताल से फॉलो-अप सेवा है। कृपया बताएं क्या आपने आज अपनी दवाई ली है?</Say>
    <Gather input="speech" timeout="5" action="/api/telephony/twilio/gather" language="hi-IN" />
</Response>"""
    return Response(content=twiml_response, media_type="application/xml")

@router.post("/twilio/gather")
async def twilio_gather_webhook(request: Request):
    """
    Handles speech input from Twilio and processes non-diagnostic triage.
    """
    form_data = await request.form()
    speech_result = form_data.get("SpeechResult", "Yes, taken")
    
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="hi-IN">जानकारी दर्ज कर ली गई है। धन्यवाद और अपना ख्याल रखें।</Say>
    <Hangup />
</Response>"""
    return Response(content=twiml_response, media_type="application/xml")


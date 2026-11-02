import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Patient, VoiceCall, CallTranscript, MedicationAdherenceRecord, Alert, AuditLog
from ..schemas import (
    StartCallRequest,
    CallSimulateTurnRequest,
    CallSimulateTurnResponse,
    VoiceCallResponse,
    VoiceCallDetailResponse
)
from ..services.voice_agent import voice_agent
from ..services.alert_engine import create_alert
from ..services.sarvam_service import sarvam_service

router = APIRouter(prefix="/calls", tags=["Voice Calls"])

@router.get("", response_model=List[VoiceCallResponse])
def get_calls(
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(VoiceCall)
    if patient_id:
        query = query.filter(VoiceCall.patient_id == patient_id)
    if status:
        query = query.filter(VoiceCall.status == status)
    return query.order_by(VoiceCall.created_at.desc()).limit(limit).all()

@router.get("/{call_id}", response_model=VoiceCallDetailResponse)
def get_call_detail(call_id: int, db: Session = Depends(get_db)):
    call = db.query(VoiceCall).filter(VoiceCall.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call record not found")
    return call

@router.post("/start")
def start_call(payload: StartCallRequest, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if patient.opt_out:
        raise HTTPException(status_code=400, detail="Patient has opted out of automated follow-up calls.")

    call_sid = f"call_{uuid.uuid4().hex[:14]}"
    lang = patient.preferred_language or "hi-IN"

    # Create VoiceCall record
    call = VoiceCall(
        call_sid=call_sid,
        patient_id=patient.id,
        coordinator_id=patient.assigned_coordinator_id,
        call_type=payload.call_type,
        status="In Progress",
        language_code=lang,
        scheduled_at=datetime.utcnow(),
        started_at=datetime.utcnow(),
        conversation_outcome="In Progress",
        adherence_status="Pending",
        symptom_status="Normal",
        urgency_level="Low"
    )
    db.add(call)
    db.commit()
    db.refresh(call)

    # Generate initial greeting with Sarvam Bulbul:v3 TTS
    greeting = voice_agent.get_initial_greeting(patient, language_code=lang)

    # Save turn 0 transcript
    transcript = CallTranscript(
        call_id=call.id,
        turn_index=0,
        speaker="AI",
        message_text=greeting["native_text"],
        translated_text_en=greeting["english_text"],
        audio_base64=greeting["audio_base64"],
        sentiment="Neutral",
        timestamp=datetime.utcnow()
    )
    db.add(transcript)

    # Update patient's last call date
    patient.last_call_date = datetime.utcnow()
    db.commit()

    return {
        "call_id": call.id,
        "call_sid": call.call_sid,
        "patient_name": patient.full_name,
        "language_code": lang,
        "turn_index": 0,
        "ai_greeting_native": greeting["native_text"],
        "ai_greeting_english": greeting["english_text"],
        "ai_audio_base64": greeting["audio_base64"]
    }

@router.post("/simulate-turn", response_model=CallSimulateTurnResponse)
def simulate_call_turn(payload: CallSimulateTurnRequest, db: Session = Depends(get_db)):
    call = db.query(VoiceCall).filter(VoiceCall.id == payload.call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call session not found")

    patient = db.query(Patient).filter(Patient.id == call.patient_id).first()
    lang = call.language_code or "hi-IN"

    # Count existing turns
    existing_transcripts = db.query(CallTranscript).filter(CallTranscript.call_id == call.id).all()
    current_patient_turn = len([t for t in existing_transcripts if t.speaker == "Patient"])

    # 1. Log patient's reply
    pt_transcript = CallTranscript(
        call_id=call.id,
        turn_index=len(existing_transcripts),
        speaker="Patient",
        message_text=payload.patient_reply,
        translated_text_en=payload.patient_reply,  # in real deployment, Sarvam translation can be mapped
        audio_base64=payload.patient_audio_base64,
        sentiment="Neutral",
        timestamp=datetime.utcnow()
    )
    db.add(pt_transcript)
    db.commit()

    # 2. Process turn with VoiceAgent and safety guardrails
    turn_result = voice_agent.process_turn(
        patient=patient,
        current_turn=current_patient_turn,
        patient_reply=payload.patient_reply,
        language_code=lang
    )

    # 3. Log AI response transcript
    ai_transcript = CallTranscript(
        call_id=call.id,
        turn_index=len(existing_transcripts) + 1,
        speaker="AI",
        message_text=turn_result["ai_reply_native"],
        translated_text_en=turn_result["ai_reply_english"],
        audio_base64=turn_result["ai_audio_base64"],
        sentiment="Empathetic",
        timestamp=datetime.utcnow()
    )
    db.add(ai_transcript)

    # 4. Handle safety alerts & clinical records
    if turn_result["safety_alert_triggered"]:
        priority = turn_result["detected_urgency"]
        if priority == "High":
            create_alert(
                db=db,
                patient_id=patient.id,
                call_id=call.id,
                alert_type="Potentially Urgent Symptoms",
                priority="High",
                title=f"URGENT: Red-flag symptoms reported by {patient.full_name}",
                description=f"Patient response: '{payload.patient_reply}'. Protocol initiated."
            )
            call.urgency_level = "High"
            call.symptom_status = "Urgent Red Flag"
            
        elif priority == "Medium" and turn_result["detected_adherence"] == "Missed Dose":
            create_alert(
                db=db,
                patient_id=patient.id,
                call_id=call.id,
                alert_type="Missed Dose",
                priority="Medium",
                title=f"Missed medication dose reported by {patient.full_name}",
                description=f"Patient stated: '{payload.patient_reply}'. Requires coordinator adherence follow-up."
            )
            # Log MedicationAdherenceRecord
            adh_record = MedicationAdherenceRecord(
                patient_id=patient.id,
                call_id=call.id,
                record_date=datetime.utcnow(),
                status="Missed",
                missed_reason=payload.patient_reply,
                dose_time="Morning",
                notes="Reported during automated AI follow-up call"
            )
            db.add(adh_record)
            call.adherence_status = "Missed Dose"
            
        elif priority == "Medium":
            create_alert(
                db=db,
                patient_id=patient.id,
                call_id=call.id,
                alert_type="Worsening Symptoms",
                priority="Medium",
                title=f"Worsening symptom reported by {patient.full_name}",
                description=f"Patient stated: '{payload.patient_reply}'."
            )
            call.symptom_status = "New / Worsening"

    # If adherent
    if current_patient_turn == 1 and turn_result["detected_adherence"] == "Fully Adherent":
        adh_record = MedicationAdherenceRecord(
            patient_id=patient.id,
            call_id=call.id,
            record_date=datetime.utcnow(),
            status="Taken",
            dose_time="Morning",
            notes="Confirmed taken during automated AI call"
        )
        db.add(adh_record)
        call.adherence_status = "Fully Adherent"

    # 5. Check if call completed or ended
    call_summary_str = None
    if turn_result["is_call_ended"]:
        call.status = "Completed"
        call.ended_at = datetime.utcnow()
        if call.started_at:
            call.duration_seconds = int((call.ended_at - call.started_at).total_seconds())
        call.conversation_outcome = "Successful Follow-up" if call.urgency_level != "High" else "Urgent Referral"

        # Generate concise clinical call summary
        call_summary_str = (
            f"Follow-up call completed in {lang}. Adherence: {call.adherence_status}. "
            f"Symptoms: {call.symptom_status}. Urgency: {call.urgency_level}."
        )
        call.call_summary = call_summary_str

    db.commit()

    return {
        "call_id": call.id,
        "turn_index": turn_result["turn_index"],
        "ai_reply_native": turn_result["ai_reply_native"],
        "ai_reply_english": turn_result["ai_reply_english"],
        "ai_audio_base64": turn_result["ai_audio_base64"],
        "is_call_ended": turn_result["is_call_ended"],
        "detected_adherence": turn_result["detected_adherence"],
        "detected_symptoms": turn_result["detected_symptoms"],
        "detected_urgency": turn_result["detected_urgency"],
        "safety_alert_triggered": turn_result["safety_alert_triggered"],
        "safety_message": turn_result["safety_message"],
        "call_summary": call_summary_str
    }


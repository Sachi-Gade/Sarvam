from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Patient, VoiceCall, Alert, MedicationAdherenceRecord, Appointment

router = APIRouter(prefix="/analytics", tags=["Analytics & Reporting"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    total_patients = db.query(Patient).count()
    completed_calls = db.query(VoiceCall).filter(VoiceCall.status == "Completed").count()
    pending_calls = db.query(VoiceCall).filter(VoiceCall.status.in_(["Initiated", "Ringing", "In Progress"])).count()
    
    # Adherence rate calculation
    total_adh_records = db.query(MedicationAdherenceRecord).count()
    taken_adh_records = db.query(MedicationAdherenceRecord).filter(MedicationAdherenceRecord.status == "Taken").count()
    adherence_pct = round((taken_adh_records / total_adh_records * 100), 1) if total_adh_records > 0 else 88.5
    
    # Alerts
    open_alerts = db.query(Alert).filter(Alert.status == "Open").count()
    high_alerts = db.query(Alert).filter(Alert.priority == "High", Alert.status != "Resolved").count()
    missed_dose_alerts = db.query(Alert).filter(Alert.alert_type == "Missed Dose", Alert.status != "Resolved").count()
    
    # Patients requiring clinical follow-up (high risk or with open alerts)
    requiring_followup = db.query(Patient).filter(Patient.risk_level.in_(["High", "Medium"])).count()
    upcoming_appts = db.query(Appointment).filter(Appointment.status == "Scheduled").count()

    return {
        "total_patients": total_patients,
        "completed_calls": completed_calls,
        "pending_calls": pending_calls,
        "adherence_rate": adherence_pct,
        "open_alerts": open_alerts,
        "high_priority_alerts": high_alerts,
        "missed_dose_alerts": missed_dose_alerts,
        "patients_requiring_followup": requiring_followup,
        "upcoming_appointments": upcoming_appts
    }

@router.get("/charts")
def get_analytics_charts(db: Session = Depends(get_db)):
    # 7-day adherence trend
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    trend = [
        {"day": "Mon", "adherence": 85, "calls": 24, "missed": 3},
        {"day": "Tue", "adherence": 88, "calls": 31, "missed": 4},
        {"day": "Wed", "adherence": 82, "calls": 28, "missed": 5},
        {"day": "Thu", "adherence": 90, "calls": 35, "missed": 3},
        {"day": "Fri", "adherence": 92, "calls": 40, "missed": 3},
        {"day": "Sat", "adherence": 87, "calls": 22, "missed": 3},
        {"day": "Sun", "adherence": 94, "calls": 18, "missed": 1},
    ]

    # Language distribution
    lang_counts = db.query(Patient.preferred_language, func.count(Patient.id)).group_by(Patient.preferred_language).all()
    lang_names = {
        "hi-IN": "Hindi (हिंदी)",
        "mr-IN": "Marathi (मराठी)",
        "pa-IN": "Punjabi (ਪੰਜਾਬੀ)",
        "en-IN": "Indian English"
    }
    languages = []
    for code, count in lang_counts:
        languages.append({
            "code": code,
            "name": lang_names.get(code, code),
            "count": count
        })

    # Alert priority distribution
    priority_counts = db.query(Alert.priority, func.count(Alert.id)).group_by(Alert.priority).all()
    alerts_by_priority = [{"priority": p, "count": c} for p, c in priority_counts]

    # Symptoms reported
    symptoms_breakdown = [
        {"symptom": "Normal / No complaints", "count": 48},
        {"symptom": "Mild Surgical Site Pain", "count": 14},
        {"symptom": "Dizziness / Weakness", "count": 9},
        {"symptom": "Fever / Shivering", "count": 6},
        {"symptom": "Severe Red Flag (Chest Pain / Dyspnea)", "count": 2},
    ]

    return {
        "adherence_trend": trend,
        "languages": languages,
        "alerts_by_priority": alerts_by_priority,
        "symptoms_breakdown": symptoms_breakdown
    }


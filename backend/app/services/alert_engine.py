from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from ..models import Alert, EscalationRecord, Patient, VoiceCall

CLINICAL_PROTOCOLS = {
    "Potentially Urgent Symptoms": (
        "High Priority Clinical Protocol: Trigger emergency escalation to 108 / Duty Emergency Medical Officer. "
        "Instruct patient not to wait. Coordinator to place verification callback within 15 minutes."
    ),
    "Worsening Symptoms": (
        "Medium Priority Protocol: Care Coordinator to review reported symptoms with supervising physician. "
        "Schedule telemedicine or OPD re-evaluation within 24-48 hours."
    ),
    "Missed Dose": (
        "Medication Safety Protocol: Coordinator to call patient to identify adherence barriers (cost, confusion, side effects). "
        "Reiterate prescribed discharge instructions. Remind patient never to double up doses."
    ),
    "Missed Appointment": (
        "Care Continuity Protocol: Coordinator outreach to patient/family. Provide transportation assistance or rebook OPD slot."
    ),
    "Repeated Unanswered Calls": (
        "Outreach Protocol: If 3 consecutive calls go unanswered, contact primary emergency contact or local ASHA / ANM health worker."
    ),
    "Human Assistance Requested": (
        "Patient-Initiated Request: Connect patient with assigned Healthcare Coordinator within 4 hours."
    )
}

def create_alert(
    db: Session,
    patient_id: int,
    alert_type: str,
    priority: str,
    title: str,
    description: str,
    call_id: Optional[int] = None
) -> Alert:
    """
    Creates an alert and automatically logs an escalation record for High/Medium priority items.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    coordinator_id = patient.assigned_coordinator_id if patient else None

    protocol = CLINICAL_PROTOCOLS.get(
        alert_type,
        "Standard Healthcare Coordinator review required."
    )

    alert = Alert(
        patient_id=patient_id,
        call_id=call_id,
        alert_type=alert_type,
        priority=priority,
        title=title,
        description=description,
        status="Open",
        clinical_protocol_action=protocol,
        assigned_to_id=coordinator_id,
        created_at=datetime.utcnow()
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # For High priority, auto-generate EscalationRecord
    if priority == "High":
        escalation = EscalationRecord(
            alert_id=alert.id,
            patient_id=patient_id,
            escalated_by="AI Alert Engine (Safety Triage)",
            escalated_to="Emergency Hotline 108 & Duty Medical Officer",
            reason=f"Urgent red-flag symptom reported: {description}",
            status="Dispatched",
            coordinator_notes="System automatically dispatched alert to emergency clinical desk.",
            created_at=datetime.utcnow()
        )
        db.add(escalation)
        
        # Also update patient status
        if patient:
            patient.status = "Escalated"
            patient.risk_level = "High"
            db.commit()

    return alert


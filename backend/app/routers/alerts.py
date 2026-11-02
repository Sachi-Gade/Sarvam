from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Alert, EscalationRecord, Patient, HealthcareCoordinator, AuditLog
from ..schemas import AlertResponse, AlertUpdate

router = APIRouter(prefix="/alerts", tags=["Alerts & Escalation"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    priority: Optional[str] = None,
    status: Optional[str] = None,
    patient_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if priority:
        query = query.filter(Alert.priority == priority)
    if status:
        query = query.filter(Alert.status == status)
    if patient_id:
        query = query.filter(Alert.patient_id == patient_id)
        
    return query.order_by(
        Alert.status.asc(), # Open first
        Alert.created_at.desc()
    ).limit(limit).all()

@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(alert_id: int, payload: AlertUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if payload.status:
        alert.status = payload.status
        if payload.status == "Resolved":
            alert.resolved_at = datetime.utcnow()
            alert.resolved_by = "Care Coordinator Desk"
            
    if payload.assigned_to_id is not None:
        alert.assigned_to_id = payload.assigned_to_id
    if payload.resolution_notes:
        alert.resolution_notes = payload.resolution_notes

    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/escalate")
def escalate_alert(alert_id: int, reason: str = "Direct coordinator clinical escalation", db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    escalation = EscalationRecord(
        alert_id=alert.id,
        patient_id=alert.patient_id,
        escalated_by="Care Coordinator (Manual)",
        escalated_to="Supervising Medical Officer",
        reason=reason,
        status="Dispatched",
        coordinator_notes="Escalated from dashboard for urgent clinical consultation.",
        created_at=datetime.utcnow()
    )
    db.add(escalation)
    alert.status = "In Progress"
    db.commit()

    return {"message": "Alert escalated to supervising physician", "escalation_id": escalation.id}


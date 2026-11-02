from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Appointment, Patient, Alert
from ..schemas import AppointmentCreate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("", response_model=List[AppointmentResponse])
def get_appointments(
    patient_id: Optional[int] = None,
    status: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    if status:
        query = query.filter(Appointment.status == status)
    return query.order_by(Appointment.scheduled_date.asc()).limit(limit).all()

@router.post("", response_model=AppointmentResponse)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    appt = Appointment(
        patient_id=payload.patient_id,
        appointment_type=payload.appointment_type,
        scheduled_date=payload.scheduled_date,
        scheduled_time=payload.scheduled_time,
        doctor_name=payload.doctor_name,
        department=payload.department,
        hospital_location=payload.hospital_location,
        status=payload.status,
        notes=payload.notes,
        created_at=datetime.utcnow()
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt

@router.put("/{appointment_id}/status")
def update_appointment_status(appointment_id: int, status: str, db: Session = Depends(get_db)):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appt.status = status
    if status == "Missed":
        # Create Medium Priority Alert for Missed Appointment
        patient = db.query(Patient).filter(Patient.id == appt.patient_id).first()
        patient_name = patient.full_name if patient else "Patient"
        alert = Alert(
            patient_id=appt.patient_id,
            alert_type="Missed Appointment",
            priority="Medium",
            title=f"Missed clinical follow-up by {patient_name}",
            description=f"Missed {appt.appointment_type} scheduled with Dr. {appt.doctor_name}.",
            status="Open",
            clinical_protocol_action="Coordinator to contact patient/family to understand barriers and re-schedule OPD visit."
        )
        db.add(alert)

    db.commit()
    return {"message": f"Appointment status updated to {status}"}


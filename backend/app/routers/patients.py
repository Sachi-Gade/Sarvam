from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..database import get_db
from ..models import Patient, Medication, Appointment, HealthcareCoordinator, AuditLog
from ..schemas import PatientCreate, PatientUpdate, PatientResponse, PatientDetailResponse

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientResponse])
def get_patients(
    search: Optional[str] = None,
    language: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Patient)

    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Patient.full_name.ilike(search_fmt),
                Patient.patient_id.ilike(search_fmt),
                Patient.phone_number.ilike(search_fmt),
                Patient.village_or_city.ilike(search_fmt),
                Patient.admission_diagnosis.ilike(search_fmt)
            )
        )

    if language:
        query = query.filter(Patient.preferred_language == language)
    if risk_level:
        query = query.filter(Patient.risk_level == risk_level)
    if status:
        query = query.filter(Patient.status == status)

    return query.order_by(Patient.created_at.desc()).all()

@router.post("", response_model=PatientResponse)
def register_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    # Check if patient_id exists
    existing = db.query(Patient).filter(Patient.patient_id == payload.patient_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patient with this ID already registered.")

    coordinator = db.query(HealthcareCoordinator).filter(HealthcareCoordinator.is_available == True).first()

    patient = Patient(
        patient_id=payload.patient_id,
        full_name=payload.full_name,
        age=payload.age,
        gender=payload.gender,
        phone_number=payload.phone_number,
        alternate_phone=payload.alternate_phone,
        village_or_city=payload.village_or_city,
        district=payload.district,
        state=payload.state,
        preferred_language=payload.preferred_language,
        hospital_name=payload.hospital_name,
        discharge_date=payload.discharge_date or datetime.utcnow(),
        admission_diagnosis=payload.admission_diagnosis,
        discharge_instructions=payload.discharge_instructions,
        risk_level=payload.risk_level,
        status="Active",
        assigned_coordinator_id=coordinator.id if coordinator else None,
        consent_given=payload.consent_given,
        opt_out=payload.opt_out,
        created_at=datetime.utcnow()
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Add discharge medications
    for med in payload.medications:
        db_med = Medication(
            patient_id=patient.id,
            name=med.name,
            generic_name=med.generic_name,
            dosage=med.dosage,
            frequency=med.frequency,
            timing_instructions=med.timing_instructions,
            instructions_vernacular=med.instructions_vernacular,
            start_date=med.start_date or datetime.utcnow(),
            is_active=True
        )
        db.add(db_med)

    # Log audit
    audit = AuditLog(
        action="PATIENT_REGISTERED",
        entity_type="Patient",
        entity_id=str(patient.id),
        details=f"Registered patient {patient.full_name} ({patient.patient_id})"
    )
    db.add(audit)
    db.commit()

    return patient

@router.get("/{patient_id}", response_model=PatientDetailResponse)
def get_patient_detail(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: int, payload: PatientUpdate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(patient, field, value)

    patient.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(patient)
    return patient

@router.post("/{patient_id}/opt-out")
def toggle_opt_out(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient.opt_out = not patient.opt_out
    if patient.opt_out:
        patient.status = "Opted Out"
    else:
        patient.status = "Active"

    db.commit()
    return {"message": f"Patient opt-out status updated to {patient.opt_out}"}


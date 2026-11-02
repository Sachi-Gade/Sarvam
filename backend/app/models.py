from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
)
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(30), default="coordinator")  # coordinator, doctor, admin
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    coordinator_profile = relationship("HealthcareCoordinator", back_populates="user", uselist=False)


class HealthcareCoordinator(Base):
    __tablename__ = "healthcare_coordinators"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    designation = Column(String(100), default="Care Coordinator")
    languages_spoken = Column(String(200), default="Hindi, Marathi, Punjabi, English")
    active_patient_count = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="coordinator_profile")
    patients = relationship("Patient", back_populates="assigned_coordinator")
    alerts_assigned = relationship("Alert", back_populates="assigned_to")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(30), unique=True, index=True, nullable=False)  # e.g., PT-2026-101
    full_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    phone_number = Column(String(20), nullable=False, index=True)
    alternate_phone = Column(String(20), nullable=True)
    village_or_city = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), default="Maharashtra")
    
    preferred_language = Column(String(20), default="hi-IN")  # hi-IN, mr-IN, pa-IN, en-IN
    hospital_name = Column(String(150), default="District Civil Hospital")
    discharge_date = Column(DateTime, nullable=False)
    admission_diagnosis = Column(String(200), nullable=False)
    discharge_instructions = Column(Text, nullable=True)
    risk_level = Column(String(20), default="Medium")  # Low, Medium, High
    status = Column(String(20), default="Active")  # Active, Completed, Escalated
    
    assigned_coordinator_id = Column(Integer, ForeignKey("healthcare_coordinators.id"), nullable=True)
    consent_given = Column(Boolean, default=True)
    opt_out = Column(Boolean, default=False)
    
    last_call_date = Column(DateTime, nullable=True)
    next_scheduled_call = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_coordinator = relationship("HealthcareCoordinator", back_populates="patients")
    medications = relationship("Medication", back_populates="patient", cascade="all, delete-orphan")
    adherence_records = relationship("MedicationAdherenceRecord", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")
    calls = relationship("VoiceCall", back_populates="patient", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="patient", cascade="all, delete-orphan")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    name = Column(String(100), nullable=False)
    generic_name = Column(String(100), nullable=True)
    dosage = Column(String(50), nullable=False)  # e.g., 500mg, 1 tablet
    frequency = Column(String(50), nullable=False)  # e.g., Twice daily, Once morning
    timing_instructions = Column(String(150), nullable=True)  # e.g., After meals
    instructions_vernacular = Column(String(200), nullable=True)  # Hindi/Marathi instruction
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    patient = relationship("Patient", back_populates="medications")
    adherence_records = relationship("MedicationAdherenceRecord", back_populates="medication")


class MedicationAdherenceRecord(Base):
    __tablename__ = "medication_adherence_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=True)
    call_id = Column(Integer, ForeignKey("voice_calls.id"), nullable=True)
    record_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(30), nullable=False)  # Taken, Missed, Delayed, Partial
    missed_reason = Column(String(255), nullable=True)  # e.g., Forgot, Ran out, Side effects
    dose_time = Column(String(30), default="Morning")  # Morning, Afternoon, Evening, Night
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="adherence_records")
    medication = relationship("Medication", back_populates="adherence_records")
    call = relationship("VoiceCall", back_populates="adherence_records")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_type = Column(String(100), nullable=False)  # e.g. Post-Op Wound Check, Cardiology Review
    scheduled_date = Column(DateTime, nullable=False)
    scheduled_time = Column(String(20), default="10:00 AM")
    doctor_name = Column(String(100), nullable=False)
    department = Column(String(100), default="General Medicine")
    hospital_location = Column(String(150), default="District Civil Hospital, OPD Room 12")
    status = Column(String(30), default="Scheduled")  # Scheduled, Attended, Missed, Rescheduled
    reminder_sent = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")


class VoiceCall(Base):
    __tablename__ = "voice_calls"

    id = Column(Integer, primary_key=True, index=True)
    call_sid = Column(String(60), unique=True, index=True, nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    coordinator_id = Column(Integer, ForeignKey("healthcare_coordinators.id"), nullable=True)
    call_type = Column(String(40), default="Simulated Web Call")  # Scheduled Outbound, Immediate Escalation, Simulated Web Call, Inbound Callback
    status = Column(String(30), default="Initiated")  # Initiated, Ringing, In Progress, Completed, Failed, Unanswered
    language_code = Column(String(20), default="hi-IN")
    
    scheduled_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    
    # AI Follow-up assessment fields
    conversation_outcome = Column(String(50), default="Pending")
    adherence_status = Column(String(40), default="Unknown")  # Fully Adherent, Missed Dose, Partial
    symptom_status = Column(String(40), default="Normal")  # Normal, New / Worsening, Urgent Red Flag
    appointment_status = Column(String(40), default="Scheduled")  # Attended, Missed, Scheduled, Needs Scheduling
    urgency_level = Column(String(20), default="Low")  # Low, Medium, High
    
    call_summary = Column(Text, nullable=True)
    call_summary_vernacular = Column(Text, nullable=True)
    audio_base64 = Column(Text, nullable=True)
    audio_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="calls")
    transcripts = relationship("CallTranscript", back_populates="call", cascade="all, delete-orphan", order_by="CallTranscript.turn_index")
    adherence_records = relationship("MedicationAdherenceRecord", back_populates="call")
    alerts = relationship("Alert", back_populates="call")


class CallTranscript(Base):
    __tablename__ = "call_transcripts"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(Integer, ForeignKey("voice_calls.id"), nullable=False)
    turn_index = Column(Integer, default=0)
    speaker = Column(String(20), nullable=False)  # AI, Patient, Coordinator
    message_text = Column(Text, nullable=False)  # Native language text
    translated_text_en = Column(Text, nullable=True)  # English translation
    audio_base64 = Column(Text, nullable=True)
    sentiment = Column(String(30), default="Neutral")
    timestamp = Column(DateTime, default=datetime.utcnow)

    call = relationship("VoiceCall", back_populates="transcripts")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    call_id = Column(Integer, ForeignKey("voice_calls.id"), nullable=True)
    alert_type = Column(String(50), nullable=False)  # Missed Dose, Worsening Symptoms, Potentially Urgent Symptoms, Missed Appointment, Repeated Unanswered Calls, Human Assistance Requested
    priority = Column(String(20), nullable=False)  # High, Medium, Low
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(30), default="Open")  # Open, In Progress, Resolved
    
    clinical_protocol_action = Column(Text, nullable=True)  # Approved action protocol recommendation
    assigned_to_id = Column(Integer, ForeignKey("healthcare_coordinators.id"), nullable=True)
    
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="alerts")
    call = relationship("VoiceCall", back_populates="alerts")
    assigned_to = relationship("HealthcareCoordinator", back_populates="alerts_assigned")
    escalations = relationship("EscalationRecord", back_populates="alert", cascade="all, delete-orphan")


class EscalationRecord(Base):
    __tablename__ = "escalation_records"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    escalated_by = Column(String(100), default="AI Alert Engine")
    escalated_to = Column(String(100), default="Care Coordinator Desk")  # Supervising Physician, 108 Emergency, Duty Medical Officer
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="Dispatched")  # Dispatched, Acknowledged, Completed
    coordinator_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    alert = relationship("Alert", back_populates="escalations")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


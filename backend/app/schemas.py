from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: str = "coordinator"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# --- Medication Schemas ---
class MedicationBase(BaseModel):
    name: str
    generic_name: Optional[str] = None
    dosage: str
    frequency: str
    timing_instructions: Optional[str] = "After food"
    instructions_vernacular: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True

class MedicationCreate(MedicationBase):
    pass

class MedicationResponse(MedicationBase):
    id: int
    patient_id: int

    class Config:
        from_attributes = True


# --- Appointment Schemas ---
class AppointmentBase(BaseModel):
    appointment_type: str
    scheduled_date: datetime
    scheduled_time: str = "10:00 AM"
    doctor_name: str
    department: str = "General Medicine"
    hospital_location: str = "District Civil Hospital"
    status: str = "Scheduled"
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    patient_id: int

class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    reminder_sent: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Adherence Schemas ---
class AdherenceRecordBase(BaseModel):
    status: str  # Taken, Missed, Delayed, Partial
    missed_reason: Optional[str] = None
    dose_time: str = "Morning"
    notes: Optional[str] = None

class AdherenceRecordCreate(AdherenceRecordBase):
    patient_id: int
    medication_id: Optional[int] = None
    call_id: Optional[int] = None
    record_date: Optional[datetime] = None

class AdherenceRecordResponse(AdherenceRecordBase):
    id: int
    patient_id: int
    medication_id: Optional[int] = None
    record_date: datetime
    recorded_at: datetime
    medication: Optional[MedicationResponse] = None

    class Config:
        from_attributes = True


# --- Call Transcript & Call Schemas ---
class CallTranscriptResponse(BaseModel):
    id: int
    turn_index: int
    speaker: str
    message_text: str
    translated_text_en: Optional[str] = None
    sentiment: Optional[str] = "Neutral"
    timestamp: datetime

    class Config:
        from_attributes = True

class VoiceCallResponse(BaseModel):
    id: int
    call_sid: str
    patient_id: int
    call_type: str
    status: str
    language_code: str
    scheduled_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_seconds: int
    conversation_outcome: str
    adherence_status: str
    symptom_status: str
    appointment_status: str
    urgency_level: str
    call_summary: Optional[str] = None
    call_summary_vernacular: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class VoiceCallDetailResponse(VoiceCallResponse):
    transcripts: List[CallTranscriptResponse] = []


# --- Alert Schemas ---
class AlertBase(BaseModel):
    alert_type: str
    priority: str
    title: str
    description: str
    clinical_protocol_action: Optional[str] = None

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to_id: Optional[int] = None
    resolution_notes: Optional[str] = None

class AlertResponse(AlertBase):
    id: int
    patient_id: int
    call_id: Optional[int] = None
    status: str
    assigned_to_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Patient Schemas ---
class PatientBase(BaseModel):
    patient_id: str
    full_name: str
    age: int
    gender: str
    phone_number: str
    alternate_phone: Optional[str] = None
    village_or_city: str
    district: str
    state: str = "Maharashtra"
    preferred_language: str = "hi-IN"
    hospital_name: str = "District Civil Hospital"
    discharge_date: datetime
    admission_diagnosis: str
    discharge_instructions: Optional[str] = None
    risk_level: str = "Medium"
    status: str = "Active"
    consent_given: bool = True
    opt_out: bool = False

class PatientCreate(PatientBase):
    medications: List[MedicationCreate] = []

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    alternate_phone: Optional[str] = None
    village_or_city: Optional[str] = None
    preferred_language: Optional[str] = None
    risk_level: Optional[str] = None
    status: Optional[str] = None
    opt_out: Optional[bool] = None
    discharge_instructions: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    assigned_coordinator_id: Optional[int] = None
    last_call_date: Optional[datetime] = None
    next_scheduled_call: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PatientDetailResponse(PatientResponse):
    medications: List[MedicationResponse] = []
    appointments: List[AppointmentResponse] = []
    adherence_records: List[AdherenceRecordResponse] = []
    calls: List[VoiceCallResponse] = []
    alerts: List[AlertResponse] = []


# --- Voice Call Simulation & Interactive API ---
class StartCallRequest(BaseModel):
    patient_id: int
    call_type: str = "Simulated Web Call"  # "Simulated Web Call" or "Outbound Phone Call"

class CallSimulateTurnRequest(BaseModel):
    call_id: int
    patient_reply: str
    patient_audio_base64: Optional[str] = None

class CallSimulateTurnResponse(BaseModel):
    call_id: int
    turn_index: int
    ai_reply_native: str
    ai_reply_english: str
    ai_audio_base64: Optional[str] = None
    is_call_ended: bool = False
    detected_adherence: str = "Unknown"
    detected_symptoms: str = "Normal"
    detected_urgency: str = "Low"
    safety_alert_triggered: bool = False
    safety_message: Optional[str] = None
    call_summary: Optional[str] = None


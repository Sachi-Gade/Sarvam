from datetime import datetime, timedelta
from .database import SessionLocal, engine, Base
from .models import (
    User, HealthcareCoordinator, Patient, Medication,
    MedicationAdherenceRecord, Appointment, VoiceCall,
    CallTranscript, Alert, EscalationRecord, AuditLog
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if data already exists
    if db.query(User).first():
        print("[Seed] Database already seeded.")
        db.close()
        return

    print("[Seed] Seeding realistic synthetic healthcare data...")

    # 1. Users & Coordinators
    coord_user = User(
        username="coordinator1",
        email="coordinator@aarogya.gov.in",
        full_name="Pooja Sharma",
        role="coordinator",
        hashed_password="password123"
    )
    doc_user = User(
        username="dr_kulkarni",
        email="dr.kulkarni@hospital.org",
        full_name="Dr. Arvind Kulkarni",
        role="doctor",
        hashed_password="password123"
    )
    db.add_all([coord_user, doc_user])
    db.commit()

    coordinator = HealthcareCoordinator(
        user_id=coord_user.id,
        full_name="Pooja Sharma",
        phone_number="+91-98765-43210",
        email="coordinator@aarogya.gov.in",
        designation="Senior Rural Care Coordinator",
        languages_spoken="Hindi, Marathi, Punjabi, English",
        active_patient_count=8,
        is_available=True
    )
    db.add(coordinator)
    db.commit()

    # 2. Patients
    patients_data = [
        {
            "patient_id": "PT-2026-101",
            "full_name": "Rameshwar Patil",
            "age": 62,
            "gender": "Male",
            "phone_number": "+91-98221-54321",
            "alternate_phone": "+91-98221-54322",
            "village_or_city": "Koregaon Village",
            "district": "Satara",
            "state": "Maharashtra",
            "preferred_language": "mr-IN",
            "hospital_name": "District Civil Hospital Satara",
            "discharge_date": datetime.utcnow() - timedelta(days=4),
            "admission_diagnosis": "Post-CABG (Coronary Artery Bypass Surgery)",
            "discharge_instructions": "Complete bed rest for 2 weeks. Strict blood pressure and pulse monitoring. Do not lift heavy objects.",
            "risk_level": "High",
            "status": "Active",
            "meds": [
                {"name": "Ecosprin 75mg", "dosage": "1 tablet", "frequency": "Once daily", "timing_instructions": "After lunch", "instructions_vernacular": "दुपारच्या जेवणानंतर १ गोळी"},
                {"name": "Metoprolol 25mg", "dosage": "1 tablet", "frequency": "Twice daily", "timing_instructions": "Morning & Night after meals", "instructions_vernacular": "सकाळी व रात्री जेवणानंतर"},
                {"name": "Atorvastatin 20mg", "dosage": "1 tablet", "frequency": "Night", "timing_instructions": "Before bedtime", "instructions_vernacular": "रात्री झोपताना १ गोळी"}
            ],
            "appointment": {
                "appointment_type": "Cardiology Post-Op Check",
                "days_offset": 3,
                "doctor_name": "Dr. A. Kulkarni",
                "department": "Cardiology",
                "status": "Scheduled"
            }
        },
        {
            "patient_id": "PT-2026-102",
            "full_name": "Kamla Devi",
            "age": 58,
            "gender": "Female",
            "phone_number": "+91-94500-11223",
            "alternate_phone": "+91-94500-11224",
            "village_or_city": "Ramnagar",
            "district": "Varanasi",
            "state": "Uttar Pradesh",
            "preferred_language": "hi-IN",
            "hospital_name": "Pandit Deendayal Hospital",
            "discharge_date": datetime.utcnow() - timedelta(days=6),
            "admission_diagnosis": "Type 2 Diabetes Mellitus with Severe Hyperglycemia",
            "discharge_instructions": "Low carbohydrate diet. Daily fasting blood sugar check. Avoid barefoot walking.",
            "risk_level": "Medium",
            "status": "Active",
            "meds": [
                {"name": "Metformin 500mg", "dosage": "1 tablet", "frequency": "Twice daily", "timing_instructions": "With morning & evening meals", "instructions_vernacular": "सुबह और शाम खाने के साथ"},
                {"name": "Telmisartan 40mg", "dosage": "1 tablet", "frequency": "Once morning", "timing_instructions": "After breakfast", "instructions_vernacular": "सुबह नाश्ते के बाद"}
            ],
            "appointment": {
                "appointment_type": "Endocrine Blood Sugar Review",
                "days_offset": 5,
                "doctor_name": "Dr. R. Pandey",
                "department": "General Medicine",
                "status": "Scheduled"
            }
        },
        {
            "patient_id": "PT-2026-103",
            "full_name": "Gurpreet Singh",
            "age": 45,
            "gender": "Male",
            "phone_number": "+91-98140-99887",
            "alternate_phone": "+91-98140-99888",
            "village_or_city": "Dera Baba Nanak",
            "district": "Gurdaspur",
            "state": "Punjab",
            "preferred_language": "pa-IN",
            "hospital_name": "Civil Hospital Gurdaspur",
            "discharge_date": datetime.utcnow() - timedelta(days=7),
            "admission_diagnosis": "Right Femur Fracture (ORIF Orthopedic Fixation)",
            "discharge_instructions": "Non-weight bearing with crutches for 4 weeks. Keep surgical dressing clean and dry.",
            "risk_level": "Medium",
            "status": "Active",
            "meds": [
                {"name": "Cefuroxime 500mg", "dosage": "1 tablet", "frequency": "Twice daily", "timing_instructions": "After meals for 7 days", "instructions_vernacular": "ਰੋਟੀ ਤੋਂ ਬਾਅਦ ੧ ਗੋਲੀ ਸਵੇਰੇ ਸ਼ਾਮ"},
                {"name": "Calcium + Vitamin D3", "dosage": "1 tablet", "frequency": "Once daily", "timing_instructions": "After breakfast", "instructions_vernacular": "ਸਵੇਰੇ ਨਾਸ਼ਤੇ ਤੋਂ ਬਾਅਦ"}
            ],
            "appointment": {
                "appointment_type": "Orthopedic Suture Removal & X-Ray",
                "days_offset": -1,  # Yesterday - missed!
                "doctor_name": "Dr. H. Sandhu",
                "department": "Orthopedics",
                "status": "Missed"
            }
        },
        {
            "patient_id": "PT-2026-104",
            "full_name": "Sunita Sharma",
            "age": 34,
            "gender": "Female",
            "phone_number": "+91-97600-44556",
            "alternate_phone": "+91-97600-44557",
            "village_or_city": "Chhata Rural",
            "district": "Mathura",
            "state": "Uttar Pradesh",
            "preferred_language": "hi-IN",
            "hospital_name": "Sub-District Hospital",
            "discharge_date": datetime.utcnow() - timedelta(days=3),
            "admission_diagnosis": "Post-Partum with Mild Pre-Eclampsia",
            "discharge_instructions": "Rest adequately. Hydrate well. Monitor blood pressure twice daily. Report severe headaches immediately.",
            "risk_level": "Medium",
            "status": "Active",
            "meds": [
                {"name": "Labetalol 100mg", "dosage": "1 tablet", "frequency": "Twice daily", "timing_instructions": "Every 12 hours", "instructions_vernacular": "१२ घंटे के अंतर पर"},
                {"name": "Iron & Folic Acid", "dosage": "1 tablet", "frequency": "Once daily", "timing_instructions": "After dinner", "instructions_vernacular": "रात के खाने के बाद"}
            ],
            "appointment": {
                "appointment_type": "Postnatal Maternal Wellbeing Check",
                "days_offset": 4,
                "doctor_name": "Dr. S. Yadav",
                "department": "Obstetrics & Gynecology",
                "status": "Scheduled"
            }
        },
        {
            "patient_id": "PT-2026-105",
            "full_name": "Rajesh Verma",
            "age": 52,
            "gender": "Male",
            "phone_number": "+91-98900-77665",
            "village_or_city": "Wardha Road",
            "district": "Nagpur",
            "state": "Maharashtra",
            "preferred_language": "en-IN",
            "hospital_name": "Government Medical College Nagpur",
            "discharge_date": datetime.utcnow() - timedelta(days=5),
            "admission_diagnosis": "Acute Coronary Syndrome (Drug-Eluting Stent Placed)",
            "discharge_instructions": "Strict antiplatelet compliance. Low salt, low oil diet. Avoid heavy exertion.",
            "risk_level": "High",
            "status": "Escalated",
            "meds": [
                {"name": "Clopidogrel 75mg", "dosage": "1 tablet", "frequency": "Once daily", "timing_instructions": "Morning with breakfast", "instructions_vernacular": "Morning with water"},
                {"name": "Rosuvastatin 20mg", "dosage": "1 tablet", "frequency": "Night", "timing_instructions": "At bedtime", "instructions_vernacular": "At bedtime"}
            ],
            "appointment": {
                "appointment_type": "Echo & Cardiology Review",
                "days_offset": 2,
                "doctor_name": "Dr. M. Joshi",
                "department": "Cardiology",
                "status": "Scheduled"
            }
        }
    ]

    for pdata in patients_data:
        pt = Patient(
            patient_id=pdata["patient_id"],
            full_name=pdata["full_name"],
            age=pdata["age"],
            gender=pdata["gender"],
            phone_number=pdata["phone_number"],
            alternate_phone=pdata.get("alternate_phone"),
            village_or_city=pdata["village_or_city"],
            district=pdata["district"],
            state=pdata["state"],
            preferred_language=pdata["preferred_language"],
            hospital_name=pdata["hospital_name"],
            discharge_date=pdata["discharge_date"],
            admission_diagnosis=pdata["admission_diagnosis"],
            discharge_instructions=pdata["discharge_instructions"],
            risk_level=pdata["risk_level"],
            status=pdata["status"],
            assigned_coordinator_id=coordinator.id,
            consent_given=True,
            opt_out=False,
            last_call_date=datetime.utcnow() - timedelta(hours=14),
            next_scheduled_call=datetime.utcnow() + timedelta(hours=10),
            created_at=datetime.utcnow() - timedelta(days=5)
        )
        db.add(pt)
        db.commit()
        db.refresh(pt)

        # Add medications
        for mdata in pdata["meds"]:
            med = Medication(
                patient_id=pt.id,
                name=mdata["name"],
                dosage=mdata["dosage"],
                frequency=mdata["frequency"],
                timing_instructions=mdata["timing_instructions"],
                instructions_vernacular=mdata.get("instructions_vernacular"),
                start_date=pdata["discharge_date"],
                is_active=True
            )
            db.add(med)

        # Add Appointment
        appt_info = pdata["appointment"]
        appt = Appointment(
            patient_id=pt.id,
            appointment_type=appt_info["appointment_type"],
            scheduled_date=datetime.utcnow() + timedelta(days=appt_info["days_offset"]),
            scheduled_time="10:30 AM",
            doctor_name=appt_info["doctor_name"],
            department=appt_info["department"],
            hospital_location=f"{pdata['hospital_name']}, Room 4",
            status=appt_info["status"],
            reminder_sent=True if appt_info["days_offset"] < 0 else False
        )
        db.add(appt)

    db.commit()

    # 3. Create Sample Calls, Transcripts, Adherence Records and Alerts
    # Call 1 for Rameshwar Patil (Adherent, Marathi)
    pt1 = db.query(Patient).filter(Patient.patient_id == "PT-2026-101").first()
    call1 = VoiceCall(
        call_sid="call_mr_rameshwar_01",
        patient_id=pt1.id,
        coordinator_id=coordinator.id,
        call_type="Simulated Web Call",
        status="Completed",
        language_code="mr-IN",
        started_at=datetime.utcnow() - timedelta(days=1, hours=2),
        ended_at=datetime.utcnow() - timedelta(days=1, hours=2) + timedelta(seconds=95),
        duration_seconds=95,
        conversation_outcome="Successful Follow-up",
        adherence_status="Fully Adherent",
        symptom_status="Normal",
        appointment_status="Scheduled",
        urgency_level="Low",
        call_summary="Follow-up call completed in Marathi. Patient confirmed taking Metoprolol and Ecosprin on time. No post-CABG chest pain. Appointment confirmed.",
        call_summary_vernacular="मराठीमध्ये फॉलो-अप कॉल पूर्ण झाला. रुग्णाने औषधे वेळेवर घेतल्याची पुष्टी केली. कोणताही छातीत त्रास नाही."
    )
    db.add(call1)
    db.commit()

    # Call 2 for Gurpreet Singh (Missed dose + missed appt, Punjabi)
    pt3 = db.query(Patient).filter(Patient.patient_id == "PT-2026-103").first()
    call2 = VoiceCall(
        call_sid="call_pa_gurpreet_02",
        patient_id=pt3.id,
        coordinator_id=coordinator.id,
        call_type="Scheduled Outbound",
        status="Completed",
        language_code="pa-IN",
        started_at=datetime.utcnow() - timedelta(hours=6),
        ended_at=datetime.utcnow() - timedelta(hours=6) + timedelta(seconds=110),
        duration_seconds=110,
        conversation_outcome="Missed Dose Flagged",
        adherence_status="Missed Dose",
        symptom_status="Normal",
        appointment_status="Missed",
        urgency_level="Medium",
        call_summary="Patient reported missing yesterday evening's antibiotic dose because the strip was finished. Missed yesterday's orthopedic follow-up due to lack of transport.",
        call_summary_vernacular="ਮਰੀਜ਼ ਨੇ ਦੱਸਿਆ ਕਿ ਕੱਲ੍ਹ ਸ਼ਾਮ ਦੀ ਦਵਾਈ ਖਤਮ ਹੋਣ ਕਾਰਨ ਖੁੰਝ ਗਈ ਸੀ। ਟਰਾਂਸਪੋਰਟ ਨਾ ਹੋਣ ਕਾਰਨ ਹਸਪਤਾਲ ਨਹੀਂ ਜਾ ਸਕੇ।"
    )
    db.add(call2)
    db.commit()

    # Call 3 for Rajesh Verma (Urgent Symptom, High Priority Alert!)
    pt5 = db.query(Patient).filter(Patient.patient_id == "PT-2026-105").first()
    call3 = VoiceCall(
        call_sid="call_en_rajesh_03",
        patient_id=pt5.id,
        coordinator_id=coordinator.id,
        call_type="Simulated Web Call",
        status="Completed",
        language_code="en-IN",
        started_at=datetime.utcnow() - timedelta(hours=2),
        ended_at=datetime.utcnow() - timedelta(hours=2) + timedelta(seconds=65),
        duration_seconds=65,
        conversation_outcome="Urgent Referral",
        adherence_status="Fully Adherent",
        symptom_status="Urgent Red Flag",
        appointment_status="Scheduled",
        urgency_level="High",
        call_summary="URGENT: Patient reported feeling sudden squeezing chest pain and mild breathlessness. Immediate 108 emergency referral given. Duty doctor alerted.",
        call_summary_vernacular="तातडीचा इशारा: रुग्णाने छातीत दुखणे आणि धाप लागण्याची तक्रार केली. त्वरित १०८ रुग्णवाहिका सूचना देण्यात आली."
    )
    db.add(call3)
    db.commit()

    # Transcripts for Call 1
    transcripts_c1 = [
        ("AI", "नमस्कार रमेशवर जी! मी जिल्हा शासकीय रुग्णालयाच्या फॉलो-अप सेवेमधून बोलत आहे. ही बोलण्यासाठी सोयीची वेळ आहे का?", "Namaste Rameshwar ji! I am calling from District Hospital follow-up service. Is this a convenient time to speak?"),
        ("Patient", "होय, मी बोलू शकतो.", "Yes, I can speak."),
        ("AI", "धन्यवाद. डिस्चार्जच्या वेळी तुम्हाला Ecosprin आणि Metoprolol औषधे दिली होती. आज तुम्ही आपली सर्व औषधे वेळेवर घेतली आहेत का?", "Thank you. You were prescribed Ecosprin and Metoprolol. Have you taken all your medicines today?"),
        ("Patient", "हो, मी दोन्ही गोळ्या वेळेवर घेतल्या आहेत.", "Yes, I have taken both tablets on time."),
        ("AI", "छान. तुम्हाला सध्या कोणताही त्रास, छातीत दुखणे किंवा नवीन वेदना जाणवत आहेत का?", "Good. Are you experiencing any pain, chest discomfort, or new distress?"),
        ("Patient", "नाही, देवाच्या कृपेने आता कोणताही त्रास नाही.", "No, by God's grace there is no trouble right now."),
        ("AI", "समजले. तुमची पुढची तपासणी ३ दिवसांनंतर आहे. तुम्ही रुग्णालयात येऊ शकाल ना?", "Understood. Your next appointment is in 3 days. Will you be able to visit?"),
        ("Patient", "हो, माझा मुलगा घेऊन येणार आहे.", "Yes, my son will bring me."),
        ("AI", "माहिती दिल्याबद्दल धन्यवाद रमेशवर जी. काळजी घ्या आणि डॉक्टरांच्या सल्ल्यानुसारच औषधे चालू ठेवा. नमस्कार!", "Thank you for the update Rameshwar ji. Take care and continue medicines strictly per doctor's advice. Goodbye!")
    ]

    for idx, (spk, msg_native, msg_en) in enumerate(transcripts_c1):
        tr = CallTranscript(
            call_id=call1.id,
            turn_index=idx,
            speaker=spk,
            message_text=msg_native,
            translated_text_en=msg_en,
            sentiment="Positive" if spk == "Patient" else "Empathetic",
            timestamp=call1.started_at + timedelta(seconds=idx * 10)
        )
        db.add(tr)

    # 4. Alerts
    # High priority alert for Rajesh Verma
    alert_high = Alert(
        patient_id=pt5.id,
        call_id=call3.id,
        alert_type="Potentially Urgent Symptoms",
        priority="High",
        title="URGENT: Post-Stent Chest Pain reported by Rajesh Verma",
        description="Patient reported acute squeezing chest pain and shortness of breath during automated check-in.",
        status="Open",
        clinical_protocol_action="Immediate 108 Emergency referral triggered. Supervising Cardiologist Dr. M. Joshi notified.",
        assigned_to_id=coordinator.id,
        created_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.add(alert_high)
    db.commit()

    # Escalation record for the high alert
    esc = EscalationRecord(
        alert_id=alert_high.id,
        patient_id=pt5.id,
        escalated_by="AI Safety Engine (Red Flag Triage)",
        escalated_to="Emergency Hotline 108 & Duty Medical Officer",
        reason="Acute chest pain in post-PCI stented patient.",
        status="Dispatched",
        coordinator_notes="Automatic alert dispatched to clinical desk.",
        created_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.add(esc)

    # Medium priority alert for Gurpreet Singh (Missed Dose)
    alert_med1 = Alert(
        patient_id=pt3.id,
        call_id=call2.id,
        alert_type="Missed Dose",
        priority="Medium",
        title="Missed Antibiotic Dose (Cefuroxime) - Gurpreet Singh",
        description="Patient ran out of tablets yesterday. Needs refill guidance and adherence encouragement.",
        status="In Progress",
        clinical_protocol_action="Care coordinator to facilitate pharmacy refill through local primary health center (PHC).",
        assigned_to_id=coordinator.id,
        created_at=datetime.utcnow() - timedelta(hours=6)
    )
    db.add(alert_med1)

    # Medium priority alert for Gurpreet Singh (Missed Appointment)
    alert_med2 = Alert(
        patient_id=pt3.id,
        call_id=call2.id,
        alert_type="Missed Appointment",
        priority="Medium",
        title="Missed Orthopedic Follow-Up - Gurpreet Singh",
        description="Scheduled suture removal on yesterday was missed due to transportation barrier.",
        status="Open",
        clinical_protocol_action="Reschedule OPD appointment and coordinate with 108/Janani express or local transport.",
        assigned_to_id=coordinator.id,
        created_at=datetime.utcnow() - timedelta(hours=6)
    )
    db.add(alert_med2)

    # Adherence records
    adh1 = MedicationAdherenceRecord(
        patient_id=pt1.id,
        medication_id=pt1.medications[0].id if pt1.medications else None,
        call_id=call1.id,
        record_date=datetime.utcnow() - timedelta(days=1),
        status="Taken",
        dose_time="Afternoon",
        notes="Patient verified taking dose on time",
        recorded_at=datetime.utcnow() - timedelta(days=1)
    )
    adh2 = MedicationAdherenceRecord(
        patient_id=pt3.id,
        medication_id=pt3.medications[0].id if pt3.medications else None,
        call_id=call2.id,
        record_date=datetime.utcnow() - timedelta(days=1),
        status="Missed",
        missed_reason="Strip finished; pharmacy was closed",
        dose_time="Night",
        notes="Antibiotic missed",
        recorded_at=datetime.utcnow() - timedelta(hours=6)
    )
    db.add_all([adh1, adh2])

    db.commit()
    db.close()
    print("[Seed] Synthetic healthcare data successfully seeded!")

if __name__ == "__main__":
    seed_database()

# 🩺 AarogyaVani — Missed-Dose & Follow-Up Companion
> **AI-Powered Multilingual Healthcare Follow-Up Platform for Discharged Rural Patients in India**  
> *Powered by Sarvam AI (`bulbul:v3` Speech Synthesis & `sarvam-105b` LLM Triage)*

---

## 🌟 1. Project Overview

**AarogyaVani** is an end-to-end, clinical-grade patient follow-up and medication adherence platform designed specifically for rural Indian patients post-hospital discharge. 

In rural India, hospital discharge often leads to adherence drop-off due to limited health literacy, language barriers, and lack of active outreach. AarogyaVani automates outbound check-in phone calls in patients' native vernacular tongues (**Hindi**, **Marathi**, **Punjabi**, and **Indian English**), systematically assessing:
1. **Medication Adherence**: Verified intake of prescribed discharge medicines.
2. **Symptom Monitoring**: Detection of new or worsening complications.
3. **Follow-Up Appointments**: Reminders for OPD review visits and transportation checks.
4. **Intelligent Escalation**: Real-time routing of missed doses and emergency red flags to human care coordinators and supervising physicians.

---

## 🛡️ 2. Clinical Safety Guardrails (Strictly Non-Diagnostic)

> [!IMPORTANT]
> **Strict Non-Diagnostic Boundary**:
> The AI voice agent **NEVER** independently prescribes medicines, changes dosages, diagnoses medical conditions, or instructs patients to discontinue medication.
> - **Red Flag Detection (High Priority)**: Symptoms such as acute chest pain, severe dyspnea, and neurological deficits trigger an immediate referral to **108 Emergency Services** and concurrently dispatch an urgent alert to the hospital clinical desk.
> - **Missed Doses (Medium Priority)**: Logged into the adherence registry with immediate outreach tasks generated for the rural healthcare coordinator.
> - **Supervised Protocol**: All escalation decisions adhere to approved healthcare professional protocols.

---

## 🏗️ 3. System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │       Discharged Rural Patient (Phone)       │
                               └──────────────────────▲───────────────────────┘
                                                      │ (Audio Call / WebRTC)
                               ┌──────────────────────▼───────────────────────┐
                               │         Interactive Voice Studio             │
                               │   (Twilio / Exotel / Browser Simulation)     │
                               └──────────────────────▲───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       │                                                             │
         ┌─────────────▼─────────────┐                                 ┌─────────────▼─────────────┐
         │     Sarvam AI Speech      │                                 │     Sarvam AI 105b        │
         │       (Bulbul:v3)         │                                 │   Conversational Engine   │
         │  Hindi, Marathi, Punjabi  │                                 │    Non-Diagnostic Triage  │
         └─────────────▲─────────────┘                                 └─────────────▲─────────────┘
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      │
                                       ┌──────────────▼──────────────┐
                                       │     FastAPI Backend Core    │
                                       │   Safety Triage & Alerts    │
                                       └──────────────▲──────────────┘
                                                      │
                                       ┌──────────────▼──────────────┐
                                       │     PostgreSQL / SQLite     │
                                       │    SQLAlchemy 2.0 Engine    │
                                       └──────────────▲──────────────┘
                                                      │
                                       ┌──────────────▼──────────────┐
                                       │   React Coordinator SaaS    │
                                       │   Tailwind CSS + Recharts   │
                                       └─────────────────────────────┘
```

---

## 🚀 4. Quick Start & Execution

### Prerequisites
- Python 3.10+ (Anaconda or standalone)
- Sarvam AI API Key (configured in `.env`)
- Node.js 18+ (for frontend development, or run the pre-built bundle)

### Quick One-Click Run (Recommended)
```bash
python run_app.py
```
*Or on Windows, simply double-click `run_app.bat`.*

This launches the unified server at **`http://localhost:8000`** with:
- **Web SaaS Dashboard**: `http://localhost:8000`
- **Interactive Swagger API Docs**: `http://localhost:8000/docs`

---

### Running Frontend in Hot-Reload Development Mode
If you wish to modify the React frontend with live HMR:
```bash
# Terminal 1: Backend
python -m uvicorn backend.app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
# Accessible at http://localhost:5173
```

---

## 📞 5. AI Voice Calling System Features

- **Empathetic Vernacular Greetings**: Personalized greeting addressing the patient by name in their native language (e.g., *"नमस्कार रमेशवर जी! मी जिल्हा शासकीय रुग्णालयाच्या फॉलो-अप सेवेमधून बोलत आहे..."*).
- **Sarvam Bulbul:v3 Voice Generation**: Natural Indian regional accents:
  - **Hindi (`hi-IN`)**: `ritu` / `priya`
  - **Marathi (`mr-IN`)**: `soham` / `rupali`
  - **Punjabi (`pa-IN`)**: `simran` / `anand`
  - **Indian English (`en-IN`)**: `ritu`
- **Interactive Web Simulator**: Real-time voice calls directly in the browser with audio mic input, Sarvam audio playback, live waveform, and one-click clinical scenario chips:
  - *Adherent patient*
  - *Missed dose*
  - *Emergency red flag (acute chest pain)*
  - *Transportation barrier*

---

## 🗄️ 6. Database Schema

1. **`users`**: Role-based access control (Admin, Healthcare Coordinator, Supervising Doctor).
2. **`healthcare_coordinators`**: Coordinator desk info, language competencies, and assigned cohorts.
3. **`patients`**: Demographics, village/district, discharge diagnosis, risk stratification, opt-out status.
4. **`medications`**: Verified discharge prescriptions, dosages, frequencies, and vernacular instructions.
5. **`medication_adherence_records`**: Turn-by-turn dose intake tracking and reported barriers.
6. **`appointments`**: Scheduled post-discharge OPD visits, attended logs, and missed appointments.
7. **`voice_calls`**: Call metadata, duration, audio recordings, and clinical follow-up outcomes.
8. **`call_transcripts`**: Turn-by-turn bilingual transcripts with sentiment and audio timestamps.
9. **`alerts`**: High / Medium / Low priority triage queue with protocol action recommendations.
10. **`escalation_records`**: Audit trails of dispatches to supervising doctors and 108 emergency services.
11. **`audit_logs`**: System audit logging compliant with Indian healthcare privacy standards.

---

## 🔒 7. Privacy & Security

- **Strict Environment Isolation**: API keys (`SARVAM_API_KEY`) and credentials are read strictly from `.env` and excluded from source control (`.gitignore`).
- **Patient Consent & Opt-Out**: Explicit informed consent tracking and a 1-click patient opt-out toggle.
- **Synthetic Patient Cohort**: Realistic synthetic patients adhering to DISHA (Digital Information Security in Healthcare Act) guidelines.

---

## 👥 Authors
Built for post-discharge healthcare continuity in rural India using **Sarvam AI**.


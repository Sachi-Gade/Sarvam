import re
from typing import Dict, Any, List, Optional
from .safety_engine import analyze_clinical_safety
from .sarvam_service import sarvam_service

# Pre-scripted empathetic follow-up dialogues tailored for rural comprehension
STAGE_PROMPTS = {
    "hi-IN": {
        "greeting": "नमस्ते {name} जी! मैं आपके अस्पताल 'डिस्ट्रिक्ट सिविल हॉस्पिटल' की फॉलो-अप सेवा से बोल रहा हूँ। क्या यह बात करने का सही समय है?",
        "greeting_en": "Namaste {name}! I am calling from the District Civil Hospital follow-up service. Is this a convenient time to speak?",
        
        "med_check": "धन्यवाद। अस्पताल से छुट्टी के समय आपको {medications} लिखी गई थीं। क्या आपने आज अपनी निर्धारित दवाइयाँ समय पर ले ली हैं?",
        "med_check_en": "Thank you. At discharge, you were prescribed {medications}. Have you taken your prescribed medications today?",
        
        "symptom_check": "बहुत अच्छा। क्या छुट्टी के बाद आपको कोई नया दर्द, बुखार, चक्कर या कोई अन्य तकलीफ महसूस हो रही है?",
        "symptom_check_en": "Good. Have you experienced any new pain, fever, dizziness, or worsening discomfort since discharge?",
        
        "appointment_check": "समझ गया। आपकी अगली डॉक्टर की जाँच {appointment_date} को तय है। क्या आपको यह याद है या अस्पताल आने में कोई कठिनाई है?",
        "appointment_check_en": "Understood. Your next doctor checkup is scheduled for {appointment_date}. Do you remember this, or do you anticipate any difficulty visiting the clinic?",
        
        "wrapup": "बहुत-बहुत धन्यवाद {name} जी। आपकी सभी जानकारी हमने सुरक्षित दर्ज कर ली है। कृपया डॉक्टर की सलाह के अनुसार ही दवाइयाँ लेते रहें। यदि कोई भी परेशानी हो तो अपने कोऑर्डिनेटर से संपर्क करें। शुभ दिन!",
        "wrapup_en": "Thank you very much, {name}. We have recorded your update. Please continue following your doctor's instructions. If you need any assistance, your coordinator will be available. Have a restful day!"
    },
    "mr-IN": {
        "greeting": "नमस्कार {name} जी! मी जिल्हा शासकीय रुग्णालयाच्या फॉलो-अप सेवेमधून बोलत आहे. ही बोलण्यासाठी सोयीची वेळ आहे का?",
        "greeting_en": "Namaste {name}! I am calling from the District Hospital follow-up service. Is this a convenient time to speak?",
        
        "med_check": "धन्यवाद. डिस्चार्जच्या वेळी तुम्हाला {medications} औषधे दिली होती. आज तुम्ही आपली सर्व औषधे वेळेवर घेतली आहेत का?",
        "med_check_en": "Thank you. You were prescribed {medications} at discharge. Have you taken all your medicines on time today?",
        
        "symptom_check": "छान. तुम्हाला सध्या कोणताही त्रास, ताप, चक्कर किंवा नवीन वेदना जाणवत आहेत का?",
        "symptom_check_en": "Good. Are you experiencing any pain, fever, dizziness, or new discomfort?",
        
        "appointment_check": "समजले. तुमची पुढची तपासणी {appointment_date} रोजी आहे. तुम्ही रुग्णालयात येऊ शकाल ना?",
        "appointment_check_en": "Understood. Your next appointment is on {appointment_date}. Will you be able to visit the hospital?",
        
        "wrapup": "माहिती दिल्याबद्दल धन्यवाद {name} जी. काळजी घ्या आणि डॉक्टरांच्या सल्ल्यानुसारच औषधे चालू ठेवा. नमस्कार!",
        "wrapup_en": "Thank you for the update {name}. Take care and continue medicines strictly per doctor's advice. Goodbye!"
    },
    "pa-IN": {
        "greeting": "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ {name} ਜੀ! ਮੈਂ ਸਿਵਲ ਹਸਪਤਾਲ ਦੀ ਫਾਲੋ-ਅੱਪ ਟੀਮ ਵੱਲੋਂ ਗੱਲ ਕਰ ਰਿਹਾ ਹਾਂ। ਕੀ ਇਹ ਗੱਲ ਕਰਨ ਦਾ ਠੀਕ ਸਮਾਂ ਹੈ?",
        "greeting_en": "Sat Sri Akal {name}! I am calling from the Civil Hospital follow-up service. Is this a good time to speak?",
        
        "med_check": "ਸ਼ੁਕਰੀਆ। ਡਿਸਚਾਰਜ ਵੇਲੇ ਤੁਹਾਨੂੰ {medications} ਲਿਖੀਆਂ ਗਈਆਂ ਸਨ। ਕੀ ਤੁਸੀਂ ਅੱਜ ਆਪਣੀਆਂ ਦਵਾਈਆਂ ਸਮੇਂ ਸਿਰ ਲੈ ਲਈਆਂ ਹਨ?",
        "med_check_en": "Thank you. You were prescribed {medications}. Have you taken your medicines on time today?",
        
        "symptom_check": "ਕੀ ਤੁਹਾਨੂੰ ਕੋਈ ਨਵੀਂ ਤਕਲੀਫ਼, ਬੁਖ਼ਾਰ, ਦਰਦ ਜਾਂ ਚੱਕਰ ਆਦਿ ਮਹਿਸੂਸ ਹੋ ਰਹੇ ਹਨ?",
        "symptom_check_en": "Are you experiencing any new complaints like fever, pain, or dizziness?",
        
        "appointment_check": "ਤੁਹਾਡੀ ਅਗਲੀ ਡਾਕਟਰੀ ਜਾਂਚ {appointment_date} ਨੂੰ ਹੈ। ਕੀ ਤੁਸੀਂ ਆਸਾਨੀ ਨਾਲ ਹਸਪਤਾਲ ਪਹੁੰਚ ਸਕਦੇ ਹੋ?",
        "appointment_check_en": "Your next checkup is on {appointment_date}. Will you be able to visit comfortably?",
        
        "wrapup": "ਜਾਣਕਾਰੀ ਲਈ ਧੰਨਵਾਦ {name} ਜੀ। ਆਪਣੀ ਦਵਾਈ ਸਮੇਂ ਸਿਰ ਲੈਂਦੇ ਰਹੋ ਅਤੇ ਸਿਹਤ ਦਾ ਧਿਆਨ ਰੱਖੋ। ਰੱਬ ਰਾਖਾ!",
        "wrapup_en": "Thank you {name}. Please keep taking your medication on time. Take care!"
    },
    "en-IN": {
        "greeting": "Hello {name}! I am calling from the hospital follow-up care team. Is this a convenient time to speak for two minutes?",
        "greeting_en": "Hello {name}! I am calling from the hospital follow-up care team. Is this a convenient time to speak for two minutes?",
        
        "med_check": "Thank you. You were prescribed {medications} upon discharge. Have you been able to take your prescribed doses today?",
        "med_check_en": "Thank you. You were prescribed {medications} upon discharge. Have you been able to take your prescribed doses today?",
        
        "symptom_check": "Good to know. Have you noticed any new or worsening symptoms such as fever, breathlessness, or unusual pain?",
        "symptom_check_en": "Good to know. Have you noticed any new or worsening symptoms such as fever, breathlessness, or unusual pain?",
        
        "appointment_check": "Got it. Your follow-up clinical appointment is scheduled for {appointment_date}. Do you need any assistance getting to the clinic?",
        "appointment_check_en": "Got it. Your follow-up clinical appointment is scheduled for {appointment_date}. Do you need any assistance getting to the clinic?",
        
        "wrapup": "Thank you so much, {name}. We have noted everything. Please continue taking your prescribed medications. Your coordinator is available if you need help.",
        "wrapup_en": "Thank you so much, {name}. We have noted everything. Please continue taking your prescribed medications. Your coordinator is available if you need help."
    }
}

class VoiceAgent:
    """
    Manages structured, clinical-grade outbound healthcare follow-up dialogs.
    Enforces non-diagnostic clinical boundaries and real-time red-flag detection.
    """

    @staticmethod
    def get_initial_greeting(patient, language_code: str = "hi-IN") -> Dict[str, Any]:
        lang_prompts = STAGE_PROMPTS.get(language_code, STAGE_PROMPTS["hi-IN"])
        native_text = lang_prompts["greeting"].format(name=patient.full_name)
        english_text = lang_prompts["greeting_en"].format(name=patient.full_name)
        
        # Synthesize audio with Sarvam Bulbul:v3
        audio_b64 = sarvam_service.synthesize_speech(native_text, language_code=language_code)

        return {
            "stage": "GREETING",
            "native_text": native_text,
            "english_text": english_text,
            "audio_base64": audio_b64
        }

    @staticmethod
    def process_turn(
        patient,
        current_turn: int,
        patient_reply: str,
        language_code: str = "hi-IN",
        call_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Processes a turn in the follow-up call.
        Checks for safety triggers, moves through clinical follow-up stages, and generates voice.
        """
        lang_prompts = STAGE_PROMPTS.get(language_code, STAGE_PROMPTS["hi-IN"])
        safety = analyze_clinical_safety(patient_reply, language_code=language_code)

        # 1. Critical Red Flag Escalation
        if safety["urgency"] == "High":
            emergency_text = safety["emergency_instruction"]
            audio_b64 = sarvam_service.synthesize_speech(emergency_text, language_code=language_code)
            return {
                "turn_index": current_turn + 1,
                "stage": "EMERGENCY_ESCALATION",
                "ai_reply_native": emergency_text,
                "ai_reply_english": "Emergency red-flag detected. Immediate 108 referral provided and clinical supervisor notified.",
                "ai_audio_base64": audio_b64,
                "is_call_ended": True,
                "detected_urgency": "High",
                "detected_symptoms": "Urgent Red Flag",
                "detected_adherence": "Unknown",
                "safety_alert_triggered": True,
                "safety_message": safety["protocol"]
            }

        # Format medication names
        med_names = ", ".join([m.name for m in patient.medications]) if patient.medications else "निर्धारित दवाएं"
        appt_date_str = patient.appointments[0].scheduled_date.strftime("%d %B %Y") if patient.appointments else "अगले हफ्ते"

        # Determine stage based on turn index (0: Greeted, 1: After Greeting, 2: After Meds, 3: After Symptoms, 4: After Appt)
        if current_turn == 0:
            # Move to Medication Check
            native_text = lang_prompts["med_check"].format(medications=med_names)
            english_text = lang_prompts["med_check_en"].format(medications=med_names)
            stage = "MEDICATION_CHECK"
            is_ended = False
            detected_adherence = "Pending"
            detected_symptoms = "Normal"
            
        elif current_turn == 1:
            # Patient replied about medications; process adherence
            is_missed = safety["alert_type"] == "Missed Dose"
            detected_adherence = "Missed Dose" if is_missed else "Fully Adherent"

            # Reassurance + Move to Symptom Check
            prefix_hi = "जानकारी नोट कर ली गई है। " if is_missed else "बहुत अच्छा! "
            native_text = prefix_hi + lang_prompts["symptom_check"]
            english_text = ("Noted. " if is_missed else "Great! ") + lang_prompts["symptom_check_en"]
            stage = "SYMPTOM_CHECK"
            is_ended = False
            detected_symptoms = "Normal"

        elif current_turn == 2:
            # Patient replied about symptoms
            is_worsening = safety["urgency"] == "Medium"
            detected_symptoms = "New / Worsening" if is_worsening else "Normal"
            detected_adherence = "Noted"

            # Move to Appointment Check
            prefix_hi = "हम आपके लक्षणों की जानकारी कोऑर्डिनेटर तक पहुंचा रहे हैं। " if is_worsening else "यह जानकर राहत मिली। "
            native_text = prefix_hi + lang_prompts["appointment_check"].format(appointment_date=appt_date_str)
            english_text = ("Coordinator notified about symptoms. " if is_worsening else "Glad to hear. ") + lang_prompts["appointment_check_en"].format(appointment_date=appt_date_str)
            stage = "APPOINTMENT_CHECK"
            is_ended = False

        else:
            # Wrap-up call
            native_text = lang_prompts["wrapup"].format(name=patient.full_name)
            english_text = lang_prompts["wrapup_en"].format(name=patient.full_name)
            stage = "COMPLETED"
            is_ended = True
            detected_symptoms = "Normal"
            detected_adherence = "Recorded"

        # Synthesize audio with Sarvam Bulbul:v3
        audio_b64 = sarvam_service.synthesize_speech(native_text, language_code=language_code)

        return {
            "turn_index": current_turn + 1,
            "stage": stage,
            "ai_reply_native": native_text,
            "ai_reply_english": english_text,
            "ai_audio_base64": audio_b64,
            "is_call_ended": is_ended,
            "detected_urgency": safety["urgency"],
            "detected_symptoms": safety["symptom_status"],
            "detected_adherence": "Missed Dose" if safety["alert_type"] == "Missed Dose" else "Recorded",
            "safety_alert_triggered": safety["urgency"] != "Low",
            "safety_message": safety["protocol"]
        }

voice_agent = VoiceAgent()


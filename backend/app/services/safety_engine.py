import re
from typing import Dict, Any, Tuple

# Red-flag clinical keywords across languages
URGENT_KEYWORDS = [
    # English
    r"\b(chest pain|heart attack|can't breathe|cannot breathe|severe breathless|breathlessness|gasping|coughing blood|blood in vomit|passed out|fainted|unconscious|stroke|slurred speech|paralysis|convulsions|seizure|emergency|108)\b",
    # Hindi
    r"(सीने में दर्द|छाती में दर्द|साँस लेने में दिक्कत|दम घुट|सांस फूल|खून की उल्टी|बेहोश|चक्कर खाकर गिर|लकवा|दौरा|तेज बुखार|खून आ रहा|इमरजेंसी)",
    # Marathi
    r"(छातीत दुखणे|छातीत कळ|श्वास घेण्यास त्रास|श्वास कोंडणे|रक्ताची उलटी|शुद्ध हरपणे|बेहोश|पक्षाघात|फिट येणे|तातडीने)",
    # Punjabi
    r"(ਛਾਤੀ ਵਿੱਚ ਦਰਦ|ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼|ਸਾਹ ਫੁੱਲ|ਖੂਨ ਦੀ ਉਲਟੀ|ਬੇਹੋਸ਼|ਦੌਰਾ|ਐਮਰਜੈਂਸੀ)",
]

WORSENING_KEYWORDS = [
    # English
    r"\b(fever|pain|swelling|vomiting|nausea|dizziness|rash|infection|loose motion|diarrhea|headache|weak|tired|worse)\b",
    # Hindi
    r"(बुखार|दर्द|सूजन|उल्टी|जी मिचलाना|चक्कर|घबराहट|दस्त|कमजोरी|बढ़ रहा|तकलीफ)",
    # Marathi
    r"(ताप|वेदना|सूज|उलटी|मळमळ|चक्कर|अशक्तपणा|जुलाब|त्रास वाढला)",
    # Punjabi
    r"(ਬੁਖ਼ਾਰ|ਦਰਦ|ਸੋਜ|ਉਲਟੀ|ਚੱਕਰ|ਦਸਤ|ਕਮਜ਼ੋਰੀ)",
]

MISSED_DOSE_KEYWORDS = [
    # English
    r"\b(missed|forgot|didn't take|did not take|skipped|no medicine|ran out|finished|stopped)\b",
    # Hindi
    r"(छूट गई|भूल गया|भूल गई|नहीं ली|दवा खत्म|दवा बंद|नहीं खाई|छोड़ दी)",
    # Marathi
    r"(विसरलो|घेतली नाही|औषध संपले|बंद केले|नाही खाल्ली)",
    # Punjabi
    r"(ਭੁੱਲ ਗਿਆ|ਨਹੀਂ ਲਈ|ਦਵਾਈ ਖ਼ਤਮ|ਛੱਡ ਦਿੱਤੀ)",
]

TAKEN_DOSE_KEYWORDS = [
    # English
    r"\b(yes|taken|took|had them|finished on time|all good|already took)\b",
    # Hindi
    r"(हाँ|ले ली|खा ली|समय पर|पूरी ले ली|सब ठीक)",
    # Marathi
    r"(हो|घेतली|खाल्ली|वेळेवर घेतली)",
    # Punjabi
    r"(ਹਾਂ|ਲੈ ਲਈ|ਖਾ ਲਈ|ਸਮੇਂ ਸਿਰ)",
]

# Emergency protocols per language
EMERGENCY_INSTRUCTIONS = {
    "hi-IN": "यह एक आपातकालीन लक्षण हो सकता है। कृपया तुरंत 108 नंबर पर कॉल करके एम्बुलेंस बुलाएं या नजदीकी आपातकालीन अस्पताल जाएं। हम आपके डॉक्टर और कोऑर्डिनेटर को भी तुरंत अलर्ट कर रहे हैं।",
    "mr-IN": "हे तातडीच्या उपचारांचे लक्षण असू शकते. कृपया त्वरित 108 वर संपर्क साधा किंवा जवळच्या रुग्णालयात जा. आम्ही तुमच्या समन्वयकांना आणि डॉक्टरांना तात्काळ सूचित करत आहोत.",
    "pa-IN": "ਇਹ ਇੱਕ ਐਮਰਜੈਂਸੀ ਲੱਛਣ ਹੋ ਸਕਦਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ 108 'ਤੇ ਕਾਲ ਕਰੋ ਜਾਂ ਨੇੜਲੇ ਹਸਪਤਾਲ ਜਾਓ। ਅਸੀਂ ਤੁਹਾਡੇ ਡਾਕਟਰ ਅਤੇ ਕੋਆਰਡੀਨੇਟਰ ਨੂੰ ਵੀ ਤੁਰੰਤ ਸੁਚੇਤ ਕਰ ਰਹੇ ਹਾਂ।",
    "en-IN": "These symptoms require immediate medical attention. Please call emergency services (108) or go to the nearest hospital emergency department immediately. We are alerting your supervising medical team right away."
}

def analyze_clinical_safety(patient_reply: str, language_code: str = "hi-IN") -> Dict[str, Any]:
    """
    Evaluates patient responses using approved clinical escalation logic.
    Strictly non-diagnostic: identifies triggers for human healthcare escalation.
    """
    reply_lower = patient_reply.lower()

    # 1. High-priority red-flag check
    for pattern in URGENT_KEYWORDS:
        if re.search(pattern, reply_lower, re.IGNORECASE):
            return {
                "urgency": "High",
                "alert_type": "Potentially Urgent Symptoms",
                "symptom_status": "Urgent Red Flag",
                "emergency_instruction": EMERGENCY_INSTRUCTIONS.get(language_code, EMERGENCY_INSTRUCTIONS["en-IN"]),
                "requires_immediate_dispatch": True,
                "protocol": "Immediate 108 Emergency referral + On-Call Clinician Notification"
            }

    # 2. Medium-priority worsening symptoms
    for pattern in WORSENING_KEYWORDS:
        if re.search(pattern, reply_lower, re.IGNORECASE):
            return {
                "urgency": "Medium",
                "alert_type": "Worsening Symptoms",
                "symptom_status": "New / Worsening",
                "emergency_instruction": None,
                "requires_immediate_dispatch": False,
                "protocol": "Care Coordinator Callback within 4 hours; Physician Review"
            }

    # 3. Missed dose check
    for pattern in MISSED_DOSE_KEYWORDS:
        if re.search(pattern, reply_lower, re.IGNORECASE):
            return {
                "urgency": "Medium",
                "alert_type": "Missed Dose",
                "symptom_status": "Normal",
                "emergency_instruction": None,
                "requires_immediate_dispatch": False,
                "protocol": "Log adherence deficit; Coordinator medication reconciliation call"
            }

    # 4. Routine / Normal
    return {
        "urgency": "Low",
        "alert_type": None,
        "symptom_status": "Normal",
        "emergency_instruction": None,
        "requires_immediate_dispatch": False,
        "protocol": "Routine follow-up logging"
    }


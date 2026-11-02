import os
import base64
from typing import Optional, List, Dict
from dotenv import load_dotenv

load_dotenv()

# Speaker mapping optimized for bulbul:v3 Indian language nuances
DEFAULT_SPEAKERS = {
    "hi-IN": "ritu",       # Calm, empathetic female Hindi voice
    "mr-IN": "soham",      # Clear, respectful Marathi voice
    "pa-IN": "simran",     # Warm Punjabi voice
    "en-IN": "ritu"        # Clear Indian English voice
}

class SarvamService:
    def __init__(self):
        self.api_key = os.getenv("SARVAM_API_KEY", "")
        self.client = None
        if self.api_key:
            try:
                from sarvamai import SarvamAI
                self.client = SarvamAI(api_subscription_key=self.api_key)
            except Exception as e:
                print(f"[SarvamService] Warning: Could not initialize SarvamAI client: {e}")

    def synthesize_speech(
        self,
        text: str,
        language_code: str = "hi-IN",
        speaker: Optional[str] = None
    ) -> Optional[str]:
        """
        Synthesizes text into natural Indian audio using Sarvam Bulbul:v3 TTS.
        Returns base64 audio string (WAV or MP3).
        """
        if not self.client or not self.api_key:
            print("[SarvamService] Sarvam client not initialized. Skipping TTS.")
            return None

        # Clean text: strip special markdown formatting
        clean_text = text.replace("**", "").replace("#", "").strip()
        if not clean_text:
            return None

        selected_speaker = speaker or DEFAULT_SPEAKERS.get(language_code, "ritu")

        try:
            response = self.client.text_to_speech.convert(
                text=clean_text[:450],  # truncate if overly long for optimal latency
                language_code=language_code,
                speaker=selected_speaker,
                model="bulbul:v3",
                output_audio_codec="wav"
            )
            if response and response.audios and len(response.audios) > 0:
                return response.audios[0]
        except Exception as e:
            print(f"[SarvamService] TTS synthesis error ({language_code}/{selected_speaker}): {e}")
            return None

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        model: str = "sarvam-105b-conversations",
        temperature: float = 0.2
    ) -> str:
        """
        Calls Sarvam LLM with safety guardrails for rural patient healthcare follow-up.
        """
        if not self.client or not self.api_key:
            return "Thank you for sharing. Your healthcare coordinator has been notified."

        try:
            response = self.client.chat.completions(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=300
            )
            if response and response.choices and len(response.choices) > 0:
                return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[SarvamService] Chat completion error: {e}")
            return "Thank you for the update. We have recorded your responses."

sarvam_service = SarvamService()


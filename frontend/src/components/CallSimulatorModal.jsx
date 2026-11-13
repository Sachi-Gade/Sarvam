import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Volume2, 
  Mic, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  User, 
  Languages, 
  Clock, 
  FileText,
  RotateCcw
} from 'lucide-react';
import { api } from '../api';

const QUICK_CHIPS = {
  0: [
    { text: "हाँ, बात करने का सही समय है।", en: "Yes, this is a convenient time to speak." },
    { text: "होय, मी बोलू शकतो.", en: "Yes, I can speak now." },
    { text: "ਹਾਂਜੀ, ਮੈਂ ਗੱਲ ਕਰ ਸਕਦਾ ਹਾਂ।", en: "Yes, I can speak." },
    { text: "Yes, I have two minutes to speak.", en: "Yes, I have two minutes to speak." },
  ],
  1: [
    { text: "हाँ, मैंने सभी दवाइयाँ समय पर ले ली हैं।", en: "Yes, I took all my medicines on time today.", tag: "Adherent" },
    { text: "नहीं, मैं सुबह की दवा लेना भूल गया।", en: "No, I forgot to take my morning dose.", tag: "Missed Dose" },
    { text: "नाही, माझी औषधे संपली आहेत.", en: "No, my medicine strip is finished.", tag: "Ran Out" },
    { text: "I missed one dose of my blood pressure tablet.", en: "Missed one dose.", tag: "Missed Dose" },
  ],
  2: [
    { text: "नहीं, कोई परेशानी नहीं है, सब ठीक है।", en: "No complaints, feeling fine.", tag: "Normal" },
    { text: "मुझे हल्का बुखार और उल्टी जैसा लग रहा है।", en: "Mild fever and nausea.", tag: "Worsening" },
    { text: "सीने में बहुत तेज दर्द हो रहा है और सांस फूल रही है!", en: "Severe chest pain and shortness of breath!", tag: "URGENT RED FLAG" },
    { text: "छातीत तीव्र कळ येत आहे आणि दम लागतोय!", en: "Severe chest pain and breathlessness!", tag: "URGENT RED FLAG" }
  ],
  3: [
    { text: "हाँ, मुझे याद है, मैं अस्पताल आऊँगा।", en: "Yes, I remember and will visit the OPD.", tag: "Confirmed" },
    { text: "गाँव में गाड़ी नहीं है, आने में परेशानी होगी।", en: "No transport from village to district hospital.", tag: "Barrier" },
    { text: "Yes, my son is bringing me to the clinic.", en: "Yes, family bringing me.", tag: "Confirmed" }
  ]
};

export default function CallSimulatorModal({ isOpen, onClose, patients = [], onCallCompleted }) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || "");
  const [callSession, setCallSession] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [patientInput, setPatientInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [callStage, setCallStage] = useState(0); // 0: Greeting, 1: Meds, 2: Symptoms, 3: Appt, 4: Done
  const [urgencyBadge, setUrgencyBadge] = useState("Low");
  const [safetyAlert, setSafetyAlert] = useState(null);
  const [callSummary, setCallSummary] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [unansweredData, setUnansweredData] = useState(null);

  const audioPlayerRef = useRef(null);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, isLoading]);

  const selectedPatient = patients.find(p => p.id === Number(selectedPatientId));

  // Play audio from base64
  const playBase64Audio = (base64Audio) => {
    if (!base64Audio) return;
    try {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      setIsPlayingAudio(true);
      audio.play().catch(e => console.warn("Audio autoplay blocked by browser policy:", e));
      audio.onended = () => setIsPlayingAudio(false);
    } catch (e) {
      console.error("Audio playback error:", e);
      setIsPlayingAudio(false);
    }
  };

  const handleStartCall = async () => {
    if (!selectedPatient) return;
    setIsLoading(true);
    setTranscripts([]);
    setCallStage(0);
    setUrgencyBadge("Low");
    setSafetyAlert(null);
    setCallSummary(null);
    setUnansweredData(null);

    try {
      const res = await api.startCall(selectedPatient.id, "Simulated Web Call");
      setCallSession(res);

      const initialTurn = {
        speaker: "AI",
        nativeText: res.ai_greeting_native,
        englishText: res.ai_greeting_english,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTranscripts([initialTurn]);

      if (res.ai_audio_base64) {
        playBase64Audio(res.ai_audio_base64);
      }
    } catch (err) {
      alert("Failed to start call: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Microphone recognition is supported in Google Chrome and Microsoft Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langMap = {
        'hi-IN': 'hi-IN',
        'mr-IN': 'mr-IN',
        'pa-IN': 'pa-IN',
        'en-IN': 'en-IN'
      };
      recognition.lang = langMap[selectedPatient?.preferred_language] || 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          setPatientInput(spoken);
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSimulateUnanswered = async () => {
    if (!callSession) return;
    setIsLoading(true);
    try {
      const res = await api.markCallUnanswered(callSession.call_id);
      setUnansweredData(res);
      setCallSummary("Call marked Unanswered. Automated vernacular WhatsApp/SMS reminder dispatched.");
      if (onCallCompleted) onCallCompleted();
    } catch (e) {
      alert("Error marking call unanswered: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async (replyText) => {
    const textToSend = replyText || patientInput;
    if (!textToSend.trim() || !callSession || isLoading) return;

    // Append patient transcript
    const userTurn = {
      speaker: "Patient",
      nativeText: textToSend,
      englishText: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTranscripts(prev => [...prev, userTurn]);
    setPatientInput("");
    setIsLoading(true);

    try {
      const res = await api.simulateCallTurn(callSession.call_id, textToSend);

      // Append AI response
      const aiTurn = {
        speaker: "AI",
        nativeText: res.ai_reply_native,
        englishText: res.ai_reply_english,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTranscripts(prev => [...prev, aiTurn]);

      if (res.ai_audio_base64) {
        playBase64Audio(res.ai_audio_base64);
      }

      setCallStage(prev => prev + 1);
      setUrgencyBadge(res.detected_urgency);

      if (res.safety_alert_triggered) {
        setSafetyAlert({
          urgency: res.detected_urgency,
          message: res.safety_message
        });
      }

      if (res.is_call_ended) {
        setCallSummary(res.call_summary || "Call concluded successfully. Follow-up logged.");
        if (onCallCompleted) onCallCompleted();
      }
    } catch (err) {
      alert("Error processing turn: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setCallSession(null);
    setIsPlayingAudio(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Studio Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${callSession ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
              <Phone className={`w-5 h-5 ${callSession ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">AI Outbound Follow-Up Studio</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/30 text-brand-300 border border-brand-400/30">
                  Sarvam Bulbul TTS + 105b
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated non-diagnostic telephone health check for rural post-discharge patients
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Call Workspace Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Left Column: Patient Profile & Safety Status */}
          <div className="p-5 bg-slate-50/70 overflow-y-auto space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Target Discharged Patient
              </label>
              <select
                disabled={!!callSession}
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.patient_id}) - {p.preferred_language}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                    {selectedPatient.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{selectedPatient.full_name}</h4>
                    <p className="text-xs text-slate-500">
                      {selectedPatient.age} yrs, {selectedPatient.gender} • {selectedPatient.village_or_city}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Diagnosis:</span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[150px]" title={selectedPatient.admission_diagnosis}>
                      {selectedPatient.admission_diagnosis}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Native Lang:</span>
                    <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                      {selectedPatient.preferred_language === 'hi-IN' ? 'Hindi (हिंदी)' :
                       selectedPatient.preferred_language === 'mr-IN' ? 'Marathi (मराठी)' :
                       selectedPatient.preferred_language === 'pa-IN' ? 'Punjabi (ਪੰਜਾਬੀ)' : 'Indian English'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono text-slate-700 font-medium">{selectedPatient.phone_number}</span>
                  </div>
                </div>

                {/* Prescribed Meds */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Discharge Prescriptions:</p>
                  <div className="space-y-1">
                    {selectedPatient.medications?.map((m, idx) => (
                      <div key={idx} className="text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-800">{m.name}</span>
                        <span className="text-slate-500 text-[11px] block">{m.timing_instructions}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Non-Diagnostic Clinical Safety Rule Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Strict Non-Diagnostic Guardrails</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                The agent conducts structured follow-up only. It will NEVER change doses, prescribe meds, or give diagnostic advice. Red-flag symptoms trigger immediate 108 referral.
              </p>
            </div>

            {/* Live Urgency Status */}
            {callSession && (
              <div className={`p-3 rounded-2xl border text-xs font-medium space-y-1 ${
                urgencyBadge === "High" ? "bg-rose-50 border-rose-200 text-rose-800" :
                urgencyBadge === "Medium" ? "bg-amber-50 border-amber-200 text-amber-800" :
                "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <div className="flex items-center justify-between">
                  <span>Safety Triage Status:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    urgencyBadge === "High" ? "bg-rose-600 text-white animate-pulse" :
                    urgencyBadge === "Medium" ? "bg-amber-500 text-white" :
                    "bg-emerald-600 text-white"
                  }`}>
                    {urgencyBadge} Urgency
                  </span>
                </div>
                {safetyAlert && (
                  <p className="text-[11px] font-semibold mt-1">
                    Protocol: {safetyAlert.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column (2 cols): Interactive Audio Conversation Stream */}
          <div className="md:col-span-2 flex flex-col justify-between h-[520px] bg-white">
            
            {/* Call Status Bar */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${callSession ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}></span>
                <span className="text-xs font-bold text-slate-700">
                  {callSession ? `Call Active • Turn ${transcripts.length}` : 'Outbound Call Standby'}
                </span>
                {isPlayingAudio && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    <span>Sarvam Voice Speaking...</span>
                  </span>
                )}
              </div>

              {callSession ? (
                <div className="flex items-center gap-2">
                  {!callSummary && (
                    <button
                      onClick={handleSimulateUnanswered}
                      disabled={isLoading}
                      title="Simulate patient not answering the call"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition"
                    >
                      <PhoneOff className="w-3.5 h-3.5 text-amber-600" />
                      <span>Simulate No Answer</span>
                    </button>
                  )}
                  <button
                    onClick={handleEndCall}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>Hang Up</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartCall}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition active:scale-95 disabled:opacity-50"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Dial Patient Now</span>
                </button>
              )}
            </div>

            {/* Conversation Messages Container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {!callSession && transcripts.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                    <Phone className="w-8 h-8 opacity-80" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm">Ready to Place Follow-Up Call</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Click <strong>"Dial Patient Now"</strong>. The AI voice agent will greet the patient in their native language and conduct the non-diagnostic follow-up protocol.
                  </p>
                </div>
              )}

              {transcripts.map((t, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col ${t.speaker === 'AI' ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-600">
                      {t.speaker === 'AI' ? 'Sarvam Care Assistant' : selectedPatient?.full_name || 'Patient'}
                    </span>
                    <span>• {t.timestamp}</span>
                  </div>

                  <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${
                    t.speaker === 'AI' 
                      ? 'bg-slate-100/90 text-slate-800 rounded-tl-sm border border-slate-200/60' 
                      : 'bg-brand-600 text-white rounded-tr-sm'
                  }`}>
                    {/* Primary Vernacular Text */}
                    <p className="text-sm font-medium leading-relaxed">
                      {t.nativeText}
                    </p>

                    {/* Subtitle Translation */}
                    {t.englishText && t.nativeText !== t.englishText && (
                      <p className={`text-[11px] mt-1.5 pt-1.5 border-t italic ${
                        t.speaker === 'AI' ? 'border-slate-200 text-slate-500' : 'border-brand-500 text-brand-100'
                      }`}>
                        English: "{t.englishText}"
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-brand-600 bg-brand-50 p-3 rounded-xl border border-brand-100 w-max animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Sarvam 105b is analyzing clinical response & synthesizing Bulbul audio...</span>
                </div>
              )}

              {callSummary && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1.5 mt-3">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Call Completed • Structured Clinical Summary</span>
                  </div>
                  <p className="text-emerald-800 font-medium">{callSummary}</p>
                </div>
              )}

              {unansweredData && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-950 space-y-2.5 mt-3 shadow-sm animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      WhatsApp / SMS Fallback Auto-Dispatched
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      Sent to {unansweredData.recipient_phone}
                    </span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-slate-800 space-y-1.5">
                    <p className="font-bold text-[11px] text-emerald-800 uppercase tracking-wider">
                      District Civil Hospital • Patient Outreach Reminder
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      "{unansweredData.fallback_message}"
                    </p>
                  </div>
                  {unansweredData.alert_created && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold bg-amber-100/80 p-2.5 rounded-xl border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Repeated Unanswered Call Alert logged: Coordinator dispatch required</span>
                    </div>
                  )}
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>

            {/* Bottom: Patient Input & Quick Chips */}
            {callSession && !callSummary && (
              <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
                
                {/* One-Click Quick Response Chips */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Simulate Patient Reply (Or Speak / Type):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(QUICK_CHIPS[callStage] || QUICK_CHIPS[1]).map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendReply(chip.text)}
                        disabled={isLoading}
                        className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-all text-left ${
                          chip.tag === 'URGENT RED FLAG' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-bold'
                            : chip.tag === 'Missed Dose'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Free Text / Mic Input */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startListening}
                    disabled={isLoading}
                    title="Speak using microphone in patient's native language"
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse border-rose-600 shadow-md shadow-rose-500/30'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={patientInput}
                    onChange={(e) => setPatientInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder={isListening ? "Listening to your voice..." : "Speak into mic or type answer..."}
                    disabled={isLoading}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => handleSendReply()}
                    disabled={isLoading || !patientInput.trim()}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


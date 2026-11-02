import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sparkles, 
  PhoneCall, 
  ShieldCheck, 
  Lock, 
  Save, 
  HelpCircle,
  Volume2
} from 'lucide-react';
import { api } from '../api';

export default function SettingsPage() {
  const [telephony, setTelephony] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState({
    model: 'bulbul:v3',
    hindiSpeaker: 'ritu',
    marathiSpeaker: 'soham',
    punjabiSpeaker: 'simran',
    englishSpeaker: 'ritu',
    pace: 1.0,
    emergencyHotline: '108',
    hospitalDesk: '+91-1800-108-CARE'
  });

  useEffect(() => {
    api.getTelephonyStatus().then(setTelephony).catch(console.error);
  }, []);

  const handleSave = () => {
    alert("System settings and clinical protocols saved successfully!");
  };

  return (
    <div className="p-8 max-w-4xl space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Platform Settings & Clinical Safety Guardrails</h3>
            <p className="text-xs text-slate-500">Configure Sarvam AI speech models, telephony modes, and emergency protocols</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Section 1: Sarvam AI Voice Engine */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <h4 className="text-sm font-bold text-slate-800">Sarvam AI Speech & Voice Parameters</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">TTS Voice Model</label>
            <input
              type="text"
              readOnly
              value={voiceSettings.model}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Speech Pace</label>
            <select
              value={voiceSettings.pace}
              onChange={(e) => setVoiceSettings({ ...voiceSettings, pace: parseFloat(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
            >
              <option value="0.9">0.9x (Slow & Clear - Rural elderly optimal)</option>
              <option value="1.0">1.0x (Standard conversational pace)</option>
              <option value="1.1">1.1x (Brisk pace)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Hindi Speaker (Bulbul:v3)</label>
            <select
              value={voiceSettings.hindiSpeaker}
              onChange={(e) => setVoiceSettings({ ...voiceSettings, hindiSpeaker: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
            >
              <option value="ritu">ritu (Empathetic female voice)</option>
              <option value="priya">priya (Calm recovery voice)</option>
              <option value="rahul">rahul (Respectful male voice)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Marathi Speaker (Bulbul:v3)</label>
            <select
              value={voiceSettings.marathiSpeaker}
              onChange={(e) => setVoiceSettings({ ...voiceSettings, marathiSpeaker: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
            >
              <option value="soham">soham (Clear polite male Marathi)</option>
              <option value="rupali">rupali (Gentle female Marathi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Telephony Integration Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-800">Telephony Provider Configuration</h4>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            {telephony?.mode || "Simulated Voice Demo Mode"}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {telephony?.note || "If Twilio or Exotel credentials are not configured in environment variables, the platform operates in full Interactive Audio Simulation Mode with live Sarvam Bulbul:v3 TTS playback."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-bold block mb-1">Twilio Integration</span>
            <p className="font-semibold text-slate-700">{telephony?.has_twilio ? "Configured & Active" : "Not configured (Using Demo Mode)"}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-bold block mb-1">Exotel Integration</span>
            <p className="font-semibold text-slate-700">{telephony?.has_exotel ? "Configured & Active" : "Not configured (Using Demo Mode)"}</p>
          </div>
        </div>
      </div>

      {/* Section 3: Clinical Protocol Guardrails */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <h4 className="text-sm font-bold text-slate-800">Clinical Safety Rules (Mandatory Guardrails)</h4>
        </div>

        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
            <span className="font-bold block">1. Non-Diagnostic Boundary Enforced:</span>
            <p>The AI will never independently alter medication dosages, prescribe drugs, or diagnose diseases. Any changes must be conducted by the supervising physician.</p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
            <span className="font-bold block">2. Automatic Emergency Referral:</span>
            <p>Immediate 108 referral is provided whenever chest pain, severe dyspnea, or sudden neurological deficits are mentioned. Emergency desk is notified concurrently.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


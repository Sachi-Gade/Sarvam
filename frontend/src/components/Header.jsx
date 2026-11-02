import React from 'react';
import { PhoneCall, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';

export default function Header({ title, subtitle, onOpenNewPatient, onOpenCallStudio }) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Sarvam Engine Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-xs text-brand-700 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Sarvam Bulbul:v3 + 105b</span>
        </div>

        {/* Emergency Hotline Protocol Button */}
        <a 
          href="tel:108"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-sm"
          title="Emergency Ambulance & Critical Clinical Escalation"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Emergency 108</span>
        </a>

        {/* Action: Add Patient */}
        <button
          onClick={onOpenNewPatient}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5 text-slate-500" />
          <span>Register Patient</span>
        </button>

        {/* Action: Launch Call Studio */}
        <button
          onClick={onOpenCallStudio}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm shadow-brand-500/25 transition active:scale-95"
        >
          <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
          <span>Start AI Call</span>
        </button>
      </div>
    </header>
  );
}


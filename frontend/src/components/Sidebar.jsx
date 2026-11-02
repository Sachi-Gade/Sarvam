import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  AlertTriangle, 
  CalendarClock, 
  FileText, 
  BarChart3, 
  Settings, 
  HeartPulse,
  Headphones,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, alertCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients Directory', icon: Users },
    { id: 'simulator', label: 'Outbound Voice Studio', icon: PhoneCall, highlight: true },
    { id: 'alerts', label: 'Alerts & Escalations', icon: AlertTriangle, badge: alertCount },
    { id: 'appointments', label: 'Appointment Tracking', icon: CalendarClock },
    { id: 'calls', label: 'Call History & Audio', icon: Headphones },
    { id: 'analytics', label: 'Analytics & Adherence', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Protocols', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm z-20">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight tracking-tight">
              Aarogya<span className="text-brand-600">Vani</span>
            </h1>
            <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Powered by Sarvam AI
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-teal-100 text-teal-700">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Coordinator Profile Footer */}
      <div className="p-4 border-t border-slate-100 m-3 bg-slate-50/80 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-200">
            PS
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-800 truncate">Pooja Sharma</h4>
            <p className="text-[11px] text-slate-500 truncate">Lead Care Coordinator</p>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Desk Online
          </span>
          <span className="text-slate-400">Civil Hosp Satara</span>
        </div>
      </div>
    </aside>
  );
}


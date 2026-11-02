import React, { useEffect, useState } from 'react';
import { 
  Users, 
  PhoneCall, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  Volume2, 
  ShieldAlert, 
  Sparkles,
  Clock,
  Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatCard from '../components/StatCard';
import AlertBadge from '../components/AlertBadge';
import { api } from '../api';

export default function DashboardOverview({ onOpenCallStudio, onSelectPatient, setCurrentTab }) {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, chartsData, callsData, alertsData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getAnalyticsCharts(),
        api.getCalls({ limit: 6 }),
        api.getAlerts({ limit: 5 })
      ]);
      setStats(statsData);
      setCharts(chartsData);
      setRecentCalls(callsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const highPriorityAlert = alerts.find(a => a.priority === "High" && a.status !== "Resolved");

  return (
    <div className="p-8 space-y-6">
      
      {/* High-Priority Clinical Alert Callout Banner */}
      {highPriorityAlert && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 shadow-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-500/20">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900 uppercase tracking-wider">
                  Critical Red Flag Escalation
                </span>
                <span className="text-xs text-rose-600 font-medium">Auto-detected by AI Safety Engine</span>
              </div>
              <h4 className="font-bold text-sm text-slate-800 mt-0.5">{highPriorityAlert.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{highPriorityAlert.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('alerts')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              Review Protocol
            </button>
          </div>
        </div>
      )}

      {/* Top 6 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Patients"
          value={stats?.total_patients ?? "..."}
          subtitle="Registered post-discharge"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Completed Calls"
          value={stats?.completed_calls ?? "..."}
          subtitle="Automated vernacular"
          icon={PhoneCall}
          color="emerald"
        />
        <StatCard
          title="Adherence Rate"
          value={`${stats?.adherence_rate ?? 88.5}%`}
          subtitle="Verified medication intake"
          icon={CheckCircle}
          color="emerald"
          trend="+3.2%"
          trendType="positive"
        />
        <StatCard
          title="Missed Doses"
          value={stats?.missed_dose_alerts ?? "..."}
          subtitle="Flagged for outreach"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Active Alerts"
          value={stats?.open_alerts ?? "..."}
          subtitle={`${stats?.high_priority_alerts || 0} urgent clinical`}
          icon={Activity}
          color="rose"
        />
        <StatCard
          title="Upcoming Appts"
          value={stats?.upcoming_appointments ?? "..."}
          subtitle="Follow-up clinic visits"
          icon={Calendar}
          color="indigo"
        />
      </div>

      {/* Main Grid: Adherence Trend Chart + Alert Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): 7-Day Medication Adherence Trend & Call Volume */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">7-Day Medication Adherence & Call Volume</h3>
                <p className="text-xs text-slate-500">Tracking post-discharge compliance across rural sub-districts</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Adherence %
                </span>
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Calls Completed
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {charts?.adherence_trend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.adherence_trend}>
                    <defs>
                      <linearGradient id="colorAdh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="adherence" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdh)" name="Adherence %" />
                    <Area type="monotone" dataKey="calls" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" name="Calls Made" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading charts...</div>
              )}
            </div>
          </div>

          {/* Recent Outbound AI Calls Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recent Automated Follow-Up Calls</h3>
                <p className="text-xs text-slate-500">Multilingual interactions powered by Sarvam Voice</p>
              </div>
              <button 
                onClick={() => setCurrentTab('calls')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View Full Log <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2.5">Call ID</th>
                    <th className="pb-2.5">Language</th>
                    <th className="pb-2.5">Outcome</th>
                    <th className="pb-2.5">Adherence</th>
                    <th className="pb-2.5">Urgency</th>
                    <th className="pb-2.5 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 font-mono font-medium text-slate-700 truncate max-w-[120px]">
                        {call.call_sid}
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full text-[11px]">
                          {call.language_code === 'hi-IN' ? 'Hindi' :
                           call.language_code === 'mr-IN' ? 'Marathi' :
                           call.language_code === 'pa-IN' ? 'Punjabi' : 'English'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-700 font-medium truncate max-w-[150px]">
                        {call.conversation_outcome || 'Follow-up Complete'}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          call.adherence_status === 'Fully Adherent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          call.adherence_status === 'Missed Dose' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {call.adherence_status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3">
                        <AlertBadge priority={call.urgency_level} />
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500">
                        {call.duration_seconds}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Urgent Alert Triage & Quick Voice Launcher */}
        <div className="space-y-6">
          
          {/* Quick Voice Studio Launcher Card */}
          <div className="bg-gradient-to-br from-brand-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
              <PhoneCall className="w-36 h-36" />
            </div>

            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md uppercase">
                <Sparkles className="w-3 h-3" />
                Live Demo Calling Studio
              </span>
              <h3 className="text-lg font-bold leading-snug">
                Simulate AI Outbound Follow-Up Call
              </h3>
              <p className="text-xs text-brand-100 leading-relaxed">
                Experience the live voice conversation in Hindi, Marathi, Punjabi or English with realistic non-diagnostic triage.
              </p>
              <button
                onClick={onOpenCallStudio}
                className="w-full py-2.5 bg-white text-brand-700 font-bold rounded-xl text-xs hover:bg-brand-50 transition shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-brand-600" />
                <span>Open Voice Studio</span>
              </button>
            </div>
          </div>

          {/* Active Clinical Alert Queue */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800">Alert Triage Queue</h3>
              </div>
              <button 
                onClick={() => setCurrentTab('alerts')}
                className="text-xs text-brand-600 font-bold hover:text-brand-700"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 4).map(alert => (
                <div 
                  key={alert.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <AlertBadge priority={alert.priority} />
                    <AlertBadge status={alert.status} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{alert.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Languages Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Native Languages Supported
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-800 font-semibold flex items-center justify-between">
                <span>हिंदी (Hindi)</span>
                <span className="text-[10px] bg-orange-200/60 px-1.5 py-0.5 rounded">Ritu</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 font-semibold flex items-center justify-between">
                <span>मराठी (Marathi)</span>
                <span className="text-[10px] bg-blue-200/60 px-1.5 py-0.5 rounded">Soham</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 font-semibold flex items-center justify-between">
                <span>ਪੰਜਾਬੀ (Punjabi)</span>
                <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded">Simran</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-800 font-semibold flex items-center justify-between">
                <span>Indian English</span>
                <span className="text-[10px] bg-purple-200/60 px-1.5 py-0.5 rounded">Ritu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


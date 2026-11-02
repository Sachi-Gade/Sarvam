import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Send, 
  Filter,
  Check,
  FileText
} from 'lucide-react';
import { api } from '../api';
import AlertBadge from '../components/AlertBadge';

export default function AlertsPage({ onSelectPatient }) {
  const [alerts, setAlerts] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [resolvingAlertId, setResolvingAlertId] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, [selectedPriority, selectedStatus]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedPriority) params.priority = selectedPriority;
      if (selectedStatus) params.status = selectedStatus;

      const data = await api.getAlerts(params);
      setAlerts(data);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await api.updateAlert(alertId, {
        status: "Resolved",
        resolution_notes: resolutionNotes || "Reviewed by care coordinator and reconciled with patient."
      });
      setResolvingAlertId(null);
      setResolutionNotes('');
      fetchAlerts();
    } catch (err) {
      alert("Failed to resolve alert: " + err.message);
    }
  };

  const handleEscalate = async (alertId) => {
    const reason = prompt("Enter escalation reason for supervising physician / emergency team:", "Patient requires direct medical review.");
    if (!reason) return;

    try {
      await api.escalateAlert(alertId, reason);
      alert("Alert escalated to clinical supervisor.");
      fetchAlerts();
    } catch (err) {
      alert("Escalation failed: " + err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Clinical Alerts & Escalation Engine</h3>
            <p className="text-xs text-slate-500">Triage missed doses, worsening symptoms and red-flag emergency responses</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading clinical alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-slate-700 text-sm font-bold">No active clinical alerts.</p>
          <p className="text-xs text-slate-500 mt-1">All patient follow-up checks are currently within normal safety parameters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isHigh = alert.priority === "High";
            const isOpen = alert.status === "Open";

            return (
              <div 
                key={alert.id}
                className={`bg-white rounded-2xl p-6 border transition-all duration-200 shadow-sm ${
                  isHigh && isOpen 
                    ? 'border-rose-300 ring-2 ring-rose-500/10 bg-rose-50/20' 
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <AlertBadge priority={alert.priority} />
                      <AlertBadge status={alert.status} />
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 tracking-tight">{alert.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>

                    {/* Approved Clinical Protocol Recommendation */}
                    {alert.clinical_protocol_action && (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                        <span className="font-bold text-slate-900 block mb-0.5">Clinical Protocol Action:</span>
                        <p>{alert.clinical_protocol_action}</p>
                      </div>
                    )}

                    {/* Resolution Notes if Resolved */}
                    {alert.resolution_notes && (
                      <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800">
                        <span className="font-bold block">Resolution Notes:</span>
                        <p>{alert.resolution_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                    {alert.status !== "Resolved" && (
                      <>
                        <button
                          onClick={() => setResolvingAlertId(alert.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve Alert</span>
                        </button>

                        <button
                          onClick={() => handleEscalate(alert.id)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Escalate to Doctor</span>
                        </button>
                      </>
                    )}

                    {alert.patient_id && onSelectPatient && (
                      <button
                        onClick={() => onSelectPatient(alert.patient_id)}
                        className="px-4 py-2 text-brand-600 hover:bg-brand-50 rounded-xl text-xs font-semibold text-center transition"
                      >
                        Open Patient Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Resolve Modal Form */}
                {resolvingAlertId === alert.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 animate-fadeIn">
                    <label className="text-xs font-bold text-slate-700 block">
                      Coordinator Resolution Notes & Reconciliation:
                    </label>
                    <textarea
                      rows="2"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="e.g. Contacted patient and family. Arranged medicine refill through local primary health center (PHC)."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setResolvingAlertId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      >
                        Confirm Resolved
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


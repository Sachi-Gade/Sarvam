import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  PhoneCall, 
  Pill, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText,
  User,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { api } from '../api';
import AlertBadge from '../components/AlertBadge';

export default function PatientDetailPage({ patientId, onBack, onOpenCallStudioWithPatient }) {
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('medications');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatientDetail();
  }, [patientId]);

  const fetchPatientDetail = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPatientDetail(patientId);
      setPatient(data);
    } catch (err) {
      console.error("Error loading patient detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !patient) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading patient medical record...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      
      {/* Top Bar with Back Button & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patients Directory</span>
        </button>

        <button
          onClick={() => onOpenCallStudioWithPatient(patient.id)}
          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/20 hover:from-brand-700 hover:to-teal-700 transition"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Launch AI Call For {patient.full_name}</span>
        </button>
      </div>

      {/* Patient Profile Card Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 font-bold text-xl flex items-center justify-center">
            {patient.full_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">{patient.full_name}</h2>
              <span className="font-mono text-xs text-slate-400">({patient.patient_id})</span>
              <AlertBadge priority={patient.risk_level} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {patient.age} years old • {patient.gender} • {patient.village_or_city}, {patient.district}, {patient.state}
            </p>
          </div>
        </div>

        {/* Quick Contact & Language Pill */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
            <span className="font-mono font-semibold text-slate-800">{patient.phone_number}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Native Language</span>
            <span className="font-semibold text-brand-700">
              {patient.preferred_language === 'hi-IN' ? 'Hindi (हिंदी)' :
               patient.preferred_language === 'mr-IN' ? 'Marathi (मराठी)' :
               patient.preferred_language === 'pa-IN' ? 'Punjabi (ਪੰਜਾਬੀ)' : 'Indian English'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Discharge Date</span>
            <span className="font-semibold text-slate-800">
              {new Date(patient.discharge_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Discharge Diagnosis & Medical Instructions Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital Discharge Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-semibold block mb-1">Admission Diagnosis:</span>
            <p className="font-bold text-slate-800">{patient.admission_diagnosis}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-semibold block mb-1">Discharge Instructions:</span>
            <p className="text-slate-700 leading-relaxed">{patient.discharge_instructions || "Standard recovery protocol."}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-4">
        {[
          { id: 'medications', label: 'Prescribed Medications', icon: Pill, count: patient.medications?.length },
          { id: 'adherence', label: 'Adherence Records', icon: Activity, count: patient.adherence_records?.length },
          { id: 'appointments', label: 'Follow-Up Appointments', icon: Calendar, count: patient.appointments?.length },
          { id: 'calls', label: 'Call Records', icon: PhoneCall, count: patient.calls?.length },
          { id: 'alerts', label: 'Clinical Alerts', icon: AlertTriangle, count: patient.alerts?.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 font-semibold text-xs flex items-center gap-2 border-b-2 transition ${
                isActive 
                  ? 'border-brand-600 text-brand-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'medications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patient.medications?.map(med => (
            <div key={med.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{med.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{med.dosage} • {med.frequency}</p>
                </div>
                <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Pill className="w-4 h-4" />
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-semibold block">Instructions:</span>
                <p className="text-slate-700">{med.timing_instructions}</p>
                {med.instructions_vernacular && (
                  <p className="text-brand-600 font-medium italic mt-0.5">"{med.instructions_vernacular}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'adherence' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Medication</th>
                <th className="p-4">Dose Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patient.adherence_records?.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-700">
                    {new Date(rec.record_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    {rec.medication?.name || "Prescribed Regimen"}
                  </td>
                  <td className="p-4 text-slate-600">{rec.dose_time}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      rec.status === 'Taken' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      rec.status === 'Missed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 italic">{rec.missed_reason || rec.notes || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-3">
          {patient.appointments?.map(appt => (
            <div key={appt.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{appt.appointment_type}</h4>
                  <p className="text-xs text-slate-500">
                    {appt.doctor_name} • {appt.department} • {appt.hospital_location}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-xs text-slate-800 block">
                  {new Date(appt.scheduled_date).toLocaleDateString()} at {appt.scheduled_time}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  appt.status === 'Scheduled' ? 'bg-brand-50 text-brand-700' :
                  appt.status === 'Attended' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-rose-50 text-rose-700'
                }`}>
                  {appt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'calls' && (
        <div className="space-y-3">
          {patient.calls?.map(call => (
            <div key={call.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-700">{call.call_sid}</span>
                <div className="flex items-center gap-2">
                  <AlertBadge priority={call.urgency_level} />
                  <span className="text-xs font-semibold text-slate-500">{call.duration_seconds}s</span>
                </div>
              </div>
              <p className="text-xs text-slate-700 font-medium">{call.call_summary}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {patient.alerts?.map(alert => (
            <div key={alert.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <AlertBadge priority={alert.priority} />
                <AlertBadge status={alert.status} />
              </div>
              <h4 className="text-xs font-bold text-slate-800">{alert.title}</h4>
              <p className="text-xs text-slate-600">{alert.description}</p>
              <p className="text-[11px] text-brand-700 font-semibold bg-brand-50 p-2 rounded-lg">
                Protocol: {alert.clinical_protocol_action}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


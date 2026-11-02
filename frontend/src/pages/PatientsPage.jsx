import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  PhoneCall, 
  UserPlus, 
  FileText, 
  Pill, 
  MapPin, 
  Calendar,
  AlertCircle,
  Eye,
  ShieldOff,
  ShieldCheck
} from 'lucide-react';
import { api } from '../api';

export default function PatientsPage({ onOpenNewPatient, onOpenCallStudioWithPatient, onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, [search, selectedLanguage, selectedRisk]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedLanguage) params.language = selectedLanguage;
      if (selectedRisk) params.risk_level = selectedRisk;

      const data = await api.getPatients(params);
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOptOut = async (patientId) => {
    try {
      await api.toggleOptOut(patientId);
      fetchPatients();
    } catch (err) {
      alert("Failed to update opt-out status: " + err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Top Controls: Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, village, diagnosis..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Language filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Native Languages</option>
            <option value="hi-IN">Hindi (हिंदी)</option>
            <option value="mr-IN">Marathi (मराठी)</option>
            <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option>
            <option value="en-IN">Indian English</option>
          </select>

          {/* Risk Level filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          <button
            onClick={onOpenNewPatient}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-brand-500/20"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Cards Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading patients directory...</div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">No patients found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map((patient) => {
            const isHighRisk = patient.risk_level === "High";
            const isMediumRisk = patient.risk_level === "Medium";

            return (
              <div 
                key={patient.id} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-800">{patient.full_name}</h4>
                        <span className="font-mono text-[11px] text-slate-400">({patient.patient_id})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {patient.age} yrs • {patient.gender} • <span className="font-medium text-slate-700">{patient.village_or_city}, {patient.district}</span>
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isHighRisk ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      isMediumRisk ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {patient.risk_level} Risk
                    </span>
                  </div>

                  {/* Diagnosis */}
                  <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Discharge Diagnosis:</span>
                    <p className="font-semibold text-slate-800 line-clamp-1">{patient.admission_diagnosis}</p>
                  </div>

                  {/* Language and Phone */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full text-[11px]">
                      {patient.preferred_language === 'hi-IN' ? 'Hindi (हिंदी)' :
                       patient.preferred_language === 'mr-IN' ? 'Marathi (मराठी)' :
                       patient.preferred_language === 'pa-IN' ? 'Punjabi (ਪੰਜਾਬੀ)' : 'Indian English'}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">{patient.phone_number}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectPatient(patient.id)}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => onOpenCallStudioWithPatient(patient.id)}
                    disabled={patient.opt_out}
                    className="flex-1 py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-40"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{patient.opt_out ? 'Opted Out' : 'Start Call'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleOptOut(patient.id)}
                    title={patient.opt_out ? "Re-enable calls (Opt In)" : "Patient requests Opt-Out"}
                    className={`p-1.5 rounded-xl border transition ${
                      patient.opt_out 
                        ? 'bg-rose-50 border-rose-200 text-rose-600' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {patient.opt_out ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


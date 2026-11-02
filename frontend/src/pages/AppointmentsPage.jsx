import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CalendarClock, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  MapPin, 
  User, 
  PhoneCall, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../api';

export default function AppointmentsPage({ onSelectPatient, onOpenCallStudioWithPatient }) {
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const data = await api.getAppointments(params);
      setAppointments(data);
    } catch (err) {
      console.error("Error loading appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await api.updateAppointmentStatus(apptId, newStatus);
      fetchAppointments();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Post-Discharge Appointment Tracking</h3>
            <p className="text-xs text-slate-500">Monitor clinical follow-up compliance, attendances and missed OPD checkups</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['', 'Scheduled', 'Attended', 'Missed'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterStatus === st 
                  ? 'bg-brand-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st || 'All Appointments'}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading appointments schedule...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 text-sm font-semibold">No appointments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {appointments.map((appt) => {
            const isMissed = appt.status === "Missed";
            const isAttended = appt.status === "Attended";

            return (
              <div 
                key={appt.id}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                  isMissed ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isAttended ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isMissed ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-brand-50 text-brand-700 border border-brand-200'
                      }`}>
                        {appt.status}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 mt-1.5">{appt.appointment_type}</h4>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-xs text-slate-800 block">
                        {new Date(appt.scheduled_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{appt.scheduled_time}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                    <p className="text-slate-700">
                      <span className="text-slate-400 font-semibold">Doctor:</span> {appt.doctor_name} ({appt.department})
                    </p>
                    <p className="text-slate-700 truncate">
                      <span className="text-slate-400 font-semibold">Location:</span> {appt.hospital_location}
                    </p>
                  </div>

                  {isMissed && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold bg-rose-50 p-2 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Missed Appointment Alert Dispatched</span>
                    </div>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {appt.status === "Scheduled" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(appt.id, "Attended")}
                        className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Attended</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(appt.id, "Missed")}
                        className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Mark Missed</span>
                      </button>
                    </>
                  )}

                  {appt.status !== "Scheduled" && (
                    <button
                      onClick={() => handleUpdateStatus(appt.id, "Scheduled")}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold text-center"
                    >
                      Reset to Scheduled
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


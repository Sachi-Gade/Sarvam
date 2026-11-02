import React, { useState } from 'react';
import { UserPlus, Plus, Trash2, X, Pill, ShieldCheck } from 'lucide-react';
import { api } from '../api';

export default function PatientModal({ isOpen, onClose, onPatientCreated }) {
  const [formData, setFormData] = useState({
    patient_id: `PT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    full_name: '',
    age: '',
    gender: 'Female',
    phone_number: '+91-',
    alternate_phone: '',
    village_or_city: '',
    district: '',
    state: 'Maharashtra',
    preferred_language: 'hi-IN',
    hospital_name: 'District Civil Hospital',
    admission_diagnosis: '',
    discharge_instructions: '',
    risk_level: 'Medium',
    status: 'Active',
    consent_given: true,
    opt_out: false
  });

  const [medications, setMedications] = useState([
    { name: '', dosage: '1 tablet', frequency: 'Twice daily', timing_instructions: 'After meals' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMedication = () => {
    setMedications(prev => [
      ...prev,
      { name: '', dosage: '1 tablet', frequency: 'Once daily', timing_instructions: 'After breakfast' }
    ]);
  };

  const handleRemoveMedication = (index) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    setMedications(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone_number || !formData.admission_diagnosis) {
      alert("Please fill in the required fields: Full Name, Phone, and Diagnosis.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: Number(formData.age) || 45,
        discharge_date: new Date().toISOString(),
        medications: medications.filter(m => m.name.trim() !== '')
      };

      await api.registerPatient(payload);
      alert("Patient registered successfully!");
      if (onPatientCreated) onPatientCreated();
      onClose();
    } catch (err) {
      alert("Registration failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">Register Discharged Patient</h3>
              <p className="text-xs text-slate-500">Record verified discharge prescription and language preference</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Shakuntala Devi"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Patient ID</label>
              <input
                type="text"
                readOnly
                value={formData.patient_id}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 56"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number (Calling) *</label>
              <input
                type="text"
                required
                value={formData.phone_number}
                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Preferred Native Language</label>
              <select
                value={formData.preferred_language}
                onChange={e => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500"
              >
                <option value="hi-IN">Hindi (हिंदी)</option>
                <option value="mr-IN">Marathi (मराठी)</option>
                <option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option>
                <option value="en-IN">Indian English</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Village / Town</label>
              <input
                type="text"
                value={formData.village_or_city}
                onChange={e => setFormData({ ...formData, village_or_city: e.target.value })}
                placeholder="e.g. Shirwal Village"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Satara"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Admission Diagnosis *</label>
            <input
              type="text"
              required
              value={formData.admission_diagnosis}
              onChange={e => setFormData({ ...formData, admission_diagnosis: e.target.value })}
              placeholder="e.g. Acute Myocardial Infarction / Post-Angioplasty"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Discharge Instructions</label>
            <textarea
              rows="2"
              value={formData.discharge_instructions}
              onChange={e => setFormData({ ...formData, discharge_instructions: e.target.value })}
              placeholder="e.g. Low salt diet. Bed rest. Report dizziness immediately."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Prescribed Medications Section */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-brand-600" />
                Prescribed Discharge Medications
              </span>
              <button
                type="button"
                onClick={handleAddMedication}
                className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medication
              </button>
            </div>

            <div className="space-y-2">
              {medications.map((med, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Ecosprin 75mg)"
                    value={med.name}
                    onChange={e => handleMedChange(index, 'name', e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 1 tab)"
                    value={med.dosage}
                    onChange={e => handleMedChange(index, 'dosage', e.target.value)}
                    className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Timing (e.g. After meals)"
                    value={med.timing_instructions}
                    onChange={e => handleMedChange(index, 'timing_instructions', e.target.value)}
                    className="w-32 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs"
                  />
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent_given}
              onChange={e => setFormData({ ...formData, consent_given: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="consent" className="text-xs text-slate-600">
              Patient informed consent obtained for automated follow-up calls & language preference
            </label>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


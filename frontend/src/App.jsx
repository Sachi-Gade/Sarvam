import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CallSimulatorModal from './components/CallSimulatorModal';
import PatientModal from './components/PatientModal';

import DashboardOverview from './pages/DashboardOverview';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AlertsPage from './pages/AlertsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import CallHistoryPage from './pages/CallHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

import { api } from './api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  
  // Modals state
  const [isCallStudioOpen, setIsCallStudioOpen] = useState(false);
  const [callStudioPatientId, setCallStudioPatientId] = useState(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  // App data
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadPatients();
    loadAlerts();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts({ status: 'Open' });
      setAlerts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCallStudioWithPatient = (patientId) => {
    setCallStudioPatientId(patientId);
    setIsCallStudioOpen(true);
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setCurrentTab('patient-detail');
  };

  const handleCallCompleted = () => {
    loadPatients();
    loadAlerts();
  };

  // Titles mapping
  const titles = {
    dashboard: { title: "Healthcare Coordinator Overview", subtitle: "District Civil Hospital • Post-Discharge Monitoring Desk" },
    patients: { title: "Discharged Patients Directory", subtitle: "Track prescribed medications, languages, and recovery risks" },
    'patient-detail': { title: "Patient Clinical Follow-Up Profile", subtitle: "Medication adherence, call history, and appointment timeline" },
    simulator: { title: "AI Voice Calling Studio", subtitle: "Interactive simulated outbound follow-up calls in Indian native languages" },
    alerts: { title: "Clinical Alerts & Escalation Desk", subtitle: "Triage missed medication doses, worsening symptoms, and red flags" },
    appointments: { title: "Post-Discharge Appointments", subtitle: "Track scheduled clinical checkups, attended visits, and missed OPD slots" },
    calls: { title: "Call History & Audio Transcripts", subtitle: "Auditable conversational logs with Sarvam Bulbul synthesized voice" },
    analytics: { title: "Population Health & Adherence Analytics", subtitle: "Compliance trends and rural demographic coverage metrics" },
    settings: { title: "System Protocols & Voice Settings", subtitle: "Sarvam AI voice configurations and emergency escalation protocols" }
  };

  const currentTitle = titles[currentTab] || titles.dashboard;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          if (tab === 'simulator') {
            setIsCallStudioOpen(true);
          } else {
            setCurrentTab(tab);
            setSelectedPatientId(null);
          }
        }}
        alertCount={alerts.filter(a => a.priority === 'High').length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Header 
          title={currentTitle.title}
          subtitle={currentTitle.subtitle}
          onOpenNewPatient={() => setIsPatientModalOpen(true)}
          onOpenCallStudio={() => setIsCallStudioOpen(true)}
        />

        <main className="flex-1 pb-16">
          {currentTab === 'dashboard' && (
            <DashboardOverview 
              onOpenCallStudio={() => setIsCallStudioOpen(true)}
              onSelectPatient={handleSelectPatient}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsPage 
              onOpenNewPatient={() => setIsPatientModalOpen(true)}
              onOpenCallStudioWithPatient={handleOpenCallStudioWithPatient}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentTab === 'patient-detail' && selectedPatientId && (
            <PatientDetailPage 
              patientId={selectedPatientId}
              onBack={() => setCurrentTab('patients')}
              onOpenCallStudioWithPatient={handleOpenCallStudioWithPatient}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsPage onSelectPatient={handleSelectPatient} />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsPage 
              onSelectPatient={handleSelectPatient}
              onOpenCallStudioWithPatient={handleOpenCallStudioWithPatient}
            />
          )}

          {currentTab === 'calls' && (
            <CallHistoryPage />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>

      {/* Interactive Outbound Voice Simulator Modal */}
      <CallSimulatorModal
        isOpen={isCallStudioOpen}
        onClose={() => {
          setIsCallStudioOpen(false);
          setCallStudioPatientId(null);
        }}
        patients={patients}
        initialPatientId={callStudioPatientId}
        onCallCompleted={handleCallCompleted}
      />

      {/* Register Patient Modal */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onPatientCreated={() => {
          loadPatients();
          loadAlerts();
        }}
      />
    </div>
  );
}

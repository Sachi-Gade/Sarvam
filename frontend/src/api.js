const API_BASE = "http://localhost:8000/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Patients
  getPatients: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/patients${query ? `?${query}` : ""}`);
  },
  getPatientDetail: (id) => request(`/patients/${id}`),
  registerPatient: (data) => request("/patients", { method: "POST", body: JSON.stringify(data) }),
  updatePatient: (id, data) => request(`/patients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggleOptOut: (id) => request(`/patients/${id}/opt-out`, { method: "POST" }),

  // Calls
  getCalls: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/calls${query ? `?${query}` : ""}`);
  },
  getCallDetail: (id) => request(`/calls/${id}`),
  startCall: (patientId, callType = "Simulated Web Call") => 
    request("/calls/start", { method: "POST", body: JSON.stringify({ patient_id: patientId, call_type: callType }) }),
  simulateCallTurn: (callId, patientReply, audioBase64 = null) =>
    request("/calls/simulate-turn", { 
      method: "POST", 
      body: JSON.stringify({ call_id: callId, patient_reply: patientReply, patient_audio_base64: audioBase64 }) 
    }),
  markCallUnanswered: (callId) => request(`/calls/${callId}/unanswered`, { method: "POST" }),

  // Alerts
  getAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/alerts${query ? `?${query}` : ""}`);
  },
  updateAlert: (id, data) => request(`/alerts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  escalateAlert: (id, reason) => request(`/alerts/${id}/escalate?reason=${encodeURIComponent(reason)}`, { method: "POST" }),

  // Appointments
  getAppointments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/appointments${query ? `?${query}` : ""}`);
  },
  createAppointment: (data) => request("/appointments", { method: "POST", body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, status) => 
    request(`/appointments/${id}/status?status=${encodeURIComponent(status)}`, { method: "PUT" }),

  // Analytics
  getAnalyticsOverview: () => request("/analytics/overview"),
  getAnalyticsCharts: () => request("/analytics/charts"),

  // Telephony
  getTelephonyStatus: () => request("/telephony/status"),
};


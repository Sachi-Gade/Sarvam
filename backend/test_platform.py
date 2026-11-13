import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_full_system():
    print("\n--- Testing AarogyaVani Healthcare Platform Endpoints ---")
    
    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] /health:", res.json())

    # 2. Patients list
    res = client.get("/api/patients")
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) >= 5
    print(f"[PASS] /api/patients: Loaded {len(patients)} registered rural patients")

    # 3. Analytics Overview
    res = client.get("/api/analytics/overview")
    assert res.status_code == 200
    print("[PASS] /api/analytics/overview:", res.json())

    # 4. Analytics Charts
    res = client.get("/api/analytics/charts")
    assert res.status_code == 200
    print("[PASS] /api/analytics/charts: Loaded adherence trends & language distribution")

    # 5. Alerts list
    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    print(f"[PASS] /api/alerts: Loaded {len(alerts)} triage alerts")

    # 6. Appointments list
    res = client.get("/api/appointments")
    assert res.status_code == 200
    appts = res.json()
    print(f"[PASS] /api/appointments: Loaded {len(appts)} scheduled OPD visits")

    # 7. Start Call Simulation
    first_pt = patients[0]
    res = client.post("/api/calls/start", json={"patient_id": first_pt["id"], "call_type": "Simulated Web Call"})
    assert res.status_code == 200
    call_data = res.json()
    call_id = call_data["call_id"]
    print(f"[PASS] /api/calls/start: Initiated call {call_id} for {first_pt['full_name']} in {call_data['language_code']}")

    # 8. Simulate Turn 1: Adherent answer
    res = client.post("/api/calls/simulate-turn", json={
        "call_id": call_id,
        "patient_reply": "Yes, I took my medicines on time today"
    })
    assert res.status_code == 200
    turn1 = res.json()
    print(f"[PASS] Turn 1 Adherence response: {turn1['detected_adherence']}")

    # 9. Simulate Turn 2: Red flag emergency test
    res = client.post("/api/calls/simulate-turn", json={
        "call_id": call_id,
        "patient_reply": "I have severe chest pain and breathlessness!"
    })
    assert res.status_code == 200
    turn2 = res.json()
    assert turn2["detected_urgency"] == "High"
    assert turn2["safety_alert_triggered"] is True
    print(f"[PASS] Red-Flag Safety Triage: Urgency={turn2['detected_urgency']}, Alert={turn2['safety_message']}")

    print("\nALL SYSTEM TESTS PASSED CLEANLY! Ready for college hackathon demonstration.")

if __name__ == "__main__":
    test_full_system()


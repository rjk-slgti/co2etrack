import json
import random
from datetime import datetime, timedelta

def generate_pilot_data():
    """Generates synthetic CCUS pilot data for CO2etrack staging."""
    batches = []
    start_date = datetime.now() - timedelta(days=5)
    
    # 5 Days of Capture
    for i in range(5):
        capture_date = start_date + timedelta(days=i)
        batch = {
            "batch_id": f"BTC-CAPT-{100+i}",
            "mass_tonnes": 10.0 + random.uniform(-0.1, 0.1),
            "purity_pct": 99.92 + random.uniform(-0.02, 0.02),
            "marker_id": "MARKER-CO2-ALPHA-01",
            "marker_concentration_ppm": 5.0,
            "timestamp": capture_date.isoformat(),
            "location": "LAT 46.2044, LON 6.1432 (Geneva Emitter)",
            "status": "Captured"
        }
        batches.append(batch)
        
    # Anomaly: Missing Mass in Transport
    transport_handover = {
        "event": "Custody Transfer (Emitter -> Transporter)",
        "batch_ref": "BTC-CAPT-104",
        "measured_mass_tonnes": 8.2,  # Anomalous drop from 10.0
        "reason": "Suspected fugitive leakage at rail-link manifold",
        "timestamp": datetime.now().isoformat()
    }
    
    data = {
        "metadata": {
            "project": "C44DEV-CO2-Trace-Pilot",
            "standard": "ISO 14064-2 / Verra VCS",
            "generated_at": datetime.now().isoformat()
        },
        "capture_batches": batches,
        "anomalies": [transport_handover]
    }
    
    with open("scripts/synthetic_pilot_data.json", "w") as f:
        json.dump(data, f, indent=4)
    print("Synthetic Pilot Data Generated: scripts/synthetic_pilot_data.json")

if __name__ == "__main__":
    generate_pilot_data()

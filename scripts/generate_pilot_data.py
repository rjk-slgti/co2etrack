import json
import uuid
import random
from datetime import datetime, timedelta

def generate_pilot_json():
    org_id = str(uuid.uuid4())
    facility_id = str(uuid.uuid4())
    batch_id = str(uuid.uuid4())
    marker_id = "ALPHA-2026-CH"
    
    # 1. Organization & Facility
    org = {
        "id": org_id,
        "name": "C44DEV Geneva Emitter Cluster",
        "role": "Emitter",
        "hq_location": "Geneva, Switzerland"
    }
    
    # 2. Capture Batch (50 Tonnes)
    batch = {
        "id": batch_id,
        "organization_id": org_id,
        "mass_tonnes": 50.24,
        "purity_pct": 99.98,
        "uncertainty_pct": 0.005,
        "marker_id": marker_id,
        "marker_concentration_ppm": 5.2,
        "status": "Stored",
        "location_gps": "46.2044, 6.1432"
    }
    
    # 3. Custody Transitions (Traceability Chain)
    transitions = [
        {"type": "Truck-to-Hub", "pps": 5.2, "gps": "46.21, 6.15"},
        {"type": "Hub-to-Barge", "pps": 5.1, "gps": "51.88, 4.44"}, # Rotterdam
        {"type": "Barge-to-Well", "pps": 5.1, "gps": "60.40, 4.80"}, # Northern Lights
    ]
    
    # 4. Sensor Logs (Time-series)
    logs = []
    base_time = datetime(2026, 4, 1)
    for i in range(100):
        log_time = base_time + timedelta(hours=i)
        logs.append({
            "timestamp": log_time.isoformat() + "Z",
            "sensor_id": "SN-001-FLOW",
            "batch_id": batch_id,
            "flow_rate_m3h": 12.5 + random.uniform(-0.1, 0.1),
            "pressure_bar": 74.2 + random.uniform(-0.5, 0.5),
            "temp_c": 24.8 + random.uniform(-0.2, 0.2),
            "purity_pct": 99.98 + random.uniform(-0.01, 0.01)
        })

    pilot_package = {
        "organization": org,
        "batch": batch,
        "transitions": transitions,
        "sensor_logs": logs[:10] # Subset for demo
    }

    print(json.dumps(pilot_package, indent=2))

if __name__ == "__main__":
    generate_pilot_json()

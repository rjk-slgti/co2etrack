from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from engine import run_monte_carlo, MonteCarloRequest, MonteCarloResult

app = FastAPI(title='CO2etrack CCUS Scientific Core')

# ... (Existing models)

@app.post('/calculate/monte-carlo', response_model=MonteCarloResult)
def calculate_monte_carlo(request: MonteCarloRequest):
    """
    Performs a high-fidelity Monte Carlo simulation (N=10,000) 
    to quantify uncertainty for a specific CCUS batch.
    """
    try:
        return run_monte_carlo(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/calculate/blending')
def calculate_blending(request: BlendingRequest):
    """
    Scientific reconciliation of multiple CO2 batches.
    Calculates weighted mass, purity, and propagated uncertainty.
    """
    if not request.batches:
        raise HTTPException(status_code=400, detail="No batches provided")
    
    total_mass = sum(b.mass for b in request.batches)
    weighted_purity = sum(b.mass * b.purity for b in request.batches) / total_mass
    
    # Propagated Uncertainty (RSS of flow errors)
    total_uncertainty = np.sqrt(sum((b.mass * b.flow_meter_error)**2 for b in request.batches))
    
    return {
        "reconciled_mass": round(total_mass, 4),
        "reconciled_purity": round(weighted_purity, 4),
        "uncertainty_sigma": round(float(total_uncertainty), 6),
        "confidence_interval": "95%",
        "provenance_grade": "AAA" if weighted_purity > 99.9 else "AA"
    }

@app.post('/calculate/uncertainty')
def calculate_uncertainty(batch: Batch):
    """Calculates uncertainty for a single batch."""
    u_mass = batch.mass * batch.flow_meter_error
    u_purity = batch.mass * 0.001 # Assume 0.1% sensor error
    
    combined = np.sqrt(u_mass**2 + u_purity**2)
    
    return {
        "batch_id": batch.batch_id,
        "absolute_uncertainty": round(combined, 4),
        "relative_uncertainty_pct": round((combined / batch.mass) * 100, 4)
    }
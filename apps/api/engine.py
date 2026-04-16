import numpy as np
from pydantic import BaseModel
from typing import List, Dict

class SensorProfile(BaseModel):
    name: str
    distribution: str = "gaussian" # gaussian, rectangular, triangular
    mean: float
    std_dev: float = 0.0
    half_width: float = 0.0

class MonteCarloRequest(BaseModel):
    iterations: int = 10000
    mass_mean: float
    mass_error_pct: float = 0.005 # ±0.5%
    purity_mean: float
    purity_error_abs: float = 0.001 # ±0.1%
    leak_rate_expected: float = 0.0001 # 0.01%
    leak_uncertainty_pct: float = 0.20 # ±20%

class MonteCarloResult(BaseModel):
    mean_removal: float
    std_dev: float
    p95_lower: float
    p95_upper: float
    uncertainty_absolute: float
    uncertainty_pct: float

def run_monte_carlo(req: MonteCarloRequest) -> MonteCarloResult:
    # 1. Generate Mass Distribution (Gaussian)
    mass_samples = np.random.normal(req.mass_mean, req.mass_mean * req.mass_error_pct / 2, req.iterations)
    
    # 2. Generate Purity Distribution (Rectangular/Uniform - common for digital sensors)
    purity_samples = np.random.uniform(req.purity_mean - req.purity_error_abs, req.purity_mean + req.purity_error_abs, req.iterations)
    
    # 3. Generate Leakage Distribution (Lognormal - errors in leak estimates tend to be skewed)
    # Using normal approximation for simplicity in this version
    leak_samples = np.random.normal(req.leak_rate_expected, req.leak_rate_expected * req.leak_uncertainty_pct, req.iterations)
    
    # 4. Calculate Net Removal for each sample
    # Formula: Net = (Mass * Purity) - (Mass * Leakage)
    net_samples = (mass_samples * purity_samples) - (mass_samples * leak_samples)
    
    # 5. Extract Statistics
    mean_val = float(np.mean(net_samples))
    std_val = float(np.std(net_samples))
    p95_lower = float(np.percentile(net_samples, 2.5))
    p95_upper = float(np.percentile(net_samples, 97.5))
    
    abs_uncertainty = (p95_upper - p95_lower) / 2
    
    return MonteCarloResult(
        mean_removal=round(mean_val, 4),
        std_dev=round(std_val, 6),
        p95_lower=round(p95_lower, 4),
        p95_upper=round(p95_upper, 4),
        uncertainty_absolute=round(abs_uncertainty, 4),
        uncertainty_pct=round((abs_uncertainty / mean_val) * 100, 4)
    )

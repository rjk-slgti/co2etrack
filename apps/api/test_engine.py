import unittest
from engine import run_monte_carlo, MonteCarloRequest

class TestScientificEngine(unittest.TestCase):
    def test_monte_carlo_stability(self):
        """Verify that the Monte Carlo simulation returns consistent P95 bounds."""
        req = MonteCarloRequest(
            iterations=5000,
            mass_mean=100.0,
            mass_error_pct=0.01,
            purity_mean=0.99,
            purity_error_abs=0.001
        )
        
        # Run multiple times to check for variance drift
        result1 = run_monte_carlo(req)
        result2 = run_monte_carlo(req)
        
        # Mean removal should be around 99.0 tonnes
        self.assertAlmostEqual(result1.mean_removal, 99.0, delta=0.5)
        
        # P95 Lower bound should be stable
        self.assertAlmostEqual(result1.p95_lower, result2.p95_lower, delta=0.2)
        
        print(f"Verified P95: {result1.p95_lower} to {result1.p95_upper}")

if __name__ == "__main__":
    unittest.main()

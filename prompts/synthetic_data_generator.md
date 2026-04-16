# System Prompt: Synthetic CCUS Pilot Data Generator

**Objective**: Create a realistic, engineering-grade dataset for a 50-tonne CCUS pilot project to test the CO2etrack staging and validation engine.

**Data Requirements**:
1. **Emitter Phase**: 50 tonnes captured over 5 days (10 tonnes/day). Multi-marker injection (Marker_A, Marker_B).
2. **Transport Phase**: 2 trucks (20 tonnes each) and 1 rail car (10 tonnes). Include handover GPS timestamps and purity re-checks.
3. **Storage Phase**: Injection into a saline aquifer. Include pressure and temperature sensors every 15 minutes.
4. **Variations**:
    - Inject one "Anomaly Case" (e.g., 2 tonnes missing during rail transport).
    - Inject one "Purity Drift" (e.g., purity drops from 99.9% to 94% due to compressor failure).

**Output**:
- SQL Insert statements for PostgreSQL.
- CSV template for bulk ingestion.
- JSON stream for IoT dashboard simulation.

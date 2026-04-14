

# Carbon Accounting Platform — Full Build Plan

## Overview
A globally compliant, audit-ready carbon accounting platform aligned with GHG Protocol and ISO 14064, built with React + Supabase.

---

## Phase 1: Database Schema & Backend Foundation

### Supabase Tables
- **emission_factor_headers** — Category, activity type, region, source, version, validity dates, methodology notes
- **emission_factor_values** — Factor values with unit mappings, GWP sets, gas breakdowns, uncertainty, data quality
- **country_overrides** — Grid factors (location-based & market-based) per country
- **unit_conversions** — Conversion library (L↔gallon, km↔mile, kWh↔MWh, etc.)
- **activity_entries** — User-entered activity data linked to factors
- **audit_logs** — Every calculation logged with factor_id, source, version, GWP set, user, timestamp, overrides
- **organizations** — Multi-org support for multinational reporting
- **reporting_periods** — Annual/monthly period definitions

### Auth & Security
- User authentication with role-based access (Admin, Auditor, Data Entry)
- RLS policies: admins manage factors, users enter activity data, auditors read-only
- Factor locking: only admins can edit emission factors

### Seed Data
- Pre-loaded DEFRA 2024 emission factors (fuels, electricity, transport, waste, refrigerants)
- IPCC AR6 default factors
- Sri Lanka-specific grid factors and available local factors
- Sample country overrides for key regions

---

## Phase 2: Calculation Engine

### Factor Selection Hierarchy
- Automatic deterministic selection: Country-specific → Regional → DEFRA/NGER → IPCC default
- Visual indicator showing selected source + year
- "Assumed Factor" warning badge when fallback is used

### Unit Standardization
- All inputs converted to SI base units before calculation
- Conversion library with validation — blocks ambiguous unit mappings
- Support for custom unit definitions

### Calculation Logic
- Core: `Emission (kgCO2e) = Activity Data × Emission Factor`
- Split gas method: CO2, CH4, N2O × GWP values
- Dual Scope 2: Location-based and Market-based calculations
- Results broken down by activity, scope, category, and time period

### Scope Classification
- Auto-classify into Scope 1 (stationary/mobile combustion, fugitive), Scope 2 (electricity), and all 15 Scope 3 categories
- Upstream/Downstream tagging
- Category codes in all outputs

---

## Phase 3: User Interface

### Guided Data Entry
- Step-by-step flow: Category → Activity Type → Unit → Quantity
- Auto-filled emission factor (read-only) with source metadata displayed
- Warning badges for fallback/assumed factors
- Bulk entry via CSV/Excel import with validation

### Admin Panel
- Emission factor management (CRUD with version control)
- CSV/Excel import for factor datasets
- Factor locking controls
- Active dataset selector for multi-year support

### Dashboard & Reporting
- **Scope Overview**: Scope 1, 2 (LB/MB), 3 breakdown with donut/bar charts
- **Scope 3 Detail**: All 15 categories with contribution analysis
- **Trends**: Monthly/annual emission trends over time
- **Top Drivers**: Ranked emission sources
- **Intensity KPIs**: Emissions per revenue, per employee, per unit output
- **Country View**: Emissions by region for multinational reporting

### Exports
- ISO 14064-aligned inventory report (PDF)
- GHG Protocol disclosure tables (Excel)
- Audit trail export with full calculation methodology
- Activity data export (CSV/Excel)

---

## Phase 4: Audit & Governance

### Audit Trail
- Every calculation logged: factor used, source, version, GWP set, user, timestamp
- Override tracking with justification notes
- Reproducible calculation records

### Data Quality Controls
- Required data quality flag per entry (Measured/Estimated, High/Medium/Low)
- Range validation checks on activity data
- Unit compatibility checks
- Uncertainty propagation display

### Version Control
- Multi-year dataset storage (e.g., DEFRA 2022–2025 simultaneously)
- Backward compatibility for prior-year reports
- Dataset activation/deactivation controls

---

## Phase 5: Localization & Extensibility

### Sri Lanka + Global
- Sri Lanka factor set maintained separately
- Country switcher for multinational reporting
- Clear labeling when local factors unavailable

### Future-Ready Architecture
- Structured for API ingestion (IEA, national databases)
- Scenario analysis framework (comparing transport modes, fuel types)
- Carbon pricing module placeholder

---

## Key Pages
1. **Dashboard** — Overview of emissions by scope with charts and KPIs
2. **Data Entry** — Guided activity data input with factor auto-selection
3. **Emission Factors** — Browse/manage/import factor database (admin)
4. **Reports** — Generate and export compliance reports
5. **Audit Log** — Searchable audit trail with filters
6. **Settings** — Organization, reporting periods, country, dataset management


# CO2eTrack

CO2eTrack is a React + Supabase carbon auditing workspace for scopes 1, 2, and 3. The app now includes:

- A guided carbon audit wizard with autosave, live factor matching, anomaly hints, and evidence upload
- An audit center for validation, verification, and approval workflow actions
- A factor library with official and custom emission factors
- A report generator with printable PDF output and Excel workbook export
- Supabase schema upgrades for audit projects, checklist items, findings, custom factors, report jobs, and richer activity entry metadata

## Architecture

- `src/pages`
  Main product surfaces: dashboard, audit wizard, audit center, reports, factor library, trail, settings
- `src/hooks`
  Data access, workspace settings, Supabase fallbacks, and audit workspace composition
- `src/lib`
  Calculation engine, analytics, reporting/export helpers, demo data, and local fallback storage
- `supabase/migrations`
  Core schema, GHG factor dataset, legacy bridge, and the auditing/reporting upgrade
- `supabase/functions/sync-emission-factors`
  Edge function for syncing electricity emission factors from public open data

## Supabase rollout

Run migrations in order:

```bash
supabase db push
```

Important migrations for this upgrade:

- `20260416000001_ghg2025_schema.sql`
- `20260416000004_ghg_legacy_bridge.sql`
- `20260416000005_audit_reporting_upgrade.sql`

Optional edge function deployment:

```bash
supabase functions deploy sync-emission-factors
```

## Local development

1. Install Node.js or Bun.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to `.env`.
3. Start the app:

```bash
npm install
npm run dev
```

If Supabase credentials are unavailable, the app falls back to a demo workspace with seeded entries, factors, and audit logs so the UI remains usable.

## Testing

Run the test suite once Node.js is available:

```bash
npm test
```

## Report generation

- PDF: open the report preview and use the browser print flow
- Excel: downloads an Excel-compatible workbook containing the executive summary and detailed inventory

## Notes

- The workspace settings page stores report defaults locally for fast iteration during prototyping.
- Critical calculation, analytics, and reporting utilities are covered by Vitest tests in `src/lib/*.test.ts`.

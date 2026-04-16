#!/usr/bin/env pwsh
# =============================================================================
# CO2eTrack – Open Source GHG Data Importer
# File: scripts/import-open-data.ps1
#
# Sources:
#   1. Our World in Data (OWID) – Electricity carbon intensity per country  
#      URL: https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv
#      License: CC BY 4.0
#
#   2. DEFRA 2025 Flat File (official UK Gov)
#      URL: https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025
#      (Requires manual download due to dynamic asset URL)
#
#   3. IEA-derived electricity factors via OWID (included above)
#
# Usage:
#   ./scripts/import-open-data.ps1 -SupabaseUrl "https://xxx.supabase.co" -AnonKey "eyJ..."
#   ./scripts/import-open-data.ps1 -DryRun    # prints SQL only, no DB calls
# =============================================================================

param(
    [string]$SupabaseUrl  = $env:SUPABASE_URL,
    [string]$AnonKey      = $env:SUPABASE_ANON_KEY,
    [string]$OutputDir    = ".\data\imports",
    [switch]$DryRun,
    [int]$TargetYear      = 2023
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Colours ──────────────────────────────────────────────────────────────────
function Write-Step  { param($m) Write-Host "`n▶  $m" -ForegroundColor Cyan }
function Write-OK    { param($m) Write-Host "   ✓  $m" -ForegroundColor Green }
function Write-Warn  { param($m) Write-Host "   ⚠  $m" -ForegroundColor Yellow }
function Write-Fail  { param($m) Write-Host "   ✗  $m" -ForegroundColor Red }

# ── Setup ─────────────────────────────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# ── TARGET COUNTRIES (ISO3) ───────────────────────────────────────────────────
$targetISO3 = @(
    "GBR","USA","DEU","FRA","NLD","SWE","NOR","AUS","CHN","JPN","IND",
    "BRA","ZAF","CAN","BEL","POL","ITA","ESP","KOR","MEX","IDN","TUR",
    "SAU","ARE","SGP","MYS","THA","PHL","VNM","PAK","BGD","NGA","EGY",
    "DZA","MAR","KEN","GHA","TZA","ETH","LKA","NZL","IRL","PRT","GRC",
    "CZE","HUN","ROU","FIN","DNK","CHE","AUT","ISR","ARG","CHL","COL"
)

# ISO3 → ISO2 mapping (for dim_countries FK lookup)
$iso3toIso2 = @{
    GBR="GB"; USA="US"; DEU="DE"; FRA="FR"; NLD="NL"; SWE="SE"; NOR="NO"
    AUS="AU"; CHN="CN"; JPN="JP"; IND="IN"; BRA="BR"; ZAF="ZA"; CAN="CA"
    BEL="BE"; POL="PL"; ITA="IT"; ESP="ES"; KOR="KR"; MEX="MX"; IDN="ID"
    TUR="TR"; SAU="SA"; ARE="AE"; SGP="SG"; MYS="MY"; THA="TH"; PHL="PH"
    VNM="VN"; PAK="PK"; BGD="BD"; NGA="NG"; EGY="EG"; DZA="DZ"; MAR="MA"
    KEN="KE"; GHA="GH"; TZA="TZ"; ETH="ET"; LKA="LK"; NZL="NZ"; IRL="IE"
    PRT="PT"; GRC="GR"; CZE="CZ"; HUN="HU"; ROU="RO"; FIN="FI"; DNK="DK"
    CHE="CH"; AUT="AT"; ISR="IL"; ARG="AR"; CHL="CL"; COL="CO"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 – Download OWID CSV
# ─────────────────────────────────────────────────────────────────────────────
Write-Step "Downloading Our World in Data (OWID) Energy CSV..."

$owidUrl  = "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv"
$owidFile = Join-Path $OutputDir "owid-energy-data.csv"

try {
    Invoke-WebRequest -Uri $owidUrl -OutFile $owidFile -UseBasicParsing
    $sizeMB = [math]::Round((Get-Item $owidFile).Length / 1MB, 1)
    Write-OK "Downloaded $sizeMB MB → $owidFile"
} catch {
    Write-Fail "Failed to download OWID data: $_"
    exit 1
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 – Parse CSV and extract electricity carbon intensity
# ─────────────────────────────────────────────────────────────────────────────
Write-Step "Parsing CSV for electricity carbon intensity (gCO₂/kWh)..."

$rows = Import-Csv -Path $owidFile

# Header names in OWID CSV
$ciColumn = "carbon_intensity_elec"

$extracted = $rows | Where-Object {
    $_.year -eq $TargetYear -and
    $_.iso_code -in $targetISO3 -and
    $_.$ciColumn -ne "" -and
    [double]$_.$ciColumn -gt 0
} | ForEach-Object {
    $gco2 = [double]$_.$ciColumn
    $kgCO2e = [math]::Round($gco2 / 1000, 8)
    [PSCustomObject]@{
        Country          = $_.country
        ISO3             = $_.iso_code
        ISO2             = $iso3toIso2[$_.iso_code]
        Year             = [int]$_.year
        CI_gCO2_per_kWh  = $gco2
        kg_co2e_per_kWh  = $kgCO2e
    }
}

Write-OK "Extracted $($extracted.Count) country-year records for $TargetYear"

# Export parsed results to CSV for audit trail
$parsedFile = Join-Path $OutputDir "owid-electricity-factors-${TargetYear}.csv"
$extracted | Export-Csv -Path $parsedFile -NoTypeInformation
Write-OK "Audit CSV saved → $parsedFile"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 – Generate SQL INSERT statements
# ─────────────────────────────────────────────────────────────────────────────
Write-Step "Generating SQL INSERT statements..."

$sqlLines = @()
$sqlLines += "-- ============================================================="
$sqlLines += "-- Electricity Carbon Intensity – OWID Energy Data ($TargetYear)"
$sqlLines += "-- Source: Our World in Data | License: CC BY 4.0"
$sqlLines += "-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') UTC"
$sqlLines += "-- ============================================================="
$sqlLines += ""

foreach ($row in $extracted) {
    $label   = "Electricity – Grid – Location-Based ($($row.Country), $($row.Year))"
    $label   = $label.Replace("'", "''")   # escape SQL quotes
    $notes   = "OWID source. Original: $($row.CI_gCO2_per_kWh) gCO2/kWh. CC BY 4.0."
    $notes   = $notes.Replace("'", "''")

    $sqlLines += @"
INSERT INTO public.emission_factors
  (scope_id, category_id, activity_label, country_id, market_segment_id, unit_id,
   kg_co2e, kg_co2, emission_type, gwp_standard,
   source_sheet, source_row_ref, data_quality, notes, valid_year, is_wtt_factor)
SELECT
  (SELECT id FROM public.dim_scopes WHERE code='scope2_lb'),
  (SELECT id FROM public.dim_ghg_categories WHERE code='purchased_electricity'),
  '$label',
  (SELECT id FROM public.dim_countries WHERE iso2='$($row.ISO2)'),
  (SELECT id FROM public.dim_market_segments WHERE code='location_based'),
  (SELECT id FROM public.dim_units WHERE code='kWh'),
  $($row.kg_co2e_per_kWh), $($row.kg_co2e_per_kWh),
  'electricity', 'AR5',
  'OWID Energy Data', 'iso3=$($row.ISO3),year=$($row.Year)',
  'Medium', '$notes', $($row.Year), false
ON CONFLICT (activity_label) DO UPDATE SET
  kg_co2e           = EXCLUDED.kg_co2e,
  kg_co2            = EXCLUDED.kg_co2,
  notes             = EXCLUDED.notes,
  updated_at        = now();
"@
}

$sqlFile = Join-Path $OutputDir "owid-electricity-factors-${TargetYear}.sql"
$sqlLines | Set-Content -Path $sqlFile -Encoding UTF8
Write-OK "$($extracted.Count) INSERT statements written → $sqlFile"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 – Optionally push to Supabase REST API
# ─────────────────────────────────────────────────────────────────────────────
if ($DryRun) {
    Write-Warn "DryRun mode: SQL generated but NOT sent to Supabase."
    Write-Warn "Apply manually:  psql -f `"$sqlFile`""
} else {
    if (-not $SupabaseUrl -or -not $AnonKey) {
        Write-Warn "No SUPABASE_URL or SUPABASE_ANON_KEY set. Use -DryRun or set env vars."
        Write-Warn "Apply manually with: psql -f `"$sqlFile`""
    } else {
        Write-Step "Pushing to Supabase via Edge Function..."

        $invokeUrl = "$SupabaseUrl/functions/v1/sync-emission-factors"
        $headers = @{
            "Authorization" = "Bearer $AnonKey"
            "Content-Type"  = "application/json"
        }

        try {
            $response = Invoke-RestMethod -Method POST -Uri $invokeUrl -Headers $headers -ErrorAction Stop
            Write-OK "Edge Function response:"
            $response | ConvertTo-Json -Depth 3 | Write-Host
        } catch {
            Write-Warn "Edge Function call failed: $_"
            Write-Warn "Try applying SQL directly: psql -f `"$sqlFile`""
        }
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5 – Summary Report
# ─────────────────────────────────────────────────────────────────────────────
Write-Step "Summary"
Write-Host ""
Write-Host "  Source         : Our World in Data (OWID) Energy CSV" -ForegroundColor White
Write-Host "  License        : CC BY 4.0 (ourworldindata.org)" -ForegroundColor White
Write-Host "  Target year    : $TargetYear" -ForegroundColor White
Write-Host "  Countries      : $($extracted.Count)" -ForegroundColor White
Write-Host "  Output SQL     : $sqlFile" -ForegroundColor White
Write-Host "  Audit CSV      : $parsedFile" -ForegroundColor White
Write-Host ""
Write-Host "  Top 10 factors extracted:" -ForegroundColor Cyan
$extracted |
    Sort-Object kg_co2e_per_kWh -Descending |
    Select-Object -First 10 |
    Format-Table Country, ISO2, CI_gCO2_per_kWh, kg_co2e_per_kWh -AutoSize

Write-Host ""
Write-OK "Done. Apply with: psql -h <host> -U postgres -d postgres -f `"$sqlFile`""

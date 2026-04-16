// =============================================================================
// Supabase Edge Function: sync-emission-factors
// Fetches electricity carbon intensity per country from OWID GitHub CSV
// and upserts into emission_factors table.
// Deploy: supabase functions deploy sync-emission-factors
// Invoke: POST /functions/v1/sync-emission-factors
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OWID_CSV_URL =
  "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv";

// Country ISO2 → dim_countries id mapping (subset of countries we care about)
// Resolved at runtime via DB lookup
const TARGET_ISO3_CODES = new Set([
  "GBR","USA","DEU","FRA","NLD","SWE","NOR","AUS","CHN","JPN","IND",
  "BRA","ZAF","CAN","BEL","POL","ITA","ESP","KOR","MEX","IDN","TUR",
  "SAU","ARE","SGP","MYS","THA","PHL","VNM","PAK","BGD","NGA","EGY",
  "DZA","MAR","KEN","GHA","TZA","ETH","LKA","NZL","IRL","PRT","GRC",
  "CZE","HUN","ROU","FIN","DNK","CHE","AUT","ISR","ARG","CHL","COL",
  "PER","VEN","UKR","KAZ","IRN","IRQ","QAT","KWT","OMN","BHR",
]);

const TARGET_YEAR = 2023; // Most recent reliable year in OWID dataset

interface OwidRow {
  country: string;
  year: number;
  iso_code: string;
  carbon_intensity_elec?: number; // gCO2/kWh
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  let syncRunId: string | null = null;

  try {
    const { data: syncRun } = await supabase
      .from("factor_sync_runs")
      .insert({
        source: "Our World in Data",
        source_url: OWID_CSV_URL,
        status: "running",
      })
      .select("id")
      .single();

    syncRunId = syncRun?.id ?? null;

    console.log(`[sync-ef] Fetching OWID energy CSV from GitHub...`);
    const csvResponse = await fetch(OWID_CSV_URL);
    if (!csvResponse.ok) {
      throw new Error(`OWID fetch failed: ${csvResponse.status}`);
    }

    const csvText = await csvResponse.text();
    const rows = parseOwidCsv(csvText);

    // Filter to target year + countries with carbon_intensity_elec
    const filtered = rows.filter(
      (r) =>
        r.year === TARGET_YEAR &&
        r.iso_code &&
        TARGET_ISO3_CODES.has(r.iso_code) &&
        r.carbon_intensity_elec != null &&
        r.carbon_intensity_elec > 0,
    );

    console.log(`[sync-ef] Found ${filtered.length} valid country-year rows`);

    // Load existing dim lookups
    const { data: scopes } = await supabase
      .from("dim_scopes")
      .select("id, code");
    const { data: cats } = await supabase
      .from("dim_ghg_categories")
      .select("id, code");
    const { data: units } = await supabase
      .from("dim_units")
      .select("id, code");
    const { data: countries } = await supabase
      .from("dim_countries")
      .select("id, iso3");
    const { data: segments } = await supabase
      .from("dim_market_segments")
      .select("id, code");

    const scopeId = scopes?.find((s) => s.code === "scope2_lb")?.id;
    const catId = cats?.find((c) => c.code === "purchased_electricity")?.id;
    const unitId = units?.find((u) => u.code === "kWh")?.id;
    const segmentId = segments?.find((s) => s.code === "location_based")?.id;

    if (!scopeId || !catId || !unitId || !segmentId) {
      throw new Error("Missing required dimension IDs in DB. Run schema migrations first.");
    }

    const countryByIso3 = new Map(
      (countries ?? []).map((country) => [country.iso3, country]),
    );

    let inserted = 0;
    let skipped = 0;

    for (const row of filtered) {
      const countryRecord = countryByIso3.get(row.iso_code);
      if (!countryRecord) {
        skipped++;
        continue;
      }

      // OWID stores carbon_intensity_elec in gCO2/kWh — convert to kg CO2e/kWh
      const kg_co2e = parseFloat(
        (row.carbon_intensity_elec! / 1000).toFixed(8),
      );

      const factor = {
        scope_id: scopeId,
        category_id: catId,
        activity_label: `Electricity – Grid – Location-Based (${row.country}, ${row.year})`,
        country_id: countryRecord.id,
        market_segment_id: segmentId,
        unit_id: unitId,
        kg_co2e,
        kg_co2: kg_co2e, // electricity: all CO2 (no CH4/N2O from grid average)
        kg_ch4: null,
        kg_n2o: null,
        emission_type: "electricity",
        gwp_standard: "AR5",
        source_sheet: "OWID Energy Data",
        source_row_ref: `country=${row.iso_code},year=${row.year}`,
        data_quality: "Medium",
        notes: `Source: Our World in Data energy dataset. Original value: ${row.carbon_intensity_elec} gCO2/kWh. License: CC BY 4.0.`,
        valid_year: row.year,
        is_wtt_factor: false,
      };

      const { error } = await supabase
        .from("emission_factors")
        .upsert(factor, {
          onConflict: "activity_label",
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`[sync-ef] Error upserting ${row.country}: ${error.message}`);
        skipped++;
      } else {
        inserted++;
      }
    }

    const result = {
      success: true,
      source: "Our World in Data",
      url: OWID_CSV_URL,
      target_year: TARGET_YEAR,
      rows_processed: filtered.length,
      inserted,
      skipped,
      timestamp: new Date().toISOString(),
    };

    console.log(`[sync-ef] Done:`, result);

    if (syncRunId) {
      await supabase
        .from("factor_sync_runs")
        .update({
          status: "completed",
          rows_processed: filtered.length,
          rows_inserted: inserted,
          rows_updated: 0,
          message: `Inserted or refreshed ${inserted} electricity factors.`,
          completed_at: new Date().toISOString(),
        })
        .eq("id", syncRunId);
    }

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[sync-ef] Fatal error:", err);

    if (syncRunId) {
      await supabase
        .from("factor_sync_runs")
        .update({
          status: "failed",
          message: String(err),
          completed_at: new Date().toISOString(),
        })
        .eq("id", syncRunId);
    }

    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      },
    );
  }
});

// ---------------------------------------------------------------------------
// CSV parser — handles OWID's large CSV (25k+ rows, 130+ columns)
// ---------------------------------------------------------------------------
function parseOwidCsv(csv: string): OwidRow[] {
  const lines = csv.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const idxCountry = headers.indexOf("country");
  const idxYear = headers.indexOf("year");
  const idxIso = headers.indexOf("iso_code");
  const idxCI = headers.indexOf("carbon_intensity_elec");

  const results: OwidRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const year = parseInt(cols[idxYear], 10);
    if (isNaN(year)) continue;

    const ciRaw = cols[idxCI]?.trim();
    const carbon_intensity_elec =
      ciRaw && ciRaw !== "" ? parseFloat(ciRaw) : undefined;

    results.push({
      country: cols[idxCountry]?.trim() ?? "",
      year,
      iso_code: cols[idxIso]?.trim() ?? "",
      carbon_intensity_elec,
    });
  }

  return results;
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        current += "\"";
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

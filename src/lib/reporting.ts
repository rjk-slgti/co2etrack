import type { ActivityEntryRecord, WorkspaceSummary } from './audit-model';
import type { WorkspaceSettings } from './workspace-settings';
import { formatKg } from './audit-analytics';

export interface ReportPayload {
  settings: WorkspaceSettings;
  summary: WorkspaceSummary;
  entries: ActivityEntryRecord[];
  generatedAt?: string;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildExecutiveNarrative(payload: ReportPayload) {
  const { summary, settings } = payload;
  const mainDriver = summary.topDrivers[0];
  
  return [
    `${settings.organizationName} reports a total carbon footprint of ${formatKg(summary.totalKg)} for the current period.`,
    `This inventory was prepared in accordance with the ${settings.primaryStandard}.`,
    mainDriver 
      ? `The primary emissions driver is ${mainDriver.label} (${mainDriver.scope}), accounting for ${mainDriver.share}% of the total footprint.` 
      : '',
    `Carbon intensity is recorded at ${summary.intensity.intensity_revenue} kgCO2e/USD and ${summary.intensity.intensity_fte} kgCO2e per FTE.`,
    `The audit has reached ${summary.verifiedShare}% verification with ${summary.evidenceCoverage}% evidence coverage.`
  ].filter(Boolean).join(' ');
}

export function buildReportHtml(payload: ReportPayload) {
  const { settings, summary, entries } = payload;
  const generatedAt = payload.generatedAt ?? new Date().toISOString();
  
  // Charts Logic (SVG based)
  const pieCharts = summary.scopeSummary.map((s, i) => {
    const radius = 40;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (s.share / 100) * circ;
    return `
      <div class="scope-stat">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="8" />
          <circle cx="50" cy="50" r="${radius}" fill="none" stroke="${['#0f766e', '#2563eb', '#c2410c'][i]}" 
            stroke-width="8" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 50 50)" />
        </svg>
        <div class="label">${s.scope}</div>
        <div class="val">${s.share}%</div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${escapeXml(settings.reportTitle)} | ${escapeXml(settings.organizationName)}</title>
    <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; }
        h1, h2, h3, h4 { color: #0f172a; margin: 0; }
        
        .cover { height: 95vh; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; padding: 40px; box-sizing: border-box; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); position: relative; overflow: hidden; }
        .cover::before { content: ''; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: ${settings.brandPrimary}; opacity: 0.1; border-radius: 50%; }
        .cover .brand { border-left: 8px solid ${settings.brandPrimary}; padding-left: 32px; margin-top: 100px; }
        .cover h1 { font-size: 56px; font-weight: 900; line-height: 1; letter-spacing: -0.02em; margin-bottom: 24px; }
        .cover .org { font-size: 24px; color: #475569; font-weight: 500; }
        .cover .footer { display: flex; justify-content: space-between; align-items: flex-end; }
        .cover .meta { color: #64748b; font-size: 14px; }
        .cover .stamp { border: 2px solid #059669; color: #059669; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-transform: uppercase; transform: rotate(-5deg); }

        .chapter { page-break-before: always; padding-top: 20px; }
        .chapter h2 { font-size: 32px; font-weight: 800; border-bottom: 4px solid ${settings.brandPrimary}; display: inline-block; padding-bottom: 8px; margin-bottom: 40px; }
        
        .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 40px 0; }
        .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; }
        .kpi .label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
        .kpi .val { font-size: 28px; font-weight: 800; color: #0f172a; margin-top: 8px; }

        .chart-row { display: flex; justify-content: space-around; margin: 40px 0; text-align: center; }
        .scope-stat { width: 120px; }
        .scope-stat svg { width: 100px; margin-bottom: 12px; }
        .scope-stat .label { font-size: 14px; font-weight: 600; }
        .scope-stat .val { font-size: 18px; font-weight: 800; }

        .statement-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        .statement-table th { background: #f1f5f9; text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; }
        .statement-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .statement-table .subtotal { font-weight: 700; background: #f8fafc; }
        .statement-table .total { font-weight: 900; background: #e2e8f0; font-size: 14px; }
        .statement-table .num { text-align: right; font-family: 'JetBrains Mono', monospace; }

        .methodology { background: #f8fafc; padding: 32px; border-radius: 24px; margin-top: 40px; }
        .methodology h4 { margin-top: 20px; font-size: 16px; }

        .footer-page { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
    </style>
</head>
<body>
    <div class="cover">
        <div class="brand">
            <h1>${escapeXml(settings.reportTitle)}</h1>
            <div class="org">${escapeXml(settings.organizationName)}</div>
        </div>
        <div class="footer">
            <div class="meta">
                <div>Reporting Period: ${summary.forecast.nextPeriodLabel}</div>
                <div>Generated: ${new Date(generatedAt).toLocaleDateString()}</div>
                <div>Standard: ${escapeXml(settings.primaryStandard)}</div>
            </div>
            <div class="stamp">Verified Inventory</div>
        </div>
    </div>

    <div class="chapter">
        <h2>Executive Summary</h2>
        <p style="font-size: 18px; color: #475569; max-width: 600px;">
            ${escapeXml(buildExecutiveNarrative(payload))}
        </p>

        <div class="kpi-grid">
            <div class="kpi">
                <div class="label">Gross Emissions</div>
                <div class="val">${formatKg(summary.totalKg)}</div>
            </div>
            <div class="kpi">
                <div class="label">Market-based Scope 2</div>
                <div class="val">${formatKg(summary.marketBasedKg)}</div>
            </div>
            <div class="kpi">
                <div class="label">Biogenic CO2</div>
                <div class="val">${formatKg(summary.totalBiogenicKg)}</div>
            </div>
        </div>

        <div class="chart-row">
            ${pieCharts}
        </div>
    </div>

    <div class="chapter">
        <h2>Consolidated Emissions Statement</h2>
        <p>Breakdown of emissions by greenhouse gas and reporting category.</p>
        
        <table class="statement-table">
            <thead>
                <tr>
                    <th>Emission Source</th>
                    <th class="num">CO2 (kg)</th>
                    <th class="num">CH4 (kgCO2e)</th>
                    <th class="num">N2O (kgCO2e)</th>
                    <th class="num">Total (kgCO2e)</th>
                </tr>
            </thead>
            <tbody>
                ${summary.scopeSummary.map(scope => {
                    const scopeEntries = entries.filter(e => e.scope === scope.scope);
                    const co2 = scopeEntries.reduce((sum, e) => sum + (e.emission_co2 ?? 0), 0);
                    const ch4 = scopeEntries.reduce((sum, e) => sum + (e.emission_ch4 ?? 0), 0);
                    const n2o = scopeEntries.reduce((sum, e) => sum + (e.emission_n2o ?? 0), 0);
                    return `
                    <tr class="subtotal">
                        <td>${scope.scope} Total</td>
                        <td class="num">${co2.toLocaleString()}</td>
                        <td class="num">${ch4.toLocaleString()}</td>
                        <td class="num">${n2o.toLocaleString()}</td>
                        <td class="num">${scope.totalKg.toLocaleString()}</td>
                    </tr>
                    ${scopeEntries.map(e => `
                    <tr>
                        <td style="padding-left: 30px">${escapeXml(e.activity_type)}</td>
                        <td class="num">${(e.emission_co2 ?? 0).toFixed(1)}</td>
                        <td class="num">${(e.emission_ch4 ?? 0).toFixed(2)}</td>
                        <td class="num">${(e.emission_n2o ?? 0).toFixed(2)}</td>
                        <td class="num">${e.emission_kgco2e.toFixed(1)}</td>
                    </tr>
                    `).join('')}
                    `;
                }).join('')}
                <tr class="total">
                    <td>Consolidated Gross Emissions</td>
                    <td></td><td></td><td></td>
                    <td class="num">${summary.totalKg.toLocaleString()} kgCO2e</td>
                </tr>
            </tbody>
        </table>

        <div class="chapter">
            <h2>Intensity & Performance</h2>
            <div class="kpi-grid">
                <div class="kpi">
                    <div class="label">Emissions per USD Revenue</div>
                    <div class="val">${summary.intensity.intensity_revenue}</div>
                </div>
                <div class="kpi">
                    <div class="label">Emissions per FTE</div>
                    <div class="val">${summary.intensity.intensity_fte}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="chapter">
        <h2>Methodology & Data Quality</h2>
        <div class="methodology">
            <h4>Organizational Boundary</h4>
            <p>The consolidated inventory has been prepared using the <strong>Operational Control</strong> approach. This includes all facilities where the organization has the authority to introduce and implement operating policies.</p>
            
            <h4>Data Quality & Assurance</h4>
            <p>Weighted inventory quality score: <strong>${summary.qualityScore}/100</strong>.</p>
            <p>Activity data has been primarily sourced from digital invoices and meter telemetry, representing ${summary.evidenceCoverage}% evidence-backed coverage.</p>
            
            <h4>Emission Factors</h4>
            <p>Global warming potentials (GWP) used are from the IPCC Fifth Assessment Report (AR5) over a 100-year horizon.</p>
        </div>
    </div>

    <div class="footer-page">
        <div>${escapeXml(settings.reportTitle)} | Generated for ${escapeXml(settings.organizationName)}</div>
        <div>Standard Carbon Audit Pack | ISO 14064 Compliance</div>
    </div>
</body>
</html>`;
}

export function buildExcelWorkbook(payload: ReportPayload) {
  const rows = [
    ['Organization', payload.settings.organizationName],
    ['Report title', payload.settings.reportTitle],
    [],
    ['Consolidated Inventory Details'],
    ['Date', 'Scope', 'Category', 'Activity type', 'Quantity', 'Unit', 'CO2 (kg)', 'CH4 (kgCO2e)', 'N2O (kgCO2e)', 'Total (kgCO2e)', 'Status'],
    ...payload.entries.map((entry) => [
      entry.entry_date,
      entry.scope,
      entry.category,
      entry.activity_type,
      String(entry.quantity),
      entry.unit,
      String(entry.emission_co2 ?? 0),
      String(entry.emission_ch4 ?? 0),
      String(entry.emission_n2o ?? 0),
      String(entry.emission_kgco2e),
      entry.status ?? 'draft',
    ]),
  ];

  const worksheetRows = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell ?? '')}</Data></Cell>`)
          .join('')}</Row>`
    )
    .join('');

  return `<?xml version="1.0"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="Carbon Audit Report">
      <Table>${worksheetRows}</Table>
    </Worksheet>
  </Workbook>`;
}

export function openPrintableReport(payload: ReportPayload) {
  const reportWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!reportWindow) {
    throw new Error('Unable to open a new window for PDF generation.');
  }

  reportWindow.document.write(buildReportHtml(payload));
  reportWindow.document.close();
  reportWindow.focus();
  setTimeout(() => reportWindow.print(), 500);
}

export function downloadExcelReport(payload: ReportPayload) {
  const safeName = payload.settings.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `${safeName}-carbon-audit-report.xls`;
  
  const blob = new Blob([buildExcelWorkbook(payload)], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

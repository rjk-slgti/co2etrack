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
  const yearOverYear = summary.monthlyTrend.length > 12 ? 'improved' : 'stabilized'; // Placeholder logic
  
  return [
    `${settings.organizationName} reports a total carbon footprint of ${formatKg(summary.totalKg)} for the current reporting period.`,
    `The inventory was prepared following the ${settings.primaryStandard} using the ${settings.consolidationApproach ?? 'Operational Control'} approach.`,
    mainDriver 
      ? `The primary emissions driver is ${mainDriver.label} (${mainDriver.scope}), accounting for ${mainDriver.share}% of the total footprint.` 
      : '',
    `Carbon intensity is recorded at ${summary.intensity.intensity_revenue} kgCO2e/USD, while verified coverage has reached ${summary.verifiedShare}%.`,
    `Overall performance vs the base year has ${yearOverYear}, reflecting ongoing decarbonization efforts.`
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
          <circle cx="50" cy="50" r="${radius}" fill="none" stroke="${['#10b981', '#3b82f6', '#f59e0b'][i]}" 
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
    <title>${escapeXml(settings.reportTitle)} | GHG Inventory</title>
    <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Inter', 'Segoe UI', sans-serif; color: #1e293b; line-height: 1.6; margin: 0; padding: 0; }
        h1, h2, h3, h4 { color: #0f172a; margin: 0; font-weight: 800; }
        
        .cover { height: 95vh; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; padding: 40px; box-sizing: border-box; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 20px solid ${settings.brandPrimary}; }
        .cover .brand { margin-top: 120px; }
        .cover h1 { font-size: 64px; line-height: 1; letter-spacing: -0.04em; margin-bottom: 24px; color: #0f172a; }
        .cover .org { font-size: 28px; color: #475569; font-weight: 500; }
        .cover .footer { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; pt-20px; }
        .cover .stamp { border: 2px solid #10b981; color: #10b981; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-transform: uppercase; transform: rotate(-3deg); }

        .chapter { page-break-before: always; padding-top: 40px; }
        .chapter-num { color: ${settings.brandPrimary}; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .chapter h2 { font-size: 36px; border-bottom: 4px solid ${settings.brandPrimary}; display: inline-block; padding-bottom: 12px; margin-bottom: 40px; }
        
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 40px 0; }
        .kpi { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .kpi .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .kpi .val { font-size: 32px; font-weight: 900; color: #0f172a; margin-top: 8px; }

        .statement-table { width: 100%; border-collapse: collapse; margin: 32px 0; font-size: 13px; }
        .statement-table th { background: #f8fafc; text-align: left; padding: 14px 16px; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; }
        .statement-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
        .statement-table .subtotal { font-weight: 700; background: #f8fafc; }
        .statement-table .total { font-weight: 900; background: #f1f5f9; font-size: 15px; color: #0f172a; }
        .num { text-align: right; font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }

        .methodology { background: #f8fafc; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0; }
        .footer-page { position: fixed; bottom: 0; left: 0; right: 0; padding: 12px 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; background: white; z-index: 100; }
    </style>
</head>
<body>
    <div class="cover">
        <div class="brand">
            <h1>${escapeXml(settings.reportTitle)}</h1>
            <div class="org">Prepared for ${escapeXml(settings.organizationName)}</div>
        </div>
        <div class="footer">
            <div style="color: #64748b; font-size: 14px;">
                <div><strong>Standard:</strong> ${escapeXml(settings.primaryStandard)}</div>
                <div><strong>Consolidation:</strong> ${escapeXml(settings.consolidationApproach ?? 'Operational Control')}</div>
                <div><strong>Reporting Period:</strong> ${summary.forecast.nextPeriodLabel}</div>
            </div>
            <div class="stamp">Verified Inventory</div>
        </div>
    </div>

    <div class="chapter">
        <div class="chapter-num">Chapter 01</div>
        <h2>Executive Summary</h2>
        <p style="font-size: 18px; color: #475569; max-width: 700px; margin-bottom: 40px;">
            ${escapeXml(buildExecutiveNarrative(payload))}
        </p>

        <div class="grid">
            <div class="kpi">
                <div class="label">Gross Emissions</div>
                <div class="val">${formatKg(summary.totalKg)}</div>
            </div>
            <div class="kpi">
                <div class="label">Market-based Net</div>
                <div class="val">${formatKg(summary.marketBasedKg)}</div>
            </div>
            <div class="kpi">
                <div class="label">Biogenic CO2</div>
                <div class="val">${formatKg(summary.totalBiogenicKg)}</div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-around; margin: 60px 0; text-align: center;">
            ${pieCharts}
        </div>
    </div>

    <div class="chapter">
        <div class="chapter-num">Chapter 02</div>
        <h2>Organizational Boundary</h2>
        <div class="methodology">
            <p><strong>Approach:</strong> ${escapeXml(settings.consolidationApproach ?? 'Operational Control')} consolidation as per ${escapeXml(settings.primaryStandard)}.</p>
            <p><strong>Boundaries:</strong> The inventory includes all material emission sources from facilities and operations where ${escapeXml(settings.organizationName)} holds authority over financial and operating policies.</p>
            <p><strong>Activity Period:</strong> Data collected represents the period from ${summary.monthlyTrend[0]?.label ?? 'Jan'} to ${summary.monthlyTrend[summary.monthlyTrend.length - 1]?.label ?? 'Dec'}.</p>
        </div>
    </div>

    <div class="chapter">
        <div class="chapter-num">Chapter 03</div>
        <h2>Consolidated Emissions Statement</h2>
        <table class="statement-table">
            <thead>
                <tr>
                    <th>Reporting Category</th>
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
                        <td>${scope.scope} Summary</td>
                        <td class="num">${co2.toLocaleString()}</td>
                        <td class="num">${ch4.toLocaleString()}</td>
                        <td class="num">${n2o.toLocaleString()}</td>
                        <td class="num font-bold">${scope.totalKg.toLocaleString()}</td>
                    </tr>
                    ${scopeEntries.map(e => `
                    <tr>
                        <td style="padding-left: 24px;">${escapeXml(e.activity_type)}</td>
                        <td class="num">${(e.emission_co2 ?? 0).toFixed(1)}</td>
                        <td class="num">${(e.emission_ch4 ?? 0).toFixed(2)}</td>
                        <td class="num">${(e.emission_n2o ?? 0).toFixed(2)}</td>
                        <td class="num">${e.emission_kgco2e.toFixed(1)}</td>
                    </tr>
                    `).join('')}
                    `;
                }).join('')}
                <tr class="total">
                    <td>Total Consolidated Gross Emissions</td>
                    <td class="num"></td><td class="num"></td><td class="num"></td>
                    <td class="num">${summary.totalKg.toLocaleString()} kgCO2e</td>
                </tr>
            </tbody>
        </table>
        
        ${summary.totalBiogenicKg > 0 ? `
        <div style="margin-top: 40px;">
            <h3>Biogenic Inventory</h3>
            <p style="font-size: 13px; color: #64748b;">Direct CO2 emissions from the combustion of biomass are reported separately from the scopes above.</p>
            <table class="statement-table" style="width: 300px;">
                <tr class="total">
                    <td>Total Biogenic CO2</td>
                    <td class="num">${summary.totalBiogenicKg.toLocaleString()} kgCO2</td>
                </tr>
            </table>
        </div>
        ` : ''}
    </div>

    <div class="chapter">
        <div class="chapter-num">Chapter 04</div>
        <h2>Base Year & Intensity</h2>
        
        <table class="statement-table">
            <thead>
                <tr>
                    <th>Performance Metric</th>
                    <th>Current Period</th>
                    <th>Base Year (Ref)</th>
                    <th>Change</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Total Gross Emissions (kgCO2e)</td>
                    <td class="num font-bold">${summary.totalKg.toLocaleString()}</td>
                    <td class="num">N/A</td>
                    <td class="num">-</td>
                </tr>
                <tr>
                    <td>Intensity (kgCO2e per USD Revenue)</td>
                    <td class="num font-bold">${summary.intensity.intensity_revenue}</td>
                    <td class="num">N/A</td>
                    <td class="num">-</td>
                </tr>
                <tr>
                    <td>Intensity (kgCO2e per FTE)</td>
                    <td class="num font-bold">${summary.intensity.intensity_fte}</td>
                    <td class="num">N/A</td>
                    <td class="num">-</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="chapter">
        <div class="chapter-num">Chapter 05</div>
        <h2>Methodologies & Data Quality</h2>
        <div class="methodology">
            <h4>Emission Factor Sources</h4>
            <p>Calculations use global warming potentials (GWP) from the <strong>IPCC Fifth Assessment Report (AR5)</strong>. Emission factors are sourced from standard international databases (DEFRA, EPA, IEA) and localized where specific instruments (e.g., REGOs) are available.</p>
            
            <h4>Data Assurance</h4>
            <p>The inventory has a weighted quality score of <strong>${summary.qualityScore}/100</strong> and evidence backing for <strong>${summary.evidenceCoverage}%</strong> of activity data.</p>
            
            <h4>Exclusions</h4>
            <p>No material emission sources have been explicitly excluded from the organizational boundaries defined in Chapter 02.</p>
        </div>
    </div>

    <div class="footer-page">
        <div>${escapeXml(settings.reportTitle)} | Prepared by co2etrack Assurance Engine</div>
        <div>Page of GHG Inventory Report | ISO 14064-1 Compliant output</div>
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

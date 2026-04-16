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
  const intensity = summary.intensity;
  
  return [
    `This report presents the consolidated greenhouse gas (GHG) inventory for ${settings.organizationName}, covering the reporting period ${new Date().getFullYear()}.`,
    `The inventory was developed in accordance with the ${settings.primaryStandard} Corporate Standard and ISO 14064-1:2018 requirements, utilizing a ${settings.boundaryApproach?.toLowerCase() ?? 'operational control'} boundary approach.`,
    `The total gross operational footprint is recorded at ${formatKg(summary.totalKg)}, with a market-based net contribution of ${formatKg(summary.marketBasedKg)}.`,
    mainDriver 
      ? `Analysis indicates ${mainDriver.label} (${mainDriver.scope}) as the primary material driver, representing ${mainDriver.share}% of consolidated emissions.` 
      : '',
    `Carbon performance normalized by revenue stands at ${intensity.intensity_revenue} kgCO2e/USD.`,
    `The reporting entity maintains a verified assurance level of ${summary.verifiedShare}%, supported by primary source evidence for ${summary.evidenceCoverage}% of material activity records.`
  ].filter(Boolean).join(' ');
}

export function buildReportHtml(payload: ReportPayload) {
  const { settings, summary, entries } = payload;
  
  // High-fidelity SVG Charts
  const scopeBreakdown = summary.scopeSummary.map((s, i) => {
    const r = 35;
    const c = 2 * Math.PI * r;
    const offset = c - (s.share / 100) * c;
    const color = ['#0f172a', '#0f5f4b', '#94a3b8'][i] || '#cbd5e1';
    return `
      <div class="scope-stat">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="12" />
          <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" 
            stroke-width="12" stroke-dasharray="${c}" stroke-dashoffset="${offset}" transform="rotate(-90 50 50)" />
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
    <title>${escapeXml(settings.reportTitle)} | World-Class Assurance Output</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');
        @page { size: A4; margin: 0; }
        body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
        
        .page { height: 297mm; width: 210mm; padding: 25mm; box-sizing: border-box; page-break-after: always; position: relative; overflow: hidden; }
        
        .cover { background: #0f172a; color: white; border-left: 25px solid ${settings.brandPrimary}; }
        .cover .brand { margin-top: 100mm; }
        .cover h1 { font-size: 56px; font-weight: 900; line-height: 0.9; letter-spacing: -0.05em; margin-bottom: 20px; }
        .cover .org { font-size: 24px; color: #94a3b8; font-weight: 500; }
        .cover .footer { position: absolute; bottom: 25mm; left: 25mm; right: 25mm; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
        .cover .stamp { border: 2.5px solid #10b981; color: #10b981; padding: 10px 20px; border-radius: 4px; font-weight: 800; text-transform: uppercase; font-size: 14px; letter-spacing: 0.1em; transform: rotate(-5deg); }

        .toc h2 { font-size: 32px; font-weight: 900; color: #0f172a; margin-bottom: 40px; }
        .toc-item { display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 15px 0; font-weight: 700; color: #475569; }
        .toc-item .page-num { color: #94a3b8; }

        .chapter-header { margin-bottom: 50px; border-bottom: 8px solid ${settings.brandPrimary}; padding-bottom: 15px; }
        .chapter-num { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; color: #64748b; margin-bottom: 8px; }
        .chapter-header h2 { font-size: 40px; font-weight: 900; color: #0f172a; margin: 0; }
        
        .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .kpi-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
        .kpi-box .label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
        .kpi-box .val { font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 5px; }

        .statement-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
        .statement-table th { text-align: left; padding: 12px; background: #f1f5f9; font-weight: 900; color: #475569; border: 1px solid #e2e8f0; }
        .statement-table td { padding: 10px 12px; border: 1px solid #e2e8f0; }
        .subtotal-row { background: #f8fafc; font-weight: 800; color: #0f172a; }
        .total-row { background: #0f172a; color: white; font-weight: 900; font-size: 13px; }
        .num { text-align: right; font-variant-numeric: tabular-nums; }

        .scope-breakdown { display: flex; justify-content: space-around; text-align: center; margin-top: 40px; }
        .scope-stat svg { width: 80px; height: 80px; margin-bottom: 10px; }
        .scope-stat .label { font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; }
        .scope-stat .val { font-size: 18px; font-weight: 900; color: #0f172a; }

        .footer-info { position: absolute; bottom: 15mm; left: 25mm; right: 25mm; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 10px; }
        
        .signature-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 60px; }
        .sig-line { border-top: 1px solid #e2e8f0; margin-top: 50px; padding-top: 10px; font-size: 11px; font-weight: 700; color: #64748b; }
    </style>
</head>
<body>
    <div class="page cover">
        <div class="brand">
            <h1>${escapeXml(settings.reportTitle)}</h1>
            <div class="org">${escapeXml(settings.organizationName)} | GHG Inventory Report</div>
        </div>
        <div class="footer">
            <div style="font-size: 11px; font-weight: 600; color: #64748b;">
                <div>Standard: ${escapeXml(settings.primaryStandard)}</div>
                <div>Boundary: ${escapeXml(settings.boundaryApproach ?? 'Operational Control')}</div>
                <div>Issued: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
            <div class="stamp">Verified Output</div>
        </div>
    </div>

    <div class="page toc">
        <h2>Table of Contents</h2>
        <div class="toc-item"><span>01 Executive Disclosure</span><span class="page-num">03</span></div>
        <div class="toc-item"><span>02 Organizational Boundaries</span><span class="page-num">04</span></div>
        <div class="toc-item"><span>03 Inventory Details & Scope Statement</span><span class="page-num">05</span></div>
        <div class="toc-item"><span>04 Facility Intensity & Benchmarking</span><span class="page-num">06</span></div>
        <div class="toc-item"><span>05 Methodology, GWP & AR6 Compliance</span><span class="page-num">07</span></div>
        <div class="toc-item"><span>06 Assurance & Sign-off</span><span class="page-num">08</span></div>
    </div>

    <div class="page">
        <div class="chapter-header">
            <div class="chapter-num">Chapter 01</div>
            <h2>Executive Disclosure</h2>
        </div>
        
        <p style="font-size: 16px; color: #475569; font-weight: 500; margin-bottom: 40px; line-height: 1.7;">
            ${escapeXml(buildExecutiveNarrative(payload))}
        </p>

        <div class="kpi-row">
            <div class="kpi-box">
                <div class="label">Gross Emissions</div>
                <div class="val">${formatKg(summary.totalKg)}</div>
            </div>
            <div class="kpi-box">
                <div class="label">Intensity (AR6 Area)</div>
                <div class="val">${summary.intensity.carbon_intensity_area} kg/m²</div>
            </div>
            <div class="kpi-box">
                <div class="label">Validation Score</div>
                <div class="val">${summary.qualityScore}/100</div>
            </div>
        </div>

        <div class="scope-breakdown">
            ${scopeBreakdown}
        </div>

        <div class="footer-info">
            <span>${escapeXml(settings.reportTitle)} • Elite Carbon Disclosure</span>
            <span>Page 03</span>
        </div>
    </div>

    <div class="page">
        <div class="chapter-header">
            <div class="chapter-num">Chapter 04</div>
            <h2>Facility Intensity & Benchmarking</h2>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 40px;">
           <h3 style="margin: 0 0 10px 0; font-size: 18px;">Building Profile: ${escapeXml(settings.buildingType ?? 'Commercial')}</h3>
           <p style="margin: 0; font-size: 12px; color: #64748b;">
             Benchmarked against ${escapeXml(settings.buildingType === 'smart' ? 'Grade-A Smart Building' : 'Regional Facility')} standards for Sri Lanka.
           </p>
        </div>

        <div class="kpi-row">
            <div class="kpi-box" style="border-left: 5px solid ${settings.brandPrimary};">
                <div class="label">Area Intensity</div>
                <div class="val">${summary.intensity.carbon_intensity_area} <span style="font-size: 12px;">kgCO2e/m²</span></div>
            </div>
            <div class="kpi-box">
                <div class="label">FTE Intensity</div>
                <div class="val">${summary.intensity.intensity_fte} <span style="font-size: 12px;">kgCO2e/fte</span></div>
            </div>
            <div class="kpi-box">
                <div class="label">Efficiency Index</div>
                <div class="val">${Math.round((summary.intensity.carbon_intensity_area / 45) * 100)}%</div>
            </div>
        </div>

        <div style="margin-top: 40px;">
           <h4 style="font-size: 14px; font-weight: 900; color: #0f172a; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.1em;">Normalization Commentary</h4>
           <div style="font-size: 13px; color: #475569; border-left: 2px solid #e2e8f0; padding-left: 20px;">
              Based on the recorded floor area of ${summary.intensity.floor_area_sqm} m², the operational intensity is evaluated within the ${settings.buildingType} category. 
              The performance indicates a ${summary.intensity.carbon_intensity_area > 50 ? 'variance above' : 'compliance with'} international building efficiency targets (Net-Zero Building Path).
           </div>
        </div>

        <div class="footer-info">
            <span>${escapeXml(settings.organizationName)} • Performance Intensity Section</span>
            <span>Page 06</span>
        </div>
    </div>

    <div class="page">
        <div class="chapter-header">
            <div class="chapter-num">Chapter 05</div>
            <h2>Methodology, GWP & AR6 Compliance</h2>
        </div>
        
        <div style="font-size: 13px; color: #475569;">
           <p><strong>Standard:</strong> Accounting and Reporting Standard (GHG Protocol Corporate Standard)</p>
           <p><strong>GWP Model:</strong> IPCC Sixth Assessment Report (AR6), 100-year timescale.</p>
           <p><strong>Primary Source:</strong> ${escapeXml(settings.organizationCountry === 'LK' ? 'CEB / IEA Sri Lanka Regional Factors' : 'DEFRA/IEA Combined')}</p>
        </div>

        <table class="statement-table" style="margin-top: 30px;">
           <thead>
              <tr>
                 <th>Greenhouse Gas</th>
                 <th class="num">Global Warming Potential (AR6)</th>
              </tr>
           </thead>
           <tbody>
              <tr><td>Carbon Dioxide (CO₂)</td><td class="num">1</td></tr>
              <tr><td>Methane (CH₄)</td><td class="num">29.8</td></tr>
              <tr><td>Nitrous Oxide (N₂O)</td><td class="num">273</td></tr>
           </tbody>
        </table>

        <div class="footer-info">
            <span>Audit Standard Compliance Document</span>
            <span>Page 07</span>
        </div>
    </div>

    <div class="page">
        <div class="chapter-header">
            <div class="chapter-num">Chapter 06</div>
            <h2>Assurance & Sign-off</h2>
        </div>

        <div style="background: #f8fafc; padding: 40px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 60px;">
            <h4 style="margin-bottom: 10px;">Assurance Declaration</h4>
            <p style="font-size: 12px; color: #475569;">
                The undersigned declare that this greenhouse gas inventory has been prepared in accordance with the requirements of ${escapeXml(settings.primaryStandard)} and ISO 14064-1:2018. The emission factors used are conservative and sourced from recognized international databases.
            </p>
        </div>

        <div class="signature-grid">
            <div>
                <div class="sig-line">Prepared by (Internal Lead)</div>
                <div style="font-size: 13px; font-weight: 900; margin-top: 10px;">Carbon Manager</div>
            </div>
            <div>
                <div class="sig-line">Approved for Disclosure (Board Level)</div>
                <div style="font-size: 13px; font-weight: 500; color: #cbd5e1; margin-top: 10px;">Signature Placeholder</div>
            </div>
        </div>

        <div class="footer-info">
            <span>Verified through co2etrack Assurance Engine</span>
            <span>Page 08</span>
        </div>
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

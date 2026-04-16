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

function createDownload(filename: string, mimeType: string, content: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function createReportFilename(settings: WorkspaceSettings, suffix: string) {
  const safeName = settings.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${safeName}-${suffix}`;
}

export function buildExecutiveNarrative(payload: ReportPayload) {
  const mainDriver = payload.summary.topDrivers[0];
  const forecast = payload.summary.forecast;

  return [
    `${payload.settings.organizationName} recorded ${formatKg(payload.summary.totalKg)} during the active reporting period.`,
    mainDriver
      ? `${mainDriver.label} is the largest emissions driver at ${mainDriver.share}% of the current footprint.`
      : 'No dominant emissions driver has been identified yet.',
    `Audit readiness is ${payload.summary.verifiedShare}% verified with ${payload.summary.evidenceCoverage}% evidence coverage.`,
    `The current trend projects ${formatKg(forecast.nextPeriodKg)} next month (${forecast.trendPercent}% versus the latest actual month).`,
  ].join(' ');
}

export function buildPrintableReportHtml(payload: ReportPayload) {
  const generatedAt = payload.generatedAt ?? new Date().toISOString();
  const executiveNarrative = buildExecutiveNarrative(payload);
  const entriesRows = payload.entries
    .map(
      (entry) => `
        <tr>
          <td>${escapeXml(entry.entry_date)}</td>
          <td>${escapeXml(entry.scope)}</td>
          <td>${escapeXml(entry.category)}</td>
          <td>${escapeXml(entry.activity_type)}</td>
          <td style="text-align:right">${entry.quantity.toLocaleString()}</td>
          <td>${escapeXml(entry.unit)}</td>
          <td style="text-align:right">${entry.emission_kgco2e.toFixed(2)}</td>
          <td>${escapeXml(entry.status ?? 'draft')}</td>
        </tr>`
    )
    .join('');

  const checklistRows = payload.summary.checklist
    .map(
      (item) => `
        <tr>
          <td>${escapeXml(item.standard)}</td>
          <td>${escapeXml(item.requirement)}</td>
          <td>${escapeXml(item.status)}</td>
          <td>${escapeXml(item.detail)}</td>
        </tr>`
    )
    .join('');

  const opportunities = payload.summary.reductionOpportunities
    .map(
      (opportunity) => `
        <li>
          <strong>${escapeXml(opportunity.title)}</strong><br />
          ${escapeXml(opportunity.description)} Estimated reduction: ${opportunity.estimatedReductionKg.toFixed(0)} kgCO2e.
        </li>`
    )
    .join('');

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${escapeXml(payload.settings.reportTitle)}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #1f2937; margin: 32px; }
        h1, h2, h3 { margin: 0 0 12px; }
        .hero { padding: 24px; border-radius: 18px; background: linear-gradient(135deg, ${payload.settings.brandPrimary}, ${payload.settings.brandSecondary}); color: white; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
        .metric { border: 1px solid #dbe4ea; border-radius: 14px; padding: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #e5e7eb; padding: 10px; font-size: 12px; vertical-align: top; }
        th { background: #f8fafc; text-align: left; }
        section { margin-top: 28px; }
        ul { padding-left: 20px; }
      </style>
    </head>
    <body>
      <div class="hero">
        <h1>${escapeXml(payload.settings.reportTitle)}</h1>
        <p>${escapeXml(payload.settings.organizationName)} | ${escapeXml(payload.settings.primaryStandard)} | Generated ${escapeXml(new Date(generatedAt).toLocaleString())}</p>
      </div>

      <section>
        <h2>Executive Summary</h2>
        <p>${escapeXml(executiveNarrative)}</p>
      </section>

      <div class="grid">
        <div class="metric">
          <h3>Total footprint</h3>
          <p>${formatKg(payload.summary.totalKg)}</p>
        </div>
        <div class="metric">
          <h3>Verified coverage</h3>
          <p>${payload.summary.verifiedShare}%</p>
        </div>
        <div class="metric">
          <h3>Evidence coverage</h3>
          <p>${payload.summary.evidenceCoverage}%</p>
        </div>
      </div>

      <section>
        <h2>Compliance Checklist</h2>
        <table>
          <thead>
            <tr><th>Standard</th><th>Requirement</th><th>Status</th><th>Detail</th></tr>
          </thead>
          <tbody>${checklistRows}</tbody>
        </table>
      </section>

      <section>
        <h2>Reduction Opportunities</h2>
        <ul>${opportunities}</ul>
      </section>

      <section>
        <h2>Detailed Inventory</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Scope</th>
              <th>Category</th>
              <th>Activity</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>kgCO2e</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${entriesRows}</tbody>
        </table>
      </section>
    </body>
  </html>`;
}

export function buildExcelWorkbook(payload: ReportPayload) {
  const rows = [
    ['Organization', payload.settings.organizationName],
    ['Report title', payload.settings.reportTitle],
    ['Primary standard', payload.settings.primaryStandard],
    ['Total footprint (kgCO2e)', String(payload.summary.totalKg)],
    ['Verified share (%)', String(payload.summary.verifiedShare)],
    ['Evidence coverage (%)', String(payload.summary.evidenceCoverage)],
    ['Generated at', payload.generatedAt ?? new Date().toISOString()],
    [],
    ['Date', 'Scope', 'Category', 'Activity type', 'Quantity', 'Unit', 'kgCO2e', 'Status'],
    ...payload.entries.map((entry) => [
      entry.entry_date,
      entry.scope,
      entry.category,
      entry.activity_type,
      String(entry.quantity),
      entry.unit,
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

  reportWindow.document.write(buildPrintableReportHtml(payload));
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
}

export function downloadExcelReport(payload: ReportPayload) {
  createDownload(
    createReportFilename(payload.settings, 'carbon-audit-report.xls'),
    'application/vnd.ms-excel',
    buildExcelWorkbook(payload)
  );
}

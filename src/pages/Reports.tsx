import { type ReactNode, useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Languages, Palette, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuditWorkspace } from '@/hooks/useAuditWorkspace';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import { supabase, hasSupabaseConfig } from '@/integrations/supabase/client';
import { buildExecutiveNarrative, downloadExcelReport, openPrintableReport } from '@/lib/reporting';
import { REPORT_LANGUAGES, STANDARD_OPTIONS } from '@/lib/constants';

export default function Reports() {
  const { entries, summary } = useAuditWorkspace();
  const { settings, updateSettings } = useWorkspaceSettings();
  const { toast } = useToast();
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeChecklist, setIncludeChecklist] = useState(true);
  const [customSummary, setCustomSummary] = useState('');

  const reportPayload = useMemo(
    () => ({
      settings,
      summary: {
        ...summary,
        reductionOpportunities: includeRecommendations ? summary.reductionOpportunities : [],
        checklist: includeChecklist ? summary.checklist : [],
      },
      entries,
      generatedAt: new Date().toISOString(),
    }),
    [entries, includeChecklist, includeRecommendations, settings, summary]
  );

  const executiveNarrative = customSummary.trim() || buildExecutiveNarrative(reportPayload);

  const trackReportJob = async (format: 'pdf' | 'excel') => {
    if (!hasSupabaseConfig) return;

    try {
      await supabase.from('report_jobs' as any).insert({
        organization_id: settings.selectedOrganizationId,
        format,
        template_name: settings.reportTitle,
        status: 'completed',
        report_options: {
          includeRecommendations,
          includeChecklist,
          language: settings.defaultLanguage,
        },
        completed_at: new Date().toISOString(),
      });
    } catch {
      // Report generation still succeeds even if audit job tracking is unavailable.
    }
  };

  const handlePdf = () => {
    try {
      openPrintableReport(reportPayload);
      void trackReportJob('pdf');
    } catch (error: any) {
      toast({
        title: 'Unable to open print preview',
        description: error.message ?? 'Please allow pop-ups and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExcel = () => {
    downloadExcelReport(reportPayload);
    void trackReportJob('excel');
    toast({
      title: 'Excel workbook created',
      description: 'The audit workbook download has started.',
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-none bg-primary/10 text-primary">Report generator</Badge>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground">Generate polished carbon audit reports in PDF and Excel format.</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Build a professional pack with executive summary, compliance status, detailed entries, and reduction
            recommendations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" className="rounded-full" onClick={handlePdf}>
            <Printer className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button type="button" className="rounded-full" onClick={handleExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.2fr]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Report controls</CardTitle>
            <CardDescription>Customize the branded output before generating the final pack.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="Report title">
              <Input value={settings.reportTitle} onChange={(event) => updateSettings({ reportTitle: event.target.value })} />
            </Field>
            <Field label="Primary standard">
              <Select value={settings.primaryStandard} onValueChange={(value) => updateSettings({ primaryStandard: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_OPTIONS.map((standard) => (
                    <SelectItem key={standard} value={standard}>
                      {standard}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Report language">
              <Select value={settings.defaultLanguage} onValueChange={(value) => updateSettings({ defaultLanguage: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Executive summary">
              <Textarea
                className="min-h-[180px]"
                value={customSummary}
                placeholder="Override the auto-generated executive summary if needed."
                onChange={(event) => setCustomSummary(event.target.value)}
              />
            </Field>
            <Field label="Brand primary color">
              <div className="flex gap-3">
                <Input value={settings.brandPrimary} onChange={(event) => updateSettings({ brandPrimary: event.target.value })} />
                <div className="h-10 w-10 rounded-xl border border-border" style={{ backgroundColor: settings.brandPrimary }} />
              </div>
            </Field>
            <Field label="Brand secondary color">
              <div className="flex gap-3">
                <Input value={settings.brandSecondary} onChange={(event) => updateSettings({ brandSecondary: event.target.value })} />
                <div className="h-10 w-10 rounded-xl border border-border" style={{ backgroundColor: settings.brandSecondary }} />
              </div>
            </Field>
            <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
              <ToggleRow
                label="Include reduction recommendations"
                icon={<Palette className="h-4 w-4 text-primary" />}
                checked={includeRecommendations}
                onCheckedChange={setIncludeRecommendations}
              />
              <ToggleRow
                label="Include compliance checklist"
                icon={<Languages className="h-4 w-4 text-primary" />}
                checked={includeChecklist}
                onCheckedChange={setIncludeChecklist}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <div
              className="border-b border-white/10 p-7 text-white"
              style={{
                background: `linear-gradient(135deg, ${settings.brandPrimary}, ${settings.brandSecondary})`,
              }}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-white/70">Preview</p>
              <h3 className="mt-3 text-3xl font-black tracking-tight">{settings.reportTitle}</h3>
              <p className="mt-2 max-w-2xl text-white/80">{settings.organizationName}</p>
            </div>
            <CardContent className="space-y-6 p-6">
              <section className="grid gap-4 md:grid-cols-3">
                <PreviewMetric label="Total footprint" value={`${summary.totalKg.toLocaleString()} kgCO2e`} />
                <PreviewMetric label="Verified coverage" value={`${summary.verifiedShare}%`} />
                <PreviewMetric label="Evidence coverage" value={`${summary.evidenceCoverage}%`} />
              </section>

              <section className="space-y-3">
                <h4 className="text-lg font-semibold text-foreground">Executive summary</h4>
                <p className="text-sm leading-6 text-muted-foreground">{executiveNarrative}</p>
              </section>

              {includeChecklist && (
                <section className="space-y-3">
                  <h4 className="text-lg font-semibold text-foreground">Compliance status</h4>
                  <div className="grid gap-3">
                    {reportPayload.summary.checklist.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-foreground">{item.requirement}</p>
                          <Badge variant="outline">{item.status}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {includeRecommendations && (
                <section className="space-y-3">
                  <h4 className="text-lg font-semibold text-foreground">Reduction recommendations</h4>
                  <div className="grid gap-3">
                    {reportPayload.summary.reductionOpportunities.map((opportunity) => (
                      <div key={opportunity.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <p className="font-medium text-foreground">{opportunity.title}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{opportunity.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-lg font-semibold text-foreground">Detailed inventory sample</h4>
                  <Button type="button" variant="outline" className="rounded-full" onClick={handlePdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Open print preview
                  </Button>
                </div>
                <div className="rounded-3xl border border-border/70">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Scope</th>
                        <th className="px-4 py-3">Activity</th>
                        <th className="px-4 py-3 text-right">kgCO2e</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.slice(0, 6).map((entry) => (
                        <tr key={entry.id} className="border-t border-border/70">
                          <td className="px-4 py-3">{entry.entry_date}</td>
                          <td className="px-4 py-3">{entry.scope}</td>
                          <td className="px-4 py-3">{entry.activity_type}</td>
                          <td className="px-4 py-3 text-right">{entry.emission_kgco2e.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  icon,
  checked,
  onCheckedChange,
}: {
  label: string;
  icon: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

import { type ReactNode, useMemo, useState } from 'react';
import { 
  Download, 
  FileCheck, 
  FileSpreadsheet, 
  History, 
  Languages, 
  LayoutDashboard, 
  Palette, 
  Printer,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
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
  const { entries, summary, organization, isLoading } = useAuditWorkspace();
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
          executiveNarrative,
        },
        completed_at: new Date().toISOString(),
      });
    } catch {
      // Background logging failure shouldn't block the user
    }
  };

  const handlePdf = () => {
    try {
      openPrintableReport(reportPayload);
      void trackReportJob('pdf');
      toast({
        title: 'Report generated',
        description: 'Professional audit pack has been prepared for printing.',
      });
    } catch (error: any) {
      toast({
        title: 'Unable to open print preview',
        description: 'Please allow pop-ups and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExcel = () => {
    downloadExcelReport(reportPayload);
    void trackReportJob('excel');
    toast({
      title: 'Audit workbook created',
      description: 'The Excel data dump has been downloaded.',
    });
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading report suite...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-3 py-1">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Assurance Ready
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Reporting Suite</h1>
          <p className="text-slate-500 max-w-2xl">
            Generate world-class, ISO 14064 compliant carbon audit reports. Customize narratives, branding, and disclosure levels with a single click.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200" onClick={handleExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Audit Workbook (XLS)
          </Button>
          <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200" onClick={handlePdf}>
            <Printer className="mr-2 h-4 w-4" />
            Generate PDF Report
          </Button>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[400px_1fr]">
        {/* Controls Panel */}
        <aside className="space-y-6">
          <Card className="border-slate-200/60 shadow-sm sticky top-6">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="text-lg">Report Controls</CardTitle>
              <CardDescription>Tailor the final disclosure pack.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Report Title</Label>
                <Input 
                  value={settings.reportTitle} 
                  onChange={(e) => updateSettings({ reportTitle: e.target.value })} 
                  className="rounded-lg border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Reporting Standard</Label>
                <Select value={settings.primaryStandard} onValueChange={(v) => updateSettings({ primaryStandard: v })}>
                  <SelectTrigger className="rounded-lg border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STANDARD_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Executive Narrative</Label>
                <Textarea
                  className="min-h-[140px] rounded-lg border-slate-200 text-sm leading-relaxed"
                  value={customSummary}
                  placeholder="The system generates a narrative based on drivers. Override it here if needed."
                  onChange={(e) => setCustomSummary(e.target.value)}
                />
              </div>

              <div className="pt-2 space-y-3">
                <ToggleRow label="Include Recommendations" checked={includeRecommendations} onCheckedChange={setIncludeRecommendations} />
                <ToggleRow label="Include Compliance Checklist" checked={includeChecklist} onCheckedChange={setIncludeChecklist} />
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Brand Color</div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full border border-slate-100" style={{ background: settings.brandPrimary }} />
                    <Input 
                      value={settings.brandPrimary} 
                      onChange={(e) => updateSettings({ brandPrimary: e.target.value })} 
                      className="h-8 text-xs w-24 border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secondary</div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full border border-slate-100" style={{ background: settings.brandSecondary }} />
                    <Input 
                      value={settings.brandSecondary} 
                      onChange={(e) => updateSettings({ brandSecondary: e.target.value })} 
                      className="h-8 text-xs w-24 border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-slate-400" />
                Previous Assurance Packs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/50 text-xs">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-bold">Annual Inventory 2024</div>
                    <div className="text-slate-400 mt-0.5">PDF • Jan 12, 2025</div>
                  </div>
                </div>
                <Download className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="text-[10px] text-center text-slate-400 italic">Historical data is backed up for 7 years.</p>
            </CardContent>
          </Card>
        </aside>

        {/* Live Preview */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-slate-200/60 shadow-xl bg-white min-h-[1000px]">
            {/* Professional Cover Header Mockup */}
            <div 
              className="p-12 text-white relative h-[320px] flex flex-col justify-end"
              style={{ background: `linear-gradient(135deg, ${settings.brandPrimary}, ${settings.brandSecondary})` }}
            >
              <div className="absolute top-12 left-12 h-16 w-16 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/70">Verified Emission Report</p>
                <h2 className="text-5xl font-black tracking-tight">{settings.reportTitle}</h2>
                <div className="flex items-center gap-4 text-white/80 font-medium">
                  <span>{organization?.name}</span>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>Period 2024/25</span>
                </div>
              </div>
            </div>

            <CardContent className="p-12 space-y-12">
              {/* Executive Metrics */}
              <section className="grid grid-cols-3 gap-6">
                <PreviewMetric label="Total Footprint" value={formatKg(summary.totalKg)} icon={<LayoutDashboard className="h-4 w-4 text-primary" />} />
                <PreviewMetric label="Emissions per FTE" value={`${summary.intensity.intensity_fte} kg`} icon={<TrendingUp className="h-4 w-4 text-blue-500" />} />
                <PreviewMetric label="Verification" value={`${summary.verifiedShare}%`} icon={<ShieldCheck className="h-4 w-4 text-green-500" />} />
              </section>

              {/* Narrative Section */}
              <section className="space-y-4">
                <h4 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  Executive Narrative
                </h4>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {executiveNarrative}
                </p>
              </section>

              {/* Intensity Analysis */}
              <section className="space-y-4 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-extrabold text-slate-900">Intensity Metrics</h4>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">Normalized Data</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <IntensityMetric 
                    label="Economic Intensity" 
                    value={`${summary.intensity.intensity_revenue} kgCO2e`} 
                    unit="per USD Revenue" 
                  />
                  <IntensityMetric 
                    label="Productivity Intensity" 
                    value={`${summary.intensity.intensity_fte} kgCO2e`} 
                    unit="per Team Member" 
                  />
                </div>
              </section>

              {/* Detail Table Sample */}
              <section className="space-y-4 pt-8 border-t border-slate-100">
                <h4 className="text-xl font-extrabold text-slate-900">Consolidated Emissions Sample</h4>
                <div className="rounded-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-5 py-4 text-left font-bold uppercase tracking-wider text-[10px]">Source Activity</th>
                        <th className="px-5 py-4 text-left font-bold uppercase tracking-wider text-[10px]">Scope</th>
                        <th className="px-5 py-4 text-right font-bold uppercase tracking-wider text-[10px]">kgCO2e</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {entries.slice(0, 4).map((e) => (
                        <tr key={e.id}>
                          <td className="px-5 py-4 font-medium text-slate-900">{e.activity_type}</td>
                          <td className="px-5 py-4 text-slate-500">{e.scope}</td>
                          <td className="px-5 py-4 text-right font-bold text-slate-900">{e.emission_kgco2e.toFixed(1)}</td>
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

function PreviewMetric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function IntensityMetric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
      <div className="text-sm font-bold text-slate-900">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-black text-primary">{value}</span>
        <span className="text-xs text-slate-400 font-medium">{unit}</span>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

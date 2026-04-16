import { type ReactNode, useMemo, useState } from 'react';
import { 
  ArrowLeft,
  Calendar,
  ChevronRight,
  Download, 
  FileCheck, 
  FileSpreadsheet, 
  History, 
  Layers,
  LayoutDashboard, 
  Loader2,
  PieChart,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  UploadCloud,
  Zap
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
import { useReportHistory } from '@/hooks/useReportHistory';
import { buildExecutiveNarrative, downloadExcelReport, openPrintableReport } from '@/lib/reporting';
import { STANDARD_OPTIONS } from '@/lib/constants';
import { formatKg } from '@/lib/audit-analytics';

type ReportView = 'dashboard' | 'wizard';

export default function Reports() {
  const [view, setView] = useState<ReportView>('dashboard');
  const [step, setStep] = useState(1);
  const { entries, summary, organization, isLoading: isWorkspaceLoading } = useAuditWorkspace();
  const { settings, updateSettings } = useWorkspaceSettings();
  const { jobs, isLoading: isHistoryLoading, createJob } = useReportHistory();
  const { toast } = useToast();

  const [wizardState, setWizardState] = useState({
    includeRecommendations: true,
    includeChecklist: true,
    customSummary: '',
    isGenerating: false,
  });

  const reportPayload = useMemo(
    () => ({
      settings,
      summary: {
        ...summary,
        reductionOpportunities: wizardState.includeRecommendations ? summary.reductionOpportunities : [],
        checklist: wizardState.includeChecklist ? summary.checklist : [],
      },
      entries,
      generatedAt: new Date().toISOString(),
    }),
    [entries, wizardState.includeChecklist, wizardState.includeRecommendations, settings, summary]
  );

  const executiveNarrative = wizardState.customSummary.trim() || buildExecutiveNarrative(reportPayload);

  const handleGenerate = async (format: 'pdf' | 'excel') => {
    setWizardState(prev => ({ ...prev, isGenerating: true }));
    try {
      if (format === 'pdf') {
        openPrintableReport(reportPayload);
      } else {
        downloadExcelReport(reportPayload);
      }

      await createJob.mutateAsync({
        template_name: settings.reportTitle,
        format,
        status: 'completed',
        report_options: {
          includeRecommendations: wizardState.includeRecommendations,
          language: settings.defaultLanguage,
          executiveNarrative,
        },
        completed_at: new Date().toISOString(),
      });

      toast({
        title: 'Report generated successfully',
        description: 'Your audit pack is ready and archived in history.',
      });
      
      // Auto-return to dashboard after success
      setTimeout(() => {
        setView('dashboard');
        setStep(1);
        setWizardState(prev => ({ ...prev, isGenerating: false }));
      }, 1000);

    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'There was an error saving the report to history.',
        variant: 'destructive',
      });
      setWizardState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  if (isWorkspaceLoading) return <div className="p-8 text-center text-slate-500">Initializing compliance suite...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      {view === 'dashboard' ? (
        <ReportsDashboard 
          jobs={jobs} 
          summary={summary} 
          isLoading={isHistoryLoading}
          onStartWizard={() => setView('wizard')} 
        />
      ) : (
        <div className="space-y-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-in fade-in slide-in-from-top-4">
            <div className="space-y-1">
              <Button variant="ghost" className="pl-0 -ml-2 text-slate-400 hover:text-slate-900" onClick={() => setView('dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Archives
              </Button>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Audit Pack Generator</h1>
              <p className="text-sm text-slate-500">Step {step} of 3: Configure Disclosure Modules</p>
            </div>
            
            <div className="flex gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {[1, 2, 3].map(s => (
                  <div 
                    key={s} 
                    className={`h-2 w-12 rounded-full mx-1 transition-all ${s <= step ? 'bg-primary' : 'bg-slate-200'}`} 
                  />
                ))}
              </div>
            </div>
          </header>

          <div className="grid gap-8 xl:grid-cols-[440px_1fr]">
            {/* Step Content */}
            <aside className="space-y-6">
              <Card className="border-slate-200 shadow-xl overflow-hidden ring-1 ring-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {step === 1 ? 'Report Identity' : step === 2 ? 'Disclosure Scopes' : 'Audit Narrative'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {step === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Document Title</Label>
                        <Input 
                          value={settings.reportTitle} 
                          onChange={(e) => updateSettings({ reportTitle: e.target.value })} 
                          className="rounded-xl border-slate-200 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reporting Standard</Label>
                        <Select value={settings.primaryStandard} onValueChange={(v) => updateSettings({ primaryStandard: v })}>
                          <SelectTrigger className="rounded-xl border-slate-200 h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STANDARD_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Boundary Approach</Label>
                        <Select value={settings.boundaryApproach} onValueChange={(v) => updateSettings({ boundaryApproach: v })}>
                          <SelectTrigger className="rounded-xl border-slate-200 h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Operational control">Operational control</SelectItem>
                            <SelectItem value="Financial control">Financial control</SelectItem>
                            <SelectItem value="Equity share">Equity share</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-4">
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                          <PieChart className="h-4 w-4" />
                          Coverage Check
                        </div>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Your current inventory has <strong>{summary.evidenceCoverage}% evidence coverage</strong>. 
                          We recommend including the 'Recommendations' module for areas with gaps.
                        </p>
                      </div>
                      <div className="space-y-4 pt-2">
                        <ToggleRow label="Biogenic CO2 Breakdown" checked={true} disabled />
                        <ToggleRow label="Include Reduction Roadmap" checked={wizardState.includeRecommendations} onCheckedChange={(v) => setWizardState(p => ({ ...p, includeRecommendations: v }))} />
                        <ToggleRow label="Compliance Assurance Checklist" checked={wizardState.includeChecklist} onCheckedChange={(v) => setWizardState(p => ({ ...p, includeChecklist: v }))} />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Executive Summary Override</Label>
                        <Textarea
                          className="min-h-[220px] rounded-xl border-slate-200 text-sm leading-relaxed"
                          value={wizardState.customSummary}
                          placeholder="Leave blank to use autogenerated professional narrative..."
                          onChange={(e) => setWizardState(p => ({ ...p, customSummary: e.target.value }))}
                        />
                      </div>
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 space-y-2">
                        <p className="text-xs text-emerald-800 leading-relaxed italic">
                          "Audit logic suggests focusing on ${summary.topDrivers[0]?.label ?? 'transport'} metrics this period."
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    {step > 1 && (
                      <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold" onClick={() => setStep(s => s - 1)}>
                        Previous
                      </Button>
                    )}
                    {step < 3 ? (
                      <Button className="flex-[2] rounded-xl h-11 font-bold" onClick={() => setStep(s => s + 1)}>
                        Next Step
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        disabled={wizardState.isGenerating}
                        className="flex-[2] rounded-xl h-11 font-bold bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-200" 
                        onClick={() => handleGenerate('pdf')}
                      >
                        {wizardState.isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                        Generate Audit Pack
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 bg-slate-50/50 hidden xl:block">
                <CardHeader className="pb-3 text-center">
                  <UploadCloud className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <CardTitle className="text-sm font-bold opacity-60">Evidence Vault</CardTitle>
                </CardHeader>
                <CardContent className="text-[10px] text-center text-slate-400 px-10 pb-6">
                  Drag and drop files here to automatically attach them to the 'Appendix: Evidence' section of the report.
                </CardContent>
              </Card>
            </aside>

            {/* Live Preview */}
            <div className="space-y-6">
              <Card className="overflow-hidden border-slate-200/60 shadow-2xl bg-white min-h-[900px] ring-4 ring-slate-100/50">
                <div 
                  className="p-16 text-white relative h-[380px] flex flex-col justify-end"
                  style={{ background: `linear-gradient(135deg, ${settings.brandPrimary}, ${settings.brandSecondary})` }}
                >
                  <div className="absolute top-16 left-16 h-20 w-20 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 flex items-center justify-center">
                    <ShieldCheck className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-4">
                    <Badge variant="outline" className="text-white/40 border-white/20 font-mono tracking-widest text-[10px]">VERIFIED INVENTORY</Badge>
                    <h2 className="text-6xl font-black tracking-tighter leading-none">{settings.reportTitle}</h2>
                    <div className="flex items-center gap-6 text-white/70 font-bold uppercase text-xs tracking-wider">
                      <span>{organization?.name}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                      <span>{settings.boundaryApproach}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-16 space-y-16">
                  <section className="grid grid-cols-3 gap-8">
                    <PreviewMetric label="Total Footprint" value={formatKg(summary.totalKg)} icon={<Layers className="h-4 w-4 text-primary" />} />
                    <PreviewMetric label="Unit Intensity" value={`${summary.intensity.intensity_fte} kg`} icon={<Zap className="h-4 w-4 text-blue-500" />} />
                    <PreviewMetric label="Assurance" value={`${summary.verifiedShare}%`} icon={<ShieldCheck className="h-4 w-4 text-green-500" />} />
                  </section>

                  <section className="space-y-6">
                    <h4 className="text-2xl font-black text-slate-900 border-b-4 border-slate-100 pb-3 inline-block">01. Executive Narrative</h4>
                    <p className="text-slate-600 leading-relaxed text-lg font-medium">
                      {executiveNarrative}
                    </p>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center justify-between border-b-4 border-slate-100 pb-3">
                      <h4 className="text-2xl font-black text-slate-900">02. Economic Intensity</h4>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">Normalized Data</Badge>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                       <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Revenue Intensity</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-primary">{summary.intensity.intensity_revenue}</span>
                          <span className="text-xs text-slate-400 font-bold">kgCO2e/USD</span>
                        </div>
                      </div>
                      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">FTE Intensity</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-primary">{summary.intensity.intensity_fte}</span>
                          <span className="text-xs text-slate-400 font-bold">kgCO2e/Team</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </CardContent>
              </Card>
              <div className="flex justify-center">
                <p className="text-xs text-slate-400 font-medium">Live Report Preview • ISO 14064 Compliance Framework</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsDashboard({ 
  jobs, 
  summary, 
  isLoading, 
  onStartWizard 
}: { 
  jobs: any[], 
  summary: any, 
  isLoading: boolean, 
  onStartWizard: () => void 
}) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">Assurance Archive</h1>
          <p className="text-lg text-slate-500 font-medium">Manage, track, and publish your corporate carbon disclosures.</p>
        </div>
        <Button size="lg" className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 group" onClick={onStartWizard}>
          Generate New Audit Pack
          <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </header>

      {/* Quick Stats Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        <DashboardMetric 
          label="Reporting Period Footprint" 
          value={formatKg(summary.totalKg)} 
          subValue={`${summary.verifiedShare}% verified`}
          icon={<LayoutDashboard className="h-5 w-5 text-indigo-500" />}
        />
        <DashboardMetric 
          label="YOY Intensity Variance" 
          value="-4.2%" 
          subValue="Economic normalization"
          trend="down"
          icon={<TrendingDown className="h-5 w-5 text-emerald-500" />}
        />
        <DashboardMetric 
          label="Active Audit Controls" 
          value="ISO 14064-1" 
          subValue="Framework compliance"
          icon={<ShieldCheck className="h-5 w-5 text-amber-500" />}
        />
      </section>

      {/* Jobs List */}
      <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black">Generated Assurance Packs</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Historical audit workbooks and board-ready reports.</CardDescription>
          </div>
          <Button variant="outline" className="rounded-xl font-bold bg-white">
            <Calendar className="mr-2 h-4 w-4" />
            Filter Period
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-200" /></div>
          ) : jobs.length === 0 ? (
            <div className="p-24 text-center space-y-4">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <History className="h-8 w-8" />
              </div>
              <p className="text-slate-500 font-bold italic">No reports generated yet for this organization.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_120px] p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <div>Document Name</div>
                <div>Status</div>
                <div>Format</div>
                <div className="text-right">Action</div>
              </div>
              {jobs.map((job) => (
                <div key={job.id} className="grid grid-cols-[1.5fr_1fr_1fr_120px] items-center p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                      {job.format === 'pdf' ? <Printer className="h-5 w-5" /> : <FileSpreadsheet className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{job.template_name}</div>
                      <div className="text-xs text-slate-400">{new Date(job.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 rounded-lg">
                      <FileCheck className="h-3 w-3 mr-1" />
                      {job.status}
                    </Badge>
                  </div>
                  <div className="text-sm font-bold text-slate-500 uppercase">{job.format}</div>
                  <div className="text-right">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary">
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardMetric({ label, value, subValue, icon, trend }: { label: string, value: string, subValue: string, icon: ReactNode, trend?: 'up' | 'down' }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner">
          {icon}
        </div>
        {trend && (
          <Badge className={trend === 'down' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}>
            {value}
          </Badge>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
        <p className="text-xs font-bold text-slate-500 mt-1">{subValue}</p>
      </div>
    </div>
  );
}

function PreviewMetric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 shadow-inner">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function ToggleRow({ label, checked, onCheckedChange, disabled }: { label: string; checked: boolean; onCheckedChange?: (v: boolean) => void, disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-sm font-bold ${disabled ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

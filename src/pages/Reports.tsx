import { type ReactNode, useMemo, useState } from 'react';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { 
  ArrowLeft,
  BrainCircuit,
  Calendar,
  ChevronRight,
  Download, 
  FileCheck, 
  FileSpreadsheet, 
  History, 
  Layers,
  LayoutDashboard, 
  LineChart,
  Loader2,
  PieChart as PieIcon,
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
import { Slider } from '@/components/ui/slider';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useToast } from '@/hooks/use-toast';
import { useAuditWorkspace } from '@/hooks/useAuditWorkspace';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import { useReportHistory } from '@/hooks/useReportHistory';
import { buildExecutiveNarrative, downloadExcelReport, openPrintableReport } from '@/lib/reporting';
import { STANDARD_OPTIONS } from '@/lib/constants';
import { formatKg, simulateScenario } from '@/lib/audit-analytics';

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

  // Decarbonization Planner / Scenario State
  const [scenario, setScenario] = useState<{ targetCategory: string; reductionPercent: number }>({
    targetCategory: '',
    reductionPercent: 0,
  });

  const activeSummary = useMemo(() => {
    if (scenario.targetCategory && scenario.reductionPercent > 0) {
      return simulateScenario(summary, scenario);
    }
    return summary;
  }, [summary, scenario]);

  const reportPayload = useMemo(
    () => ({
      settings,
      summary: {
        ...activeSummary,
        reductionOpportunities: wizardState.includeRecommendations ? activeSummary.reductionOpportunities : [],
        checklist: wizardState.includeChecklist ? activeSummary.checklist : [],
      },
      entries,
      generatedAt: new Date().toISOString(),
    }),
    [entries, wizardState.includeChecklist, wizardState.includeRecommendations, settings, activeSummary]
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

  if (isWorkspaceLoading) return <div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      {view === 'dashboard' ? (
        <ReportsDashboard 
          jobs={jobs} 
          summary={activeSummary} 
          scenario={scenario}
          setScenario={setScenario}
          isLoading={isHistoryLoading}
          onStartWizard={() => setView('wizard')} 
        />
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <Button variant="ghost" className="pl-0 -ml-2 text-slate-400 hover:text-slate-900" onClick={() => setView('dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Assurance Archive
              </Button>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Audit Pack Generator</h1>
              <p className="text-sm text-slate-500 font-medium">Step {step} of 3: Configure Disclosure Modules</p>
            </div>
            
            <div className="flex gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {[1, 2, 3].map(s => (
                  <div 
                    key={s} 
                    className={`h-2 w-12 rounded-full mx-1 transition-all ${s <= step ? 'bg-slate-900' : 'bg-slate-200'}`} 
                  />
                ))}
              </div>
            </div>
          </header>

          <div className="grid gap-8 xl:grid-cols-[440px_1fr]">
            {/* Step Content */}
            <aside className="space-y-6">
              <Card className="border-slate-200 shadow-xl overflow-hidden rounded-3xl">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {step === 1 ? 'Report Identity' : step === 2 ? 'Disclosure Scopes' : 'Audit Narrative'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {step === 1 && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Document Title</Label>
                        <Input 
                          value={settings.reportTitle} 
                          onChange={(e) => updateSettings({ reportTitle: e.target.value })} 
                          className="rounded-xl border-slate-200 h-11 focus-visible:ring-primary"
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
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                          <ShieldCheck className="h-4 w-4" />
                          Coverage Compliance
                        </div>
                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                          Current inventory shows <strong>{activeSummary.evidenceCoverage}% evidence coverage</strong>. 
                        </p>
                      </div>
                      <div className="space-y-4 pt-2">
                        <ToggleRow label="Biogenic CO2 Disclosure" checked={true} disabled />
                        <ToggleRow label="Include Reduction Roadmap" checked={wizardState.includeRecommendations} onCheckedChange={(v) => setWizardState(p => ({ ...p, includeRecommendations: v }))} />
                        <ToggleRow label="Compliance Assurance Checklist" checked={wizardState.includeChecklist} onCheckedChange={(v) => setWizardState(p => ({ ...p, includeChecklist: v }))} />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Executive Summary</Label>
                        <Textarea
                          className="min-h-[220px] rounded-xl border-slate-200 text-sm leading-relaxed"
                          value={wizardState.customSummary}
                          placeholder="Leave blank to use elite autogenerated narrative..."
                          onChange={(e) => setWizardState(p => ({ ...p, customSummary: e.target.value }))}
                        />
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
                        Publish Report
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Live Preview */}
            <div className="space-y-6">
              <Card className="overflow-hidden border-slate-200/60 shadow-2xl bg-white min-h-[900px] ring-1 ring-slate-100 rounded-[40px]">
                <div 
                  className="p-20 text-white relative h-[440px] flex flex-col justify-end overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${settings.brandPrimary}, ${settings.brandSecondary})` }}
                >
                  <div className="absolute top-20 right-20 blur-3xl opacity-20 h-96 w-96 rounded-full bg-white animate-pulse" />
                  <div className="absolute top-20 left-20 h-24 w-24 bg-white/10 rounded-3xl backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl">
                    <ShieldCheck className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-6 relative">
                    <Badge variant="outline" className="text-white/60 border-white/20 font-mono tracking-widest text-[10px] px-3 py-1">VERIFIED INVENTORY • ISO-14064</Badge>
                    <h2 className="text-7xl font-black tracking-tighter leading-[0.9]">{settings.reportTitle}</h2>
                    <div className="flex items-center gap-8 text-white/50 font-bold uppercase text-[10px] tracking-[0.2em] pt-4">
                      <span>{organization?.name}</span>
                      <span className="h-2 w-2 rounded-full bg-white/20" />
                      <span>{settings.boundaryApproach}</span>
                      <span className="h-2 w-2 rounded-full bg-white/20" />
                      <span>{new Date().getFullYear()} AUDIT</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-20 space-y-20">
                  <div className="grid grid-cols-3 gap-10">
                    <PreviewMetric label="Total Footprint" value={formatKg(activeSummary.totalKg)} icon={<Layers className="h-5 w-5 text-primary" />} />
                    <PreviewMetric label="Unit Intensity" value={`${activeSummary.intensity.intensity_fte} kg/FTE`} icon={<Zap className="h-5 w-5 text-blue-500" />} />
                    <PreviewMetric label="Audited Level" value={`${activeSummary.verifiedShare}%`} icon={<ShieldCheck className="h-5 w-5 text-green-500" />} />
                  </div>

                  <section className="space-y-8">
                    <div className="space-y-2">
                       <h4 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-2">Chapter 01</h4>
                       <h3 className="text-4xl font-black text-slate-900 tracking-tight">Executive Disclosure</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xl font-medium max-w-4xl">
                      {executiveNarrative}
                    </p>
                  </section>
                </CardContent>
              </Card>
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
  scenario,
  setScenario,
  isLoading, 
  onStartWizard 
}: { 
  jobs: any[], 
  summary: any, 
  scenario: any,
  setScenario: (s: any) => void,
  isLoading: boolean, 
  onStartWizard: () => void 
}) {
  const [metricTrack, setMetricTrack] = useState<'gross' | 'net'>('gross');
  
  const displayTotal = metricTrack === 'gross' ? summary.totalKg : summary.netEmissionsKg;
  const displayLabel = metricTrack === 'gross' ? 'Gross Emissions' : 'Net Emissions (Biogenic Incl)';

  const topDriversData = useMemo(() => 
    summary.topDrivers.map((d: any) => ({
      name: d.label,
      value: d.totalKg,
      share: d.share
    })), [summary.topDrivers]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Badge className="bg-primary/5 text-primary border-primary/10 px-4 py-1.5 rounded-full font-bold">Assurance Archive v2026</Badge>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-[0.8] py-2">Corporate <span className="text-primary italic">Disclosures</span></h1>
          <p className="text-xl text-slate-500 font-medium max-w-xl leading-relaxed">Financial-grade auditing, AI-driven simulations, and world-class compliance reporting.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="rounded-2xl h-16 px-8 border-slate-200 font-black text-slate-600 hover:bg-slate-50">
            <Download className="mr-2 h-5 w-5" />
            Export Raw Data
          </Button>
          <Button size="lg" className="rounded-2xl h-16 px-10 bg-slate-900 hover:bg-slate-800 text-white font-black shadow-2xl shadow-slate-200 group" onClick={onStartWizard}>
            Launch Audit Wizard
            <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </header>

      {/* Primary KPI & Visual Grid */}
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-slate-200/60 shadow-2xl rounded-[40px] overflow-hidden bg-white ring-1 ring-slate-100">
          <CardHeader className="p-10 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/30">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight">{displayLabel}</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Activity-based footprint trend vs 12-month forecast.</CardDescription>
            </div>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
              <Button 
                variant={metricTrack === 'gross' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-xl font-bold h-9 bg-slate-900 text-white text-[10px] uppercase tracking-wider"
                onClick={() => setMetricTrack('gross')}
              >
                Gross
              </Button>
              <Button 
                variant={metricTrack === 'net' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-xl font-bold h-9 text-[10px] uppercase tracking-wider text-slate-400"
                onClick={() => setMetricTrack('net')}
              >
                Net
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
              <div className="space-y-8">
                <div className="p-8 rounded-[32px] bg-slate-950 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] mb-4">Core Period Total</p>
                  <p className="text-5xl font-black tabular-nums tracking-tighter leading-none">{formatKg(displayTotal)}</p>
                  <div className="flex items-center gap-2 mt-6">
                    <TrendingDown className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary">4.2% reduction vs LY</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <IntensityRow label="Revenue Intensity" value={`${summary.intensity.intensity_revenue} kg/USD`} icon={<Zap className="h-4 w-4" />} />
                  <IntensityRow label="Team Intensity" value={`${summary.intensity.intensity_fte} kg/FTE`} icon={<Layers className="h-4 w-4" />} />
                  <IntensityRow label="Area Intensity" value={`${summary.intensity.carbon_intensity_area} kg/sqm`} icon={<ShieldCheck className="h-4 w-4" />} />
                </div>
              </div>

              <div className="h-[460px] w-full rounded-2xl bg-white p-4">
                <ChartContainer
                  config={{
                    actual: { label: "Actual", color: "#0f5f4b" },
                    forecast: { label: "AI Forecast", color: "#94a3b8" }
                  }}
                  className="h-full w-full"
                >
                  <AreaChart data={summary.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="actualKg" 
                      name="Actual" 
                      stroke="var(--color-actual)" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorActual)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="forecastKg" 
                      name="AI Forecast" 
                      stroke="#94a3b8" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      fill="transparent" 
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar: AI & Top Drivers */}
        <div className="space-y-8">
          <Card className="border-slate-200/60 shadow-xl rounded-[40px] bg-slate-900 text-white overflow-hidden group">
             <CardHeader className="p-8 border-b border-white/5">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                  Decarbonization Planner
                </CardTitle>
                <CardDescription className="text-white/50">Model reduction scenarios for target categories.</CardDescription>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Target Strategy</Label>
                  <Select value={scenario.targetCategory} onValueChange={(v) => setScenario({ ...scenario, targetCategory: v, reductionPercent: v ? 20 : 0 })}>
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl h-12 text-white">
                      <SelectValue placeholder="Select high-impact category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {summary.topDrivers.map((d: any) => <SelectItem key={d.label} value={d.label}>{d.label} Optimization</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                {scenario.targetCategory && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Efficiency Gain: {scenario.reductionPercent}%</Label>
                    </div>
                    <Slider 
                      value={[scenario.reductionPercent]} 
                      max={80} 
                      step={1} 
                      className="py-4"
                      onValueChange={([v]) => setScenario({ ...scenario, reductionPercent: v })}
                    />
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                       <span className="text-xs text-white/60 font-medium">Estimated Impact</span>
                       <Badge className="bg-primary text-white font-black">-{formatKg(summary.topDrivers.find((d: any) => d.label === scenario.targetCategory).totalKg * (scenario.reductionPercent / 100))}</Badge>
                    </div>
                    <Button variant="ghost" className="w-full text-white/40 hover:text-white" onClick={() => setScenario({ targetCategory: '', reductionPercent: 0 })}>
                      Reset Simulation
                    </Button>
                  </div>
                )}
             </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-xl rounded-[40px] bg-white ring-1 ring-slate-100 overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-100">
               <CardTitle className="text-xl font-black">Primary Drivers</CardTitle>
               <CardDescription className="text-slate-500 font-medium">Activity clusters sorted by material impact.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
               <div className="h-[280px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topDriversData} layout="vertical" margin={{ left: -10, right: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} 
                        width={90}
                      />
                      <Tooltip cursor={{ fill: '#f8fafc' }} content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="value" 
                        fill="#0f5f4b" 
                        radius={[0, 12, 12, 0]} 
                        barSize={24}
                      />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Assurance Pack List */}
      <Card className="border-slate-200 shadow-2xl overflow-hidden rounded-[40px] bg-white ring-1 ring-slate-100">
        <CardHeader className="p-10 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight">Assurance Packs</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-lg italic">The verified track of organizational disclosures and board-ready reports.</CardDescription>
          </div>
          <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold bg-white text-slate-500 hover:text-slate-900 border-slate-200">
            <Calendar className="mr-2 h-4 w-4" />
            Filter Period
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></div>
          ) : jobs.length === 0 ? (
            <div className="p-32 text-center space-y-6">
              <div className="h-24 w-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto text-slate-200 shadow-inner">
                <History className="h-10 w-10" />
              </div>
              <p className="text-slate-400 font-bold italic text-lg transition-transform hover:scale-105">No assurance packs published in this workspace yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-[2fr_1fr_1fr_120px] p-8 text-[11px] font-black uppercase text-slate-400 tracking-[0.25em]">
                <div>Document Architecture</div>
                <div>Compliance Status</div>
                <div>Output Format</div>
                <div className="text-right">Action</div>
              </div>
              {jobs.map((job) => (
                <div key={job.id} className="grid grid-cols-[2fr_1fr_1fr_120px] items-center p-8 hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform shadow-sm">
                      {job.format === 'pdf' ? <Printer className="h-6 w-6" /> : <FileSpreadsheet className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="font-black text-xl text-slate-900 tracking-tight">{job.template_name}</div>
                      <div className="text-sm text-slate-400 font-medium">Assurance Date: {new Date(job.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-100/50 rounded-xl px-4 py-1 font-black text-[10px] uppercase tracking-wider">
                      <FileCheck className="h-3 w-3 mr-2" />
                      {job.status}
                    </Badge>
                  </div>
                  <div className="text-sm font-black text-slate-500 uppercase tracking-widest">{job.format}</div>
                  <div className="text-right">
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-[20px] text-slate-300 hover:text-primary hover:bg-primary/5 shadow-none transition-colors">
                      <Download className="h-6 w-6" />
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

function IntensityRow({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-primary transition-colors">{icon}</div>
        <p className="text-xs font-bold text-slate-500">{label}</p>
      </div>
      <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{value}</p>
    </div>
  );
}

function PreviewMetric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="p-10 rounded-[40px] border border-slate-100 bg-slate-50/20 shadow-inner group hover:bg-white transition-colors cursor-default">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-white rounded-2xl shadow-xl group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{label}</span>
      </div>
      <div className="text-4xl font-black text-slate-900 tracking-tighter">{value}</div>
    </div>
  );
}

function ToggleRow({ label, checked, onCheckedChange, disabled }: { label: string; checked: boolean; onCheckedChange?: (v: boolean) => void, disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-4 rounded-2xl transition hover:bg-slate-50">
      <span className={`text-sm font-bold ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

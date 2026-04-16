import { type ReactNode, useState } from 'react';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { 
  ChevronRight,
  Download, 
  FileCheck, 
  FileSpreadsheet, 
  History, 
  Layers,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Zap,
  Building2,
  Users,
  Loader2,
  Target,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuditWorkspace } from '@/hooks/useAuditWorkspace';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import { useReportHistory } from '@/hooks/useReportHistory';
import { downloadExcelReport, openPrintableReport } from '@/lib/reporting';
import { formatKg } from '@/lib/audit-analytics';
import { cn } from '@/lib/utils';

export default function Reports() {
  const { entries, summary, isLoading: isWorkspaceLoading } = useAuditWorkspace();
  const { settings } = useWorkspaceSettings();
  const { jobs, isLoading: isHistoryLoading } = useReportHistory();

  const handlePrint = () => {
    openPrintableReport({ settings, summary, entries });
  };

  const handleExcel = () => {
    downloadExcelReport({ settings, summary, entries });
  };

  if (isWorkspaceLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary/40" />
          <p className="text-sm font-black uppercase tracking-widest text-slate-400">Archiving Assurance Evidence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-2">
        <div className="space-y-3">
          <Badge className="bg-primary/5 text-primary border-primary/10 px-4 py-1.5 rounded-full font-bold">Assurance Archive v2026</Badge>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-[0.8] py-2">Corporate <span className="text-primary italic">Disclosures</span></h1>
          <p className="text-xl text-slate-500 font-medium max-w-xl leading-relaxed">Financial-grade auditing, AI-driven simulations, and world-class compliance reporting.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="rounded-2xl h-16 px-8 border-slate-200 font-black text-slate-600 hover:bg-slate-50" onClick={handleExcel}>
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Export Raw Data
          </Button>
          <Button size="lg" className="rounded-2xl h-16 px-10 bg-slate-900 hover:bg-slate-800 text-white font-black shadow-2xl shadow-slate-200 group" onClick={handlePrint}>
            Launch Audit Pack
            <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </header>

      {/* Primary Analytics & Visual Grid */}
      <section className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <Card className="border-slate-200/60 shadow-2xl rounded-[48px] overflow-hidden bg-white ring-1 ring-slate-100">
          <CardHeader className="p-10 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/30">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight">Assurance Performance</CardTitle>
              <CardDescription className="text-slate-500 font-medium italic">Verified footprint trend vs IPCC AR6 benchmarks.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <Badge className="bg-emerald-500 text-white border-none rounded-full px-4 py-1 font-black text-[10px] tracking-widest uppercase">Verified</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
              <div className="space-y-10">
                <div className="p-8 rounded-[40px] bg-slate-950 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.25em] mb-4">Total Inventory</p>
                  <p className="text-5xl font-black tabular-nums tracking-tighter leading-none">{formatKg(summary.totalKg)}</p>
                  <div className="flex items-center gap-3 mt-8">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-primary">Audit-grade Accuracy</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                   <MetricRow label="Building Intensity" value={`${summary.intensity.carbon_intensity_area} kg/m²`} icon={<Building2 className="h-5 w-5" />} />
                   <MetricRow label="FTE Normalization" value={`${summary.intensity.intensity_fte} kg/FTE`} icon={<Users className="h-5 w-5" />} />
                   <MetricRow label="Validation Score" value={`${summary.qualityScore}/100`} icon={<ShieldCheck className="h-5 w-5" />} />
                </div>
              </div>

              <div className="h-[420px] w-full rounded-[32px] bg-slate-50/50 p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f5f4b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0f5f4b" stopOpacity={0}/>
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
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
                      itemStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="actualKg" 
                      stroke="#0f5f4b" 
                      strokeWidth={5} 
                      fill="url(#colorActual)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="forecastKg" 
                      stroke="#94a3b8" 
                      strokeWidth={2} 
                      strokeDasharray="8 6" 
                      fill="transparent" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Sidebar */}
        <div className="space-y-8">
           <Card className="border-slate-900 bg-slate-900 text-white shadow-2xl rounded-[48px] overflow-hidden relative">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/20 blur-[100px]" />
              <CardHeader className="p-10">
                 <div className="h-14 w-14 rounded-3xl bg-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/40">
                    <Target className="h-7 w-7 text-white" />
                 </div>
                 <CardTitle className="text-2xl font-black tracking-tight leading-none">Methodology Check</CardTitle>
                 <CardDescription className="text-white/40 font-medium">13-Step GHG Protocol Alignment</CardDescription>
              </CardHeader>
              <CardContent className="px-10 pb-10 space-y-8">
                 <div className="space-y-3">
                    <MethodologyStatus label="Boundary Definition" status="complete" />
                    <MethodologyStatus label="Source Identification" status="complete" />
                    <MethodologyStatus label="Factor Selection" status="complete" />
                    <MethodologyStatus label="Reporting (Part 10)" status="active" />
                 </div>
                 <p className="text-xs text-white/40 leading-relaxed font-medium">
                   Your current inventory is compliant with the <span className="text-white font-bold">{settings.primaryStandard}</span> Corporate Standard.
                 </p>
                 <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black hover:bg-slate-100 transition-all active:scale-95">
                    View Compliance Log
                    <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </CardContent>
           </Card>

           <Card className="border-slate-200/60 shadow-xl rounded-[48px] bg-slate-50/50 ring-1 ring-slate-100 p-8 text-center space-y-4">
              <div className="p-4 bg-white rounded-3xl shadow-sm inline-flex">
                 <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-lg font-black text-slate-900 leading-none">Assurance Score</h4>
              <p className="text-4xl font-black text-primary">{summary.qualityScore}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Based on evidence coverage</p>
           </Card>
        </div>
      </section>

      {/* Historical Audit Trail */}
      <Card className="border-slate-200 shadow-3xl overflow-hidden rounded-[56px] bg-white ring-1 ring-slate-100">
        <CardHeader className="p-12 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-4xl font-black tracking-tighter">Audit Trail</CardTitle>
            <CardDescription className="text-slate-400 font-medium text-lg italic">Historical records of verified organizational disclosures.</CardDescription>
          </div>
          <History className="h-8 w-8 text-slate-100" />
        </CardHeader>
        <CardContent className="p-0">
          {isHistoryLoading ? (
            <div className="p-24 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-slate-100" /></div>
          ) : jobs.length === 0 ? (
            <div className="p-32 text-center space-y-6">
              <div className="h-24 w-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto text-slate-200">
                <FileCheck className="h-10 w-10" />
              </div>
              <p className="text-slate-400 font-bold italic text-xl">No historical audit packs in this workspace.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {jobs.slice(0, 8).map((job) => (
                <div key={job.id} className="grid grid-cols-[1fr_200px_160px] items-center p-10 hover:bg-slate-50/80 transition-all group cursor-default">
                  <div className="flex items-center gap-8">
                    <div className="h-16 w-16 rounded-[24px] bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                       {job.format === 'pdf' ? <Printer className="h-7 w-7" /> : <FileSpreadsheet className="h-7 w-7" />}
                    </div>
                    <div>
                      <h4 className="font-black text-2xl text-slate-900 tracking-tight">{job.template_name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">v2.4.1</span>
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge className="bg-emerald-50 text-emerald-800 border-none rounded-2xl px-5 py-2 font-black text-[11px] uppercase tracking-widest text-center shadow-sm">
                       {job.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-slate-300 hover:text-primary hover:bg-primary/5 transition-all">
                       <Download className="h-8 w-8" />
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

function MetricRow({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">{icon}</div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-base font-black text-slate-900 group-hover:text-primary transition-colors">{value}</p>
    </div>
  );
}

function MethodologyStatus({ label, status }: { label: string; status: 'complete' | 'active' | 'pending' }) {
  return (
    <div className="flex items-center gap-4">
       <div className={cn(
         "h-6 w-6 rounded-lg flex items-center justify-center",
         status === 'complete' ? "bg-primary text-white" : 
         status === 'active' ? "bg-white text-slate-900" : "border border-white/20 text-white/20"
       )}>
          {status === 'complete' ? <FileCheck className="h-4 w-4" /> : <div className="h-1 w-1 rounded-full bg-current" />}
       </div>
       <span className={cn(
         "text-sm font-bold", 
         status === 'pending' ? "text-white/20" : status === 'active' ? "text-white" : "text-white/60"
       )}>{label}</span>
    </div>
  );
}

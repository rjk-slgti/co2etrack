import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Database,
  FileText,
  Hexagon,
  Leaf,
  ScanSearch,
  ShieldCheck,
  TrendingUp,
  Zap,
  Globe,
  Building2,
  Target,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuditWorkspace } from '@/hooks/useAuditWorkspace';
import { useOrganizationCatalog } from '@/hooks/useOrganizationCatalog';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import { formatKg } from '@/lib/audit-analytics';
import { calculateBuildingIntensity } from '@/lib/calculation-engine';
import { SCOPE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { summary, isLoading } = useAuditWorkspace();
  const { settings } = useWorkspaceSettings();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white/5 backdrop-blur-sm rounded-[40px] border border-white/20">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary shadow-xl" />
          <p className="text-sm font-black uppercase tracking-widest text-primary/60">Simulating AR6 Workspace...</p>
        </div>
      </div>
    );
  }

  const scopeData = summary.scopeSummary.map(s => ({
    name: s.scope,
    value: s.totalKg,
    color: s.scope === 'Scope 1' ? '#146c94' : s.scope === 'Scope 2' ? '#0f5f4b' : '#334155'
  }));

  const buildingStats = calculateBuildingIntensity(
    summary.totalKg, 
    (settings as any).floor_area_sqm || 1000, 
    settings.buildingType as any
  ) as any;

  return (
    <div className="space-y-10 pb-20">
      {/* 13-Step Methodology Progression */}
      <section className="relative overflow-hidden rounded-[40px] bg-slate-900 p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 blur-[100px]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary text-white border-none py-1 px-4 rounded-full font-black text-[10px] tracking-widest uppercase shadow-lg shadow-primary/20">
                Methodology: GHG Protocol
              </Badge>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <Badge variant="outline" className="text-white/40 border-white/10 rounded-full font-bold">Standard: ISO 14064-1</Badge>
            </div>
            
            <h1 className="text-4xl font-black tracking-tighter lg:text-5xl leading-[1.1]">
              Inventory <br /> Progression <span className="text-primary tracking-widest">Studio</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Your carbon footprint is being strictly calculated using the 13-step methodology. 
              Currently validating <span className="text-white font-black underline decoration-primary lg:text-2xl">Step 09: Assurance Check</span>.
            </p>
          </div>
          
          <div className="flex-1 w-full max-w-2xl bg-white/5 rounded-[32px] p-8 border border-white/10 backdrop-blur-md">
             <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Audit Completion</span>
                <span className="text-2xl font-black text-primary italic">68%</span>
             </div>
             <Progress value={68} className="h-3 bg-white/10 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary" />
             </Progress>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MethodologyStep label="Define Boundary" status="complete" step="01" />
                <MethodologyStep label="Factoring" status="complete" step="04" />
                <MethodologyStep label="Calculation" status="active" step="05" />
                <MethodologyStep label="Report" status="pending" step="10" />
             </div>
          </div>
        </div>
      </section>

      {/* Building-Type Analytics (Smart, Industrial, etc.) */}
      <div className="grid gap-8 lg:grid-cols-4">
         <MetricCard 
           label="Total Footprint" 
           value={formatKg(summary.totalKg)} 
           detail="Net Emissions (AR6)"
           icon={<Globe className="h-6 w-6 text-primary" />}
           color="bg-primary/5"
         />
         <MetricCard 
           label="Building Intensity" 
           value={`${buildingStats.intensity} kg/m²`} 
           detail={buildingStats.isOptimal ? 'Optimal Efficiency' : 'Exceeds Benchmark'}
           icon={<Building2 className="h-6 w-6 text-indigo-500" />}
           color="bg-indigo-500/5"
           trend={buildingStats.isOptimal ? 'down' : 'up'}
         />
         <MetricCard 
           label="Validation Score" 
           value={`${summary.qualityScore}/100`} 
           detail={`${summary.evidenceCoverage}% Evidence coverage`}
           icon={<ShieldCheck className="h-6 w-6 text-emerald-500" />}
           color="bg-emerald-500/5"
         />
         <MetricCard 
           label="Energy Variance" 
           value="+12.4%" 
           detail="Vs. Previous Period"
           icon={<Zap className="h-6 w-6 text-amber-500" />}
           color="bg-amber-500/5"
           trend="up"
         />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Scopes Distribution */}
        <Card className="lg:col-span-2 border-slate-200/60 shadow-2xl rounded-[48px] bg-white ring-1 ring-slate-100 overflow-hidden group">
          <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight">Scope Contribution</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Breakdown of Direct vs. Indirect emissions.</CardDescription>
            </div>
            <div className="flex gap-2">
               <Badge variant="outline" className="rounded-xl px-4 py-2 border-slate-100 text-slate-400 font-bold uppercase text-[10px]">Location-based</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scopeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                         return (
                           <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 shadow-2xl text-white">
                             <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">GHG Protocol {payload[0].payload.name}</p>
                             <p className="text-lg font-black">{formatKg(payload[0].value as number)}</p>
                           </div>
                         );
                       }
                       return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[16, 16, 16, 16]} barSize={80}>
                    {scopeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mt-10 border-t border-slate-50 pt-10">
               {summary.scopeSummary.map((s, i) => (
                 <div key={s.scope} className="text-center group-hover:scale-105 transition-transform duration-500">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">{s.scope}</p>
                    <p className="text-xl font-black text-slate-900">{s.share}%</p>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Decarbonization Pathway */}
        <Card className="border-slate-200/60 shadow-2xl rounded-[48px] bg-slate-50/30 ring-1 ring-slate-100 overflow-hidden">
          <CardHeader className="p-10">
             <div className="h-14 w-14 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-primary" />
             </div>
             <CardTitle className="text-2xl font-black tracking-tight">Decarbonization</CardTitle>
             <CardDescription className="text-slate-500 font-medium text-base">Automatic gap analysis vs. Net-Zero 2030 target.</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 space-y-8">
             <div className="space-y-4">
                <div className="flex items-center justify-between text-sm font-black uppercase tracking-widest">
                   <span className="text-slate-400">Target Gap</span>
                   <span className="text-amber-600">32.4%</span>
                </div>
                <Progress value={67.6} className="h-3 rounded-full bg-slate-100 overflow-hidden">
                   <div className="h-full bg-amber-500" />
                </Progress>
             </div>
             
             <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Smart Recommendations</p>
                {summary.reductionOpportunities.slice(0, 2).map((opp) => (
                   <div key={opp.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-start gap-4">
                      <div className="h-8 w-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                         <Leaf className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-xs font-black text-slate-900 leading-tight">{opp.title}</p>
                         <p className="text-[10px] text-slate-400 font-medium">Est. -{formatKg(opp.estimatedReductionKg)}</p>
                      </div>
                   </div>
                ))}
             </div>
             
             <Button className="w-full h-14 rounded-3xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200">
                Explore Pathway
                <ChevronRight className="ml-2 h-4 w-4" />
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MethodologyStep({ label, status, step }: { label: string; status: 'complete' | 'active' | 'pending'; step: string }) {
  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className={cn(
        "h-12 w-12 rounded-[18px] flex items-center justify-center border-2 transition-all group-hover:scale-110",
        status === 'complete' ? "bg-primary border-primary text-white" :
        status === 'active' ? "bg-white text-slate-900 border-white shadow-xl shadow-primary/20" :
        "bg-transparent border-white/10 text-white/30"
      )}>
        {status === 'complete' ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-black italic">{step}</span>}
      </div>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest text-center h-8",
        status === 'pending' ? "text-white/20" : "text-white/60"
      )}>{label}</span>
    </div>
  );
}

function MetricCard({ label, value, detail, icon, color, trend }: { label: string; value: string; detail: string; icon: any; color: string; trend?: 'up' | 'down' }) {
  return (
    <Card className="border-slate-200/60 shadow-2xl rounded-[40px] bg-white ring-1 ring-slate-100 overflow-hidden hover:-translate-y-2 transition-all duration-500 cursor-default group">
      <CardContent className="p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className={cn("h-14 w-14 rounded-3xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform", color)}>
            {icon}
          </div>
          {trend && (
             <div className={cn(
               "h-8 w-16 rounded-full flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest",
               trend === 'down' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
             )}>
                {trend === 'down' ? <TrendingUp className="h-3 w-3 rotate-180" /> : <TrendingUp className="h-3 w-3" />}
                {trend === 'down' ? '3%' : '7%'}
             </div>
          )}
        </div>
        <div className="space-y-1 pt-2">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
        <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
           <p className="text-xs font-bold text-slate-500 italic">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}

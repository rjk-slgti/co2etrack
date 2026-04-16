import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Target, 
  Users, 
  ShieldCheck, 
  Database, 
  Search, 
  BarChart4, 
  FileText, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const METHODOLOGY_STEPS = [
  { id: '01', label: 'Define Objective', role: 'Sustainability Lead', icon: Target, status: 'complete' },
  { id: '02', label: 'Identify Sources', role: 'Facility Manager', icon: Search, status: 'complete' },
  { id: '03', label: 'Data Collection', role: 'Data Collector', icon: Database, status: 'active' },
  { id: '04', label: 'Select Factors', role: 'Auditor', icon: Wand2, status: 'pending' },
  { id: '05', label: 'Perform Calcs', role: 'System Engine', icon: Cpu, status: 'pending' },
  { id: '06', label: 'Convert to CO2e', role: 'System Engine', icon: RefreshCw, status: 'pending' },
  { id: '07', label: 'Aggregate', role: 'Audit Lead', icon: Layers, status: 'pending' },
  { id: '08', label: 'Normalize', role: 'Sustainability Lead', icon: Scaling, status: 'pending' },
  { id: '09', label: 'Assurance Check', role: 'External Auditor', icon: ShieldCheck, status: 'pending' },
  { id: '10', label: 'Final Reporting', role: 'Director', icon: FileText, status: 'pending' },
];

import { Wand2, Cpu, RefreshCw, Layers, Scaling } from 'lucide-react';

export default function AuditMissionControl() {
  const activeStep = METHODOLOGY_STEPS.find(s => s.status === 'active') || METHODOLOGY_STEPS[2];
  const progress = 30; // Mock progress based on completion

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Main Progress */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-4">
          <Badge className="bg-[#b45309]/10 text-[#b45309] border-[#b45309]/20 px-4 py-1.5 rounded-full font-black text-[10px] tracking-[0.2em] uppercase">
            Mission Control: GHG Protocol v2026
          </Badge>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-tight">
            Inventory <span className="text-[#1e3a8a] italic">Integrity</span> Hub
          </h2>
          <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
            The standard methodology ensures your disclosure is financial-grade. 
            Currently optimizing <span className="text-[#1e3a8a] font-bold underline decoration-[#b45309]">Step {activeStep.id}: {activeStep.label}</span>.
          </p>
        </div>

        <Card className="bg-slate-900 border-none shadow-2xl rounded-[32px] overflow-hidden p-8 w-full lg:w-[320px] text-white">
          <div className="flex items-center justify-between mb-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Audit Completion</span>
             <span className="text-xl font-black">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/10 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-[#b45309]" />
          </Progress>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-[10px] font-bold text-white/60 leading-tight">Smart engine is validating factor consistency...</p>
          </div>
        </Card>
      </div>

      {/* 13-Step Roadmap Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {METHODOLOGY_STEPS.slice(0, 10).map((step) => {
          const Icon = step.icon;
          return (
            <Card 
              key={step.id} 
              className={cn(
                "relative transition-all duration-300 rounded-[28px] border-slate-100 shadow-sm overflow-hidden group cursor-default",
                step.status === 'active' ? "ring-2 ring-[#1e3a8a] bg-white shadow-xl -translate-y-1" : 
                step.status === 'complete' ? "bg-slate-50/50 opacity-80" : "bg-white opacity-40 hover:opacity-60"
              )}
            >
              <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                <div className={cn(
                  "h-10 w-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                  step.status === 'active' ? "bg-[#1e3a8a] text-white" :
                  step.status === 'complete' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {step.status === 'complete' ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Step {step.id}</p>
                  <p className={cn(
                    "text-[11px] font-black leading-tight h-10 flex items-center justify-center",
                    step.status === 'active' ? "text-slate-900" : "text-slate-600"
                  )}>{step.label}</p>
                </div>
                
                <div className="pt-2 border-t border-slate-50 w-full flex items-center justify-center gap-1">
                  <Users className="h-3 w-3 text-slate-300" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{step.role}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Proactive Guidance Card (For Freshers) */}
      <Card className="bg-[#1e3a8a]/5 border-none rounded-[40px] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Sparkles className="h-24 w-24 text-[#b45309]" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-[#1e3a8a]" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">Auditor Guidance</h4>
              <p className="text-[10px] text-[#b45309] font-black uppercase tracking-widest leading-none">Smart Assistant • Steps 03-04</p>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-[1fr_200px] gap-8">
            <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-2 border-[#b45309]/30 pl-6">
              "Hi there! To finalize <strong>Step 03: Data Collection</strong>, ensure you have evidence attached for diesel generator logs at the Northern Campus. My engine suggests using the <strong>IEA-LK-2025</strong> factor for electricity to maintain IPCC AR6 compliance."
            </p>
            <div className="flex gap-2">
              <Button className="h-12 w-full rounded-2xl bg-slate-900 font-bold text-white shadow-xl hover:bg-slate-800">
                Action Source
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

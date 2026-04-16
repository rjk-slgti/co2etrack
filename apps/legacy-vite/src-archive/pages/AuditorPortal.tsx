import { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ClipboardCheck, 
  Database, 
  FileSearch, 
  Info, 
  LayoutDashboard, 
  LineChart, 
  Search,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuditWorkspace } from '@/hooks/useAuditWorkspace';
import { useAnomalyDetection } from '@/hooks/useAnomalyDetection';
import { formatKg } from '@/lib/audit-analytics';
import type { ActivityEntryRecord } from '@/lib/audit-model';

export default function AuditorPortal() {
  const { entries, summary, organization, isLoading } = useAuditWorkspace();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const { data: anomaly } = useAnomalyDetection(selectedEntryId);
  
  const pendingQueue = entries.filter((e) => e.status === 'pending_audit');
  const verifiedCount = entries.filter((e) => e.status === 'verified').length;

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading compliance workspace...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      {/* 1. Professional Header */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 px-3 py-1">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Standard Compliance Mode
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Auditor Workspace</h1>
          <p className="text-slate-500 max-w-2xl">
            Validate organizational boundaries, verify high-impact activity data, and finalize the {'GHG Protocol'} inventory for {organization?.name}.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200">
            <FileSearch className="mr-2 h-4 w-4" />
            Audit Log
          </Button>
          <Button className="rounded-xl bg-slate-900 hover:bg-slate-800">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Finalize Period
          </Button>
        </div>
      </header>

      {/* 2. Professional Metric Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          label="Gross Emissions" 
          value={formatKg(summary.totalKg)} 
          subtext="Scope 1, 2, 3 Consolidated"
          icon={<LayoutDashboard className="h-4 w-4 text-primary" />}
        />
        <MetricCard 
          label="Market-based Scope 2" 
          value={formatKg(summary.marketBasedKg)} 
          subtext="Net of instruments"
          icon={<Zap className="h-4 w-4 text-blue-500" />}
        />
        <MetricCard 
          label="Phys. Intensity" 
          value={`${summary.intensity.intensity_fte} kg/FTE`} 
          subtext={`Team members`}
          icon={<LineChart className="h-4 w-4 text-orange-500" />}
        />
        <MetricCard 
          label="Audit Progress" 
          value={`${summary.verifiedShare}%`} 
          subtext={`${verifiedCount} of ${entries.length} records verified`}
          icon={<Progress value={summary.verifiedShare} className="h-2 w-16 mt-2" />}
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* 3. Enhanced Review Queue */}
        <div className="space-y-6">
          <Card className="border-slate-200/60 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Validation Queue</CardTitle>
                  <CardDescription>Records requiring professional reviewer confirmation.</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="Search records..." className="pl-9 w-[240px] h-9 rounded-lg border-slate-200" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30 text-left">
                      <th className="px-5 py-4 font-semibold text-slate-600">Entry Details</th>
                      <th className="px-5 py-4 font-semibold text-slate-600">Scope</th>
                      <th className="px-5 py-4 font-semibold text-slate-600 text-right">Quantity</th>
                      <th className="px-5 py-4 font-semibold text-slate-600 text-right">kgCO2e</th>
                      <th className="px-5 py-4 font-semibold text-slate-600">Smart Check</th>
                      <th className="px-5 py-4 font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingQueue.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">{entry.activity_type}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{entry.entry_date} • {entry.category}</div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="outline" className="font-normal border-slate-200">
                            {entry.scope}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="text-slate-900 font-mono">{entry.quantity.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-500">{entry.unit}</div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="text-slate-900 font-bold">{entry.emission_kgco2e.toFixed(1)}</div>
                        </td>
                        <td className="px-5 py-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/5 px-2"
                            onClick={() => setSelectedEntryId(entry.id)}
                          >
                            <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                            Analyze
                          </Button>
                        </td>
                        <td className="px-5 py-4">
                          <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            Verify
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {pendingQueue.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-20 text-center text-slate-400">
                          <CheckCircle2 className="mx-auto h-10 w-10 text-slate-200 mb-3" />
                          Validation queue is clear. All entries are verified.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Professional Sidebar (Checklist & Insights) */}
        <aside className="space-y-6">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Compliance Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {summary.checklist.map((item) => (
                <div key={item.id} className="group cursor-help">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-900">{item.requirement}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 group-hover:line-clamp-none transition-all">
                        {item.detail}
                      </p>
                    </div>
                    {item.status === 'pass' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    )}
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-primary font-medium h-8 hover:bg-primary/5">
                View detailed methodology
              </Button>
            </CardContent>
          </Card>

          {/* Anomaly Popover/Result */}
          {selectedEntryId && (
            <Card className="border-primary/20 bg-primary/5 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Anomaly Investigation
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedEntryId(null)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {anomaly ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/60 p-3 rounded-xl border border-primary/10">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Baseline</div>
                        <div className="text-lg font-bold text-slate-950 font-mono">{anomaly.baseline_quantity.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/60 p-3 rounded-xl border border-primary/10">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Variance</div>
                        <div className="text-lg font-bold text-slate-950 font-mono">
                          {anomaly.variance_percent > 0 ? '+' : ''}{anomaly.variance_percent}%
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      "{anomaly.message}"
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="flex-1 text-xs h-8 hover:bg-white/80">Reject</Button>
                      <Button className="flex-1 text-xs h-8 bg-primary text-white hover:bg-primary/90">Acknowledge</Button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 p-4 text-center">Loading anomaly baseline...</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="rounded-2xl bg-slate-900 p-6 text-white overflow-hidden relative">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Source Documentation
            </h4>
            <p className="text-xs text-white/70 mb-4 text-pretty">
              All material emissions are backed by digital evidence per ISO 14064-1 best practices.
            </p>
            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold h-9 rounded-lg">
              Browse Evidence Vault
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtext, icon }: { label: string; value: string; subtext: string; icon: React.ReactNode }) {
  return (
    <Card className="border-slate-200/60 shadow-sm group hover:border-primary/50 transition-colors bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-primary/5 transition-colors">
            {icon}
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <p className="text-[11px] text-slate-400 mt-1">{subtext}</p>
      </CardContent>
    </Card>
  );
}

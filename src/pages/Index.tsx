import { useActivityEntries } from '@/hooks/useActivityEntries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEmission } from '@/lib/calculation-engine';
import { SCOPE_COLORS } from '@/lib/constants';
import { BarChart3, TrendingUp, Leaf, AlertTriangle, Zap, Car, Factory, ShieldCheck, Timer, Download, ListChecks } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const { data: entries, isLoading } = useActivityEntries();

  const entriesList = entries ?? [];

  const scopeTotals = entriesList.reduce((acc, e) => {
    acc[e.scope] = (acc[e.scope] || 0) + (e.emission_kgco2e || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalEmissions = Object.values(scopeTotals).reduce((a, b) => a + b, 0);

  const pieData = Object.entries(scopeTotals).map(([scope, value]) => ({
    name: scope,
    value,
    fill: SCOPE_COLORS[scope] || 'hsl(var(--muted))',
  }));

  const categoryTotals = entriesList.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.emission_kgco2e || 0);
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value: value / 1000 })); // convert to tonnes

  const assumedCount = entriesList.filter(e => e.is_assumed_factor).length;
  const pendingAuditCount = entriesList.filter(e => e.status === 'pending_audit').length;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-[.3em] text-[9px]">
            Intelligence Dashboard
          </Badge>
          <h1 className="text-5xl font-black font-heading text-primary uppercase tracking-tighter">Operational Overview</h1>
          <p className="text-muted-foreground text-lg italic mt-1 font-medium">Sustainability Precision • Audit-Ready Inventory Control</p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-end mr-2">
             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Compliance Status</span>
             <span className="text-sm font-bold text-primary italic uppercase tracking-tighter">Verified Stream</span>
          </div>
          <Badge variant="outline" className="bg-white px-4 py-2 flex items-center gap-2 border-primary/20 shadow-xl rounded-xl">
            <Timer className="w-4 h-4 text-secondary" />
            <span className="font-black text-[10px] uppercase tracking-widest">{pendingAuditCount} Reviews Pending</span>
          </Badge>
          <Badge variant="outline" className="bg-white px-4 py-2 flex items-center gap-2 border-primary/20 shadow-xl rounded-xl">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-black text-[10px] uppercase tracking-widest">ISO 14064-1</span>
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-none shadow-2xl bg-primary text-white group hover:scale-[1.02] transition-transform duration-500 rounded-3xl">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform duration-700">
            <Leaf className="h-20 w-20" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-[10px] font-black uppercase tracking-[.3em] opacity-80">Total Emissions</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black tracking-tighter flex items-baseline gap-2">
               {formatEmission(totalEmissions).split(' ')[0]}
               <span className="text-xl opacity-70 italic">{formatEmission(totalEmissions).split(' ')[1]}</span>
            </div>
            <p className="text-[9px] mt-4 font-black uppercase tracking-widest opacity-60">Inventory period: 2024 CY</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20" />
        </Card>

        {[
          { label: 'Scope 1', color: '#1B5E20', icon: Factory, value: scopeTotals['Scope 1'] },
          { label: 'Scope 2', color: '#00796B', icon: Zap, value: scopeTotals['Scope 2'] },
          { label: 'Scope 3', color: '#8BC34A', icon: Car, value: scopeTotals['Scope 3'] },
        ].map((scope, idx) => (
          <Card key={idx} className="border-none shadow-xl bg-white hover:shadow-2xl transition-all duration-300 rounded-3xl group overflow-hidden">
            <div className="h-1 w-full" style={{ backgroundColor: scope.color }} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
              <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[.2em]">{scope.label}</CardTitle>
              <scope.icon className="h-5 w-5 group-hover:scale-110 transition-transform" style={{ color: scope.color }} />
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-2">
              <div className="text-3xl font-black tabular-nums tracking-tighter" style={{ color: scope.color }}>
                {formatEmission(scope.value || 0)}
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full mt-5 overflow-hidden ring-1 ring-black/5">
                 <div className="h-full transition-all duration-1000 ease-out" style={{ backgroundColor: scope.color, width: `${(scope.value / (totalEmissions || 1)) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assumedCount > 0 && (
        <Card className="border-none shadow-xl bg-orange-50/50 border-l-8 border-l-orange-500 rounded-2xl overflow-hidden ring-1 ring-orange-200">
          <CardContent className="flex items-center gap-6 pt-8 pb-8 px-8">
            <div className="p-4 bg-orange-100 rounded-2xl shadow-inner">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h3 className="font-black text-orange-950 uppercase tracking-tight text-lg">Inventory Integrity Warning</h3>
                <Badge className="bg-orange-500 text-white border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest italic shadow-lg shadow-orange-500/20">LOW FIDELITY</Badge>
              </div>
              <p className="text-sm text-orange-900/70 font-medium">
                <span className="font-black text-orange-950">{assumedCount} critical entries</span> are currently utilizing proxy emission factors. Precise ISO-standard auditing requires direct source verification to maintain compliance status.
              </p>
            </div>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl shadow-xl shadow-orange-600/20">
               Resolve Discrepancies
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analytics Group */}
      <div className="grid gap-10 lg:grid-cols-12">
        <Card className="lg:col-span-4 shadow-2xl border-none bg-white rounded-3xl overflow-hidden ring-1 ring-black/5">
          <CardHeader className="bg-muted/30 border-b border-muted/50 px-8 py-6">
            <CardTitle className="text-xs font-black uppercase text-primary tracking-[.2em] flex items-center gap-3">
              <BarChart3 className="h-5 w-5 opacity-70" /> Structural Composition
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-10 px-8 pb-10 flex flex-col items-center">
            {pieData.length > 0 ? (
              <>
              <div className="h-[260px] w-full relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total</span>
                   <span className="text-2xl font-black text-primary">100%</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={75}
                      outerRadius={100} 
                      paddingAngle={8}
                    >
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip content={<div className="bg-white p-3 shadow-2xl border border-muted/50 rounded-2xl text-[10px] font-black uppercase tracking-widest" />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-8 w-full">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-muted/20 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                      <span className="text-[10px] font-black text-muted-foreground uppercase">{d.name}</span>
                    </div>
                    <span className="font-black text-primary text-xs">{totalEmissions > 0 ? ((d.value/totalEmissions)*100).toFixed(0) : 0}%</span>
                  </div>
                ))}
              </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-xs italic font-medium uppercase tracking-[.2em] opacity-40">No Structural Data</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 shadow-2xl border-none bg-white rounded-3xl overflow-hidden ring-1 ring-black/5">
          <CardHeader className="bg-muted/30 border-b border-muted/50 px-8 py-6 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase text-primary tracking-[.2em] flex items-center gap-3">
              <TrendingUp className="h-5 w-5 opacity-70" /> Strategic Hotspots
            </CardTitle>
            <Badge className="bg-primary/5 text-primary border-primary/20 font-black italic text-[9px] uppercase tracking-widest px-3 py-1 italic">Top Tonnes (tCO2e)</Badge>
          </CardHeader>
          <CardContent className="p-10">
            {barData.length > 0 ? (
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="4 4" horizontal={true} vertical={false} stroke="hsl(var(--muted))" opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      fontSize={10} 
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      tick={{fill: 'currentColor', fontWeight: 900, textTransform: 'uppercase'}}
                    />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--primary))', opacity: 0.05}} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 shadow-2xl border border-primary/10 rounded-2xl">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                              <p className="text-2xl font-black text-primary tabular-nums tracking-tighter">{payload[0].value?.toFixed(2)} <span className="text-xs opacity-50">tco2e</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[360px] items-center justify-center text-muted-foreground text-[10px] italic font-black uppercase tracking-[.3em] opacity-40">Awaiting Hotspot Analysis</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Readiness Log */}
      <Card className="shadow-2xl border-none bg-white rounded-3xl overflow-hidden ring-1 ring-black/5">
        <CardHeader className="bg-muted/30 border-b border-muted/50 px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black font-heading text-primary uppercase tracking-tight">Direct Inventory Registry</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic opacity-60">High-fidelity audit records for reconciliation</CardDescription>
            </div>
            <Button className="bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl shadow-xl shadow-primary/20 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Verification Pack
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
               <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
               <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing Ledger...</span>
            </div>
          ) : entriesList.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
               <div className="p-4 bg-muted/20 rounded-full text-muted-foreground/30"><ListChecks className="w-12 h-12" /></div>
               <p className="text-muted-foreground font-black uppercase tracking-widest text-[11px] italic opacity-40">Clean Audit Slate: No Records</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/10 text-muted-foreground border-b border-muted/30">
                    <th className="px-8 py-5 font-black text-[9px] uppercase tracking-[.2em] text-left">Status</th>
                    <th className="px-8 py-5 font-black text-[9px] uppercase tracking-[.2em] text-left">Internal Chain</th>
                    <th className="px-8 py-5 font-black text-[9px] uppercase tracking-[.2em] text-left">Categorization</th>
                    <th className="px-8 py-5 font-black text-[9px] uppercase tracking-[.2em] text-right">Qty / Input</th>
                    <th className="px-8 py-5 font-black text-[9px] uppercase tracking-[.2em] text-right">GHG Footprint</th>
                    <th className="px-8 py-5 font-black text-[9px] uppercase tracking-[.2em] text-center">Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/10">
                  {entriesList.slice(0, 10).map(e => (
                    <tr key={e.id} className="group hover:bg-primary/5 transition-all duration-300">
                      <td className="px-8 py-6">
                        {e.status === 'verified' ? (
                          <Badge className="bg-white text-primary border border-primary/20 shadow-sm font-black italic text-[9px] uppercase tracking-widest px-3 py-1">Verified</Badge>
                        ) : e.status === 'pending_audit' ? (
                          <Badge className="bg-secondary/10 text-secondary border border-secondary/20 font-black italic text-[9px] uppercase tracking-widest px-3 py-1 shadow-sm">Audit Queue</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest italic text-muted-foreground border-muted/50 px-3 py-1">Local Draft</Badge>
                        )}
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col">
                            <span className="font-black text-primary italic uppercase tracking-tighter text-sm underline underline-offset-4 decoration-primary/20">{e.scope}</span>
                            <span className="text-[9px] font-black text-muted-foreground opacity-40 uppercase tracking-widest mt-1">Tier 1 Stream</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-primary/80 uppercase tracking-tight text-xs">{e.category}</span>
                          <span className="text-[10px] text-muted-foreground font-black italic mt-0.5 truncate max-w-[180px]">
                            {e.activity_type}
                            {e.is_assumed_factor && <span className="text-orange-600 font-black ml-1">[PROXY APPLIED]</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-muted-foreground tabular-nums opacity-60">
                        {e.quantity.toLocaleString()} <span className="text-[9px] uppercase">{e.unit}</span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-primary text-base tabular-nums tracking-tighter">
                        {formatEmission(e.emission_kgco2e || 0)}
                      </td>
                      <td className="px-8 py-6 flex justify-center">
                        <div className="flex flex-col items-center gap-1.5 bg-muted/20 px-4 py-1.5 rounded-xl border border-muted/50">
                           <div className={cn(
                             "w-2.5 h-2.5 rounded-full shadow-inner",
                             e.data_quality === 'High' ? "bg-primary" : e.data_quality === 'Medium' ? "bg-secondary" : "bg-orange-500"
                           )} />
                           <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{e.data_quality} Confidence</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between p-8 bg-black/5 rounded-[2.5rem] border border-black/5 shadow-inner">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-white/50 rounded-2xl shadow-xl"><ShieldCheck className="w-8 h-8 text-primary" /></div>
            <div>
               <p className="text-sm font-black text-primary uppercase tracking-[.2em] mb-1">Authenticated Assurance Stream</p>
               <p className="text-[11px] text-muted-foreground font-medium italic max-w-xl leading-relaxed">System metrics are recalculated in real-time. All data presented in this dashboard is subject to the Maker-Checker workflow prior to formal sustainability disclosure.</p>
            </div>
         </div>
         <Button variant="ghost" className="font-black text-[10px] uppercase tracking-[.4em] text-primary/40 hover:text-primary transition-colors">
            System Diagnostics 
         </Button>
      </div>
    </div>
  );
}

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

import { useActivityEntries } from '@/hooks/useActivityEntries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEmission } from '@/lib/calculation-engine';
import { SCOPE_COLORS } from '@/lib/constants';
import { BarChart3, TrendingUp, Leaf, AlertTriangle, Zap, Car, Factory, ShieldCheck, Timer } from 'lucide-react';
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

  const chartConfig = {
    value: { label: 'Emissions (tCO2e)', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-primary">Operational Overview</h1>
          <p className="text-muted-foreground text-lg italic mt-1 font-medium">Sustainability Precision • Audit-Ready Inventory</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white px-3 py-1 flex items-center gap-2 border-primary/20 shadow-sm">
            <Timer className="w-4 h-4 text-primary" />
            <span className="font-semibold">{pendingAuditCount} Pending Reviews</span>
          </Badge>
          <Badge variant="outline" className="bg-white px-3 py-1 flex items-center gap-2 border-primary/20 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-semibold italic">ISO 14064 Compliant</span>
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-none shadow-xl bg-primary text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Leaf className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-widest font-heading">Total Emissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatEmission(totalEmissions)}</div>
            <p className="text-xs mt-2 opacity-70">Inventory period: 2024 CY</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#1B5E20] shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Scope 1</CardTitle>
            <Factory className="h-4 w-4 text-[#1B5E20]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#1B5E20]">{formatEmission(scopeTotals['Scope 1'] || 0)}</div>
            <div className="w-full bg-muted h-1 rounded-full mt-3 overflow-hidden">
               <div className="bg-[#1B5E20] h-full" style={{ width: `${(scopeTotals['Scope 1'] / (totalEmissions || 1)) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#00796B] shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Scope 2</CardTitle>
            <Zap className="h-4 w-4 text-[#00796B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#00796B]">{formatEmission(scopeTotals['Scope 2'] || 0)}</div>
            <div className="w-full bg-muted h-1 rounded-full mt-3 overflow-hidden">
               <div className="bg-[#00796B] h-full" style={{ width: `${(scopeTotals['Scope 2'] / (totalEmissions || 1)) * 100}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#8BC34A] shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Scope 3</CardTitle>
            <Car className="h-4 w-4 text-[#8BC34A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#8BC34A]">{formatEmission(scopeTotals['Scope 3'] || 0)}</div>
            <div className="w-full bg-muted h-1 rounded-full mt-3 overflow-hidden">
               <div className="bg-[#8BC34A] h-full" style={{ width: `${(scopeTotals['Scope 3'] / (totalEmissions || 1)) * 100}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {assumedCount > 0 && (
        <Card className="border-none shadow-md bg-white border-l-4 border-l-orange-500">
          <CardContent className="flex items-center gap-4 pt-6 pb-6">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-orange-900 flex items-center gap-2">
                Action Required: Data Quality Warning
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-none px-2 py-0 text-[10px] uppercase font-bold">Low Fidelity</Badge>
              </p>
              <p className="text-sm text-orange-700/80">
                {assumedCount} entries are currently utilizing calculated fallback factors. High-precision auditing requires source verification.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Group */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 shadow-sm border-muted/20">
          <CardHeader>
            <CardTitle className="text-lg font-heading tracking-tight flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Emission Structure
            </CardTitle>
            <CardDescription>Relative contribution by GHG Scope</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center flex-col items-center">
            {pieData.length > 0 ? (
              <>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60}
                      outerRadius={80} 
                      paddingAngle={5}
                    >
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 w-full text-xs">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="font-bold">{d.name}:</span>
                    <span className="text-muted-foreground">{totalEmissions > 0 ? ((d.value/totalEmissions)*100).toFixed(0) : 0}%</span>
                  </div>
                ))}
              </div>
              </>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">No inventory data available.</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-muted/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-heading tracking-tight flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Key Emission Drivers
              </CardTitle>
              <CardDescription>Top activity categories (tonnes CO2e)</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      fontSize={11} 
                      width={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted))', opacity: 0.1}} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 shadow-lg border border-border rounded-md text-xs">
                              <p className="font-bold">{payload[0].payload.name}</p>
                              <p className="text-primary font-bold">{payload[0].value?.toFixed(2)} tCO2e</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm italic">Initialize data input to view top drivers.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Readiness Log */}
      <Card className="shadow-sm border-muted/20">
        <CardHeader className="border-b border-muted/10 bg-muted/5">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-heading tracking-tight">Direct Data Inventory</CardTitle>
              <CardDescription>Comprehensive audit-ready emission record log</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="font-bold border-primary/20 hover:bg-primary/5">
              Export Audit Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 text-center text-muted-foreground">Synchronizing with audit records...</div>
          ) : entriesList.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground italic">Clean Slate: No activity entries currently recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground border-b text-left">
                    <th className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider">Scope Class</th>
                    <th className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider">Activity Category</th>
                    <th className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider text-right">Qty / Input</th>
                    <th className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider text-right">GHG Impact</th>
                    <th className="px-6 py-3 font-semibold text-[10px] uppercase tracking-wider">Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/10">
                  {entriesList.slice(0, 10).map(e => (
                    <tr key={e.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4">
                        {e.status === 'verified' ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px]">Verified</Badge>
                        ) : e.status === 'pending_audit' ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px]">Pending</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">Draft</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold italic text-primary/80">{e.scope}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{e.category}</span>
                          <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                            {e.activity_type}
                            {e.is_assumed_factor && <span className="text-orange-600 font-bold tracking-tighter">[!]</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-muted-foreground">
                        {e.quantity} {e.unit}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {formatEmission(e.emission_kgco2e || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                           <div className={cn(
                             "w-2 h-2 rounded-full",
                             e.data_quality === 'High' ? "bg-primary" : e.data_quality === 'Medium' ? "bg-secondary" : "bg-orange-400"
                           )} />
                           <span className="text-[11px] font-medium">{e.data_quality}</span>
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
    </div>
  );
}

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

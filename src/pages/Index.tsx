import { useActivityEntries } from '@/hooks/useActivityEntries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatEmission } from '@/lib/calculation-engine';
import { SCOPE_COLORS } from '@/lib/constants';
import { BarChart3, TrendingUp, Leaf, AlertTriangle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { data: entries, isLoading } = useActivityEntries();

  const scopeTotals = (entries ?? []).reduce((acc, e) => {
    acc[e.scope] = (acc[e.scope] || 0) + (e.emission_kgco2e || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalEmissions = Object.values(scopeTotals).reduce((a, b) => a + b, 0);

  const pieData = Object.entries(scopeTotals).map(([scope, value]) => ({
    name: scope,
    value,
    fill: SCOPE_COLORS[scope] || 'hsl(var(--muted))',
  }));

  const categoryTotals = (entries ?? []).reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.emission_kgco2e || 0);
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  const assumedCount = (entries ?? []).filter(e => e.is_assumed_factor).length;

  const chartConfig = {
    value: { label: 'Emissions', color: 'hsl(var(--primary))' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Emissions Dashboard</h1>
        <p className="text-muted-foreground">Overview of your greenhouse gas emissions inventory</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEmission(totalEmissions)}</div>
          </CardContent>
        </Card>
        {['Scope 1', 'Scope 2', 'Scope 3'].map(scope => (
          <Card key={scope}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{scope}</CardTitle>
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: SCOPE_COLORS[scope] }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatEmission(scopeTotals[scope] || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {totalEmissions > 0 ? `${(((scopeTotals[scope] || 0) / totalEmissions) * 100).toFixed(1)}%` : '0%'} of total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {assumedCount > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-warning" style={{ color: 'hsl(38, 92%, 50%)' }} />
            <div>
              <p className="font-medium">Assumed Factors</p>
              <p className="text-sm text-muted-foreground">
                {assumedCount} entries use fallback emission factors. Review in Data Entry.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Emissions by Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="mx-auto h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No data yet. Start by adding activity entries.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Top Emission Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No data yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (entries ?? []).length === 0 ? (
            <p className="text-muted-foreground">No entries yet. Go to Data Entry to add your first emission activity.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Date</th>
                    <th className="pb-2 text-left font-medium">Scope</th>
                    <th className="pb-2 text-left font-medium">Category</th>
                    <th className="pb-2 text-left font-medium">Activity</th>
                    <th className="pb-2 text-right font-medium">Quantity</th>
                    <th className="pb-2 text-right font-medium">Emissions</th>
                    <th className="pb-2 text-left font-medium">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {(entries ?? []).slice(0, 10).map(e => (
                    <tr key={e.id} className="border-b">
                      <td className="py-2">{new Date(e.entry_date).toLocaleDateString()}</td>
                      <td><Badge variant="outline">{e.scope}</Badge></td>
                      <td>{e.category}</td>
                      <td>
                        {e.activity_type}
                        {e.is_assumed_factor && (
                          <Badge variant="secondary" className="ml-1 text-xs" style={{ color: 'hsl(38, 92%, 50%)' }}>Assumed</Badge>
                        )}
                      </td>
                      <td className="text-right">{e.quantity} {e.unit}</td>
                      <td className="text-right font-medium">{formatEmission(e.emission_kgco2e || 0)}</td>
                      <td><Badge variant="outline">{e.data_quality}</Badge></td>
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

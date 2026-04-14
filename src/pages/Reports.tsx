import { useActivityEntries } from '@/hooks/useActivityEntries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEmission } from '@/lib/calculation-engine';
import { SCOPE_CATEGORIES, SCOPE_COLORS } from '@/lib/constants';
import { FileText, Download, BarChart3 } from 'lucide-react';

export default function Reports() {
  const { data: entries } = useActivityEntries();

  const scopeTotals = (entries ?? []).reduce((acc, e) => {
    acc[e.scope] = (acc[e.scope] || 0) + (e.emission_kgco2e || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalEmissions = Object.values(scopeTotals).reduce((a, b) => a + b, 0);

  // Scope 3 category breakdown
  const scope3ByCategory = (entries ?? [])
    .filter(e => e.scope === 'Scope 3')
    .reduce((acc, e) => {
      const cat = e.scope_category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + (e.emission_kgco2e || 0);
      return acc;
    }, {} as Record<string, number>);

  const exportCSV = () => {
    if (!entries || entries.length === 0) return;
    const headers = ['Date', 'Scope', 'Scope Category', 'Category', 'Activity Type', 'Quantity', 'Unit', 'Emission (kgCO2e)', 'Data Quality', 'Assumed Factor'];
    const rows = entries.map(e => [
      e.entry_date, e.scope, e.scope_category || '', e.category, e.activity_type,
      e.quantity, e.unit, e.emission_kgco2e || 0, e.data_quality || '', e.is_assumed_factor ? 'Yes' : 'No'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghg-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Disclosure</h1>
          <p className="text-muted-foreground">ISO 14064 & GHG Protocol aligned reporting</p>
        </div>
        <Button onClick={exportCSV} disabled={!entries?.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* GHG Protocol Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> GHG Protocol Inventory Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Scope</th>
                  <th className="pb-2 text-right font-medium">Emissions (kgCO₂e)</th>
                  <th className="pb-2 text-right font-medium">Emissions (tCO₂e)</th>
                  <th className="pb-2 text-right font-medium">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {['Scope 1', 'Scope 2', 'Scope 3'].map(scope => (
                  <tr key={scope} className="border-b">
                    <td className="py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: SCOPE_COLORS[scope] }} />
                        {scope}
                      </div>
                    </td>
                    <td className="text-right">{(scopeTotals[scope] || 0).toLocaleString()}</td>
                    <td className="text-right">{((scopeTotals[scope] || 0) / 1000).toFixed(2)}</td>
                    <td className="text-right">
                      {totalEmissions > 0 ? `${(((scopeTotals[scope] || 0) / totalEmissions) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-3">Total</td>
                  <td className="text-right">{totalEmissions.toLocaleString()}</td>
                  <td className="text-right">{(totalEmissions / 1000).toFixed(2)}</td>
                  <td className="text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Scope 3 Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Scope 3 Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(scope3ByCategory).length === 0 ? (
            <p className="text-muted-foreground">No Scope 3 data recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {SCOPE_CATEGORIES['Scope 3'].map(cat => {
                const val = scope3ByCategory[cat.code] || 0;
                const scope3Total = scopeTotals['Scope 3'] || 1;
                return (
                  <div key={cat.code} className="flex items-center gap-4">
                    <div className="w-8 text-xs text-muted-foreground">{cat.code}</div>
                    <div className="flex-1">
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{cat.name}</span>
                        <span className="font-medium">{formatEmission(val)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${(val / scope3Total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

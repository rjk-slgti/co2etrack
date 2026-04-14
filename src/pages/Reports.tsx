import { useActivityEntries } from '@/hooks/useActivityEntries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEmission } from '@/lib/calculation-engine';
import { SCOPE_CATEGORIES, SCOPE_COLORS } from '@/lib/constants';
import { FileText, Download, BarChart3, Printer, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Reports() {
  const { data: entries } = useActivityEntries();

  const entriesList = entries ?? [];

  const scopeTotals = entriesList.reduce((acc, e) => {
    acc[e.scope] = (acc[e.scope] || 0) + (e.emission_kgco2e || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalEmissions = Object.values(scopeTotals).reduce((a, b) => a + b, 0);

  // Scope 3 category breakdown
  const scope3ByCategory = entriesList
    .filter(e => e.scope === 'Scope 3')
    .reduce((acc, e) => {
      const cat = e.scope_category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + (e.emission_kgco2e || 0);
      return acc;
    }, {} as Record<string, number>);

  const exportCSV = () => {
    if (!entriesList.length) return;
    const headers = ['Date', 'Scope', 'Scope Category', 'Category', 'Activity Type', 'Quantity', 'Unit', 'Emission (kgCO2e)', 'Data Quality', 'Assumed Factor'];
    const rows = entriesList.map(e => [
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-primary uppercase tracking-tight">Disclosure & Reports</h1>
          <p className="text-muted-foreground font-medium italic">Compliant with ISO 14064-1 & GHG Protocol Standards</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="font-bold border-primary/20">
            <Printer className="mr-2 h-4 w-4" /> Print PDF
          </Button>
          <Button size="sm" onClick={exportCSV} disabled={!entriesList.length} className="font-bold bg-primary">
            <Download className="mr-2 h-4 w-4" /> Export (.csv)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Report Body */}
        <div className="lg:col-span-3 space-y-8 print:col-span-4">
          
          {/* Summary Table */}
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="bg-primary pt-6 pb-6 rounded-t-lg">
              <CardTitle className="text-white flex items-center gap-2 font-heading tracking-tight uppercase">
                <FileText className="h-5 w-5 opacity-80" /> Operational GHG Statement
              </CardTitle>
              <CardDescription className="text-white/80 italic font-medium">Reporting Period: Jan 2024 - Dec 2024</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="pb-4 text-left font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Emissions Class (Scope)</th>
                      <th className="pb-4 text-right font-bold uppercase tracking-wider text-[10px] text-muted-foreground">kgCO₂e (Gross)</th>
                      <th className="pb-4 text-right font-bold uppercase tracking-wider text-[10px] text-muted-foreground">tCO₂e (Net)</th>
                      <th className="pb-4 text-right font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Relative Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/10">
                    {['Scope 1', 'Scope 2', 'Scope 3'].map(scope => (
                      <tr key={scope} className="hover:bg-muted/5">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-1 rounded-full" style={{ backgroundColor: SCOPE_COLORS[scope] }} />
                            <span className="font-bold text-primary italic">{scope}</span>
                          </div>
                        </td>
                        <td className="text-right tabular-nums">{(scopeTotals[scope] || 0).toLocaleString()}</td>
                        <td className="text-right tabular-nums font-bold">{((scopeTotals[scope] || 0) / 1000).toFixed(3)}</td>
                        <td className="text-right tabular-nums text-muted-foreground font-medium">
                          {totalEmissions > 0 ? `${(((scopeTotals[scope] || 0) / totalEmissions) * 100).toFixed(1)}%` : '0%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-primary/20 bg-muted/20 font-black">
                      <td className="py-5 px-4 font-heading uppercase text-primary">Total Inventory</td>
                      <td className="text-right pr-4 italic">{totalEmissions.toLocaleString()}</td>
                      <td className="text-right pr-4 text-primary text-xl">{(totalEmissions / 1000).toFixed(3)}</td>
                      <td className="text-right pr-4">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed breakdown per scope category */}
          <Card className="shadow-sm border-none bg-white">
            <CardHeader className="bg-secondary/10 border-b border-muted/20">
              <CardTitle className="text-secondary flex items-center gap-2 font-heading tracking-tight uppercase text-lg">
                <BarChart3 className="h-5 w-5" /> Scope 3 Categorization Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {Object.keys(scope3ByCategory).length === 0 ? (
                <p className="text-muted-foreground text-center py-10 italic">No downstream/upstream activities recorded for this period.</p>
              ) : (
                <div className="space-y-6">
                  {SCOPE_CATEGORIES['Scope 3'].map(cat => {
                    const val = scope3ByCategory[cat.code] || 0;
                    const scope3Total = scopeTotals['Scope 3'] || 1;
                    const percentage = (val / scope3Total) * 100;
                    return (
                      <div key={cat.code} className="group">
                        <div className="mb-2 flex justify-between items-end">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{cat.code}</span>
                            <span className="font-bold text-sm group-hover:text-primary transition-colors">{cat.name}</span>
                          </div>
                          <div className="text-right">
                             <span className="font-black text-primary text-sm">{formatEmission(val)}</span>
                             <span className="text-[10px] text-muted-foreground block font-bold leading-none">{percentage.toFixed(1)}% of Scope 3</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
           <Card className="bg-muted/10 border-none shadow-none">
             <CardHeader className="pb-2">
               <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                 <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Verified Standards
               </CardTitle>
             </CardHeader>
             <CardContent className="text-xs space-y-3 font-medium">
               <div className="p-2 bg-white rounded border border-muted/40 shadow-sm flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                 ISO 14064-1:2018
               </div>
               <div className="p-2 bg-white rounded border border-muted/40 shadow-sm flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                 GHG Protocol Corporate
               </div>
               <div className="p-2 bg-white rounded border border-muted/40 shadow-sm flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                 IPCC Fifth Assessment
               </div>
               <hr className="my-4 border-muted/30" />
               <p className="text-[10px] text-muted-foreground mt-4 italic">
                 Reports are generated based on the boundary defined in the organization settings.
               </p>
             </CardContent>
           </Card>

           <Card className="bg-secondary/5 border border-secondary/20 shadow-none overflow-hidden">
              <div className="p-4 flex flex-col items-center text-center">
                 <Printer className="w-8 h-8 text-secondary mb-2 opacity-50" />
                 <h4 className="font-bold text-sm">Official Statement</h4>
                 <p className="text-[10px] text-muted-foreground mt-1">Generate a high-resolution PDF for regulatory disclosure.</p>
                 <Button variant="ghost" className="mt-4 text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1">
                   View Template <ExternalLink className="w-3 h-3" />
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

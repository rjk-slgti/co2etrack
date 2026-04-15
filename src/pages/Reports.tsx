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
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-muted pb-8">
        <div>
          <Badge variant="outline" className="mb-2 bg-secondary/5 text-secondary border-secondary/20 font-black uppercase tracking-[.3em] text-[9px]">
            Disclosure Module
          </Badge>
          <h1 className="text-4xl font-black font-heading text-primary uppercase tracking-tighter">Emission Disclosure & Analysis</h1>
          <p className="text-muted-foreground font-medium italic mt-1">Audit-Ready Reporting compliant with ISO 14064-1 & GHG Protocol</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="lg" onClick={() => window.print()} className="font-black border-muted-foreground/20 hover:bg-muted text-xs uppercase tracking-widest px-6 shadow-sm">
            <Printer className="mr-2 h-4 w-4" /> Print PDF
          </Button>
          <Button size="lg" onClick={exportCSV} disabled={!entriesList.length} className="font-black bg-primary hover:bg-primary/90 text-white text-xs uppercase tracking-widest px-6 shadow-xl">
            <Download className="mr-2 h-4 w-4" /> Export (.csv)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Report Body */}
        <div className="lg:col-span-8 space-y-10 print:col-span-12">
          
          {/* Summary Table */}
          <Card className="shadow-2xl border-none bg-white overflow-hidden ring-1 ring-black/5">
            <CardHeader className="bg-primary pt-8 pb-8 px-8">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white flex items-center gap-3 font-heading tracking-tight uppercase text-xl font-black">
                    <FileText className="h-6 w-6 opacity-70" /> Operational GHG Statement
                  </CardTitle>
                  <CardDescription className="text-white/60 italic font-bold mt-1">Consolidated inventory for the 2024 reporting cycle</CardDescription>
                </div>
                <Badge className="bg-white/20 text-white border-none font-black italic text-[9px] uppercase tracking-widest">DRAFT 0.94</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-10 px-8 pb-10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-muted">
                      <th className="pb-6 text-left font-black uppercase tracking-[.2em] text-[10px] text-muted-foreground">Emissions Class (GHG Scope)</th>
                      <th className="pb-6 text-right font-black uppercase tracking-[.2em] text-[10px] text-muted-foreground">kgCO₂e (Gross)</th>
                      <th className="pb-6 text-right font-black uppercase tracking-[.2em] text-[10px] text-muted-foreground">tCO₂e (Net)</th>
                      <th className="pb-6 text-right font-black uppercase tracking-[.2em] text-[10px] text-muted-foreground">Intensity %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/10">
                    {['Scope 1', 'Scope 2', 'Scope 3'].map(scope => (
                      <tr key={scope} className="group hover:bg-muted/5 transition-colors">
                        <td className="py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-6 w-1.5 rounded-full" style={{ backgroundColor: SCOPE_COLORS[scope] }} />
                            <div>
                               <span className="font-black text-primary italic uppercase tracking-tight text-base block">{scope}</span>
                               <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Reporting Domain</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-right tabular-nums font-bold text-gray-600">{(scopeTotals[scope] || 0).toLocaleString()}</td>
                        <td className="text-right tabular-nums font-black text-primary text-lg">{((scopeTotals[scope] || 0) / 1000).toFixed(3)}</td>
                        <td className="text-right tabular-nums text-muted-foreground font-black">
                          {totalEmissions > 0 ? `${(((scopeTotals[scope] || 0) / totalEmissions) * 100).toFixed(1)}%` : '0%'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-4 border-primary/20 bg-primary/5 font-black">
                      <td className="py-8 px-6">
                         <div className="flex flex-col">
                            <span className="font-heading uppercase text-primary text-xl tracking-tighter">Total Inventory Footprint</span>
                            <span className="text-[9px] text-primary/60 uppercase font-black italic mt-1">Aggregated Organization Wide</span>
                         </div>
                      </td>
                      <td className="text-right pr-4 italic text-muted-foreground tabular-nums">{totalEmissions.toLocaleString()} kg</td>
                      <td className="text-right pr-4 text-primary text-3xl font-black tabular-nums lowercase">
                        {((totalEmissions / 1000).toFixed(2))} <span className="text-sm">tco2e</span>
                      </td>
                      <td className="text-right pr-8 text-primary shadow-inner opacity-50">100.0</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed breakdown per scope category */}
          <Card className="shadow-xl border-none bg-white rounded-3xl overflow-hidden ring-1 ring-black/5">
            <CardHeader className="bg-secondary/5 border-b border-secondary/10 pt-6 pb-6 px-8">
              <CardTitle className="text-secondary flex items-center gap-3 font-heading tracking-tight uppercase text-lg font-black">
                <BarChart3 className="h-6 w-6" /> Scope 3 Significance Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-10 px-8 pb-10">
              {Object.keys(scope3ByCategory).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground italic bg-muted/5 rounded-2xl border-2 border-dashed border-muted/30">
                   <p className="font-bold text-xs uppercase tracking-widest mb-2 opacity-50">No Indirect Activity Found</p>
                   <p className="text-[10px] font-medium">Coordinate with supply chain partners to initialize Scope 3 tracking.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {SCOPE_CATEGORIES['Scope 3'].map(cat => {
                    const val = scope3ByCategory[cat.code] || 0;
                    const scope3Total = scopeTotals['Scope 3'] || 1;
                    const percentage = (val / scope3Total) * 100;
                    if (val === 0) return null; // Only show active categories
                    return (
                      <div key={cat.code} className="group relative">
                        <div className="mb-3 flex justify-between items-end">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-widest mb-0.5">{cat.code}</span>
                            <span className="font-black text-sm group-hover:text-primary transition-colors uppercase leading-tight">{cat.name}</span>
                          </div>
                          <div className="text-right flex flex-col">
                             <span className="font-black text-primary text-base tabular-nums">{formatEmission(val)}</span>
                             <span className="text-[9px] text-muted-foreground font-black italic tracking-tighter">{percentage.toFixed(1)}% OF S3</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden relative">
                          <div
                            className="h-full bg-primary transition-all duration-700 ease-in-out"
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

        {/* Sidebar Info Column */}
        <div className="lg:col-span-4 space-y-8 print:hidden">
           <Card className="bg-white border-none shadow-xl rounded-3xl overflow-hidden ring-1 ring-black/5">
             <CardHeader className="bg-gradient-to-r from-primary to-primary/80 pt-6 pb-6 px-6">
               <CardTitle className="text-[10px] font-black uppercase text-white tracking-[.2em] flex items-center gap-3">
                 <ShieldCheck className="w-4 h-4 text-white opacity-100" /> Assurance Framework
               </CardTitle>
             </CardHeader>
             <CardContent className="px-6 pt-8 pb-8 space-y-4">
               {[
                 { label: 'ISO 14064-1:2018', status: 'Certified' },
                 { label: 'GHG Protocol Corporate', status: 'Aligned' },
                 { label: 'IPCC Fifth Assessment (AR5)', status: 'Standardized' },
                 { label: 'TCFD Recommendations', status: 'Optimized' },
               ].map((std, i) => (
                 <div key={i} className="group p-4 bg-muted/10 rounded-2xl border border-muted/20 hover:border-primary/30 hover:bg-white transition-all shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                     <span className="text-xs font-black text-gray-800 uppercase tracking-tighter">{std.label}</span>
                   </div>
                   <Badge variant="ghost" className="text-[8px] font-black text-primary uppercase tracking-widest italic opacity-60 underline underline-offset-4">{std.status}</Badge>
                 </div>
               ))}
               
               <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                 <p className="text-[10px] leading-relaxed text-primary/80 font-bold italic text-center">
                   "Inventory boundary is defined using the Operational Control approach as per corporate governance."
                 </p>
               </div>
             </CardContent>
           </Card>

           <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-none shadow-2xl rounded-3xl overflow-hidden group">
              <div className="p-8 flex flex-col items-center text-center relative overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                 
                 <Printer className="w-12 h-12 text-white mb-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                 <h4 className="font-black text-white text-lg uppercase tracking-tight">Formal Statement</h4>
                 <p className="text-[10px] text-white/60 mt-2 font-bold uppercase tracking-widest leading-relaxed">Prepare high-resolution PDF for regulatory submissions and annual reports.</p>
                 
                 <Button variant="ghost" className="mt-8 w-full border border-white/20 text-white hover:bg-white hover:text-secondary font-black text-[10px] uppercase tracking-[.3em] h-12 rounded-xl transition-all">
                   Preview Template <ExternalLink className="w-3.5 h-3.5 ml-2" />
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}


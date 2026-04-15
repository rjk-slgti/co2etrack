import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmissionFactorHeaders, useEmissionFactorValues } from '@/hooks/useEmissionFactors';
import { EMISSION_CATEGORIES, FACTOR_SOURCES } from '@/lib/constants';
import { Database, Lock, Search, Filter } from 'lucide-react';

export default function EmissionFactors() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: headers, isLoading } = useEmissionFactorHeaders();

  const filtered = (headers ?? []).filter(h => {
    if (categoryFilter !== 'all' && h.category !== categoryFilter) return false;
    if (sourceFilter !== 'all' && h.source !== sourceFilter) return false;
    if (search && !h.activity_type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-muted pb-8">
        <div>
          <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-[.3em] text-[9px]">
            Master Data Repository
          </Badge>
          <h1 className="text-4xl font-black font-heading text-primary uppercase tracking-tighter">Emission Factor Database</h1>
          <p className="text-muted-foreground font-medium italic mt-1">Governed registry of benchmarks derived from official GHG sources</p>
        </div>
        <div className="flex items-center gap-4 bg-muted/20 px-6 py-3 rounded-2xl border border-muted/50">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Benchmarks</span>
              <span className="text-xl font-black text-primary tabular-nums">{(headers ?? []).length}</span>
           </div>
           <div className="w-px h-8 bg-muted-foreground/20" />
           <Database className="h-8 w-8 text-primary/40" />
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="shadow-xl border-none bg-white rounded-3xl overflow-hidden ring-1 ring-black/5">
        <CardContent className="flex flex-wrap gap-6 pt-8 pb-8 px-8 items-end">
          <div className="flex-1 min-w-[300px] space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Search Identifier</Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
              <Input 
                className="pl-11 h-12 bg-muted/30 border-none font-bold placeholder:font-medium placeholder:text-muted-foreground/50 focus-visible:ring-primary rounded-xl" 
                placeholder="e.g. Electricity, Natural Gas, Diesel..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Activity Group</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] h-12 bg-muted/30 border-none font-bold rounded-xl text-primary">
                <Filter className="mr-2 h-4 w-4 opacity-50" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-bold">All Categories</SelectItem>
                {EMISSION_CATEGORIES.map(c => <SelectItem key={c} value={c} className="font-medium">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Methodology Source</Label>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px] h-12 bg-muted/30 border-none font-bold rounded-xl text-primary">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-bold">All Sources</SelectItem>
                {FACTOR_SOURCES.map(s => <SelectItem key={s} value={s} className="font-medium">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Database Table */}
      <Card className="shadow-2xl border-none bg-white rounded-3xl overflow-hidden ring-1 ring-black/5">
        <CardContent className="pt-0 px-0">
          {isLoading ? (
            <div className="p-32 flex flex-col items-center justify-center text-muted-foreground">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4" />
               <p className="font-black uppercase tracking-widest text-[10px]">Retrieving Encrypted Registry...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-32 text-center">
              <div className="p-4 bg-muted/10 w-fit mx-auto rounded-full mb-6 text-muted-foreground/30">
                 <Search className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-black text-primary uppercase tracking-tight">No Matching Benchmarks</h3>
              <p className="text-muted-foreground font-medium italic mt-2">Refine your search parameters or request a new benchmark for inclusion.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-muted/50">
                    <th className="py-6 px-8 text-left font-black uppercase tracking-[.2em] text-[10px] text-muted-foreground">Activity Description</th>
                    <th className="py-6 px-4 text-left font-black uppercase tracking-[.2em] text-[10px] text-muted-foreground">Category</th>
                    <th className="py-6 px-4 text-left font-black uppercase tracking-[.2em] text-[10px] text-muted-foreground">Region</th>
                    <th className="py-6 px-4 text-left font-black uppercase tracking-[.2em] text-[10px] text-muted-foreground">Methodology Source</th>
                    <th className="py-6 px-4 text-left font-black uppercase tracking-[.2em] text-[10px] text-muted-foreground">Effective Cycle</th>
                    <th className="py-6 px-8 text-right font-black uppercase tracking-[.2em] text-[10px] text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/10">
                  {filtered.map(h => (
                    <tr key={h.id} className="group hover:bg-primary/5 transition-all duration-300">
                      <td className="py-6 px-8">
                         <div className="flex flex-col">
                            <span className="font-black text-primary uppercase tracking-tight text-base group-hover:translate-x-1 transition-transform">{h.activity_type}</span>
                            <span className="text-[9px] text-muted-foreground font-black uppercase opacity-60 mt-0.5 tracking-widest">Inventory Benchmark</span>
                         </div>
                      </td>
                      <td className="px-4">
                         <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase italic px-2 py-0.5 shadow-sm">
                           {h.category}
                         </Badge>
                      </td>
                      <td className="px-4 font-bold text-muted-foreground uppercase tracking-tighter text-xs">{h.region}</td>
                      <td className="px-4">
                        <div className="flex flex-col">
                           <span className="font-black text-xs text-primary/80 uppercase tracking-tight">{h.source}</span>
                           <span className="text-[10px] font-bold text-muted-foreground italic">V{h.source_version || '2024.1'}</span>
                        </div>
                      </td>
                      <td className="px-4">
                         <div className="bg-muted/20 px-3 py-1.5 rounded-lg border border-muted/50 inline-flex flex-col items-center">
                            <span className="text-[9px] font-black text-muted-foreground uppercase leading-none mb-1">Validity</span>
                            <span className="text-[10px] font-black text-primary tabular-nums">
                               {h.valid_from ? new Date(h.valid_from).getFullYear() : '2024'}
                               {h.valid_to ? ` – ${new Date(h.valid_to).getFullYear()}` : ' +'}
                            </span>
                         </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        {h.is_locked ? (
                          <Badge className="bg-gray-100 text-gray-500 border-none gap-2 font-black uppercase italic text-[9px] px-3 py-1 shadow-sm">
                            <Lock className="h-3 w-3" /> Immutably Locked
                          </Badge>
                        ) : (
                          <Badge className="bg-primary text-white border-none gap-2 font-black uppercase italic text-[9px] px-3 py-1 shadow-lg">
                            <ShieldCheck className="h-3 w-3" /> System Active
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex items-center gap-3 p-6 bg-primary/5 rounded-3xl border border-primary/20">
         <div className="p-2 bg-primary/10 rounded-full"><Lock className="w-5 h-5 text-primary" /></div>
         <div>
            <p className="text-xs font-black text-primary uppercase tracking-widest">Data Integrity Guarantee</p>
            <p className="text-[10px] text-muted-foreground font-medium italic mt-0.5">Emission factors are periodically synchronized with IPCC and regional environmental agencies. Locked factors cannot be modified once applied to verified entries.</p>
         </div>
      </div>
    </div>
  );
}


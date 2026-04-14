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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emission Factors</h1>
          <p className="text-muted-foreground">Governed emission factor database with multi-source support</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Database className="h-3 w-3" />
          {(headers ?? []).length} factors
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search activity types..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EMISSION_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {FACTOR_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading factors...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">No emission factors found. Seed data will be loaded by an admin.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Activity Type</th>
                    <th className="pb-2 text-left font-medium">Category</th>
                    <th className="pb-2 text-left font-medium">Region</th>
                    <th className="pb-2 text-left font-medium">Source</th>
                    <th className="pb-2 text-left font-medium">Version</th>
                    <th className="pb-2 text-left font-medium">Valid</th>
                    <th className="pb-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(h => (
                    <tr key={h.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 font-medium">{h.activity_type}</td>
                      <td><Badge variant="secondary">{h.category}</Badge></td>
                      <td>{h.region}</td>
                      <td>
                        <Badge variant="outline">{h.source}</Badge>
                      </td>
                      <td className="text-muted-foreground">{h.source_version || '—'}</td>
                      <td className="text-muted-foreground text-xs">
                        {h.valid_from ? new Date(h.valid_from).getFullYear() : '—'}
                        {h.valid_to ? `–${new Date(h.valid_to).getFullYear()}` : ''}
                      </td>
                      <td>
                        {h.is_locked ? (
                          <Badge variant="secondary" className="gap-1"><Lock className="h-3 w-3" /> Locked</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
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
    </div>
  );
}

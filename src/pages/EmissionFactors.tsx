import { type ReactNode, useDeferredValue, useMemo, useState } from 'react';
import { Database, Plus, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateCustomFactor, useCustomFactors } from '@/hooks/useCustomFactors';
import { useEmissionFactorHeaders } from '@/hooks/useEmissionFactors';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import { DATA_QUALITY_OPTIONS, EMISSION_CATEGORIES, GWP_SETS } from '@/lib/constants';

export default function EmissionFactors() {
  const { settings } = useWorkspaceSettings();
  const { toast } = useToast();
  const { data: officialHeaders } = useEmissionFactorHeaders();
  const { data: customFactors } = useCustomFactors(settings.selectedOrganizationId);
  const createCustomFactor = useCreateCustomFactor();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [customForm, setCustomForm] = useState({
    scope: 'Scope 3',
    category: 'Transport',
    activity_type: '',
    unit: 'km',
    emission_factor: '',
    source: 'Organization Specific',
    gwp_set: 'AR6',
    data_quality: 'Medium',
    notes: '',
  });

  const deferredSearch = useDeferredValue(search);

  const filteredOfficial = useMemo(
    () =>
      (officialHeaders ?? []).filter((header: any) => {
        const matchesCategory = category === 'all' || header.category === category;
        const matchesSearch = `${header.activity_type} ${header.source}`.toLowerCase().includes(deferredSearch.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [category, deferredSearch, officialHeaders]
  );

  const filteredCustom = useMemo(
    () =>
      (customFactors ?? []).filter((factor: any) => {
        const matchesCategory = category === 'all' || factor.category === category;
        const matchesSearch = `${factor.activity_type} ${factor.source}`.toLowerCase().includes(deferredSearch.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [category, customFactors, deferredSearch]
  );

  const handleCreateCustomFactor = async () => {
    if (!customForm.activity_type || !customForm.emission_factor) {
      toast({
        title: 'Missing factor details',
        description: 'Enter the activity name and factor value before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createCustomFactor.mutateAsync({
        organization_id: settings.selectedOrganizationId,
        scope: customForm.scope,
        category: customForm.category,
        activity_type: customForm.activity_type,
        unit: customForm.unit,
        emission_factor: Number(customForm.emission_factor),
        source: customForm.source,
        gwp_set: customForm.gwp_set,
        data_quality: customForm.data_quality,
        notes: customForm.notes,
      });

      setCustomForm((current) => ({
        ...current,
        activity_type: '',
        emission_factor: '',
        notes: '',
      }));

      toast({
        title: 'Custom factor saved',
        description: 'The factor is now available in the guided audit wizard.',
      });
    } catch (error: any) {
      toast({
        title: 'Unable to save factor',
        description: error.message ?? 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-none bg-primary/10 text-primary">Factor library</Badge>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground">Manage official and organization-specific emission factors.</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Browse the factor registry, search activity mappings, and publish custom factors for supplier-specific or
            internally assured data.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryCard label="Official headers" value={String((officialHeaders ?? []).length)} />
          <SummaryCard label="Custom factors" value={String((customFactors ?? []).length)} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add custom factor
            </CardTitle>
            <CardDescription>Create organization-specific factors for verified supplier or internal studies.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Scope">
              <Select value={customForm.scope} onValueChange={(value) => setCustomForm((current) => ({ ...current, scope: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scope 1">Scope 1</SelectItem>
                  <SelectItem value="Scope 2">Scope 2</SelectItem>
                  <SelectItem value="Scope 3">Scope 3</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Category">
              <Select value={customForm.category} onValueChange={(value) => setCustomForm((current) => ({ ...current, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMISSION_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Activity type">
              <Input value={customForm.activity_type} onChange={(event) => setCustomForm((current) => ({ ...current, activity_type: event.target.value }))} placeholder="Employee shuttle bus" />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Factor value">
                <Input value={customForm.emission_factor} onChange={(event) => setCustomForm((current) => ({ ...current, emission_factor: event.target.value }))} placeholder="0.094" />
              </Field>
              <Field label="Unit">
                <Input value={customForm.unit} onChange={(event) => setCustomForm((current) => ({ ...current, unit: event.target.value }))} placeholder="km" />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="GWP set">
                <Select value={customForm.gwp_set} onValueChange={(value) => setCustomForm((current) => ({ ...current, gwp_set: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GWP_SETS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Data quality">
                <Select value={customForm.data_quality} onValueChange={(value) => setCustomForm((current) => ({ ...current, data_quality: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_QUALITY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Source">
              <Input value={customForm.source} onChange={(event) => setCustomForm((current) => ({ ...current, source: event.target.value }))} />
            </Field>
            <Field label="Notes">
              <Input value={customForm.notes} onChange={(event) => setCustomForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Supplier EPD 2026, audited fleet model..." />
            </Field>
            <Button type="button" className="rounded-full" onClick={handleCreateCustomFactor}>
              Save custom factor
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Search factor registry
                </CardTitle>
                <CardDescription>Search across official headers and approved custom factors.</CardDescription>
              </div>
              <div className="flex gap-3">
                <div className="relative w-64">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search factor library" />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {EMISSION_CATEGORIES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Official library</h3>
                <Badge variant="outline">{filteredOfficial.length} results</Badge>
              </div>
              <div className="space-y-3">
                {filteredOfficial.slice(0, 8).map((header: any) => (
                  <div key={header.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{header.activity_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {header.category} | {header.region} | {header.source}
                        </p>
                      </div>
                      <Badge variant="outline">{header.source_version ?? 'Current'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Custom library</h3>
                <Badge variant="outline">{filteredCustom.length} results</Badge>
              </div>
              <div className="space-y-3">
                {filteredCustom.map((factor: any) => (
                  <div key={factor.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{factor.activity_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {factor.category} | {factor.source} | {factor.data_quality}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {factor.emission_factor} kgCO2e/{factor.unit}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredCustom.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    No custom factors match the current filter.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

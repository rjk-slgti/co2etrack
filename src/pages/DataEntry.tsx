import { type ReactNode, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  FileUp,
  Save,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useActivityEntries, useCreateActivityEntry } from '@/hooks/useActivityEntries';
import { useCustomFactors, useCreateCustomFactor } from '@/hooks/useCustomFactors';
import { useEmissionFactorHeaders, useFactorsForActivity } from '@/hooks/useEmissionFactors';
import { useEvidenceUpload } from '@/hooks/useEvidenceUpload';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useOrganizationCatalog } from '@/hooks/useOrganizationCatalog';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import {
  calculateCustomFactorEmission,
  calculateEmission,
  createRealtimeVarianceInsight,
  formatEmission,
  normalizeUnit,
  selectBestFactor,
} from '@/lib/calculation-engine';
import { DATA_QUALITY_OPTIONS, EMISSION_CATEGORIES, GWP_SETS, SCOPE_CATEGORIES } from '@/lib/constants';
import { DEMO_ORGANIZATION_ID, DEMO_REPORTING_PERIOD_ID } from '@/lib/workspace-settings';

type WizardDraft = {
  organization_id: string;
  reporting_period_id: string;
  entry_date: string;
  scope: string;
  scope_category: string;
  category: string;
  activity_type: string;
  quantity: string;
  unit: string;
  site_name: string;
  supplier_name: string;
  data_quality: string;
  notes: string;
  source_document_ref: string;
  use_custom_factor: boolean;
  save_custom_factor: boolean;
  custom_factor_value: string;
  custom_factor_unit: string;
  custom_factor_source: string;
  gwp_set: string;
};

const DEFAULT_DRAFT: WizardDraft = {
  organization_id: DEMO_ORGANIZATION_ID,
  reporting_period_id: DEMO_REPORTING_PERIOD_ID,
  entry_date: new Date().toISOString().slice(0, 10),
  scope: 'Scope 2',
  scope_category: 'S2.1',
  category: 'Electricity',
  activity_type: 'Grid electricity',
  quantity: '',
  unit: 'kWh',
  site_name: '',
  supplier_name: '',
  data_quality: 'Medium',
  notes: '',
  source_document_ref: '',
  use_custom_factor: false,
  save_custom_factor: false,
  custom_factor_value: '',
  custom_factor_unit: 'kWh',
  custom_factor_source: '',
  gwp_set: 'AR6',
};

export default function DataEntry() {
  const { toast } = useToast();
  const { settings, updateSettings } = useWorkspaceSettings();
  const { data: catalog } = useOrganizationCatalog();
  const { data: historicalEntries } = useActivityEntries(settings.selectedOrganizationId);
  const createEntry = useCreateActivityEntry();
  const uploadEvidence = useEvidenceUpload();
  const createCustomFactor = useCreateCustomFactor();
  const { data: customFactors } = useCustomFactors(settings.selectedOrganizationId);

  const [draft, setDraft] = useLocalStorageState<WizardDraft>('co2etrack-audit-draft', {
    ...DEFAULT_DRAFT,
    organization_id: settings.selectedOrganizationId,
    reporting_period_id: settings.selectedReportingPeriodId,
  });
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const headersForCategory = useEmissionFactorHeaders(draft.category).data ?? [];
  const factorValues = useFactorsForActivity(draft.category, draft.activity_type).data ?? [];
  const selectedHeaders = useEmissionFactorHeaders().data ?? [];
  const activityOptions = [...new Set(headersForCategory.map((header: any) => header.activity_type))];

  const factors = useMemo(
    () =>
      factorValues.map((value: any) => ({
        id: value.id,
        factor_id: value.factor_id,
        emission_factor: Number(value.emission_factor),
        unit_input: value.unit_input,
        unit_standard: value.unit_standard,
        emission_type: value.emission_type,
        gwp_set: value.gwp_set,
        co2_fraction: value.co2_fraction ?? null,
        ch4_fraction: value.ch4_fraction ?? null,
        n2o_fraction: value.n2o_fraction ?? null,
        uncertainty_percent: value.uncertainty_percent ?? null,
        data_quality: value.data_quality ?? 'Medium',
        header: value.emission_factor_headers,
      })),
    [factorValues]
  );

  const bestFactor = useMemo(
    () => selectBestFactor(factors, settings.organizationCountry),
    [factors, settings.organizationCountry]
  );

  const quantityValue = Number(draft.quantity);
  const baseTemplateFactor =
    bestFactor?.factor ??
    ({
      id: 'custom-preview',
      factor_id: 'custom-preview',
      emission_factor: 0,
      unit_input: draft.custom_factor_unit,
      unit_standard: draft.custom_factor_unit,
      emission_type: 'Lifecycle/LCA',
      gwp_set: draft.gwp_set,
      co2_fraction: 1,
      ch4_fraction: null,
      n2o_fraction: null,
      uncertainty_percent: null,
      data_quality: draft.data_quality,
      header: {
        id: 'custom-preview',
        category: draft.category,
        activity_type: draft.activity_type || 'Custom activity',
        region: settings.organizationCountry,
        source: 'Other',
        source_version: null,
        is_locked: false,
      },
    } as any);

  const preview = useMemo(() => {
    if (!quantityValue || !draft.unit) return null;

    if (draft.use_custom_factor) {
      const customFactorValue = Number(draft.custom_factor_value);
      if (!customFactorValue || !draft.custom_factor_unit) return null;
      return calculateCustomFactorEmission(
        quantityValue,
        draft.unit,
        customFactorValue,
        normalizeUnit(draft.custom_factor_unit),
        baseTemplateFactor
      );
    }

    if (!bestFactor) return null;
    const result = calculateEmission(quantityValue, draft.unit, bestFactor.factor);
    if (!result) return null;

    return {
      ...result,
      is_assumed_factor: bestFactor.isAssumed,
      confidence_score: bestFactor.isAssumed
        ? Math.max(40, result.confidence_score - 12)
        : result.confidence_score,
    };
  }, [baseTemplateFactor, bestFactor, draft.custom_factor_unit, draft.custom_factor_value, draft.unit, draft.use_custom_factor, quantityValue]);

  const varianceInsight = useMemo(
    () =>
      quantityValue && draft.activity_type
        ? createRealtimeVarianceInsight(
            {
              category: draft.category,
              activity_type: draft.activity_type,
              quantity: quantityValue,
              unit: draft.unit,
            },
            (historicalEntries ?? []).map((entry: any) => ({
              category: entry.category,
              activity_type: entry.activity_type,
              quantity: Number(entry.quantity),
            }))
          )
        : null,
    [draft.activity_type, draft.category, draft.unit, historicalEntries, quantityValue]
  );

  const matchingCustomFactors = useMemo(
    () =>
      (customFactors ?? []).filter(
        (factor: any) => factor.category === draft.category && factor.activity_type === draft.activity_type
      ),
    [customFactors, draft.activity_type, draft.category]
  );

  const selectedOrganization =
    catalog?.organizations.find((organization) => organization.id === draft.organization_id) ?? catalog?.organizations[0];
  const periodsForOrganization = (catalog?.reportingPeriods ?? []).filter(
    (period) => period.organization_id === draft.organization_id
  );

  const setDraftField = <K extends keyof WizardDraft>(field: K, value: WizardDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const resetDraft = () => {
    setDraft({
      ...DEFAULT_DRAFT,
      organization_id: draft.organization_id,
      reporting_period_id: draft.reporting_period_id,
      entry_date: new Date().toISOString().slice(0, 10),
    });
    setEvidenceFile(null);
  };

  const handleSubmit = async (mode: 'draft' | 'pending_audit') => {
    if (!preview) {
      toast({
        title: 'Calculation incomplete',
        description: 'Complete the activity details and factor inputs before saving the record.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (draft.use_custom_factor && draft.save_custom_factor) {
        await createCustomFactor.mutateAsync({
          organization_id: draft.organization_id,
          scope: draft.scope,
          category: draft.category,
          activity_type: draft.activity_type,
          unit: normalizeUnit(draft.custom_factor_unit),
          emission_factor: Number(draft.custom_factor_value),
          source: draft.custom_factor_source || 'Organization Specific',
          source_reference: draft.source_document_ref,
          gwp_set: draft.gwp_set,
          data_quality: draft.data_quality,
          notes: draft.notes,
        });
      }

      const entry = await createEntry.mutateAsync({
        organization_id: draft.organization_id,
        reporting_period_id: draft.reporting_period_id,
        entry_date: draft.entry_date,
        scope: draft.scope,
        scope_category: draft.scope_category,
        category: draft.category,
        activity_type: draft.activity_type,
        quantity: quantityValue,
        unit: draft.unit,
        converted_quantity: preview.converted_quantity,
        converted_unit: preview.converted_unit,
        factor_id: draft.use_custom_factor ? undefined : bestFactor?.factor.header.id,
        factor_value_id: draft.use_custom_factor ? undefined : bestFactor?.factor.id,
        emission_kgco2e: preview.emission_kgco2e,
        emission_co2: preview.emission_co2 ?? undefined,
        emission_ch4: preview.emission_ch4 ?? undefined,
        emission_n2o: preview.emission_n2o ?? undefined,
        data_quality: draft.data_quality,
        is_assumed_factor: draft.use_custom_factor ? false : bestFactor?.isAssumed,
        notes: buildEntryNotes(draft),
        status: mode,
        validation_status: mode === 'pending_audit' ? 'under_review' : 'pending',
        approval_status: mode === 'pending_audit' ? 'pending' : 'not_required',
        source_channel: draft.use_custom_factor ? 'custom_factor' : 'manual',
        source_document_ref: draft.source_document_ref,
        confidence_score: preview.confidence_score,
        site_name: draft.site_name,
        supplier_name: draft.supplier_name,
      });

      if (evidenceFile) {
        await uploadEvidence.mutateAsync({ entryId: entry.id, file: evidenceFile });
      }

      toast({
        title: mode === 'pending_audit' ? 'Submitted for review' : 'Draft saved',
        description: `${draft.activity_type} was recorded at ${formatEmission(preview.emission_kgco2e)}.`,
      });

      resetDraft();
    } catch (error: any) {
      toast({
        title: 'Unable to save entry',
        description: error.message ?? 'Please try again after reviewing the form.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-none bg-primary/10 text-primary">Guided carbon audit wizard</Badge>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground">Capture, validate, and queue activity data with confidence.</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Autosave is active. The wizard highlights unusual values, supports custom factors, and keeps the audit trail
            ready for formal review.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground shadow-sm">
          Draft autosaved for {selectedOrganization?.name ?? settings.organizationName}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          <WizardSection
            step="01"
            title="Workspace and audit boundary"
            description="Select the organization, reporting period, and source context for this activity record."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Organization">
                <Select
                  value={draft.organization_id}
                  onValueChange={(value) => {
                    const organization = (catalog?.organizations ?? []).find((item) => item.id === value);
                    const nextReportingPeriod =
                      (catalog?.reportingPeriods ?? []).find((period) => period.organization_id === value) ?? null;
                    setDraft((current) => ({
                      ...current,
                      organization_id: value,
                      reporting_period_id: nextReportingPeriod?.id ?? current.reporting_period_id,
                    }));
                    updateSettings({
                      selectedOrganizationId: value,
                      selectedReportingPeriodId: nextReportingPeriod?.id ?? settings.selectedReportingPeriodId,
                      organizationName: organization?.name ?? settings.organizationName,
                      organizationCountry: organization?.country ?? settings.organizationCountry,
                      industry: organization?.industry ?? settings.industry,
                      reportingCurrency: organization?.reporting_currency ?? settings.reportingCurrency,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {(catalog?.organizations ?? []).map((organization) => (
                      <SelectItem key={organization.id} value={organization.id}>
                        {organization.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Reporting period">
                <Select
                  value={draft.reporting_period_id}
                  onValueChange={(value) => {
                    setDraftField('reporting_period_id', value);
                    updateSettings({ selectedReportingPeriodId: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reporting period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodsForOrganization.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Entry date">
                <Input type="date" value={draft.entry_date} onChange={(event) => setDraftField('entry_date', event.target.value)} />
              </Field>
              <Field label="Source reference">
                <Input
                  placeholder="Invoice, bill, spreadsheet, or meter ID"
                  value={draft.source_document_ref}
                  onChange={(event) => setDraftField('source_document_ref', event.target.value)}
                />
              </Field>
              <Field label="Site name">
                <Input placeholder="Main plant, HQ, warehouse..." value={draft.site_name} onChange={(event) => setDraftField('site_name', event.target.value)} />
              </Field>
              <Field label="Supplier or owner">
                <Input placeholder="Utility, airline, vendor..." value={draft.supplier_name} onChange={(event) => setDraftField('supplier_name', event.target.value)} />
              </Field>
            </div>
          </WizardSection>

          <WizardSection
            step="02"
            title="Scope, source, and activity mapping"
            description="Map the record to the correct scope and activity so the engine can select the best factor."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Scope">
                <Select
                  value={draft.scope}
                  onValueChange={(value) => {
                    setDraft((current) => ({
                      ...current,
                      scope: value,
                      scope_category: SCOPE_CATEGORIES[value as keyof typeof SCOPE_CATEGORIES]?.[0]?.code ?? '',
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SCOPE_CATEGORIES).map((scope) => (
                      <SelectItem key={scope} value={scope}>
                        {scope}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Scope category">
                <Select value={draft.scope_category} onValueChange={(value) => setDraftField('scope_category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(SCOPE_CATEGORIES[draft.scope as keyof typeof SCOPE_CATEGORIES] ?? []).map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.code} - {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Emission category">
                <Select
                  value={draft.category}
                  onValueChange={(value) => {
                    setDraft((current) => ({
                      ...current,
                      category: value,
                      activity_type: '',
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMISSION_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Activity type">
                <Select value={draft.activity_type} onValueChange={(value) => setDraftField('activity_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityOptions.map((activity) => (
                      <SelectItem key={activity} value={activity}>
                        {activity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {matchingCustomFactors.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  {matchingCustomFactors.length} approved custom factor{matchingCustomFactors.length > 1 ? 's are' : ' is'} available
                  for this activity.
                </p>
                <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                  Toggle the custom factor mode below if you want to use organization-specific calculations instead of the
                  default library factor.
                </p>
              </div>
            )}
          </WizardSection>

          <WizardSection
            step="03"
            title="Quantity, factor selection, and live preview"
            description="Enter the activity data. The system recalculates instantly and flags unusual values."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Quantity">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={draft.quantity}
                  onChange={(event) => setDraftField('quantity', event.target.value)}
                />
              </Field>
              <Field label="Unit">
                <Input value={draft.unit} onChange={(event) => setDraftField('unit', event.target.value)} placeholder="kWh, litre, kg..." />
              </Field>
              <Field label="Data quality">
                <Select value={draft.data_quality} onValueChange={(value) => setDraftField('data_quality', value)}>
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

            <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
              <Card className="border-border/70">
                <CardHeader>
                  <CardTitle className="text-lg">Factor source</CardTitle>
                  <CardDescription>Use the official library factor or enter an approved custom value.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div>
                      <p className="font-medium text-foreground">Use custom emission factor</p>
                      <p className="text-sm text-muted-foreground">Great for supplier-specific or audited internal factors.</p>
                    </div>
                    <Switch checked={draft.use_custom_factor} onCheckedChange={(checked) => setDraftField('use_custom_factor', checked)} />
                  </div>

                  {draft.use_custom_factor ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Custom factor value">
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={draft.custom_factor_value}
                          onChange={(event) => setDraftField('custom_factor_value', event.target.value)}
                          placeholder="kgCO2e per unit"
                        />
                      </Field>
                      <Field label="Factor unit">
                        <Input
                          value={draft.custom_factor_unit}
                          onChange={(event) => setDraftField('custom_factor_unit', event.target.value)}
                          placeholder="kWh, kg, km..."
                        />
                      </Field>
                      <Field label="Factor source">
                        <Input
                          value={draft.custom_factor_source}
                          onChange={(event) => setDraftField('custom_factor_source', event.target.value)}
                          placeholder="Supplier EPD, metered fuel study..."
                        />
                      </Field>
                      <Field label="GWP set">
                        <Select value={draft.gwp_set} onValueChange={(value) => setDraftField('gwp_set', value)}>
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
                      <div className="md:col-span-2 flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div>
                          <p className="font-medium text-foreground">Save this factor to the custom library</p>
                          <p className="text-sm text-muted-foreground">Approved custom factors can be reused across future audits.</p>
                        </div>
                        <Switch checked={draft.save_custom_factor} onCheckedChange={(checked) => setDraftField('save_custom_factor', checked)} />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      {bestFactor ? (
                        <>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-foreground">{bestFactor.factor.header.activity_type}</p>
                              <p className="text-sm text-muted-foreground">
                                {bestFactor.factor.header.source} {bestFactor.factor.header.source_version ?? ''}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {bestFactor.factor.emission_factor} kgCO2e/{bestFactor.factor.unit_standard}
                            </Badge>
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground">
                            {bestFactor.isAssumed
                              ? 'No country-specific factor was found, so the engine selected the closest approved proxy factor.'
                              : 'The engine selected the highest-priority factor available for your region and activity.'}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No official factor matches the selected activity yet. Use the custom factor option to continue this record.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(15,95,75,0.96),rgba(20,108,148,0.95))] text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BrainCircuit className="h-5 w-5" />
                    Live calculation preview
                  </CardTitle>
                  <CardDescription className="text-white/75">
                    Every input change immediately updates the carbon result and risk signals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {preview ? (
                    <>
                      <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/65">Calculated footprint</p>
                        <p className="mt-2 text-4xl font-black tracking-tight">{formatEmission(preview.emission_kgco2e)}</p>
                        <p className="mt-2 text-sm text-white/75">
                          Converted quantity: {preview.converted_quantity.toFixed(2)} {preview.converted_unit}
                        </p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-white/65">Confidence</p>
                          <p className="mt-2 text-2xl font-bold">{preview.confidence_score}%</p>
                        </div>
                        <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-white/65">Factor type</p>
                          <p className="mt-2 text-lg font-semibold">
                            {draft.use_custom_factor ? 'Custom factor' : bestFactor?.isAssumed ? 'Proxy factor' : 'Official factor'}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-white/25 bg-white/5 p-6 text-sm text-white/75">
                      Enter quantity, unit, and a factor source to activate the live preview.
                    </div>
                  )}

                  {varianceInsight && (
                    <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-sm text-white backdrop-blur-md shadow-2xl animate-in zoom-in-95 duration-500">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                          <BrainCircuit className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-black text-[10px] uppercase tracking-widest text-white/50 mb-1">Plausibility Signal</p>
                          <p className="font-bold text-sm leading-tight">{varianceInsight.message}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </WizardSection>

          <WizardSection
            step="04"
            title="Assurance artifacts and final routing"
            description="Attach primary evidence and capture audit assumptions for the reviewer."
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <Field label="Audit notes and assumptions">
                <Textarea
                  className="min-h-[180px] rounded-2xl border-slate-200 focus-visible:ring-primary"
                  placeholder="Document meter assumptions, supplier references, or reviewer flags..."
                  value={draft.notes}
                  onChange={(event) => setDraftField('notes', event.target.value)}
                />
              </Field>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Evidence Vault</Label>
                <label
                  className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed p-8 text-center transition-all ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    const file = event.dataTransfer.files?.[0];
                    if (file) setEvidenceFile(file);
                  }}
                >
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) => setEvidenceFile(event.target.files?.[0] ?? null)}
                  />
                  <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-4">
                    <FileUp className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="font-black text-slate-900">
                    {evidenceFile ? evidenceFile.name : 'Upload Source Document'}
                  </p>
                  <p className="mt-2 text-xs text-slate-400 font-medium px-10">
                    Drag and drop invoices or utility bills to boost audit assurance.
                  </p>
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl h-12 px-8 font-bold border-slate-200"
                onClick={() => handleSubmit('draft')}
                disabled={createEntry.isPending || uploadEvidence.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Save to Drafts
              </Button>
              <Button
                type="button"
                className="rounded-2xl h-12 px-10 bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl shadow-slate-200"
                onClick={() => handleSubmit('pending_audit')}
                disabled={createEntry.isPending || uploadEvidence.isPending}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Submit to Audit Queue
              </Button>
            </div>
          </WizardSection>
        </div>

        <div className="space-y-8">
          <Card className="border-slate-200 shadow-xl rounded-[40px] bg-white overflow-hidden ring-1 ring-slate-100">
            <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="flex items-center gap-3 text-xl font-black">
                <Sparkles className="h-6 w-6 text-primary" />
                Audit Intelligence
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium italic">Contextual guidance based on your activity clusters.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <SuggestionCard
                title="Consolidate by Site"
                detail="Recording activity by site (HQ vs Plant) allows for more granular intensity normalization."
              />
              <SuggestionCard
                title="Upload PDF evidence"
                detail="Machine-readable PDFs allow the Copilot to extract billing values 70% faster."
              />
              <SuggestionCard
                title="Prefer supplier-specific factors for material categories"
                detail="If supplier EPDs or metered studies exist, store them as custom factors to replace proxy assumptions."
              />
              {preview && (
                <SuggestionCard
                  title="Review confidence before submission"
                  detail={`Current confidence is ${preview.confidence_score}%. Entries above 80% usually move through the audit queue faster.`}
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle>Current factor catalog</CardTitle>
              <CardDescription>Available activities from the official and custom factor libraries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-sm font-semibold text-foreground">
                  {selectedHeaders.length} official factor headers in the current workspace
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {(customFactors ?? []).length} approved custom factors are also available for reuse.
                </p>
              </div>
              {matchingCustomFactors.slice(0, 2).map((factor: any) => (
                <div key={factor.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="font-semibold text-foreground">{factor.activity_type}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {factor.emission_factor} kgCO2e/{factor.unit} from {factor.source}
                  </p>
                </div>
              ))}
              {matchingCustomFactors.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No custom factors match the current activity yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function buildEntryNotes(draft: WizardDraft) {
  const parts = [draft.notes];

  if (draft.source_document_ref) {
    parts.push(`Source reference: ${draft.source_document_ref}`);
  }

  if (draft.use_custom_factor) {
    parts.push(`Custom factor: ${draft.custom_factor_value} kgCO2e/${normalizeUnit(draft.custom_factor_unit)} from ${draft.custom_factor_source || 'Organization Specific'}.`);
  }

  return parts.filter(Boolean).join('\n');
}

function WizardSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardHeader className="border-b border-border/60">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
            {step}
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-6">{children}</CardContent>
    </Card>
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

function SuggestionCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        </div>
      </div>
    </div>
  );
}

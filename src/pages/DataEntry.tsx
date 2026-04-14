import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useEmissionFactorHeaders, useFactorsForActivity } from '@/hooks/useEmissionFactors';
import { useCreateActivityEntry } from '@/hooks/useActivityEntries';
import { selectBestFactor, calculateEmission, formatEmission } from '@/lib/calculation-engine';
import { SCOPE_CATEGORIES, EMISSION_CATEGORIES, DATA_QUALITY_OPTIONS } from '@/lib/constants';
import { useEvidenceUpload } from '@/hooks/useEvidenceUpload';
import { AlertTriangle, Check, Info, Upload } from 'lucide-react';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

export default function DataEntry() {
  const { toast } = useToast();
  const createEntry = useCreateActivityEntry();
  const uploadEvidence = useEvidenceUpload();

  const [scope, setScope] = useState<string>('');
  const [scopeCategory, setScopeCategory] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [activityType, setActivityType] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [dataQuality, setDataQuality] = useState<string>('Medium');
  const [notes, setNotes] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'draft' | 'pending_audit'>('draft');

  const { data: headers } = useEmissionFactorHeaders(category || undefined);
  const { data: factorValues } = useFactorsForActivity(category, activityType);

  const activityTypes = [...new Set((headers ?? []).map(h => h.activity_type))];

  // Determine best factor
  const factors = (factorValues ?? []).map((fv: any) => ({
    id: fv.id,
    factor_id: fv.factor_id,
    emission_factor: fv.emission_factor,
    unit_input: fv.unit_input,
    unit_standard: fv.unit_standard,
    emission_type: fv.emission_type,
    gwp_set: fv.gwp_set,
    co2_fraction: fv.co2_fraction,
    ch4_fraction: fv.ch4_fraction,
    n2o_fraction: fv.n2o_fraction,
    uncertainty_percent: fv.uncertainty_percent,
    data_quality: fv.data_quality,
    header: fv.emission_factor_headers,
  }));

  const bestFactor = factors.length > 0 ? selectBestFactor(factors, 'LK') : null;
  const availableUnits = bestFactor ? [bestFactor.factor.unit_input, bestFactor.factor.unit_standard] : [];

  const calcResult = bestFactor && quantity && unit
    ? calculateEmission(parseFloat(quantity), unit, bestFactor.factor)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcResult || !bestFactor) {
      toast({ title: 'Cannot calculate', description: 'Please fill all fields and ensure a valid factor exists.', variant: 'destructive' });
      return;
    }

    try {
      const entry = await createEntry.mutateAsync({
        organization_id: DEMO_ORG_ID,
        scope,
        scope_category: scopeCategory || undefined,
        category,
        activity_type: activityType,
        quantity: parseFloat(quantity),
        unit,
        converted_quantity: calcResult.converted_quantity,
        converted_unit: calcResult.converted_unit,
        factor_id: bestFactor.factor.header.id,
        factor_value_id: bestFactor.factor.id,
        emission_kgco2e: calcResult.emission_kgco2e,
        emission_co2: calcResult.emission_co2 ?? undefined,
        emission_ch4: calcResult.emission_ch4 ?? undefined,
        emission_n2o: calcResult.emission_n2o ?? undefined,
        data_quality: dataQuality,
        is_assumed_factor: bestFactor.isAssumed,
        notes: notes || undefined,
        status: submitStatus,
      });

      if (evidenceFile && entry) {
        toast({ title: 'Uploading evidence...', description: 'Please wait.' });
        await uploadEvidence.mutateAsync({ entryId: entry.id, file: evidenceFile });
      }

      toast({ title: 'Entry saved', description: `${formatEmission(calcResult.emission_kgco2e)} recorded as ${submitStatus}.` });
      setQuantity('');
      setNotes('');
      setEvidenceFile(null);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Entry</h1>
        <p className="text-muted-foreground">Record activity data with guided emission factor selection</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Scope */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Select Scope & Category</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value={scope} onValueChange={(v) => { setScope(v); setScopeCategory(''); }}>
                <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(SCOPE_CATEGORIES).map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {scope && (
              <div className="space-y-2">
                <Label>Scope Category</Label>
                <Select value={scopeCategory} onValueChange={setScopeCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {SCOPE_CATEGORIES[scope as keyof typeof SCOPE_CATEGORIES]?.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Activity Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Emission Category</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v); setActivityType(''); }}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {EMISSION_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={activityType} onValueChange={setActivityType} disabled={!category || activityTypes.length === 0}>
                <SelectTrigger><SelectValue placeholder={!category ? "Select category first" : (activityTypes.length === 0 ? "No activities found in DB" : "Select activity")} /></SelectTrigger>
                <SelectContent>
                  {activityTypes.map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Quantity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Quantity & Unit</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" step="any" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {(availableUnits.length > 0 ? [...new Set(availableUnits)] : ['L', 'kWh', 'km', 'kg', 'tonne', 'm3', 'gallon', 'mile', 'MWh']).map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Quality</Label>
              <Select value={dataQuality} onValueChange={setDataQuality}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATA_QUALITY_OPTIONS.map(q => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Factor Info */}
        {bestFactor && (
          <Card className={bestFactor.isAssumed ? 'border-yellow-500/50' : 'border-primary/50'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {bestFactor.isAssumed ? (
                  <><AlertTriangle className="h-4 w-4" style={{ color: 'hsl(38, 92%, 50%)' }} /> Assumed Factor</>
                ) : (
                  <><Check className="h-4 w-4 text-primary" /> Matched Factor</>
                )}
              </CardTitle>
              {bestFactor.isAssumed && (
                <CardDescription style={{ color: 'hsl(38, 92%, 50%)' }}>
                  No country-specific factor found. Using fallback.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <div><span className="text-muted-foreground">Source:</span> {bestFactor.factor.header.source}</div>
              <div><span className="text-muted-foreground">Version:</span> {bestFactor.factor.header.source_version || 'N/A'}</div>
              <div><span className="text-muted-foreground">Region:</span> {bestFactor.factor.header.region}</div>
              <div><span className="text-muted-foreground">GWP Set:</span> {bestFactor.factor.gwp_set}</div>
              <div><span className="text-muted-foreground">Factor:</span> {bestFactor.factor.emission_factor} kgCO₂e/{bestFactor.factor.unit_standard}</div>
              <div><span className="text-muted-foreground">Type:</span> {bestFactor.factor.emission_type}</div>
              {bestFactor.factor.uncertainty_percent && (
                <div><span className="text-muted-foreground">Uncertainty:</span> ±{bestFactor.factor.uncertainty_percent}%</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Calculation Preview */}
        {calcResult && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Calculated Emission</p>
                <p className="text-3xl font-bold text-primary">{formatEmission(calcResult.emission_kgco2e)}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{quantity} {unit} → {calcResult.converted_quantity.toFixed(2)} {calcResult.converted_unit}</p>
                <p>× {bestFactor!.factor.emission_factor} kgCO₂e/{bestFactor!.factor.unit_standard}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes & Evidence */}
        <Card>
          <CardContent className="pt-6 grid gap-4">
            <div>
              <Label>Notes (optional)</Label>
              <Textarea className="mt-2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional context..." />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4" /> Evidence Document (optional)
              </Label>
              <Input 
                type="file" 
                className="mt-2" 
                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                accept="image/*,.pdf,.csv,.xlsx"
              />
              <p className="text-xs text-muted-foreground mt-1">Upload utility bills, fuel receipts, or SAP extracts to support audits.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button 
            type="submit" 
            variant="outline"
            className="w-full" 
            disabled={!calcResult || createEntry.isPending || uploadEvidence.isPending}
            onClick={() => setSubmitStatus('draft')}
          >
            Save as Draft
          </Button>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!calcResult || createEntry.isPending || uploadEvidence.isPending}
            onClick={() => setSubmitStatus('pending_audit')}
          >
            {createEntry.isPending || uploadEvidence.isPending ? 'Saving...' : 'Submit for Audit'}
          </Button>
        </div>
      </form>
    </div>
  );
}

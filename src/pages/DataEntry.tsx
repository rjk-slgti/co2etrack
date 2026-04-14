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
import { AlertTriangle, Check, Search, Upload, FileText, Database, Shield, Info } from 'lucide-react';

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
      toast({ title: 'Validation Error', description: 'Please complete all required fields.', variant: 'destructive' });
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
        await uploadEvidence.mutateAsync({ entryId: entry.id, file: evidenceFile });
      }

      toast({ 
        title: 'Form Submitted Successfully', 
        description: `Entry for ${category} (${formatEmission(calcResult.emission_kgco2e)}) locked as ${submitStatus}.` 
      });
      
      setQuantity('');
      setNotes('');
      setEvidenceFile(null);
    } catch (err: any) {
      toast({ title: 'Submission Failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-muted pb-4">
        <h1 className="text-3xl font-bold font-heading text-primary uppercase tracking-tight">Audit-Ready Data Input</h1>
        <p className="text-muted-foreground font-medium mt-1">Structured GHG Activity Recording System</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Classification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-bold uppercase text-primary flex items-center gap-2">
                <Shield className="w-4 h-4" /> Scope Class
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 flex-1">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">GHG Classification</Label>
                <Select value={scope} onValueChange={(v) => { setScope(v); setScopeCategory(''); }}>
                  <SelectTrigger className="bg-white border-muted-foreground/20"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(SCOPE_CATEGORIES).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {scope && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Protocol Category</Label>
                  <Select value={scopeCategory} onValueChange={setScopeCategory}>
                    <SelectTrigger className="bg-white border-muted-foreground/20"><SelectValue placeholder="Select" /></SelectTrigger>
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

          <Card className="md:col-span-2 shadow-sm h-full">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-sm font-bold uppercase text-primary flex items-center gap-2">
                <Search className="w-4 h-4" /> Activity Mapping
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Emission Category</Label>
                <Select value={category} onValueChange={(v) => { setCategory(v); setActivityType(''); }}>
                  <SelectTrigger className="bg-white border-muted-foreground/20"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {EMISSION_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Activity Detail</Label>
                <Select value={activityType} onValueChange={setActivityType} disabled={!category || activityTypes.length === 0}>
                   <SelectTrigger className="bg-white border-muted-foreground/20">
                     <SelectValue placeholder={!category ? "Waiting for Category..." : (activityTypes.length === 0 ? "No records found" : "Select...")} />
                   </SelectTrigger>
                   <SelectContent>
                     {activityTypes.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                   </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quantity & Read-Only Factor */}
        <Card className="shadow-sm border-primary/10">
          <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
            <CardTitle className="text-sm font-bold uppercase text-primary flex items-center gap-2">
              <Database className="w-4 h-4" /> Quantifiable Data & Governing Factor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Input Quantity</Label>
              <Input type="number" step="any" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.00" className="bg-white text-lg font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Primary Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="bg-white"><SelectValue placeholder="Select Unit" /></SelectTrigger>
                <SelectContent>
                  {(availableUnits.length > 0 ? [...new Set(availableUnits)] : ['L', 'kWh', 'km', 'kg', 'MWh']).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            {/* Auto-filled Read-Only Factor Segment */}
            <div className="bg-muted/40 p-3 rounded border border-muted flex flex-col justify-center">
              <Label className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-tighter italic">Governing Emission Factor (Auto-Linked)</Label>
              {bestFactor ? (
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-primary">{bestFactor.factor.emission_factor}</span>
                  <span className="text-[10px] text-muted-foreground">kgCO₂e/{bestFactor.factor.unit_standard}</span>
                  <Tooltip text={`Source: ${bestFactor.factor.header.source} (${bestFactor.factor.header.source_version})`}>
                     <Info className="w-2.5 h-2.5 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic mt-1">Awaiting Activity Selection...</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Calculation Preview */}
        {calcResult && (
          <div className="bg-primary text-white p-6 rounded-xl shadow-lg border-2 border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase font-bold opacity-70 tracking-[.2em]">Calculated Greenhouse Gas Impact</p>
              <h2 className="text-4xl font-black font-heading tracking-tighter">{formatEmission(calcResult.emission_kgco2e)}</h2>
            </div>
            <div className="bg-white/10 p-4 rounded-lg flex flex-col items-end text-[11px] font-medium border border-white/20 tabular-nums">
              <p>{quantity} {unit} → {calcResult.converted_quantity.toFixed(3)} {calcResult.converted_unit}</p>
              <p className="opacity-60 font-bold mt-1">CO₂ Conversion Methodology Applied</p>
            </div>
          </div>
        )}

        {/* Metadata & Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Documentation Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter audit trail context..." className="min-h-[100px] text-xs" />
            </CardContent>
          </Card>
          
          <Card className="shadow-sm border-dashed border-muted-foreground/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Upload className="w-3.5 h-3.5" /> Evidence Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input type="file" onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)} className="text-xs py-1" />
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded border border-muted text-[10px] text-muted-foreground italic">
                <Info className="w-3 h-3 text-primary" />
                Upload bills, certificates, or invoices for ISO compliance.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" variant="ghost" className="flex-1 font-bold text-muted-foreground hover:bg-muted" disabled={!calcResult || createEntry.isPending} onClick={() => setSubmitStatus('draft')}>
            Save Local Draft
          </Button>
          <Button type="submit" className="flex-1 font-extrabold bg-primary hover:bg-primary/90 text-white shadow-md py-6 rounded-lg text-lg ring-offset-background transition-all hover:scale-[1.01]" disabled={!calcResult || createEntry.isPending} onClick={() => setSubmitStatus('pending_audit')}>
            {createEntry.isPending ? 'Processing...' : 'Secure & Submit for Audit'}
          </Button>
        </div>
      </form>
    </div>
  );
}

const Tooltip = ({ children, text }: { children: React.ReactNode, text: string }) => (
  <div className="group relative">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap z-50">
      {text}
    </div>
  </div>
);

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
import { AlertTriangle, Check, Search, Upload, FileText, Database, Shield, Info, Leaf } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-muted pb-6">
        <div>
          <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]">
            Inventory Phase 1
          </Badge>
          <h1 className="text-4xl font-black font-heading text-primary uppercase tracking-tighter">Audit-Ready Data Input</h1>
          <p className="text-muted-foreground font-medium italic mt-1">Structured Activity Recording & Emission Benchmarking</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/20 px-4 py-2 rounded-full border border-muted/30">
          <Shield className="w-4 h-4 text-secondary" /> ISO 14064 Compliance Tier
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Classification Column */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="shadow-lg border-none bg-white overflow-hidden">
              <CardHeader className="bg-primary pt-4 pb-4">
                <CardTitle className="text-xs font-black uppercase text-white flex items-center gap-2 tracking-[.2em]">
                  <Database className="w-4 h-4 opacity-70" /> 01. Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">GHG Scope Selection</Label>
                  <Select value={scope} onValueChange={(v) => { setScope(v); setScopeCategory(''); }}>
                    <SelectTrigger className="bg-muted/30 border-none font-bold text-primary">
                      <SelectValue placeholder="Select Scope" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(SCOPE_CATEGORIES).map(s => <SelectItem key={s} value={s} className="font-bold">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {scope && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Protocol Category Code</Label>
                    <Select value={scopeCategory} onValueChange={setScopeCategory}>
                      <SelectTrigger className="bg-muted/30 border-none font-bold">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCOPE_CATEGORIES[scope as keyof typeof SCOPE_CATEGORIES]?.map(c => (
                          <SelectItem key={c.code} value={c.code} className="text-xs">
                            <span className="font-black text-primary mr-2">{c.code}</span> {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="pt-2">
                   <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                     <Info className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                     <p className="text-[10px] leading-relaxed text-secondary-foreground font-medium italic">
                       Scope classification is governed by the GHG Protocol Corporate Standard boundary definitions.
                     </p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Mapping Column */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="shadow-lg border-none bg-white overflow-hidden">
              <CardHeader className="bg-secondary pt-4 pb-4">
                <CardTitle className="text-xs font-black uppercase text-white flex items-center gap-2 tracking-[.2em]">
                  <Search className="w-4 h-4 opacity-70" /> 02. Activity Mapping & Quantification
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Emission Source Category</Label>
                    <Select value={category} onValueChange={(v) => { setCategory(v); setActivityType(''); }}>
                      <SelectTrigger className="bg-muted/30 border-none font-extrabold text-primary h-12">
                        <SelectValue placeholder="Activity Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMISSION_CATEGORIES.map(c => <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Specific Activity Detail</Label>
                    <Select value={activityType} onValueChange={setActivityType} disabled={!category || activityTypes.length === 0}>
                       <SelectTrigger className="bg-muted/30 border-none font-extrabold h-12">
                         <SelectValue placeholder={!category ? "Waiting for selection..." : "Select specific type"} />
                       </SelectTrigger>
                       <SelectContent>
                         {activityTypes.map(a => <SelectItem key={a} value={a} className="font-medium">{a}</SelectItem>)}
                       </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end border-t border-muted pt-8">
                  <div className="md:col-span-1 space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Measured Quantity</Label>
                    <Input 
                      type="number" 
                      step="any" 
                      min="0" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)} 
                      placeholder="0.00" 
                      className="bg-muted/30 border-none text-2xl font-black text-primary h-14" 
                    />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Unit of Measure</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger className="bg-muted/30 border-none font-black h-14">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {(availableUnits.length > 0 ? [...new Set(availableUnits)] : ['L', 'kWh', 'km', 'kg', 'MWh']).map(u => <SelectItem key={u} value={u} className="font-bold">{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1 pb-1">
                     <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex flex-col justify-center h-14">
                        <Label className="text-[8px] font-black uppercase text-primary/60 tracking-tighter italic">Governing EF (Linked)</Label>
                        {bestFactor ? (
                          <div className="flex items-baseline gap-1.5 overflow-hidden">
                            <span className="text-lg font-black text-primary tabular-nums truncate">{bestFactor.factor.emission_factor}</span>
                            <span className="text-[9px] text-muted-foreground font-bold whitespace-nowrap">kgCO₂e/{bestFactor.factor.unit_standard}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic font-medium">Auto-mapping...</span>
                        )}
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Calculation Preview */}
            <div className="relative group perspective-1000">
              {calcResult ? (
                <div className="bg-primary text-white p-8 rounded-2xl shadow-2xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 animate-in zoom-in-95 duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                     <Leaf className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10 text-center md:text-left">
                    <p className="text-[10px] uppercase font-black opacity-80 tracking-[0.3em] mb-2 drop-shadow-sm">Calculated GHG Footprint</p>
                    <h2 className="text-6xl font-black font-heading tracking-tighter flex items-baseline gap-2">
                      {formatEmission(calcResult.emission_kgco2e).split(' ')[0]}
                      <span className="text-xl opacity-80">{formatEmission(calcResult.emission_kgco2e).split(' ')[1]}</span>
                    </h2>
                    <Badge className="mt-4 bg-white/20 text-white border-none font-bold italic tracking-widest text-[9px]">BENCHMARKED VIA {bestFactor?.factor.header.source || "OFFICIAL"}</Badge>
                  </div>
                  
                  <div className="relative z-10 bg-black/20 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center md:items-end text-xs font-bold border border-white/10 tabular-nums">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="opacity-60">{quantity} {unit}</span>
                       <div className="h-px w-8 bg-white/20" />
                       <span className="text-accent underline underline-offset-4 decoration-accent/50">{calcResult.converted_quantity.toFixed(3)} {calcResult.converted_unit}</span>
                    </div>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-black flex items-center gap-1.5 mt-2">
                       <Check className="w-3 h-3 text-accent" /> Audit Trail Initialized
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/10 p-12 rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-center">
                   <AlertTriangle className="w-10 h-10 text-muted-foreground/30 mb-4" />
                   <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Awaiting Numerical Input for Computation</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata & Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          <Card className="md:col-span-7 shadow-lg border-none bg-white overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4 border-b">
              <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-[.2em] flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary/60" /> Audit Trail Narrative
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Specify the functional boundary, data source reliability, or any assumptions made during recording..." 
                className="min-h-[120px] bg-muted/20 border-none font-medium text-sm focus-visible:ring-primary" 
              />
            </CardContent>
          </Card>
          
          <Card className="md:col-span-5 shadow-lg border-none bg-white overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4 border-b">
              <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-[.2em] flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary/60" /> Evidence Management
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="relative group">
                <Input 
                  type="file" 
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)} 
                  className="hidden" 
                  id="evidence-upload" 
                />
                <label 
                  htmlFor="evidence-upload" 
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-xl bg-muted/10 group-hover:bg-primary/5 group-hover:border-primary/30 transition-all cursor-pointer"
                >
                   {evidenceFile ? (
                     <>
                       <div className="p-3 bg-primary/10 rounded-full mb-2"><Check className="w-6 h-6 text-primary" /></div>
                       <p className="text-xs font-black text-primary truncate max-w-full">{evidenceFile.name}</p>
                       <p className="text-[10px] text-muted-foreground mt-1">Ready for secure upload</p>
                     </>
                   ) : (
                     <>
                       <Upload className="w-8 h-8 text-muted-foreground/30 mb-2 group-hover:text-primary/50 transition-colors" />
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Upload Compliance Evidence</p>
                       <p className="text-[9px] text-muted-foreground/60 mt-1 italic">Bills, Certificates, or Invoices (Max 10MB)</p>
                     </>
                   )}
                </label>
              </div>
              <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg text-[10px] text-muted-foreground font-medium border border-muted/50">
                <Shield className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                Evidence is hashed and stored in encrypted storage for ISO 14064 reconciliation.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-muted">
          <Button 
            type="submit" 
            variant="outline" 
            className="flex-1 font-black text-xs text-muted-foreground hover:bg-muted py-8 uppercase tracking-[.2em] border-muted-foreground/20 rounded-xl"
            disabled={!calcResult || createEntry.isPending} 
            onClick={() => setSubmitStatus('draft')}
          >
            Save Audit Draft
          </Button>
          <Button 
            type="submit" 
            className="flex-1 font-black bg-primary hover:bg-primary/90 text-white shadow-2xl py-8 rounded-xl text-lg uppercase tracking-widest ring-offset-background transition-all hover:scale-[1.02] active:scale-[0.98]" 
            disabled={!calcResult || createEntry.isPending} 
            onClick={() => setSubmitStatus('pending_audit')}
          >
            {createEntry.isPending ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> Finalizing...</span>
            ) : (
              'Submit for Formal Verification'
            )}
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


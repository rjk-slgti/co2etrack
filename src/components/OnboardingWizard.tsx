import { useState } from 'react';
import { 
  Building2, 
  ChevronRight, 
  Compass, 
  Flag, 
  Map, 
  ShieldCheck, 
  Sparkles,
  School,
  Factory,
  Home,
  CircuitBoard,
  Briefcase,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useWorkspaceSettings } from '@/hooks/useWorkspaceSettings';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const { settings, updateSettings } = useWorkspaceSettings();
  
  const [formData, setFormData] = useState({
    objective: settings.objective || 'Internal tracking',
    boundaryApproach: settings.boundaryApproach || 'Operational control',
    buildingType: settings.buildingType || 'commercial',
    organizationName: settings.organizationName || '',
    scopes: ['Scope 1', 'Scope 2', 'Scope 3'],
  });

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else {
      updateSettings(formData);
      toast.success('Organization boundary and reporting scope defined.');
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-2xl p-6">
      <Card className="w-full max-w-4xl border-white/20 shadow-2xl rounded-[40px] bg-white overflow-hidden ring-1 ring-slate-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="grid lg:grid-cols-[320px_1fr]">
          <div className="bg-slate-900 p-10 text-white flex flex-col justify-between">
            <div className="space-y-6">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <Compass className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black">Methodology Setup</h2>
                <p className="text-slate-400 text-sm font-medium">Step {step} of 4: Define the core accounting boundary.</p>
              </div>
              
              <div className="space-y-4 pt-8">
                {[
                  { s: 1, label: 'Audit Objective', icon: Flag },
                  { s: 2, label: 'Control Boundary', icon: Map },
                  { s: 3, label: 'Inventory Scope', icon: Target },
                  { s: 4, label: 'Asset Intelligence', icon: Building2 }
                ].map(({ s, label, icon: Icon }) => (
                  <div key={s} className={cn(
                    "flex items-center gap-4 transition-all duration-300",
                    step === s ? "opacity-100 scale-105" : "opacity-30"
                  )}>
                    <div className={cn(
                      "h-8 w-8 rounded-full border-2 flex items-center justify-center",
                      step === s ? "border-primary bg-primary text-white" : "border-white"
                    )}>
                      {step > s ? <ShieldCheck className="h-4 w-4" /> : <span className="text-xs font-bold">{s}</span>}
                    </div>
                    <span className="font-bold text-sm tracking-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Compliance Note</p>
              <p className="text-xs text-white/60 leading-relaxed italic">"Consistency in reporting scope ensures audit-ready disclosures."</p>
            </div>
          </div>

          <CardContent className="p-12">
            <div className="h-full flex flex-col justify-between">
              <div className="space-y-8">
                {step === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                    <div className="space-y-2">
                      <Label className="text-2xl font-black">Identify your audit objective</Label>
                      <p className="text-slate-500 font-medium italic">Why are you tracking emissions today?</p>
                    </div>
                    
                    <RadioGroup 
                      value={formData.objective} 
                      onValueChange={(v: any) => setFormData({...formData, objective: v})}
                      className="grid gap-4"
                    >
                      <ObjectiveOption 
                        value="Compliance" 
                        title="Regulatory Compliance" 
                        desc="Aligned with ISO 14064 or statutory SECR mandates." 
                      />
                      <ObjectiveOption 
                        value="Internal tracking" 
                        title="Corporate Sustainability" 
                        desc="Internal ESG goals and reduction performance." 
                      />
                      <ObjectiveOption 
                        value="Net-zero" 
                        title="Net-Zero Roadmap" 
                        desc="Focus on science-based targets and offsets." 
                      />
                    </RadioGroup>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                    <div className="space-y-2">
                      <Label className="text-2xl font-black">Select Organizational Boundary</Label>
                      <p className="text-slate-500 font-medium italic">How do you account for consolidated facilities?</p>
                    </div>
                    
                    <RadioGroup 
                      value={formData.boundaryApproach} 
                      onValueChange={(v: any) => setFormData({...formData, boundaryApproach: v})}
                      className="grid gap-4"
                    >
                      <BoundaryOption 
                        value="Operational control" 
                        title="Operational Control" 
                        desc="Account for 100% of emissions from operations you control." 
                      />
                      <BoundaryOption 
                        value="Financial control" 
                        title="Financial Control" 
                        desc="Emissions from entities where you have financial influence." 
                      />
                      <BoundaryOption 
                        value="Equity share" 
                        title="Equity Share" 
                        desc="Emissions proportional to your equity in each entity." 
                      />
                    </RadioGroup>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                    <div className="space-y-2">
                      <Label className="text-2xl font-black">Define Reporting Scope</Label>
                      <p className="text-slate-500 font-medium italic">Select the mandatory and optional scopes for this year.</p>
                    </div>
                    
                    <div className="space-y-4">
                      {['Scope 1', 'Scope 2', 'Scope 3'].map((scope) => (
                        <div key={scope} className="flex items-center justify-between p-6 border rounded-3xl hover:bg-slate-50 transition-colors">
                          <label htmlFor={scope} className="font-black text-lg text-slate-900 cursor-pointer">{scope}</label>
                          <Switch 
                            id={scope}
                            checked={formData.scopes.includes(scope)}
                            onCheckedChange={(checked) => {
                              if (checked) setFormData({...formData, scopes: [...formData.scopes, scope]});
                              else setFormData({...formData, scopes: formData.scopes.filter(s => s !== scope)});
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                    <div className="space-y-2">
                      <Label className="text-2xl font-black">Building & Asset Profile</Label>
                      <p className="text-slate-500 font-medium italic">This enables intelligent benchmarking (kg/m²).</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <AssetCard 
                        id="smart" 
                        name="Smart Building" 
                        icon={<CircuitBoard className="h-6 w-6" />}
                        selected={formData.buildingType === 'smart'}
                        onClick={() => setFormData({...formData, buildingType: 'smart'})}
                      />
                      <AssetCard 
                        id="commercial" 
                        name="Commercial Office" 
                        icon={<Briefcase className="h-6 w-6" />}
                        selected={formData.buildingType === 'commercial'}
                        onClick={() => setFormData({...formData, buildingType: 'commercial'})}
                      />
                      <AssetCard 
                        id="educational" 
                        name="Educational / Campus" 
                        icon={<School className="h-6 w-6" />}
                        selected={formData.buildingType === 'educational'}
                        onClick={() => setFormData({...formData, buildingType: 'educational'})}
                      />
                      <AssetCard 
                        id="industrial" 
                        name="Industrial / Plant" 
                        icon={<Factory className="h-6 w-6" />}
                        selected={formData.buildingType === 'industrial'}
                        onClick={() => setFormData({...formData, buildingType: 'industrial'})}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-12 border-t border-slate-100 mt-12">
                <Button 
                  variant="ghost" 
                  className="rounded-2xl font-bold text-slate-400"
                  onClick={() => step > 1 && setStep(step - 1)}
                  disabled={step === 1}
                >
                  Back
                </Button>
                <Button 
                  className="rounded-2xl px-12 h-14 bg-slate-900 text-white font-black shadow-xl shadow-slate-200"
                  onClick={nextStep}
                >
                  {step === 4 ? 'Initialize Workspace' : 'Continue'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

function ObjectiveOption({ value, title, desc }: { value: string; title: string; desc: string }) {
  return (
    <div className="flex items-center space-x-4 space-y-0 rounded-2xl border p-5 hover:bg-slate-50 transition-colors cursor-pointer">
      <RadioGroupItem value={value} id={value} />
      <Label htmlFor={value} className="flex-1 cursor-pointer">
        <p className="font-black text-lg text-slate-900">{title}</p>
        <p className="text-sm font-medium text-slate-500">{desc}</p>
      </Label>
    </div>
  );
}

function BoundaryOption({ value, title, desc }: { value: string; title: string; desc: string }) {
  return (
    <div className="flex items-center space-x-4 space-y-0 rounded-2xl border p-5 hover:bg-slate-50 transition-colors cursor-pointer">
      <RadioGroupItem value={value} id={value} />
      <Label htmlFor={value} className="flex-1 cursor-pointer">
        <p className="font-black text-lg text-slate-900">{title}</p>
        <p className="text-sm font-medium text-slate-500">{desc}</p>
      </Label>
    </div>
  );
}

function AssetCard({ id, name, icon, selected, onClick }: { id: string, name: string, icon: any, selected: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-4",
        selected ? "border-primary bg-primary/5 shadow-lg" : "border-slate-100 hover:border-slate-200 bg-white"
      )}
    >
      <div className={cn(
        "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
        selected ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:text-slate-600"
      )}>
        {icon}
      </div>
      <p className={cn("font-black tracking-tight", selected ? "text-primary" : "text-slate-600")}>{name}</p>
    </div>
  );
}

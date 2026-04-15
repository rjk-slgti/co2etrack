import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, Calendar, Building } from 'lucide-react';

const COUNTRIES = [
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'IN', name: 'India' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
];

export default function SettingsPage() {
  const [country, setCountry] = useState('LK');
  const [orgName, setOrgName] = useState('');
  const [gwpSet, setGwpSet] = useState('AR6');

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-muted pb-8">
        <div>
          <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-[.3em] text-[10px]">
            Governance Core
          </Badge>
          <h1 className="text-4xl font-black font-heading text-primary uppercase tracking-tighter">System Configuration</h1>
          <p className="text-muted-foreground font-medium italic mt-1">Manage organizational boundaries and reporting methodologies</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/20 px-6 py-3 rounded-2xl border border-muted/50">
           <Settings className="h-6 w-6 text-primary opacity-50" />
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Security Level</span>
              <span className="text-sm font-black text-primary uppercase italic tracking-tighter">Enterprise Audit</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-8">
          <Card className="shadow-2xl border-none bg-white rounded-3xl overflow-hidden ring-1 ring-black/5">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-8 px-8 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-xs font-black uppercase text-primary flex items-center gap-3 tracking-[.2em]">
                  <Building className="h-5 w-5 opacity-70" /> 01. Organizational Boundary
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Define the legal entity for GHG accounting</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Entity Name</Label>
                <Input 
                  value={orgName} 
                  onChange={(e) => setOrgName(e.target.value)} 
                  placeholder="e.g. SLGTI Global Solutions" 
                  className="h-14 bg-muted/30 border-none font-bold text-primary placeholder:text-muted-foreground/30 focus-visible:ring-primary rounded-xl"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Primary Operational Region</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="h-14 bg-muted/30 border-none font-bold rounded-xl text-primary">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-primary/40" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.code} className="font-bold">{c.name} ({c.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[9px] text-muted-foreground font-black italic uppercase tracking-widest ml-1 opacity-60">Influences emission factor selection hierarchy</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-none bg-white rounded-3xl overflow-hidden ring-1 ring-black/5">
            <CardHeader className="bg-primary pt-8 pb-8 px-8">
              <CardTitle className="text-xs font-black uppercase text-white flex items-center gap-3 tracking-[.2em]">
                <Settings className="h-5 w-5 opacity-70" /> 02. Methodology & Coefficients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Global Warming Potential (GWP) Set</Label>
                  <Select value={gwpSet} onValueChange={setGwpSet}>
                    <SelectTrigger className="h-14 bg-muted/30 border-none font-black rounded-xl text-primary"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AR4" className="font-bold">IPCC Fourth Assessment Report (AR4)</SelectItem>
                      <SelectItem value="AR5" className="font-bold">IPCC Fifth Assessment Report (AR5)</SelectItem>
                      <SelectItem value="AR6" className="font-bold">IPCC Sixth Assessment Report (AR6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-[.2em] mb-6 flex items-center gap-2">
                   Assurance Hierarchical Chain
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { rank: '1', title: 'National Level', desc: `Region: ${COUNTRIES.find(c => c.code === country)?.name}`, status: 'primary' },
                    { rank: '2', title: 'Regional Cluster', desc: 'Regional Averages', status: 'secondary' },
                    { rank: '3', title: 'DEFRA Equivalent', desc: 'Validated Indirects', status: 'secondary' },
                    { rank: '4', title: 'IPCC Default', desc: 'Fallback tier', status: 'outline' },
                  ].map((tier, i) => (
                    <div key={i} className="flex flex-col items-center text-center p-4 bg-white rounded-2xl shadow-sm border border-muted/50 group hover:border-primary/30 transition-all">
                       <Badge variant={tier.status as any} className="mb-3 font-black text-[10px] px-3">TIER {tier.rank}</Badge>
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{tier.title}</span>
                       <span className="text-[9px] text-muted-foreground font-bold italic">{tier.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-2xl border-none bg-white rounded-3xl overflow-hidden ring-1 ring-black/5">
            <CardHeader className="bg-muted/30 border-b border-muted/50 pt-8 pb-8 px-8">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-black uppercase text-muted-foreground flex items-center gap-3 tracking-[.2em]">
                  <Calendar className="h-5 w-5 opacity-70" /> 03. Active Inventory Libraries
                </CardTitle>
                <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest italic px-3 py-1">ISO 14064 Optimized</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'DEFRA 2024', sub: 'GHG Conversion Standards', icon: ShieldCheck },
                  { name: 'IPCC AR6 Defaults', sub: 'Calculated Coefficients', icon: ShieldCheck },
                  { name: 'SL Grid Factor', sub: 'Power Utility Registry', icon: ShieldCheck },
                ].map((lib, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-muted/20 rounded-2xl border border-muted/50 group hover:bg-white hover:shadow-xl transition-all duration-500">
                    <div className="space-y-1">
                      <p className="font-black text-primary uppercase tracking-tighter text-sm">{lib.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold italic leading-none">{lib.sub}</p>
                    </div>
                    <Badge className="bg-primary shadow-lg shadow-primary/20 text-white font-black italic text-[9px] uppercase tracking-widest">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { ShieldCheck } from 'lucide-react';


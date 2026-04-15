import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActivityEntries } from '@/hooks/useActivityEntries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatEmission } from '@/lib/calculation-engine';
import { FileText, CheckCircle, XCircle, ShieldAlert, BadgeCheck, ExternalLink, Calendar, Layers, Search, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuditorPortal() {
  const { data: entries, isLoading } = useActivityEntries();
  const { toast } = useToast();
  const { toast } = useToast();

  const handleVerify = async (entryId: string, orgId: string) => {
    try {
      await updateStatus.mutateAsync({ entryId, status: 'verified', orgId });
      toast({ title: 'Record Verified', description: 'The emission data is now part of the official disclosure statement.' });
    } catch(e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleReject = async (entryId: string, orgId: string) => {
    try {
      await updateStatus.mutateAsync({ entryId, status: 'rejected', orgId });
      toast({ title: 'Record Rejected', description: 'Entry has been reverted to draft for correction.' });
    } catch(e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const viewEvidence = async (path: string) => {
    if (path === 'mock_path') {
      toast({ title: 'Mock Evidence', description: 'This is mock evidence stored locally. No file was uploaded.' });
      return;
    }
    const { data } = await supabase.storage.from('evidence').createSignedUrl(path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-primary/10 pb-10">
        <div>
          <Badge variant="outline" className="mb-4 bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-[.3em] text-[9px] px-3">
            Assurance Gateway
          </Badge>
          <h1 className="text-5xl font-black font-heading text-primary uppercase tracking-tighter">Compliance Review</h1>
          <p className="text-muted-foreground font-medium italic mt-2 text-lg">Maker-Checker Verification Workflow • ISO 14064 Compliance</p>
        </div>
        <div className="flex items-center gap-6 bg-white shadow-2xl rounded-3xl p-6 ring-1 ring-black/5">
           <div className="flex flex-col items-center border-r border-primary/10 pr-6 gap-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Queue</span>
              <span className="text-2xl font-black text-primary tabular-nums tracking-tighter">{entries?.length || 0}</span>
           </div>
           <div className="flex flex-col items-start gap-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">System Trust</span>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-black text-primary italic uppercase tracking-tighter">Secure Stream</span>
              </div>
           </div>
        </div>
      </div>


      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-32 text-muted-foreground italic bg-white/50 rounded-3xl border-2 border-dashed border-muted">
           <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-xl" />
           </div>
           <span className="font-bold tracking-widest text-xs uppercase animate-pulse">Decrypting Audit Records...</span>
        </div>
      ) : (entries ?? []).length === 0 ? (
        <Card className="border-2 border-dashed bg-muted/5 rounded-3xl">
          <CardContent className="pt-20 pb-20 text-center">
            <div className="p-4 bg-primary/10 w-fit mx-auto rounded-full mb-6">
              <BadgeCheck className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-xl font-black text-primary uppercase tracking-tight">System Purged</h3>
            <p className="text-muted-foreground italic mt-2 font-medium">All submitted emission records have been successfully reconciled and verified.</p>
            <Button variant="outline" className="mt-8 font-black uppercase tracking-widest text-[10px] border-primary/20 text-primary" onClick={() => window.location.href = '/'}>
               Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {(entries ?? []).map((entry: any) => (
            <Card key={entry.id} className="overflow-hidden shadow-xl border-none bg-white group hover:scale-[1.01] transition-all duration-300 ring-1 ring-black/5">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <CardHeader className="pb-6 pt-6 px-8 border-b border-muted/20 bg-muted/5 relative">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-2 py-0.5 tracking-tighter italic shadow-sm hover:bg-primary/20 transition-colors">
                         {entry.scope}
                       </Badge>
                       <CardTitle className="text-2xl font-black font-heading text-primary uppercase tracking-tight">
                         {entry.category}
                       </CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-6 text-xs font-bold text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-secondary" /> {new Date(entry.entry_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-secondary" /> {entry.activity_type}</span>
                      <span className="flex items-center gap-1.5 uppercase tracking-tighter"><Search className="w-3.5 h-3.5 text-secondary" /> {entry.scope_category || "General"}</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="bg-orange-500/5 text-orange-600 border-orange-500/20 text-[10px] uppercase font-black px-3 py-1 italic tracking-widest shadow-sm">
                      Awaiting Audit
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-black opacity-50 tabular-nums uppercase">UUID: {entry.id.split('-')[0]}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 pb-8 px-8 grid md:grid-cols-12 gap-10 bg-gradient-to-br from-white to-muted/5">
                <div className="md:col-span-3 border-r border-muted/30 pr-8 space-y-6">
                   <div className="relative">
                     <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[.2em] mb-2 block">Computed Impact</Label>
                     <div className="text-4xl font-black text-gray-900 tabular-nums flex items-baseline gap-2">
                       {formatEmission(entry.emission_kgco2e).split(' ')[0]}
                       <span className="text-sm font-bold text-muted-foreground lowercase">{formatEmission(entry.emission_kgco2e).split(' ')[1]}</span>
                     </div>
                     <div className="mt-2 text-[11px] font-bold text-primary/80 bg-primary/5 w-fit px-2 py-0.5 rounded border border-primary/10">
                        {entry.quantity.toLocaleString()} {entry.unit}
                     </div>
                   </div>
                </div>

                <div className="md:col-span-5 border-r border-muted/30 pr-8 space-y-6">
                   <div className="space-y-4">
                     <div>
                       <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[.2em] mb-2 block">Source Methodology</Label>
                       <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-primary italic uppercase tracking-tight">{entry.emission_factor_headers?.source || "Internal Database"}</p>
                          <Badge variant="secondary" className="text-[9px] bg-muted inline-flex items-center font-bold px-1.5 py-0 border-none">V{entry.emission_factor_headers?.source_version || "2024.1"}</Badge>
                       </div>
                       <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Applied Region: {entry.emission_factor_headers?.region || "GLOBAL"}</p>
                     </div>
                     
                     {entry.is_assumed_factor ? (
                       <div className="flex items-center gap-2.5 text-orange-600 bg-orange-50 p-3 rounded-xl border border-orange-100 shadow-sm">
                          <ShieldAlert className="w-5 h-5 shrink-0" />
                          <div className="flex flex-col leading-none">
                             <span className="text-[10px] font-black uppercase italic tracking-widest block mb-0.5">Proxy Factor Applied</span>
                             <span className="text-[9px] text-orange-900/60 font-bold">Standard emission factor unavailable for this activity type.</span>
                          </div>
                       </div>
                     ) : (
                       <div className="flex items-center gap-2.5 text-primary bg-primary/5 p-3 rounded-xl border border-primary/10 shadow-sm">
                          <CheckCircle className="w-5 h-5 shrink-0" />
                          <div className="flex flex-col leading-none">
                             <span className="text-[10px] font-black uppercase italic tracking-widest block mb-0.5">Verified Standard Factor</span>
                             <span className="text-[9px] text-primary/60 font-bold">Matched with 100% confidence to official GHG database.</span>
                          </div>
                       </div>
                     )}
                   </div>
                </div>

                <div className="md:col-span-4 flex flex-col justify-between items-stretch pl-2 space-y-6">
                  <div>
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[.2em] block mb-3">Evidence Artifacts</Label>
                    {entry.activity_evidence && entry.activity_evidence.length > 0 ? (
                      <Button variant="outline" className="w-full font-black text-xs h-12 border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm flex justify-between px-4 group" onClick={() => viewEvidence(entry.activity_evidence[0].file_path)}>
                        <div className="flex items-center gap-3">
                           <FileText className="w-4 h-4 text-primary group-hover:text-white" />
                           <span className="uppercase tracking-widest">{entry.activity_evidence[0].file_name || "View Submission"}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                      </Button>
                    ) : (
                      <div className="w-full flex items-center justify-center h-12 bg-muted/20 rounded-xl border-2 border-dashed border-muted/50 text-[10px] uppercase font-black italic text-muted-foreground tracking-widest">
                        NO ARTIFACT ATTACHED
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 w-full pt-2">
                    <Button variant="outline" className="flex-1 font-black text-xs text-red-600 border-red-100 bg-red-50/30 hover:bg-red-500 hover:text-white hover:border-red-500 py-6 uppercase tracking-widest shadow-sm transition-all" onClick={() => handleReject(entry.id, entry.organization_id)}>
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button className="flex-1 font-black text-xs bg-primary hover:bg-primary/95 text-white shadow-xl py-6 rounded-xl uppercase tracking-widest ring-offset-background transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={() => handleVerify(entry.id, entry.organization_id)}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Verify
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


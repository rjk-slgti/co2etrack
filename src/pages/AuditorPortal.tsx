import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActivityEntries, useUpdateEntryStatus } from '@/hooks/useActivityEntries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEmission } from '@/lib/calculation-engine';
import { FileText, CheckCircle, XCircle, ShieldAlert, BadgeCheck, ExternalLink, Calendar, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuditorPortal() {
  const { data: entries, isLoading } = useActivityEntries(undefined, 'pending_audit');
  const updateStatus = useUpdateEntryStatus();
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-muted pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-heading text-primary uppercase tracking-tight">Auditor Review Portal</h1>
          <p className="text-muted-foreground font-medium italic">Maker-Checker Compliance Workflow (ISO 14064)</p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-bold">
          {entries?.length || 0} Awaiting Verification
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-muted-foreground italic">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
           Accessing encrypted audit records...
        </div>
      ) : (entries ?? []).length === 0 ? (
        <Card className="border-dashed bg-muted/5">
          <CardContent className="pt-12 pb-12 text-center text-muted-foreground italic">
            <BadgeCheck className="w-12 h-12 text-primary/20 mx-auto mb-4" />
            Clearance Achieved: All submitted records have been processed.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {(entries ?? []).map((entry: any) => (
            <Card key={entry.id} className="overflow-hidden shadow-md border-none hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-4 border-b border-muted/20 bg-muted/10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <CardTitle className="text-xl font-heading text-primary font-black uppercase tracking-tight">
                         {entry.category}
                       </CardTitle>
                       <Badge className="bg-primary text-white text-[9px] uppercase tracking-widest px-2 py-0 border-none font-bold italic">{entry.scope}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-xs font-semibold">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-secondary" /> {new Date(entry.entry_date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-secondary" /> {entry.activity_type}</span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px] uppercase font-black italic">Awaiting Audit</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-6 grid md:grid-cols-3 gap-8">
                <div className="space-y-4">
                   <div>
                     <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Calculated Impact</Label>
                     <div className="text-3xl font-black text-gray-900 tabular-nums">
                       {formatEmission(entry.emission_kgco2e)}
                     </div>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-muted-foreground">INPUT QUANTITY</span>
                      <span className="text-sm font-black tabular-nums">{entry.quantity.toLocaleString()} {entry.unit}</span>
                   </div>
                </div>

                <div className="border-l border-muted/20 pl-6 space-y-4">
                   <div>
                     <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Source Methodology</Label>
                     <p className="text-sm font-bold text-primary italic mt-1">{entry.emission_factor_headers?.source || "Internal Database"}</p>
                     <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">VER: {entry.emission_factor_headers?.source_version || "2024.1"}</p>
                   </div>
                   {entry.is_assumed_factor && (
                     <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase italic tracking-tighter">Non-Standard Factor Applied</span>
                     </div>
                   )}
                </div>

                <div className="flex flex-col items-end justify-between border-l border-muted/20 pl-6 space-y-4">
                  <div className="w-full">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mb-2">Evidence Attachment</Label>
                    {entry.activity_evidence && entry.activity_evidence.length > 0 ? (
                      <Button variant="outline" size="sm" className="w-full font-bold border-primary/20 hover:bg-primary/5 text-primary" onClick={() => viewEvidence(entry.activity_evidence[0].file_path)}>
                        <FileText className="w-4 h-4 mr-2" /> View Audit Evidence <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    ) : (
                      <div className="w-full p-2 bg-muted/20 rounded border border-muted/30 text-[10px] text-center italic text-muted-foreground font-medium">
                        NO DOCUMENTATION ATTACHED
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 w-full">
                    <Button variant="outline" className="flex-1 font-black text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-500 uppercase tracking-widest" onClick={() => handleReject(entry.id, entry.organization_id)}>
                      <XCircle className="w-4 h-4 mr-1.5" /> Reject
                    </Button>
                    <Button className="flex-1 font-black text-xs bg-primary hover:bg-primary/90 text-white shadow-sm uppercase tracking-widest" onClick={() => handleVerify(entry.id, entry.organization_id)}>
                      <CheckCircle className="w-4 h-4 mr-1.5" /> Verify
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

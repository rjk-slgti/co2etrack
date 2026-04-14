import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActivityEntries, useUpdateEntryStatus } from '@/hooks/useActivityEntries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatEmission } from '@/lib/calculation-engine';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuditorPortal() {
  const { data: entries, isLoading } = useActivityEntries(undefined, 'pending_audit');
  const updateStatus = useUpdateEntryStatus();
  const { toast } = useToast();

  const handleVerify = async (entryId: string, orgId: string) => {
    try {
      await updateStatus.mutateAsync({ entryId, status: 'verified', orgId });
      toast({ title: 'Entry verified', description: 'Data is now locked and verified.' });
    } catch(e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleReject = async (entryId: string, orgId: string) => {
    try {
      await updateStatus.mutateAsync({ entryId, status: 'rejected', orgId });
      toast({ title: 'Entry rejected', description: 'Sent back to draft.' });
    } catch(e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const viewEvidence = async (path: string) => {
    const { data } = await supabase.storage.from('evidence').createSignedUrl(path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auditor Portal</h1>
        <p className="text-muted-foreground">Review and verify submissions (Maker-Checker Workflow)</p>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (entries ?? []).length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No entries pending audit.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(entries ?? []).map((entry: any) => (
            <Card key={entry.id}>
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {entry.category} - {entry.activity_type}
                    </CardTitle>
                    <CardDescription>{new Date(entry.entry_date).toLocaleDateString()} | Scope: {entry.scope}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending Audit</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Input:</span> {entry.quantity} {entry.unit}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Factor:</span> {entry.emission_factor_headers?.source}
                  </div>
                  <div className="text-xl font-bold text-primary mt-2">
                    {formatEmission(entry.emission_kgco2e)}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between space-y-2">
                  {entry.activity_evidence && entry.activity_evidence.length > 0 ? (
                    <Button variant="outline" size="sm" onClick={() => viewEvidence(entry.activity_evidence[0].file_path)}>
                      <FileText className="w-4 h-4 mr-2" /> View Evidence
                    </Button>
                  ) : (
                    <span className="text-sm text-yellow-600 flex items-center gap-1">
                      No Evidence Provided
                    </span>
                  )}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleReject(entry.id, entry.organization_id)}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleVerify(entry.id, entry.organization_id)}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Verify
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

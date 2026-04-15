import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, User, Terminal, ListChecks } from 'lucide-react';

export default function AuditLog() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;
        return data;
      } catch (e) {
        console.error("Audit Log fetch failed", e);
        return [];
      }
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-muted pb-8">
        <div>
          <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-[.3em] text-[9px]">
            Security & Governance
          </Badge>
          <h1 className="text-4xl font-black font-heading text-primary uppercase tracking-tighter">System Audit Trail</h1>
          <p className="text-muted-foreground font-medium italic mt-1">Immutable ledger of administrative & methodology changes (ISO 14064-1 compliance)</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/20 px-6 py-3 rounded-2xl border border-muted/50">
           <Shield className="h-6 w-6 text-primary opacity-50" />
           <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Integrity Status</span>
              <span className="text-sm font-black text-primary uppercase italic tracking-tighter">Operational</span>
           </div>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden ring-1 ring-black/5">
        <CardHeader className="bg-primary pt-6 pb-6 px-8 border-b border-white/10">
          <CardTitle className="text-xs font-black uppercase text-white flex items-center gap-3 tracking-[.2em]">
            <Terminal className="h-5 w-5 opacity-70" /> System Activity Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-32 flex flex-col items-center justify-center text-muted-foreground gap-4">
               <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  <div className="relative animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent shadow-lg" />
               </div>
               <span className="font-black uppercase tracking-[.3em] text-[10px]">Decrypting Ledger...</span>
            </div>
          ) : (logs ?? []).length === 0 ? (
            <div className="p-32 text-center">
               <div className="p-4 bg-muted/10 w-fit mx-auto rounded-full mb-6">
                  <ListChecks className="w-12 h-12 text-muted-foreground/30" />
               </div>
               <h3 className="text-lg font-black text-primary uppercase tracking-tight">No Temporal Records</h3>
               <p className="text-muted-foreground font-medium italic mt-2">The system audit trail is currently empty. Initialize administrative actions to record logs.</p>
            </div>
          ) : (
            <div className="divide-y divide-muted/10">
              {(logs ?? []).map(log => (
                <div key={log.id} className="p-8 hover:bg-primary/5 transition-all duration-300 group relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className="bg-primary hover:bg-primary border-none text-[9px] uppercase font-black px-3 py-1 tracking-widest shadow-sm italic">
                          {log.action}
                        </Badge>
                        {log.factor_source && (
                          <Badge variant="outline" className="text-[9px] uppercase font-black text-muted-foreground border-muted/50 bg-muted/10 px-2 py-0.5 tracking-tighter">
                            {log.factor_source}
                          </Badge>
                        )}
                        {log.gwp_set && (
                          <Badge variant="outline" className="text-[9px] uppercase font-black text-muted-foreground border-muted/50 bg-muted/10 px-2 py-0.5 tracking-tighter">
                            GWP: {log.gwp_set}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-[11px] text-muted-foreground font-black uppercase tracking-widest">
                         <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-secondary opacity-70" /> {new Date(log.created_at).toLocaleString()}</div>
                         <div className="flex items-center gap-2">
                           <User className="w-4 h-4 text-secondary opacity-70" /> 
                           <span className="bg-muted px-2 py-0.5 rounded border border-muted/50 text-[10px] lowercase">{log.user_id}</span>
                         </div>
                      </div>
                    </div>

                    {log.details && (
                       <div className="lg:w-2/5 group-hover:scale-[1.02] transition-transform duration-500">
                         <div className="flex items-center gap-2 mb-3">
                            <Terminal className="w-4 h-4 text-primary opacity-50" />
                            <span className="text-[9px] font-black uppercase tracking-[.2em] text-muted-foreground">Contextual Metadata</span>
                         </div>
                         <div className="bg-[#0f172a] rounded-2xl p-5 font-mono text-[10px] text-emerald-400 overflow-x-auto border border-white/5 shadow-2xl relative">
                            <div className="absolute top-3 right-3 flex gap-1">
                               <div className="w-2 h-2 rounded-full bg-red-400/30" />
                               <div className="w-2 h-2 rounded-full bg-yellow-400/30" />
                               <div className="w-2 h-2 rounded-full bg-green-400/30" />
                            </div>
                            <pre className="whitespace-pre-wrap leading-relaxed opacity-90">
                               {JSON.stringify(log.details, null, 2)}
                            </pre>
                         </div>
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex items-center gap-4 p-8 bg-primary/5 rounded-3xl border border-primary/20">
         <Shield className="w-10 h-10 text-primary opacity-20" />
         <div>
            <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Immutable Audit Trail</p>
            <p className="text-[11px] text-muted-foreground font-medium italic leading-relaxed">This ledger is protected by write-once logic. Deleting or modifying individual log entries is restricted to maintain a valid ISO 14064 compliance chain. Use this log for periodic sanity checks and regulatory assurance.</p>
         </div>
      </div>
    </div>
  );
}


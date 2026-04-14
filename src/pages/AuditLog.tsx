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
        // Fallback or handle error
        console.error("Audit Log fetch failed", e);
        return [];
      }
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-muted pb-4">
        <h1 className="text-3xl font-bold font-heading text-primary uppercase tracking-tight">System Audit Trail</h1>
        <p className="text-muted-foreground font-medium italic">Immutable history of administrative & methodology changes (ISO 14064-1 compliance)</p>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10 py-6">
          <CardTitle className="text-sm font-black uppercase text-primary flex items-center gap-2 tracking-widest">
            <Shield className="h-4 w-4" /> Integrity Monitoring Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground italic flex flex-col items-center gap-3">
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
               Decrypting logs...
            </div>
          ) : (logs ?? []).length === 0 ? (
            <div className="p-20 text-center space-y-4">
               <ListChecks className="w-12 h-12 text-muted/30 mx-auto" />
               <p className="text-muted-foreground italic">No system actions recorded in the current session.</p>
            </div>
          ) : (
            <div className="divide-y divide-muted/10">
              {(logs ?? []).map(log => (
                <div key={log.id} className="p-6 hover:bg-muted/5 transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-primary hover:bg-primary border-none text-[9px] uppercase font-black px-2 py-0.5">{log.action}</Badge>
                        {log.factor_source && <Badge variant="outline" className="text-[9px] uppercase font-bold text-muted-foreground border-muted/40">{log.factor_source}</Badge>}
                        {log.gwp_set && <Badge variant="outline" className="text-[9px] uppercase font-bold text-muted-foreground border-muted/40">GWP: {log.gwp_set}</Badge>}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground font-semibold">
                         <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-secondary" /> {new Date(log.created_at).toLocaleString()}</div>
                         <div className="flex items-center gap-1"><User className="w-3 h-3 text-secondary" /> {log.user_id.slice(0, 8)}...</div>
                      </div>
                    </div>

                    {log.details && (
                       <div className="md:w-1/3">
                         <div className="flex items-center gap-1.5 mb-2">
                            <Terminal className="w-3 h-3 text-primary opacity-50" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Log Details</span>
                         </div>
                         <div className="bg-gray-900 rounded p-3 font-mono text-[9px] text-green-400 overflow-x-auto border border-white/5 shadow-inner">
                            {JSON.stringify(log.details, null, 2)}
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
    </div>
  );
}

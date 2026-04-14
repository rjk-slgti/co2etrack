import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export default function AuditLog() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">ISO 14064 compliant audit trail of all system actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (logs ?? []).length === 0 ? (
            <p className="text-muted-foreground">No audit entries yet. Actions will be logged as you use the system.</p>
          ) : (
            <div className="space-y-3">
              {(logs ?? []).map(log => (
                <div key={log.id} className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{log.action}</Badge>
                      {log.factor_source && <Badge variant="secondary">{log.factor_source}</Badge>}
                      {log.gwp_set && <Badge variant="secondary">{log.gwp_set}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      User: {log.user_id.slice(0, 8)}... | {new Date(log.created_at).toLocaleString()}
                    </p>
                    {log.details && (
                      <pre className="mt-2 rounded bg-muted p-2 text-xs overflow-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
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

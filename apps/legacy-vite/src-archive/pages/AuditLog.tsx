import { useDeferredValue, useMemo, useState } from 'react';
import { Clock3, Search, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuditLogs } from '@/hooks/useActivityEntries';

export default function AuditLog() {
  const { data: logs, isLoading } = useAuditLogs();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const filteredLogs = useMemo(
    () =>
      (logs ?? []).filter((log: any) =>
        JSON.stringify({
          action: log.action,
          factor_source: log.factor_source,
          details: log.details,
          user_id: log.user_id,
        })
          .toLowerCase()
          .includes(deferredSearch.toLowerCase())
      ),
    [deferredSearch, logs]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-none bg-primary/10 text-primary">Audit trail</Badge>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground">Track who changed what, when, and why.</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            The audit trail preserves emissions entry changes, factor decisions, evidence actions, and workflow approvals.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search the audit trail" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </section>

      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Immutable activity log
          </CardTitle>
          <CardDescription>Append-only records designed to support internal review and external assurance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Loading audit trail...
            </div>
          )}

          {!isLoading &&
            filteredLogs.map((log: any) => (
              <div key={log.id} className="rounded-3xl border border-border/70 bg-background/80 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{log.action}</Badge>
                      {log.factor_source && <Badge variant="outline">{log.factor_source}</Badge>}
                      {log.gwp_set && <Badge variant="outline">{log.gwp_set}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      User: {log.user_id} | Entry: {log.activity_entry_id ?? 'n/a'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
                {log.details && (
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs text-emerald-300">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}

          {!isLoading && filteredLogs.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
              No audit events match the current search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

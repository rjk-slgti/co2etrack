import { useDeferredValue, useMemo, useState } from 'react';
import { CheckCircle2, Filter, Search, ShieldCheck, Undo2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import { useAuditWorkspace } from '@/hooks/useAuditWorkspace';
import { useUpdateActivityEntryWorkflow } from '@/hooks/useActivityEntries';
import { formatKg } from '@/lib/audit-analytics';

export default function AuditorPortal() {
  const { entries, summary } = useAuditWorkspace();
  const updateWorkflow = useUpdateActivityEntryWorkflow();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const queueEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const matchesSearch = [entry.activity_type, entry.category, entry.scope]
          .join(' ')
          .toLowerCase()
          .includes(deferredSearch.toLowerCase());
        return matchesSearch;
      }),
    [deferredSearch, entries]
  );

  const pendingCount = queueEntries.filter((entry) => entry.status === 'pending_audit').length;
  const reviewedCount = queueEntries.filter((entry) => entry.status === 'verified').length;
  const approvalProgress = queueEntries.length === 0 ? 0 : (reviewedCount / queueEntries.length) * 100;

  const updateEntry = async (entry: any, mode: 'verified' | 'rejected' | 'draft') => {
    try {
      const timestamp = new Date().toISOString();
      const patch =
        mode === 'verified'
          ? {
              id: entry.id,
              organization_id: entry.organization_id,
              status: 'verified',
              validation_status: 'validated',
              approval_status: 'approved',
              confidence_score: Math.max(entry.confidence_score ?? 70, 85),
              reviewed_at: timestamp,
              approved_at: timestamp,
            }
          : mode === 'rejected'
            ? {
                id: entry.id,
                organization_id: entry.organization_id,
                status: 'rejected',
                validation_status: 'rejected',
                approval_status: 'rejected',
                reviewed_at: timestamp,
              }
            : {
                id: entry.id,
                organization_id: entry.organization_id,
                status: 'draft',
                validation_status: 'pending',
                approval_status: 'not_required',
              };

      await updateWorkflow.mutateAsync(patch);
      toast({
        title:
          mode === 'verified'
            ? 'Entry verified'
            : mode === 'rejected'
              ? 'Entry rejected'
              : 'Returned to draft',
        description: `${entry.activity_type} was updated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Workflow update failed',
        description: error.message ?? 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="border-none bg-primary/10 text-primary">Audit center</Badge>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-foreground">Review data quality, clear the queue, and approve the reporting pack.</h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Auditors can move through pending records, see evidence coverage, and complete the maker-checker flow from one screen.
          </p>
        </div>
        <div className="w-full max-w-sm rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Approval progress</span>
            <span className="font-semibold text-foreground">{approvalProgress.toFixed(0)}%</span>
          </div>
          <Progress value={approvalProgress} className="mt-3" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Pending review" value={String(pendingCount)} helper="Entries waiting for validation" />
        <MetricCard label="Verified records" value={String(reviewedCount)} helper="Entries already cleared for reporting" />
        <MetricCard label="Open smart alerts" value={String(summary.signals.length)} helper="Signals still affecting audit readiness" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Review queue</CardTitle>
                <CardDescription>Search the queue, inspect the evidence, and apply a workflow decision.</CardDescription>
              </div>
              <div className="relative w-full lg:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search scope, category, or activity" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {queueEntries.map((entry) => (
              <div key={entry.id} className="rounded-3xl border border-border/70 bg-background/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={entry.status ?? 'draft'} />
                      <Badge variant="outline">{entry.scope}</Badge>
                      <Badge variant="outline">{entry.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{entry.activity_type}</h3>
                    <p className="text-sm text-muted-foreground">
                      {entry.quantity.toLocaleString()} {entry.unit} | {formatKg(entry.emission_kgco2e)} | Confidence {entry.confidence_score ?? 70}%
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{entry.entry_date}</span>
                      <span>Evidence: {entry.activity_evidence?.length ?? 0}</span>
                      <span>Quality: {entry.data_quality ?? 'Medium'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => updateEntry(entry, 'draft')}
                    >
                      <Undo2 className="mr-2 h-4 w-4" />
                      Return to draft
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-red-500/20 bg-red-500/10 text-red-700 hover:bg-red-500 hover:text-white dark:text-red-300"
                      onClick={() => updateEntry(entry, 'rejected')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button type="button" className="rounded-full" onClick={() => updateEntry(entry, 'verified')}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify and approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {queueEntries.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No entries match the current filter.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Compliance checklist
              </CardTitle>
              <CardDescription>Standards-focused checks for the current reporting pack.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.checklist.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{item.requirement}</p>
                    <Badge variant="outline" className="capitalize">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Smart audit findings
              </CardTitle>
              <CardDescription>Automated signals that still need reviewer attention.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.signals.map((signal) => (
                <div key={signal.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="font-semibold text-foreground">{signal.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{signal.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardContent className="space-y-2 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

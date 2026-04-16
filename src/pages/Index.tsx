import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  FileText,
  Leaf,
  ScanSearch,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/KpiCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuditWorkspace } from '@/hooks/useAuditWorkspace';
import { useOrganizationCatalog } from '@/hooks/useOrganizationCatalog';
import { formatKg } from '@/lib/audit-analytics';
import { SCOPE_COLORS } from '@/lib/constants';

export default function Dashboard() {
  const { entries, summary, isLoading } = useAuditWorkspace();
  const { data: catalog } = useOrganizationCatalog();
  const activePeriod =
    catalog?.reportingPeriods.find((period) => period.status === 'active') ?? catalog?.reportingPeriods[0];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
          <p className="text-sm text-muted-foreground">Preparing your carbon audit command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(15,95,75,0.96),rgba(20,108,148,0.9))] text-white shadow-xl">
          <CardContent className="space-y-6 p-7">
            <Badge className="border-none bg-white/15 text-white">10-minute guided audit flow</Badge>
            <div className="space-y-3">
              <h2 className="max-w-2xl text-4xl font-black tracking-tight">
                Collect data, verify anomalies, and publish a board-ready carbon report from one workspace.
              </h2>
              <p className="max-w-2xl text-white/80">
                The app now combines activity capture, audit controls, smart anomaly warnings, and one-click report exports
                for scopes 1, 2, and 3.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-white text-slate-950 hover:bg-white/90">
                <Link to="/data-entry">
                  Start the audit wizard
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link to="/reports">Generate report</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/65">Active period</p>
                <p className="mt-2 text-lg font-semibold">{activePeriod?.name ?? 'FY2026'}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/65">Report readiness</p>
                <p className="mt-2 text-lg font-semibold">{summary.verifiedShare}% verified</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/65">Smart alerts</p>
                <p className="mt-2 text-lg font-semibold">{summary.signals.length} open insights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ScanSearch className="h-5 w-5 text-primary" />
              Audit readiness
            </CardTitle>
            <CardDescription>Critical items to clear before report sign-off.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.signals.length === 0 ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
                No major warnings are open. The workspace is ready for the next report pack.
              </div>
            ) : (
              summary.signals.slice(0, 3).map((signal) => (
                <div key={signal.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-500/15 p-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{signal.title}</p>
                      <p className="text-sm text-muted-foreground">{signal.detail}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link to="/auditor">Open audit center</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total footprint"
          value={formatKg(summary.totalKg)}
          helper="Combined emissions for the active reporting period"
          icon={<Leaf className="h-5 w-5" />}
        />
        <KpiCard
          label="Verified coverage"
          value={`${summary.verifiedShare}%`}
          helper="Entries already reviewed and cleared"
          icon={<ClipboardCheck className="h-5 w-5" />}
        />
        <KpiCard
          label="Evidence coverage"
          value={`${summary.evidenceCoverage}%`}
          helper="Entries with attached invoices, bills, or evidence"
          icon={<FileText className="h-5 w-5" />}
        />
        <KpiCard
          label="Next-month forecast"
          value={formatKg(summary.forecast.nextPeriodKg)}
          helper={`${summary.forecast.trendPercent}% versus latest actual month`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Emissions trend and forecast</CardTitle>
            <CardDescription>Monthly actuals with a forward-looking forecast for the next reporting cycle.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.18)" />
                <XAxis dataKey="label" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="actualKg" stroke="#0f5f4b" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="forecastKg" stroke="#146c94" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Top drivers</CardTitle>
            <CardDescription>Largest footprint contributors across all scopes.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.topDrivers}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.18)" />
                <XAxis dataKey="label" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} />
                <Tooltip />
                <Bar dataKey="totalKg" radius={[8, 8, 0, 0]}>
                  {summary.topDrivers.map((driver) => (
                    <Cell key={`${driver.label}-${driver.scope}`} fill={SCOPE_COLORS[driver.scope] ?? '#0f5f4b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 bg-card/80 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Newest entries in the audit workspace with workflow status and evidence coverage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.slice(0, 6).map((entry) => (
              <div
                key={entry.id}
                className="grid gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 md:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p className="font-semibold text-foreground">{entry.activity_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.scope} | {entry.category} | {entry.quantity.toLocaleString()} {entry.unit}
                  </p>
                </div>
                <div className="text-sm font-medium text-foreground">{formatKg(entry.emission_kgco2e)}</div>
                <div className="flex items-center justify-end gap-2">
                  <StatusBadge status={entry.status ?? 'draft'} />
                  <Badge variant="outline" className="capitalize">
                    {(entry.activity_evidence?.length ?? 0) > 0 ? 'Evidence attached' : 'Needs evidence'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Compliance pulse</CardTitle>
            <CardDescription>How the current workspace is tracking against core disclosure expectations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.checklist.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{item.requirement}</p>
                  <Badge
                    variant="outline"
                    className={
                      item.status === 'pass'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : item.status === 'warning'
                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300'
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Reduction opportunities</CardTitle>
            <CardDescription>Suggested actions derived from top drivers and current data quality signals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.reductionOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{opportunity.title}</p>
                  <Badge variant="outline" className="capitalize">
                    {opportunity.priority} priority
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{opportunity.description}</p>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Estimated reduction: {formatKg(opportunity.estimatedReductionKg)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Scope breakdown</CardTitle>
            <CardDescription>A quick view of how the footprint is distributed across scopes 1, 2, and 3.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.scopeSummary.map((scope) => (
              <div key={scope.scope} className="space-y-2 rounded-2xl border border-border/70 bg-background/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{scope.scope}</p>
                  <p className="text-sm text-muted-foreground">{scope.share}% of total</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${scope.share}%`,
                      backgroundColor: SCOPE_COLORS[scope.scope],
                    }}
                  />
                </div>
                <p className="text-sm font-medium text-foreground">{formatKg(scope.totalKg)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

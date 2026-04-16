import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Database,
  FileText,
  Hexagon,
  Leaf,
  ScanSearch,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
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
  const { entries, summary, organization, isLoading } = useAuditWorkspace();
  const { data: catalog } = useOrganizationCatalog();
  const activePeriod =
    catalog?.reportingPeriods.find((period) => period.status === 'active') ?? catalog?.reportingPeriods[0];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
          <p className="text-sm text-slate-500">Preparing your carbon audit command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      {/* 1. Elite Hero Section */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden border-none bg-slate-950 text-white shadow-2xl relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />
          <CardContent className="space-y-8 p-10 relative z-10">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-white/20 bg-white/5 text-emerald-400 backdrop-blur-sm px-3 py-1">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Assurance Mode Active
              </Badge>
              <span className="text-xs text-white/40 font-mono tracking-widest uppercase">Verified GHG Inventory</span>
            </div>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-5xl font-black tracking-tight leading-[1.1]">
                Command your carbon disclosure with high-precision audits.
              </h2>
              <p className="max-w-2xl text-lg text-white/60 font-medium leading-relaxed">
                Automate your Scope 1, 2, and 3 calculations using the {'GHG Protocol'} framework. 
                Verify anomalies, secure audit evidence, and export professional assurance packs.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild size="lg" className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold px-8">
                <Link to="/data-entry">
                  Launch Audit Wizard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm">
                <Link to="/reports">Export ESG Pack</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-3 pt-4 border-t border-white/10">
              <HeroMetric label="Reporting Period" value={activePeriod?.name ?? 'FY2026'} />
              <HeroMetric label="Audit Completion" value={`${summary.verifiedShare}% Verified`} />
              <HeroMetric label="Evidence Health" value={`${summary.evidenceCoverage}% Evidence-backed`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <ScanSearch className="h-5 w-5 text-primary" />
              Smart Audit Findings
            </CardTitle>
            <CardDescription className="text-xs">Real-time anomaly and compliance signals.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="divide-y divide-slate-50 flex-1 overflow-y-auto">
              {summary.signals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Inventory Status: Clean</p>
                  <p className="text-xs text-slate-500">No major variances detected in the current activity set.</p>
                </div>
              ) : (
                summary.signals.slice(0, 4).map((signal) => (
                  <div key={signal.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${signal.severity === 'high' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 leading-none">{signal.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{signal.detail}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
              <Button asChild variant="ghost" className="w-full rounded-lg text-xs font-bold text-primary hover:bg-primary/5">
                <Link to="/auditor">Enter Auditor Workspace</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Professional KPI Grid (Intensity & Gross/Net) */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Gross Footprint"
          value={formatKg(summary.totalKg)}
          helper="Consolidated Scope 1, 2, 3 Emissions"
          icon={<Hexagon className="h-4 w-4 text-slate-400" />}
        />
        <KpiCard
          label="Market-based Net"
          value={formatKg(summary.marketBasedKg)}
          helper="Net emissions following instruments"
          icon={<Zap className="h-4 w-4 text-blue-500" />}
        />
        <KpiCard
          label="FTE Carbon Intensity"
          value={`${summary.intensity.intensity_fte} kg`}
          helper="Emissions per Team Member"
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
        />
        <KpiCard
          label="Biogenic CO2"
          value={formatKg(summary.totalBiogenicKg)}
          helper="Reported outside of scopes"
          icon={<Leaf className="h-4 w-4 text-emerald-500" />}
        />
      </section>

      {/* 3. Trend & Drivers Chart Section */}
      <section className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-slate-200/60 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-slate-900">Emissions Evolution</CardTitle>
              <CardDescription>Actual monthly kgCO2e vs algorithm-derived forecast.</CardDescription>
            </div>
            <Badge variant="outline" className="border-slate-100 font-mono text-[10px] tracking-widest text-slate-400">GHG-TREND-V3</Badge>
          </CardHeader>
          <CardContent className="h-[340px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="actualKg" stroke="#0f172a" strokeWidth={4} dot={{ r: 6, fill: '#0f172a', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="forecastKg" stroke="#10b981" strokeWidth={3} strokeDasharray="8 6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-0" />
          <CardHeader>
            <CardTitle className="text-xl font-black text-slate-900">Primary Drivers</CardTitle>
            <CardDescription>Top emitters by activity category.</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.topDrivers}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="totalKg" radius={[12, 12, 0, 0]}>
                  {summary.topDrivers.map((driver) => (
                    <Cell key={`${driver.label}-${driver.scope}`} fill={SCOPE_COLORS[driver.scope] ?? '#0f172a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* 4. Recent Activity & Compliance Check */}
      <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 mb-4">
            <div>
              <CardTitle className="text-lg font-bold">Recent Material Activities</CardTitle>
              <CardDescription>High-impact entries requiring audit verification.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-400">View All Evidence</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {entries.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition-colors"
              >
                <div className="flex gap-4 items-center">
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                    <Database className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{entry.activity_type}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {entry.scope} • {entry.category} • {entry.entry_date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatKg(entry.emission_kgco2e)}</div>
                  <StatusBadge status={entry.status ?? 'draft'} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-slate-50/30">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Assurance Protocol</CardTitle>
            <CardDescription>Current status versus ISO 14064-1 core principles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.checklist.slice(0, 4).map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-white bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{item.requirement}</p>
                  {item.status === 'pass' ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.detail}</p>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full rounded-xl bg-white border-slate-200 font-bold text-slate-900 h-11 text-xs">
              <Link to="/reports">Download Full Methodology</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-white">{value}</p>
    </div>
  );
}

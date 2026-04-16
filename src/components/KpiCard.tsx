import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function KpiCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm backdrop-blur">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{helper}</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-background/80 p-3 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}

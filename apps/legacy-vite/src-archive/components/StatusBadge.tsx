import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/lib/constants';

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className="border-transparent px-2.5 py-1 text-[11px] font-semibold capitalize"
      style={{
        backgroundColor: `${STATUS_COLORS[status] ?? '#64748b'}1A`,
        color: STATUS_COLORS[status] ?? '#64748b',
      }}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

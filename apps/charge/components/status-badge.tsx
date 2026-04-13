import { Badge } from '@evuno/ui';

const statusConfig = {
  online: { variant: 'available' as const, dot: 'bg-status-available' },
  charging: { variant: 'charging' as const, dot: 'bg-status-charging' },
  faulted: { variant: 'faulted' as const, dot: 'bg-status-faulted' },
  offline: { variant: 'offline' as const, dot: 'bg-status-offline' },
  reserved: { variant: 'reserved' as const, dot: 'bg-status-reserved' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.offline;

  return (
    <Badge variant={config.variant}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

import { Card, CardContent } from '@evuno/ui';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
}

export function MetricCard({ label, value, subtitle, accent }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-xs text-text-muted mb-1">{label}</p>
        <p className={`text-xl font-mono font-semibold ${accent ? 'text-accent' : 'text-text'}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-text-muted mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

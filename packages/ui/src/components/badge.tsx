import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent-muted text-accent',
        danger: 'bg-danger-muted text-danger',
        warning: 'bg-warning-muted text-warning',
        info: 'bg-info-muted text-info',
        muted: 'bg-surface-hover text-text-muted',
        // Charger status badges
        available: 'bg-accent-muted text-status-available',
        charging: 'bg-info-muted text-status-charging',
        faulted: 'bg-danger-muted text-status-faulted',
        offline: 'bg-surface-hover text-status-offline',
        reserved: 'bg-warning-muted text-status-reserved',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

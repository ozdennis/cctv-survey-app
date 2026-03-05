import { cn } from '@/lib/utils';

export type StatusType =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'draft'
  | 'active'
  | 'completed'
  | 'cancelled';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; variant: string }> = {
  paid: { label: 'Paid', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  overdue: { label: 'Overdue', variant: 'error' },
  draft: { label: 'Draft', variant: 'neutral' },
  active: { label: 'Active', variant: 'success' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
};

const variantStyles: Record<string, string> = {
  success:
    'bg-[var(--portal-success-bg)] text-[var(--portal-success-text)] before:bg-[var(--portal-success)]',
  warning:
    'bg-[var(--portal-warning-bg)] text-[var(--portal-warning-text)] before:bg-[var(--portal-warning)]',
  error:
    'bg-[var(--portal-error-bg)] text-[var(--portal-error-text)] before:bg-[var(--portal-error)]',
  neutral:
    'bg-[var(--portal-disabled)] text-[var(--portal-muted)] before:bg-[var(--portal-muted)]',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium relative',
        variantStyles[config.variant],
        'before:absolute before:left-2.5 before:w-1.5 before:h-1.5 before:rounded-full',
        className
      )}
    >
      <span className="ml-3">{config.label}</span>
    </span>
  );
}

</contents>
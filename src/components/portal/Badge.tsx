import { cn } from '@/lib/utils';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[var(--portal-success-bg)] text-[var(--portal-success-text)]',
  warning: 'bg-[var(--portal-warning-bg)] text-[var(--portal-warning-text)]',
  error: 'bg-[var(--portal-error-bg)] text-[var(--portal-error-text)]',
  info: 'bg-[var(--portal-info-bg)] text-[var(--portal-info-text)]',
  neutral: 'bg-[var(--portal-disabled)] text-[var(--portal-muted)]',
};

export function Badge({ variant = 'neutral', children, className, dot = true }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-[var(--portal-success)]',
            variant === 'warning' && 'bg-[var(--portal-warning)]',
            variant === 'error' && 'bg-[var(--portal-error)]',
            variant === 'info' && 'bg-[var(--portal-info)]',
            variant === 'neutral' && 'bg-[var(--portal-muted)]'
          )}
        />
      )}
      {children}
    </span>
  );
}

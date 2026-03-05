import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'elevated' | 'selected' | 'interactive';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-[var(--portal-surface)] border-[var(--portal-border)]',
  elevated:
    'bg-[var(--portal-surface)] border-[var(--portal-border)] shadow-[0_2px_8px_var(--portal-shadow)]',
  selected: 'bg-[var(--portal-inner)] border-[var(--primary)] border-2',
  interactive:
    'bg-[var(--portal-surface)] border-[var(--portal-border)] hover:border-[var(--portal-border-dark)] transition-colors duration-150',
};

export function Card({ variant = 'default', children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-6 border',
        variantStyles[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

</contents>
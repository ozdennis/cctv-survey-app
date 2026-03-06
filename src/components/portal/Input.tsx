'use client';

import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            className={cn(
              'block text-sm font-medium',
              error
                ? 'text-[var(--portal-error)]'
                : 'text-[var(--portal-text)]'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'w-full px-4 rounded-md transition-all duration-150 ease-standard',
              'text-[var(--portal-text)] text-sm',
              'placeholder:text-[var(--portal-faint)]',
              'bg-[var(--portal-surface)]',
              error
                ? 'border-[var(--portal-error)] focus:border-[var(--portal-error)] focus:ring-1 focus:ring-[var(--portal-error)]'
                : success
                ? 'border-[var(--portal-success)] focus:border-[var(--portal-success)] focus:ring-1 focus:ring-[var(--portal-success)]'
                : 'border-[var(--portal-border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]',
              isFocused ? 'border-2' : 'border',
              'h-10',
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--portal-success)]">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--portal-error)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';


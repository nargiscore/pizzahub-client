import * as React from 'react';
import { cn } from '@/lib/utils';
export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  return <span className={cn('status-pill', variant === 'success' && 'status-approved', variant === 'warning' && 'status-pending', variant === 'danger' && 'status-rejected', className)} {...props} />;
}

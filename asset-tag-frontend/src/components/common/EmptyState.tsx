/**
 * Generic Empty State Component
 *
 * Provides consistent empty state UI across the application
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center p-12 text-center'>
      {Icon && (
        <div className='mb-4 rounded-full bg-muted p-6'>
          <Icon className='h-12 w-12 text-muted-foreground' />
        </div>
      )}
      <h3 className='mb-2'>{title}</h3>
      {description && (
        <p className='text-muted-foreground mb-6 max-w-md'>{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon className='h-4 w-4 mr-2' />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

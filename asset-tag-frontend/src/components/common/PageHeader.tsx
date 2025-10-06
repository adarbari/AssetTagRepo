/**
 * Generic Page Header Component
 *
 * Provides consistent page header UI across the application
 */

import { ArrowLeft, LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
  actions?: React.ReactNode;
  onBack?: () => void;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  onBack,
}: PageHeaderProps) {
  return (
    <div className='flex items-center justify-between border-b border-border p-6 bg-card'>
      <div className='flex items-center gap-4'>
        {onBack && (
          <Button variant='ghost' size='sm' onClick={onBack}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back
          </Button>
        )}
        <div className='flex items-center gap-3'>
          {Icon && (
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary'>
              <Icon className='h-5 w-5 text-primary-foreground' />
            </div>
          )}
          <div>
            <div className='flex items-center gap-2'>
              <h1>{title}</h1>
              {badge && (
                <Badge variant={badge.variant || 'default'}>
                  {badge.label}
                </Badge>
              )}
            </div>
            {description && (
              <p className='text-muted-foreground'>{description}</p>
            )}
          </div>
        </div>
      </div>
      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </div>
  );
}

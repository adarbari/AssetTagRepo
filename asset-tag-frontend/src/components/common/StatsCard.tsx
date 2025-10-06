/**
 * Generic Stats Card Component
 *
 * Provides consistent statistics card UI across the application
 */

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../ui/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  onClick?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  onClick,
  variant = 'default',
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: 'border-border',
    success:
      'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20',
    warning:
      'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20',
    danger:
      'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20',
    info: 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20',
  };

  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        variantStyles[variant],
        isClickable &&
          'cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm'>{title}</CardTitle>
        {Icon && <Icon className='h-4 w-4 text-muted-foreground' />}
      </CardHeader>
      <CardContent>
        <div className='text-2xl'>{value}</div>
        {(description || trend) && (
          <div className='flex items-center gap-2 mt-1'>
            {trend && (
              <span
                className={cn(
                  'text-xs flex items-center gap-1',
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className='h-3 w-3' />
                ) : (
                  <TrendingDown className='h-3 w-3' />
                )}
                {trend.value > 0 && '+'}
                {trend.value}
                {trend.label && ` ${trend.label}`}
              </span>
            )}
            {description && (
              <p className='text-xs text-muted-foreground'>{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

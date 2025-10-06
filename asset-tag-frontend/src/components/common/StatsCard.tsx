/**
 * Generic Stats Card Component
 *
 * Provides consistent statistics card UI across the application
 */

import React from &apos;react&apos;;
import { LucideIcon, TrendingUp, TrendingDown } from &apos;lucide-react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { cn } from &apos;../ui/utils&apos;;

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    direction: &apos;up&apos; | &apos;down&apos;;
    label?: string;
  };
  onClick?: () => void;
  variant?: &apos;default&apos; | &apos;success&apos; | &apos;warning&apos; | &apos;danger&apos; | &apos;info&apos;;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  onClick,
  variant = &apos;default&apos;,
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: &apos;border-border&apos;,
    success:
      &apos;border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20&apos;,
    warning:
      &apos;border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20&apos;,
    danger:
      &apos;border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20&apos;,
    info: &apos;border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20&apos;,
  };

  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        variantStyles[variant],
        isClickable &&
          &apos;cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]&apos;,
        className
      )}
      onClick={onClick}
    >
      <CardHeader className=&apos;flex flex-row items-center justify-between pb-2&apos;>
        <CardTitle className=&apos;text-sm&apos;>{title}</CardTitle>
        {Icon && <Icon className=&apos;h-4 w-4 text-muted-foreground&apos; />}
      </CardHeader>
      <CardContent>
        <div className=&apos;text-2xl&apos;>{value}</div>
        {(description || trend) && (
          <div className=&apos;flex items-center gap-2 mt-1&apos;>
            {trend && (
              <span
                className={cn(
                  &apos;text-xs flex items-center gap-1&apos;,
                  trend.direction === &apos;up&apos; ? &apos;text-green-600&apos; : &apos;text-red-600&apos;
                )}
              >
                {trend.direction === &apos;up&apos; ? (
                  <TrendingUp className=&apos;h-3 w-3&apos; />
                ) : (
                  <TrendingDown className=&apos;h-3 w-3&apos; />
                )}
                {trend.value > 0 && &apos;+&apos;}
                {trend.value}
                {trend.label && ` ${trend.label}`}
              </span>
            )}
            {description && (
              <p className=&apos;text-xs text-muted-foreground&apos;>{description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

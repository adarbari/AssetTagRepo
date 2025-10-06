/**
 * Generic Empty State Component
 *
 * Provides consistent empty state UI across the application
 */

import React from &apos;react&apos;;
import { LucideIcon } from &apos;lucide-react&apos;;
import { Button } from &apos;../ui/button&apos;;

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
    <div className=&apos;flex flex-col items-center justify-center p-12 text-center&apos;>
      {Icon && (
        <div className=&apos;mb-4 rounded-full bg-muted p-6&apos;>
          <Icon className=&apos;h-12 w-12 text-muted-foreground&apos; />
        </div>
      )}
      <h3 className=&apos;mb-2&apos;>{title}</h3>
      {description && (
        <p className=&apos;text-muted-foreground mb-6 max-w-md&apos;>{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <action.icon className=&apos;h-4 w-4 mr-2&apos; />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

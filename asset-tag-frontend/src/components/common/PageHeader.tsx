/**
 * Generic Page Header Component
 *
 * Provides consistent page header UI across the application
 */

import React from &apos;react&apos;;
import { ArrowLeft, LucideIcon } from &apos;lucide-react&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Badge } from &apos;../ui/badge&apos;;

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: {
    label: string;
    variant?: &apos;default&apos; | &apos;secondary&apos; | &apos;outline&apos; | &apos;destructive&apos;;
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
    <div className=&apos;flex items-center justify-between border-b border-border p-6 bg-card&apos;>
      <div className=&apos;flex items-center gap-4&apos;>
        {onBack && (
          <Button variant=&apos;ghost&apos; size=&apos;sm&apos; onClick={onBack}>
            <ArrowLeft className=&apos;h-4 w-4 mr-2&apos; />
            Back
          </Button>
        )}
        <div className=&apos;flex items-center gap-3&apos;>
          {Icon && (
            <div className=&apos;flex h-10 w-10 items-center justify-center rounded-lg bg-primary&apos;>
              <Icon className=&apos;h-5 w-5 text-primary-foreground&apos; />
            </div>
          )}
          <div>
            <div className=&apos;flex items-center gap-2&apos;>
              <h1>{title}</h1>
              {badge && (
                <Badge variant={badge.variant || &apos;default&apos;}>
                  {badge.label}
                </Badge>
              )}
            </div>
            {description && (
              <p className=&apos;text-muted-foreground&apos;>{description}</p>
            )}
          </div>
        </div>
      </div>
      {actions && <div className=&apos;flex items-center gap-2&apos;>{actions}</div>}
    </div>
  );
}

/**
 * Generic Section Component
 *
 * Provides consistent section UI with optional icon and actions
 */

import React from &apos;react&apos;;
import { LucideIcon } from &apos;lucide-react&apos;;

interface SectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
}: SectionProps) {
  return (
    <div className={className}>
      <div className=&apos;flex items-center justify-between mb-4&apos;>
        <div className=&apos;flex items-center gap-2&apos;>
          {Icon && <Icon className=&apos;h-5 w-5 text-muted-foreground&apos; />}
          <div>
            <div className=&apos;text-xl text-muted-foreground&apos;>{title}</div>
            {description && (
              <p className=&apos;text-sm text-muted-foreground&apos;>{description}</p>
            )}
          </div>
        </div>
        {actions && <div className=&apos;flex items-center gap-2&apos;>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

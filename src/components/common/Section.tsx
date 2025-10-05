/**
 * Generic Section Component
 * 
 * Provides consistent section UI with optional icon and actions
 */

import { LucideIcon } from "lucide-react";

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <div>
            <div className="text-xl text-muted-foreground">{title}</div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
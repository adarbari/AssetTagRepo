import React from &apos;react&apos;;
import { LucideIcon } from &apos;lucide-react&apos;;

interface InfoRowProps {
  icon: LucideIcon;
  children: React.ReactNode;
  iconClassName?: string;
  className?: string;
}

export function InfoRow({
  icon: Icon,
  children,
  iconClassName,
  className,
}: InfoRowProps) {
  return (
    <div className={`flex items-center gap-2 ${className || &apos;&apos;}`}>
      <Icon
        className={`h-4 w-4 text-muted-foreground ${iconClassName || &apos;&apos;}`}
      />
      {children}
    </div>
  );
}

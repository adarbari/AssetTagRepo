import React from "react";
import { LucideIcon } from "lucide-react";

interface InfoRowProps {
  icon: LucideIcon;
  children: React.ReactNode;
  iconClassName?: string;
  className?: string;
}

export function InfoRow({ icon: Icon, children, iconClassName, className }: InfoRowProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <Icon className={`h-4 w-4 text-muted-foreground ${iconClassName || ""}`} />
      {children}
    </div>
  );
}

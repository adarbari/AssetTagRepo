import React from "react";

/**
 * Reusable Capacity Bar Component
 * 
 * Displays a visual progress bar for capacity tracking with labels
 * Used in vehicle loading, asset assignments, etc.
 */

interface CapacityBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  variant?: "default" | "warning" | "danger";
}

export function CapacityBar({ 
  current, 
  total, 
  label = "Capacity",
  showPercentage = true,
  variant 
}: CapacityBarProps) {
  const percentage = Math.min((current / total) * 100, 100);
  
  // Auto-determine variant based on percentage if not provided
  const effectiveVariant = variant || (
    current >= total ? "danger" 
    : current >= total * 0.8 ? "warning" 
    : "default"
  );
  
  const colorClass = 
    effectiveVariant === "danger" ? "bg-red-500" 
    : effectiveVariant === "warning" ? "bg-orange-500" 
    : "bg-primary";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          {label}: {current}/{total}
        </span>
        {showPercentage && (
          <span className="text-sm">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`rounded-full h-2 transition-all ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

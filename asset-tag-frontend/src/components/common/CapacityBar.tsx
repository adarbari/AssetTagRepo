import React from &apos;react&apos;;

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
  variant?: &apos;default&apos; | &apos;warning&apos; | &apos;danger&apos;;
}

export function CapacityBar({
  current,
  total,
  label = &apos;Capacity&apos;,
  showPercentage = true,
  variant,
}: CapacityBarProps) {
  const percentage = Math.min((current / total) * 100, 100);

  // Auto-determine variant based on percentage if not provided
  const effectiveVariant =
    variant ||
    (current >= total
      ? &apos;danger&apos;
      : current >= total * 0.8
        ? &apos;warning&apos;
        : &apos;default&apos;);

  const colorClass =
    effectiveVariant === &apos;danger&apos;
      ? &apos;bg-red-500&apos;
      : effectiveVariant === &apos;warning&apos;
        ? &apos;bg-orange-500&apos;
        : &apos;bg-primary&apos;;

  return (
    <div>
      <div className=&apos;flex items-center justify-between mb-2&apos;>
        <span className=&apos;text-sm text-muted-foreground&apos;>
          {label}: {current}/{total}
        </span>
        {showPercentage && (
          <span className=&apos;text-sm&apos;>{Math.round(percentage)}%</span>
        )}
      </div>
      <div className=&apos;w-full bg-muted rounded-full h-2&apos;>
        <div
          className={`rounded-full h-2 transition-all ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

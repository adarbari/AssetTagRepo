import React from &apos;react&apos;;
import { Badge } from &apos;../ui/badge&apos;;

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityColors: Record<string, string> = {
  critical: &apos;bg-red-100 text-red-700 border-red-200&apos;,
  high: &apos;bg-orange-100 text-orange-700 border-orange-200&apos;,
  medium: &apos;bg-yellow-100 text-yellow-700 border-yellow-200&apos;,
  low: &apos;bg-blue-100 text-blue-700 border-blue-200&apos;,
  default: &apos;bg-gray-100 text-gray-700 border-gray-200&apos;,
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityLower = priority.toLowerCase();
  const colorClass = priorityColors[priorityLower] || priorityColors[&apos;default&apos;];

  return (
    <Badge variant=&apos;outline&apos; className={`${colorClass} ${className || &apos;&apos;}`}>
      {priority}
    </Badge>
  );
}

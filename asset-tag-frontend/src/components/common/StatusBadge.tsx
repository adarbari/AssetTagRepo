import React from &apos;react&apos;;
import { Badge } from &apos;../ui/badge&apos;;

type StatusType =
  | &apos;asset&apos;
  | &apos;site&apos;
  | &apos;job&apos;
  | &apos;vehicle&apos;
  | &apos;geofence&apos;
  | &apos;maintenance&apos;
  | &apos;issue&apos;;

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

const statusColors: Record<string, string> = {
  // Asset statuses
  active: &apos;bg-green-100 text-green-700 border-green-200&apos;,
  inactive: &apos;bg-gray-100 text-gray-700 border-gray-200&apos;,
  maintenance: &apos;bg-orange-100 text-orange-700 border-orange-200&apos;,
  &apos;in-transit&apos;: &apos;bg-blue-100 text-blue-700 border-blue-200&apos;,
  &apos;checked-out&apos;: &apos;bg-purple-100 text-purple-700 border-purple-200&apos;,
  offline: &apos;bg-red-100 text-red-700 border-red-200&apos;,
  idle: &apos;bg-yellow-100 text-yellow-700 border-yellow-200&apos;,

  // Job statuses
  planning: &apos;bg-blue-100 text-blue-700 border-blue-200&apos;,
  &apos;in-progress&apos;: &apos;bg-green-100 text-green-700 border-green-200&apos;,
  &apos;on-hold&apos;: &apos;bg-yellow-100 text-yellow-700 border-yellow-200&apos;,
  completed: &apos;bg-gray-100 text-gray-700 border-gray-200&apos;,
  cancelled: &apos;bg-red-100 text-red-700 border-red-200&apos;,

  // Maintenance statuses
  pending: &apos;bg-yellow-100 text-yellow-700 border-yellow-200&apos;,
  scheduled: &apos;bg-blue-100 text-blue-700 border-blue-200&apos;,
  overdue: &apos;bg-red-100 text-red-700 border-red-200&apos;,

  // Issue statuses
  open: &apos;bg-red-100 text-red-700 border-red-200&apos;,
  assigned: &apos;bg-blue-100 text-blue-700 border-blue-200&apos;,
  resolved: &apos;bg-green-100 text-green-700 border-green-200&apos;,
  closed: &apos;bg-gray-100 text-gray-700 border-gray-200&apos;,

  // Generic/default
  default: &apos;bg-gray-100 text-gray-700 border-gray-200&apos;,
};

export function StatusBadge({
  status,
  type: _type,
  className,
}: StatusBadgeProps) {
  const statusLower = status.toLowerCase();
  const colorClass = statusColors[statusLower] || statusColors[&apos;default&apos;];

  return (
    <Badge variant=&apos;outline&apos; className={`${colorClass} ${className || &apos;&apos;}`}>
      {status}
    </Badge>
  );
}

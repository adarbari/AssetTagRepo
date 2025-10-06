import React from 'react';
import { Badge } from '../ui/badge';

type StatusType =
  | 'asset'
  | 'site'
  | 'job'
  | 'vehicle'
  | 'geofence'
  | 'maintenance'
  | 'issue';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

const statusColors: Record<string, string> = {
  // Asset statuses
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  maintenance: 'bg-orange-100 text-orange-700 border-orange-200',
  'in-transit': 'bg-blue-100 text-blue-700 border-blue-200',
  'checked-out': 'bg-purple-100 text-purple-700 border-purple-200',
  offline: 'bg-red-100 text-red-700 border-red-200',
  idle: 'bg-yellow-100 text-yellow-700 border-yellow-200',

  // Job statuses
  planning: 'bg-blue-100 text-blue-700 border-blue-200',
  'in-progress': 'bg-green-100 text-green-700 border-green-200',
  'on-hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',

  // Maintenance statuses
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',

  // Issue statuses
  open: 'bg-red-100 text-red-700 border-red-200',
  assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-gray-100 text-gray-700 border-gray-200',

  // Generic/default
  default: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function StatusBadge({
  status,
  type: _type,
  className,
}: StatusBadgeProps) {
  const statusLower = status.toLowerCase();
  const colorClass = statusColors[statusLower] || statusColors['default'];

  return (
    <Badge variant='outline' className={`${colorClass} ${className || ''}`}>
      {status}
    </Badge>
  );
}

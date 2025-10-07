import { Badge } from '../ui/badge';

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const severityLower = severity?.toLowerCase() || 'unknown';
  const colorClass = severityColors[severityLower] || severityColors['medium'];

  return (
    <Badge variant='outline' className={`${colorClass} ${className || ''}`}>
      {severity || 'Unknown'}
    </Badge>
  );
}

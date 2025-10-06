import React from &apos;react&apos;;
import { Card, CardContent } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Button } from &apos;../ui/button&apos;;
import { SeverityBadge, StatusBadge } from &apos;./&apos;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from &apos;../ui/dropdown-menu&apos;;
import {
  Shield,
  Battery,
  AlertTriangle,
  TrendingDown,
  WifiOff,
  MapPin,
  Wrench,
  MoreHorizontal,
} from &apos;lucide-react&apos;;
import type { Alert, AlertType } from &apos;../../types&apos;;

const alertTypeIcons: Record<AlertType, any> = {
  theft: Shield,
  battery: Battery,
  compliance: AlertTriangle,
  underutilized: TrendingDown,
  offline: WifiOff,
  &apos;unauthorized-zone&apos;: MapPin,
  &apos;predictive-maintenance&apos;: Wrench,
};

const alertTypeColors: Record<AlertType, string> = {
  theft: &apos;text-red-600&apos;,
  battery: &apos;text-orange-600&apos;,
  compliance: &apos;text-yellow-600&apos;,
  underutilized: &apos;text-blue-600&apos;,
  offline: &apos;text-gray-600&apos;,
  &apos;unauthorized-zone&apos;: &apos;text-red-600&apos;,
  &apos;predictive-maintenance&apos;: &apos;text-purple-600&apos;,
};

const alertTypeLabels: Record<AlertType, string> = {
  theft: &apos;Theft Alert&apos;,
  battery: &apos;Battery Alert&apos;,
  compliance: &apos;Compliance&apos;,
  underutilized: &apos;Underutilized&apos;,
  offline: &apos;Offline&apos;,
  &apos;unauthorized-zone&apos;: &apos;Unauthorized Zone&apos;,
  &apos;predictive-maintenance&apos;: &apos;Predictive Maintenance&apos;,
};

interface AlertCardProps {
  alert: Alert;
  onTakeAction: (alert: Alert) => void;
  onQuickAcknowledge?: (alertId: string, e: React.MouseEvent) => void;
  onQuickResolve?: (alertId: string, e: React.MouseEvent) => void;
  showQuickActions?: boolean;
  getTimeAgo?: (timestamp: string) => string;
}

const defaultGetTimeAgo = (timestamp: string) => {
  const now = new Date();
  const alertTime = new Date(timestamp);
  const diffMs = now.getTime() - alertTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return &apos;Just now&apos;;
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? &apos;s&apos; : &apos;&apos;} ago`;
  return `${diffDays} day${diffDays > 1 ? &apos;s&apos; : &apos;&apos;} ago`;
};

export function AlertCard({
  alert,
  onTakeAction,
  onQuickAcknowledge,
  onQuickResolve,
  showQuickActions = false,
  getTimeAgo = defaultGetTimeAgo,
}: AlertCardProps) {
  const Icon = alertTypeIcons[alert.type];
  const iconColor = alertTypeColors[alert.type];

  return (
    <Card className=&apos;hover:shadow-md transition-shadow&apos;>
      <CardContent className=&apos;p-4&apos;>
        <div className=&apos;flex items-start gap-3&apos;>
          <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
            <Icon className=&apos;h-5 w-5&apos; />
          </div>
          <div className=&apos;flex-1 min-w-0&apos;>
            <div className=&apos;flex items-start justify-between gap-2 mb-2&apos;>
              <div className=&apos;flex-1&apos;>
                <div className=&apos;flex items-center gap-2 mb-1&apos;>
                  <h4 className=&apos;text-sm truncate&apos;>{alert.asset}</h4>
                  <SeverityBadge severity={alert.severity} />
                </div>
                <Badge variant=&apos;outline&apos; className=&apos;text-xs&apos;>
                  {alertTypeLabels[alert.type]}
                </Badge>
              </div>
              {showQuickActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant=&apos;ghost&apos; size=&apos;sm&apos; className=&apos;h-8 w-8 p-0&apos;>
                      <MoreHorizontal className=&apos;h-4 w-4&apos; />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align=&apos;end&apos;>
                    <DropdownMenuItem onClick={() => onTakeAction(alert)}>
                      Take Action
                    </DropdownMenuItem>
                    {alert.status === &apos;active&apos; && onQuickAcknowledge && (
                      <DropdownMenuItem
                        onClick={e => onQuickAcknowledge(alert.id, e)}
                      >
                        Acknowledge
                      </DropdownMenuItem>
                    )}
                    {onQuickResolve && (
                      <DropdownMenuItem
                        onClick={e => onQuickResolve(alert.id, e)}
                      >
                        Mark Resolved
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className=&apos;text-sm text-muted-foreground mb-2&apos;>
              {alert.message}
            </p>
            {alert.reason && (
              <p className=&apos;text-xs text-muted-foreground mb-2&apos;>
                <strong>Reason:</strong> {alert.reason}
              </p>
            )}
            <div className=&apos;flex items-center justify-between gap-2 mt-3&apos;>
              <div className=&apos;flex items-center gap-3 text-xs text-muted-foreground&apos;>
                <span>{alert.id}</span>
                <span>•</span>
                <span>{getTimeAgo(alert.timestamp)}</span>
                <span>•</span>
                <StatusBadge status={alert.status} />
              </div>
              <Button size=&apos;sm&apos; onClick={() => onTakeAction(alert)}>
                Take Action
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

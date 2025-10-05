import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { SeverityBadge, StatusBadge } from "./";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Shield,
  Battery,
  AlertTriangle,
  TrendingDown,
  WifiOff,
  MapPin,
  Wrench,
  MoreHorizontal,
} from "lucide-react";
import type { Alert, AlertType } from "../../types";

const alertTypeIcons: Record<AlertType, any> = {
  theft: Shield,
  battery: Battery,
  compliance: AlertTriangle,
  underutilized: TrendingDown,
  offline: WifiOff,
  "unauthorized-zone": MapPin,
  "predictive-maintenance": Wrench,
};

const alertTypeColors: Record<AlertType, string> = {
  theft: "text-red-600",
  battery: "text-orange-600",
  compliance: "text-yellow-600",
  underutilized: "text-blue-600",
  offline: "text-gray-600",
  "unauthorized-zone": "text-red-600",
  "predictive-maintenance": "text-purple-600",
};

const alertTypeLabels: Record<AlertType, string> = {
  theft: "Theft Alert",
  battery: "Battery Alert",
  compliance: "Compliance",
  underutilized: "Underutilized",
  offline: "Offline",
  "unauthorized-zone": "Unauthorized Zone",
  "predictive-maintenance": "Predictive Maintenance",
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

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm truncate">{alert.asset}</h4>
                  <SeverityBadge severity={alert.severity} />
                </div>
                <Badge variant="outline" className="text-xs">
                  {alertTypeLabels[alert.type]}
                </Badge>
              </div>
              {showQuickActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onTakeAction(alert)}>
                      Take Action
                    </DropdownMenuItem>
                    {alert.status === "active" && onQuickAcknowledge && (
                      <DropdownMenuItem onClick={(e) => onQuickAcknowledge(alert.id, e)}>
                        Acknowledge
                      </DropdownMenuItem>
                    )}
                    {onQuickResolve && (
                      <DropdownMenuItem onClick={(e) => onQuickResolve(alert.id, e)}>
                        Mark Resolved
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
            {alert.reason && (
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Reason:</strong> {alert.reason}
              </p>
            )}
            <div className="flex items-center justify-between gap-2 mt-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{alert.id}</span>
                <span>•</span>
                <span>{getTimeAgo(alert.timestamp)}</span>
                <span>•</span>
                <StatusBadge status={alert.status} />
              </div>
              <Button size="sm" onClick={() => onTakeAction(alert)}>
                Take Action
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

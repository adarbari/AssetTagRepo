import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { StatusBadge } from "./StatusBadge";

interface AssetContextCardProps {
  assetId: string;
  assetName: string;
  assetContext?: {
    id: string;
    name: string;
    type: string;
    status: string;
    location: string;
    assignedTo?: string;
    lastMaintenance?: string;
    battery?: number;
    [key: string]: any;
  };
  title?: string;
  description?: string;
  showStatus?: boolean;
  showAdditionalInfo?: boolean;
  variant?: "default" | "compact" | "minimal";
  className?: string;
}

export function AssetContextCard({
  assetId,
  assetName,
  assetContext,
  title,
  description,
  showStatus = true,
  showAdditionalInfo = true,
  variant = "default",
  className,
}: AssetContextCardProps) {
  const displayName = assetContext?.name || assetName;
  const displayId = assetContext?.id || assetId;

  if (variant === "minimal") {
    return (
      <div className={`p-4 bg-muted rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{displayName}</h4>
            <p className="text-sm text-muted-foreground">{displayId}</p>
          </div>
          {showStatus && assetContext?.status && (
            <StatusBadge status={assetContext.status} />
          )}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            {description || "Selected asset:"}
          </p>
          <h4 className="mt-1 font-medium">{displayName}</h4>
          <p className="text-sm text-muted-foreground">{displayId}</p>
          {showAdditionalInfo && assetContext && (
            <div className="mt-4 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Type:</span> {assetContext.type}
              </p>
              <p>
                <span className="text-muted-foreground">Location:</span> {assetContext.location}
              </p>
              {assetContext.lastMaintenance && (
                <p>
                  <span className="text-muted-foreground">Last Maintenance:</span> {assetContext.lastMaintenance}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title || "Asset Information"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium">{displayName}</h4>
              <p className="text-sm text-muted-foreground">{displayId}</p>
              {showAdditionalInfo && assetContext && (
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Type:</span> {assetContext.type}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status:</span> {assetContext.status}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Location:</span> {assetContext.location}
                  </p>
                  {assetContext.assignedTo && (
                    <p>
                      <span className="text-muted-foreground">Assigned To:</span> {assetContext.assignedTo}
                    </p>
                  )}
                  {assetContext.battery !== undefined && (
                    <p>
                      <span className="text-muted-foreground">Battery:</span> {assetContext.battery}%
                    </p>
                  )}
                  {assetContext.lastMaintenance && (
                    <p>
                      <span className="text-muted-foreground">Last Maintenance:</span> {assetContext.lastMaintenance}
                    </p>
                  )}
                </div>
              )}
            </div>
            {showStatus && assetContext?.status && (
              <div className="ml-4">
                <StatusBadge status={assetContext.status} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

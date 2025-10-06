import React from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from &apos;../ui/card&apos;;
import { StatusBadge } from &apos;./StatusBadge&apos;;

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
  variant?: &apos;default&apos; | &apos;compact&apos; | &apos;minimal&apos;;
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
  variant = &apos;default&apos;,
  className,
}: AssetContextCardProps) {
  // Early return if required props are missing
  if (!assetId || !assetName) {
    return null;
  }

  const displayName = assetContext?.name || assetName;
  const displayId = assetContext?.id || assetId;

  if (variant === &apos;minimal&apos;) {
    return (
      <div className={`p-4 bg-muted rounded-lg ${className}`}>
        <div className=&apos;flex items-center justify-between&apos;>
          <div>
            <h4 className=&apos;font-medium&apos;>{displayName}</h4>
            <p className=&apos;text-sm text-muted-foreground&apos;>{displayId}</p>
          </div>
          {showStatus && assetContext?.status && (
            <StatusBadge status={assetContext.status} />
          )}
        </div>
      </div>
    );
  }

  if (variant === &apos;compact&apos;) {
    return (
      <Card className={className}>
        <CardContent className=&apos;pt-6&apos;>
          <p className=&apos;text-sm text-muted-foreground&apos;>
            {description || &apos;Selected asset:&apos;}
          </p>
          <h4 className=&apos;mt-1 font-medium&apos;>{displayName}</h4>
          <p className=&apos;text-sm text-muted-foreground&apos;>{displayId}</p>
          {showAdditionalInfo && assetContext && (
            <div className=&apos;mt-4 text-sm space-y-1&apos;>
              <p>
                <span className=&apos;text-muted-foreground&apos;>Type:</span>{&apos; &apos;}
                {assetContext.type}
              </p>
              <p>
                <span className=&apos;text-muted-foreground&apos;>Location:</span>{&apos; &apos;}
                {assetContext.location}
              </p>
              {assetContext.lastMaintenance && (
                <p>
                  <span className=&apos;text-muted-foreground&apos;>
                    Last Maintenance:
                  </span>{&apos; &apos;}
                  {assetContext.lastMaintenance}
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
        <CardTitle>{title || &apos;Asset Information&apos;}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className=&apos;p-4 bg-muted rounded-lg&apos;>
          <div className=&apos;flex items-start justify-between&apos;>
            <div className=&apos;flex-1&apos;>
              <h4 className=&apos;font-medium&apos;>{displayName}</h4>
              <p className=&apos;text-sm text-muted-foreground&apos;>{displayId}</p>
              {showAdditionalInfo && assetContext && (
                <div className=&apos;mt-2 text-sm space-y-1&apos;>
                  <p>
                    <span className=&apos;text-muted-foreground&apos;>Type:</span>{&apos; &apos;}
                    {assetContext.type}
                  </p>
                  <p>
                    <span className=&apos;text-muted-foreground&apos;>Status:</span>{&apos; &apos;}
                    {assetContext.status}
                  </p>
                  <p>
                    <span className=&apos;text-muted-foreground&apos;>Location:</span>{&apos; &apos;}
                    {assetContext.location}
                  </p>
                  {assetContext.assignedTo && (
                    <p>
                      <span className=&apos;text-muted-foreground&apos;>
                        Assigned To:
                      </span>{&apos; &apos;}
                      {assetContext.assignedTo}
                    </p>
                  )}
                  {assetContext.battery !== undefined && (
                    <p>
                      <span className=&apos;text-muted-foreground&apos;>Battery:</span>{&apos; &apos;}
                      {assetContext.battery}%
                    </p>
                  )}
                  {assetContext.lastMaintenance && (
                    <p>
                      <span className=&apos;text-muted-foreground&apos;>
                        Last Maintenance:
                      </span>{&apos; &apos;}
                      {assetContext.lastMaintenance}
                    </p>
                  )}
                </div>
              )}
            </div>
            {showStatus && assetContext?.status && (
              <div className=&apos;ml-4&apos;>
                <StatusBadge status={assetContext.status} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

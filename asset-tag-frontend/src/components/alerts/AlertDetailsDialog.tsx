import React from &apos;react&apos;;
import { useState } from &apos;react&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from &apos;../ui/dialog&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Textarea } from &apos;../ui/textarea&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import {
  AlertTriangle,
  Battery,
  MapPin,
  Clock,
  CheckCircle,
  User,
  Calendar,
  Package,
} from &apos;lucide-react&apos;;

interface Alert {
  id: string;
  type: string;
  category: string;
  title: string;
  description: string;
  asset: string;
  time: string;
  status: string;
  resolvedBy?: string;
}

interface AlertDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
  onResolve?: () => void;
}

export function AlertDetailsDialog({
  open,
  onOpenChange,
  alert,
  onResolve,
}: AlertDetailsDialogProps) {
  const [resolutionNotes, setResolutionNotes] = useState(&apos;&apos;);

  if (!alert) return null;

  const getAlertColor = (type: string) => {
    switch (type) {
      case &apos;critical&apos;:
        return &apos;bg-red-100 text-red-700 border-red-200&apos;;
      case &apos;high&apos;:
        return &apos;bg-orange-100 text-orange-700 border-orange-200&apos;;
      case &apos;medium&apos;:
        return &apos;bg-yellow-100 text-yellow-700 border-yellow-200&apos;;
      case &apos;low&apos;:
        return &apos;bg-blue-100 text-blue-700 border-blue-200&apos;;
      default:
        return &apos;bg-gray-100 text-gray-700 border-gray-200&apos;;
    }
  };

  const getAlertIcon = (category: string) => {
    switch (category) {
      case &apos;geofence&apos;:
        return <MapPin className=&apos;h-5 w-5&apos; />;
      case &apos;battery&apos;:
        return <Battery className=&apos;h-5 w-5&apos; />;
      case &apos;theft&apos;:
        return <AlertTriangle className=&apos;h-5 w-5&apos; />;
      default:
        return <AlertTriangle className=&apos;h-5 w-5&apos; />;
    }
  };

  const handleResolve = () => {
    // In a real app, this would save to backend
// // // // // // // console.log(&apos;Resolving alert:&apos;, alert.id, &apos;Notes:&apos;, resolutionNotes);
    onResolve?.();
    onOpenChange(false);
    setResolutionNotes(&apos;&apos;);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=&apos;max-w-2xl&apos;>
        <DialogHeader>
          <div className=&apos;flex items-start gap-4&apos;>
            <div
              className={`p-3 rounded-lg ${
                alert.status === &apos;resolved&apos; ? &apos;bg-green-50&apos; : &apos;bg-muted&apos;
              }`}
            >
              {alert.status === &apos;resolved&apos; ? (
                <CheckCircle className=&apos;h-5 w-5 text-green-600&apos; />
              ) : (
                getAlertIcon(alert.category)
              )}
            </div>
            <div className=&apos;flex-1&apos;>
              <div className=&apos;flex items-center gap-2 mb-2&apos;>
                <DialogTitle>{alert.title}</DialogTitle>
                <Badge
                  variant=&apos;outline&apos;
                  className={
                    alert.status === &apos;resolved&apos;
                      ? &apos;bg-green-50 text-green-700&apos;
                      : getAlertColor(alert.type)
                  }
                >
                  {alert.status === &apos;resolved&apos; ? &apos;resolved&apos; : alert.type}
                </Badge>
                <Badge variant=&apos;outline&apos;>{alert.category}</Badge>
              </div>
              <DialogDescription>{alert.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className=&apos;space-y-4&apos;>
          <Separator />

          {/* Alert Details */}
          <div className=&apos;grid grid-cols-2 gap-4&apos;>
            <div className=&apos;space-y-2&apos;>
              <div className=&apos;flex items-center gap-2 text-sm text-muted-foreground&apos;>
                <Package className=&apos;h-4 w-4&apos; />
                <span>Asset ID</span>
              </div>
              <p className=&apos;font-mono&apos;>{alert.asset}</p>
            </div>

            <div className=&apos;space-y-2&apos;>
              <div className=&apos;flex items-center gap-2 text-sm text-muted-foreground&apos;>
                <Clock className=&apos;h-4 w-4&apos; />
                <span>Triggered</span>
              </div>
              <p>{alert.time}</p>
            </div>

            <div className=&apos;space-y-2&apos;>
              <div className=&apos;flex items-center gap-2 text-sm text-muted-foreground&apos;>
                <AlertTriangle className=&apos;h-4 w-4&apos; />
                <span>Alert ID</span>
              </div>
              <p className=&apos;font-mono text-sm&apos;>{alert.id}</p>
            </div>

            <div className=&apos;space-y-2&apos;>
              <div className=&apos;flex items-center gap-2 text-sm text-muted-foreground&apos;>
                <Calendar className=&apos;h-4 w-4&apos; />
                <span>Status</span>
              </div>
              <p className=&apos;capitalize&apos;>{alert.status}</p>
            </div>
          </div>

          {alert.status === &apos;resolved&apos; && alert.resolvedBy && (
            <>
              <Separator />
              <div className=&apos;space-y-2&apos;>
                <div className=&apos;flex items-center gap-2 text-sm text-muted-foreground&apos;>
                  <User className=&apos;h-4 w-4&apos; />
                  <span>Resolved By</span>
                </div>
                <p>{alert.resolvedBy}</p>
              </div>
            </>
          )}

          {alert.status === &apos;active&apos; && (
            <>
              <Separator />
              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;notes&apos;>Resolution Notes (Optional)</Label>
                <Textarea
                  id=&apos;notes&apos;
                  placeholder=&apos;Add notes about how this alert was resolved...&apos;
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}

          {/* Recommended Actions */}
          {alert.status === &apos;active&apos; && (
            <>
              <Separator />
              <div className=&apos;space-y-2&apos;>
                <h4>Recommended Actions</h4>
                <div className=&apos;space-y-2 text-sm&apos;>
                  {alert.category === &apos;battery&apos; && (
                    <ul className=&apos;list-disc list-inside space-y-1 text-muted-foreground&apos;>
                      <li>Replace or recharge the battery immediately</li>
                      <li>
                        Check battery health and consider replacement if
                        degraded
                      </li>
                      <li>Review battery maintenance schedule</li>
                    </ul>
                  )}
                  {alert.category === &apos;geofence&apos; && (
                    <ul className=&apos;list-disc list-inside space-y-1 text-muted-foreground&apos;>
                      <li>Verify asset location on map</li>
                      <li>Contact site manager or asset operator</li>
                      <li>Check if asset has proper authorization</li>
                    </ul>
                  )}
                  {alert.category === &apos;theft&apos; && (
                    <ul className=&apos;list-disc list-inside space-y-1 text-muted-foreground&apos;>
                      <li>Immediately verify asset location</li>
                      <li>
                        Contact security and local authorities if necessary
                      </li>
                      <li>Review surveillance footage if available</li>
                    </ul>
                  )}
                  {alert.category === &apos;offline&apos; && (
                    <ul className=&apos;list-disc list-inside space-y-1 text-muted-foreground&apos;>
                      <li>Check if asset is in a known signal dead zone</li>
                      <li>Inspect tracker for damage or battery issues</li>
                      <li>Verify last known location</li>
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant=&apos;outline&apos; onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {alert.status === &apos;active&apos; && (
            <>
              <Button variant=&apos;outline&apos;>View Asset</Button>
              <Button onClick={handleResolve}>
                <CheckCircle className=&apos;h-4 w-4 mr-2&apos; />
                Mark as Resolved
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

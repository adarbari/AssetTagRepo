import React, { useState } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Textarea } from &apos;../ui/textarea&apos;;
import { Label } from &apos;../ui/label&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Alert, AlertType } from &apos;../../types&apos;;
import {
  Shield,
  Battery,
  AlertTriangle,
  TrendingDown,
  WifiOff,
  MapPin,
  Wrench,
  Bell,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Clock,
  MapPinned,
} from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import { PageLayout } from &apos;../common&apos;;
import {
  acknowledgeAlert,
  resolveAlert,
  executeWorkflowAction,
} from &apos;../../services/alertService&apos;;

interface AlertWorkflowProps {
  alert: Alert;
  onBack: () => void;
  onActionComplete?: () => void;
}

const alertTypeConfig: Record<
  AlertType,
  {
    icon: any;
    color: string;
    bgColor: string;
    workflows: {
      label: string;
      description: string;
      value: string;
      requiresInput?: boolean;
      inputLabel?: string;
      inputType?: string;
    }[];
  }
> = {
  theft: {
    icon: Shield,
    color: &apos;text-red-600&apos;,
    bgColor: &apos;bg-red-50 border-red-200&apos;,
    workflows: [
      {
        label: &apos;Notify Security Team&apos;,
        description: &apos;Alert security personnel and initiate theft protocol&apos;,
        value: &apos;notify-security&apos;,
      },
      {
        label: &apos;Contact Law Enforcement&apos;,
        description: &apos;File police report and provide tracking information&apos;,
        value: &apos;contact-police&apos;,
      },
      {
        label: &apos;Lock Asset Remotely&apos;,
        description: &apos;Disable asset if remote lock feature is available&apos;,
        value: &apos;lock-asset&apos;,
      },
      {
        label: &apos;Contact Last User&apos;,
        description: &apos;Verify with last authorized user&apos;,
        value: &apos;contact-user&apos;,
        requiresInput: true,
        inputLabel: &apos;User to contact&apos;,
        inputType: &apos;select&apos;,
      },
      {
        label: &apos;Mark as Stolen&apos;,
        description: &apos;Update asset status and notify all stakeholders&apos;,
        value: &apos;mark-stolen&apos;,
      },
    ],
  },
  battery: {
    icon: Battery,
    color: &apos;text-orange-600&apos;,
    bgColor: &apos;bg-orange-50 border-orange-200&apos;,
    workflows: [
      {
        label: &apos;Schedule Battery Replacement&apos;,
        description: &apos;Create work order for battery replacement&apos;,
        value: &apos;schedule-replacement&apos;,
        requiresInput: true,
        inputLabel: &apos;Scheduled date&apos;,
        inputType: &apos;date&apos;,
      },
      {
        label: &apos;Send Reminder to Technician&apos;,
        description: &apos;Notify assigned technician about battery issue&apos;,
        value: &apos;notify-technician&apos;,
        requiresInput: true,
        inputLabel: &apos;Technician name&apos;,
        inputType: &apos;select&apos;,
      },
      {
        label: &apos;Order Replacement Battery&apos;,
        description: &apos;Initiate battery procurement process&apos;,
        value: &apos;order-battery&apos;,
      },
      {
        label: &apos;Temporary Deactivation&apos;,
        description: &apos;Take asset offline until battery is replaced&apos;,
        value: &apos;deactivate-asset&apos;,
      },
    ],
  },
  compliance: {
    icon: AlertTriangle,
    color: &apos;text-yellow-600&apos;,
    bgColor: &apos;bg-yellow-50 border-yellow-200&apos;,
    workflows: [
      {
        label: &apos;Return to Authorized Zone&apos;,
        description: &apos;Notify operator to return asset to compliant location&apos;,
        value: &apos;return-to-zone&apos;,
      },
      {
        label: &apos;Update Compliance Requirements&apos;,
        description: &apos;Adjust geofence or certification requirements&apos;,
        value: &apos;update-requirements&apos;,
      },
      {
        label: &apos;Schedule Recertification&apos;,
        description: &apos;Book certification inspection&apos;,
        value: &apos;schedule-certification&apos;,
        requiresInput: true,
        inputLabel: &apos;Inspection date&apos;,
        inputType: &apos;date&apos;,
      },
      {
        label: &apos;Document Exception&apos;,
        description: &apos;Create compliance exception with approval&apos;,
        value: &apos;document-exception&apos;,
        requiresInput: true,
        inputLabel: &apos;Exception reason&apos;,
        inputType: &apos;text&apos;,
      },
      {
        label: &apos;Restrict Asset Use&apos;,
        description: &apos;Prevent further use until compliant&apos;,
        value: &apos;restrict-use&apos;,
      },
    ],
  },
  underutilized: {
    icon: TrendingDown,
    color: &apos;text-blue-600&apos;,
    bgColor: &apos;bg-blue-50 border-blue-200&apos;,
    workflows: [
      {
        label: &apos;Relocate to Active Site&apos;,
        description: &apos;Move asset to location with higher demand&apos;,
        value: &apos;relocate-asset&apos;,
        requiresInput: true,
        inputLabel: &apos;Target site&apos;,
        inputType: &apos;select&apos;,
      },
      {
        label: &apos;List for Internal Rental&apos;,
        description: &apos;Make available for other departments&apos;,
        value: &apos;list-rental&apos;,
      },
      {
        label: &apos;Schedule for Disposition&apos;,
        description: &apos;Initiate asset sale or disposal process&apos;,
        value: &apos;schedule-disposal&apos;,
      },
      {
        label: &apos;Analyze Usage Pattern&apos;,
        description: &apos;Generate detailed utilization report&apos;,
        value: &apos;analyze-usage&apos;,
      },
      {
        label: &apos;Reassign to Project&apos;,
        description: &apos;Allocate to specific project or job&apos;,
        value: &apos;reassign-project&apos;,
        requiresInput: true,
        inputLabel: &apos;Project name&apos;,
        inputType: &apos;text&apos;,
      },
    ],
  },
  offline: {
    icon: WifiOff,
    color: &apos;text-gray-600&apos;,
    bgColor: &apos;bg-gray-50 border-gray-200&apos;,
    workflows: [
      {
        label: &apos;Dispatch Technician&apos;,
        description: &apos;Send technician to physically locate and inspect&apos;,
        value: &apos;dispatch-tech&apos;,
        requiresInput: true,
        inputLabel: &apos;Technician name&apos;,
        inputType: &apos;select&apos;,
      },
      {
        label: &apos;Replace Tracker&apos;,
        description: &apos;Schedule tracker hardware replacement&apos;,
        value: &apos;replace-tracker&apos;,
      },
      {
        label: &apos;Check Last Known Location&apos;,
        description: &apos;Investigate asset at last GPS coordinates&apos;,
        value: &apos;check-location&apos;,
      },
      {
        label: &apos;Contact Asset Operator&apos;,
        description: &apos;Reach out to last known operator&apos;,
        value: &apos;contact-operator&apos;,
        requiresInput: true,
        inputLabel: &apos;Contact method&apos;,
        inputType: &apos;select&apos;,
      },
      {
        label: &apos;Mark for Physical Audit&apos;,
        description: &apos;Flag for next inventory audit&apos;,
        value: &apos;flag-audit&apos;,
      },
    ],
  },
  &apos;unauthorized-zone&apos;: {
    icon: MapPin,
    color: &apos;text-red-600&apos;,
    bgColor: &apos;bg-red-50 border-red-200&apos;,
    workflows: [
      {
        label: &apos;Immediate Exit Required&apos;,
        description: &apos;Contact operator to exit restricted zone immediately&apos;,
        value: &apos;exit-zone&apos;,
      },
      {
        label: &apos;Request Authorization&apos;,
        description: &apos;Submit request for zone access approval&apos;,
        value: &apos;request-auth&apos;,
        requiresInput: true,
        inputLabel: &apos;Justification&apos;,
        inputType: &apos;text&apos;,
      },
      {
        label: &apos;Log Security Incident&apos;,
        description: &apos;Create formal security incident report&apos;,
        value: &apos;log-incident&apos;,
      },
      {
        label: &apos;Notify Zone Manager&apos;,
        description: &apos;Alert restricted area manager&apos;,
        value: &apos;notify-manager&apos;,
      },
      {
        label: &apos;Suspend Asset Access&apos;,
        description: &apos;Revoke access permissions temporarily&apos;,
        value: &apos;suspend-access&apos;,
      },
    ],
  },
  &apos;predictive-maintenance&apos;: {
    icon: Wrench,
    color: &apos;text-purple-600&apos;,
    bgColor: &apos;bg-purple-50 border-purple-200&apos;,
    workflows: [
      {
        label: &apos;Schedule Immediate Inspection&apos;,
        description: &apos;Book urgent maintenance inspection&apos;,
        value: &apos;urgent-inspection&apos;,
        requiresInput: true,
        inputLabel: &apos;Inspection date/time&apos;,
        inputType: &apos;datetime&apos;,
      },
      {
        label: &apos;Order Replacement Parts&apos;,
        description: &apos;Procure parts based on predicted failure&apos;,
        value: &apos;order-parts&apos;,
        requiresInput: true,
        inputLabel: &apos;Parts needed&apos;,
        inputType: &apos;text&apos;,
      },
      {
        label: &apos;Stop Operations&apos;,
        description: &apos;Immediately cease asset usage to prevent damage&apos;,
        value: &apos;stop-ops&apos;,
      },
      {
        label: &apos;Create Maintenance Ticket&apos;,
        description: &apos;Generate work order for preventive maintenance&apos;,
        value: &apos;create-ticket&apos;,
      },
      {
        label: &apos;Notify Asset Owner&apos;,
        description: &apos;Alert asset owner/department of predicted issue&apos;,
        value: &apos;notify-owner&apos;,
      },
      {
        label: &apos;Arrange Backup Asset&apos;,
        description: &apos;Deploy replacement while maintenance performed&apos;,
        value: &apos;deploy-backup&apos;,
        requiresInput: true,
        inputLabel: &apos;Backup asset ID&apos;,
        inputType: &apos;text&apos;,
      },
    ],
  },
};

export function AlertWorkflow({
  alert,
  onBack,
  onActionComplete,
}: AlertWorkflowProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>(&apos;&apos;);
  const [workflowInput, setWorkflowInput] = useState<string>(&apos;&apos;);
  const [notes, setNotes] = useState<string>(&apos;&apos;);
  const [isProcessing, setIsProcessing] = useState(false);

  const config = alertTypeConfig[alert.type];

  // Fallback if alert type is not configured
  if (!config) {
    return (
      <div className=&apos;h-screen flex flex-col&apos;>
        <div className=&apos;border-b bg-background px-8 py-4&apos;>
          <div className=&apos;flex items-center gap-4&apos;>
            <Button variant=&apos;ghost&apos; size=&apos;icon&apos; onClick={onBack}>
              <ArrowLeft className=&apos;h-5 w-5&apos; />
            </Button>
            <div>
              <h1>Alert Workflow</h1>
              <p className=&apos;text-muted-foreground&apos;>Alert Type: {alert.type}</p>
            </div>
          </div>
        </div>
        <div className=&apos;flex-1 overflow-auto p-8&apos;>
          <Card className=&apos;border-destructive&apos;>
            <CardContent className=&apos;pt-6&apos;>
              <div className=&apos;flex items-center gap-3 text-destructive&apos;>
                <AlertTriangle className=&apos;h-5 w-5&apos; />
                <div>
                  <h3>Configuration Error</h3>
                  <p className=&apos;text-sm mt-1&apos;>
                    No workflow configuration found for alert type:{&apos; &apos;}
                    <span className=&apos;font-mono&apos;>{alert.type}</span>
                  </p>
                  <p className=&apos;text-sm text-muted-foreground mt-2&apos;>
                    Please contact your system administrator to add workflow
                    actions for this alert type.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const Icon = config.icon;
  const selectedWorkflowConfig = config.workflows.find(
    w => w.value === selectedWorkflow
  );

  const handleExecuteWorkflow = async () => {
    if (!selectedWorkflow) {
      toast.error(&apos;Please select an action&apos;);
      return;
    }

    if (selectedWorkflowConfig?.requiresInput && !workflowInput) {
      toast.error(`Please provide ${selectedWorkflowConfig.inputLabel}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Execute workflow action using alert service
      await executeWorkflowAction(
        alert.id,
        selectedWorkflow,
        workflowInput,
        notes
      );

      toast.success(&apos;Action executed successfully&apos;, {
        description: selectedWorkflowConfig?.label,
      });

      setIsProcessing(false);
      onActionComplete?.();
    } catch (error) {
// console.error(&apos;Failed to execute workflow action:&apos;, error);
      toast.error(&apos;Failed to execute action. Please try again.&apos;);
      setIsProcessing(false);
    }
  };

  const handleAcknowledge = async () => {
    setIsProcessing(true);

    try {
      // Acknowledge alert using alert service
      await acknowledgeAlert(alert.id, notes);

      toast.success(&apos;Alert acknowledged&apos;);
      setIsProcessing(false);
      onActionComplete?.();
    } catch (error) {
// console.error(&apos;Failed to acknowledge alert:&apos;, error);
      toast.error(&apos;Failed to acknowledge alert. Please try again.&apos;);
      setIsProcessing(false);
    }
  };

  const handleResolve = async () => {
    setIsProcessing(true);

    try {
      // Resolve alert using alert service
      await resolveAlert(alert.id, notes);

      toast.success(&apos;Alert resolved&apos;);
      setIsProcessing(false);
      onActionComplete?.();
    } catch (error) {
// console.error(&apos;Failed to resolve alert:&apos;, error);
      toast.error(&apos;Failed to resolve alert. Please try again.&apos;);
      setIsProcessing(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return &apos;Just now&apos;;
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? &apos;s&apos; : &apos;&apos;} ago`;
    return `${diffDays} day${diffDays > 1 ? &apos;s&apos; : &apos;&apos;} ago`;
  };

  return (
    <PageLayout variant=&apos;narrow&apos; padding=&apos;md&apos;>
      {/* Header */}
      <div className=&apos;flex items-center gap-4&apos;>
        <Button variant=&apos;outline&apos; size=&apos;icon&apos; onClick={onBack}>
          <ArrowLeft className=&apos;h-4 w-4&apos; />
        </Button>
        <div className=&apos;flex-1&apos;>
          <h1>Alert Workflow</h1>
          <p className=&apos;text-muted-foreground&apos;>Take action on this alert</p>
        </div>
      </div>

      {/* Alert Overview */}
      <Card className={`border-2 ${config.bgColor}`}>
        <CardHeader>
          <div className=&apos;flex items-start gap-4&apos;>
            <div className={`p-3 rounded-lg bg-background ${config.color}`}>
              <Icon className=&apos;h-6 w-6&apos; />
            </div>
            <div className=&apos;flex-1&apos;>
              <div className=&apos;flex items-start justify-between gap-4 mb-2&apos;>
                <div>
                  <CardTitle>{alert.asset}</CardTitle>
                  <p className=&apos;text-muted-foreground mt-1&apos;>{alert.message}</p>
                </div>
                <div className=&apos;flex gap-2&apos;>
                  <Badge
                    variant={
                      alert.severity === &apos;critical&apos; ? &apos;destructive&apos; : &apos;outline&apos;
                    }
                  >
                    {alert.severity}
                  </Badge>
                  <Badge variant=&apos;outline&apos;>{alert.status}</Badge>
                </div>
              </div>
              <div className=&apos;flex items-center gap-4 text-sm text-muted-foreground&apos;>
                <div className=&apos;flex items-center gap-1&apos;>
                  <Clock className=&apos;h-3 w-3&apos; />
                  {getTimeAgo(alert.timestamp)}
                </div>
                {alert.location && (
                  <>
                    <span>•</span>
                    <div className=&apos;flex items-center gap-1&apos;>
                      <MapPinned className=&apos;h-3 w-3&apos; />
                      {alert.location}
                    </div>
                  </>
                )}
                <span>•</span>
                <span>{alert.id}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Context Information */}
      {(alert.reason || alert.suggestedAction || alert.metadata) && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Context</CardTitle>
          </CardHeader>
          <CardContent className=&apos;space-y-4&apos;>
            {alert.reason && (
              <div>
                <Label>Reason</Label>
                <p className=&apos;text-sm text-muted-foreground mt-1&apos;>
                  {alert.reason}
                </p>
              </div>
            )}

            {alert.suggestedAction && (
              <div className={`p-4 rounded-lg border-2 ${config.bgColor}`}>
                <div className=&apos;flex items-start gap-2&apos;>
                  <Bell className={`h-5 w-5 ${config.color} mt-0.5`} />
                  <div className=&apos;flex-1&apos;>
                    <Label>Suggested Action</Label>
                    <p className=&apos;text-sm text-muted-foreground mt-1&apos;>
                      {alert.suggestedAction}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
              <div>
                <Label>Additional Information</Label>
                <div className=&apos;mt-2 grid grid-cols-2 gap-3&apos;>
                  {Object.entries(alert.metadata).map(([key, value]) => {
                    // Skip complex objects and arrays
                    if (typeof value === &apos;object&apos; && !Array.isArray(value))
                      return null;

                    return (
                      <div key={key} className=&apos;text-sm&apos;>
                        <div className=&apos;text-muted-foreground&apos;>
                          {key
                            .replace(/([A-Z])/g, &apos; $1&apos;)
                            .replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div>
                          {Array.isArray(value)
                            ? value.join(&apos;, &apos;)
                            : String(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workflow Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Select Action</CardTitle>
        </CardHeader>
        <CardContent className=&apos;space-y-4&apos;>
          <div className=&apos;space-y-2&apos;>
            <Label>Available Actions</Label>
            <Select
              value={selectedWorkflow}
              onValueChange={setSelectedWorkflow}
            >
              <SelectTrigger>
                <SelectValue placeholder=&apos;Choose workflow action...&apos; />
              </SelectTrigger>
              <SelectContent>
                {config.workflows.map(workflow => (
                  <SelectItem key={workflow.value} value={workflow.value}>
                    <div className=&apos;py-1&apos;>
                      <div>{workflow.label}</div>
                      <div className=&apos;text-xs text-muted-foreground&apos;>
                        {workflow.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Workflow Input */}
          {selectedWorkflowConfig?.requiresInput && (
            <div className=&apos;space-y-2&apos;>
              <Label>{selectedWorkflowConfig.inputLabel}</Label>
              {selectedWorkflowConfig.inputType === &apos;date&apos; ? (
                <Input
                  type=&apos;date&apos;
                  value={workflowInput}
                  onChange={e => setWorkflowInput(e.target.value)}
                />
              ) : selectedWorkflowConfig.inputType === &apos;datetime&apos; ? (
                <Input
                  type=&apos;datetime-local&apos;
                  value={workflowInput}
                  onChange={e => setWorkflowInput(e.target.value)}
                />
              ) : selectedWorkflowConfig.inputType === &apos;select&apos; ? (
                <Select value={workflowInput} onValueChange={setWorkflowInput}>
                  <SelectTrigger>
                    <SelectValue placeholder=&apos;Select...&apos; />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=&apos;tech-1&apos;>Mike Johnson</SelectItem>
                    <SelectItem value=&apos;tech-2&apos;>Sarah Williams</SelectItem>
                    <SelectItem value=&apos;tech-3&apos;>David Chen</SelectItem>
                    <SelectItem value=&apos;site-1&apos;>Main Warehouse</SelectItem>
                    <SelectItem value=&apos;site-2&apos;>Construction Site A</SelectItem>
                    <SelectItem value=&apos;contact-phone&apos;>Phone Call</SelectItem>
                    <SelectItem value=&apos;contact-email&apos;>Email</SelectItem>
                    <SelectItem value=&apos;contact-sms&apos;>SMS</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={workflowInput}
                  onChange={e => setWorkflowInput(e.target.value)}
                  placeholder={`Enter ${selectedWorkflowConfig.inputLabel.toLowerCase()}`}
                />
              )}
            </div>
          )}

          {/* Additional Notes */}
          <div className=&apos;space-y-2&apos;>
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder=&apos;Add any additional notes or context...&apos;
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className=&apos;flex items-center justify-between gap-3&apos;>
        <div className=&apos;flex gap-2&apos;>
          {alert.status === &apos;active&apos; && (
            <Button
              variant=&apos;outline&apos;
              onClick={handleAcknowledge}
              disabled={isProcessing}
            >
              <CheckCircle2 className=&apos;h-4 w-4 mr-2&apos; />
              Acknowledge
            </Button>
          )}
          <Button
            variant=&apos;outline&apos;
            onClick={handleResolve}
            disabled={isProcessing}
            className=&apos;text-green-600 hover:text-green-700&apos;
          >
            <XCircle className=&apos;h-4 w-4 mr-2&apos; />
            Mark Resolved
          </Button>
        </div>
        <Button
          onClick={handleExecuteWorkflow}
          disabled={!selectedWorkflow || isProcessing}
          size=&apos;lg&apos;
        >
          {isProcessing ? &apos;Processing...&apos; : &apos;Execute Action&apos;}
        </Button>
      </div>
    </PageLayout>
  );
}

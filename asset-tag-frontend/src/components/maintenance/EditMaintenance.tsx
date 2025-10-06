import { useState, useEffect } from &apos;react&apos;;
import { Save, Package, AlertTriangle } from &apos;lucide-react&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Textarea } from &apos;../ui/textarea&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { toast } from &apos;sonner&apos;;
import { PageHeader, StatusBadge, PriorityBadge, PageLayout } from &apos;../common&apos;;
import { LoadingState } from &apos;../common/LoadingState&apos;;
import { ErrorState } from &apos;../common/ErrorState&apos;;
import { AuditLogList } from &apos;../common&apos;;
import {
  fetchMaintenanceTaskById,
  updateMaintenanceTask,
  type MaintenanceTask,
} from &apos;../../services/maintenanceService&apos;;
import { fetchConfig } from &apos;../../services/configService&apos;;
import { fetchUsersByRole } from &apos;../../services/configService&apos;;
import type { DropdownOption } from &apos;../../data/dropdownOptions&apos;;

interface EditMaintenanceProps {
  maintenanceId: string;
  onBack: () => void;
  fromContext?: &apos;predictive-alert&apos; | &apos;maintenance-list&apos; | &apos;asset-details&apos;;
  sourceAssetContext?: any;
}

export function EditMaintenance({
  maintenanceId,
  onBack,
  fromContext,
  sourceAssetContext,
}: EditMaintenanceProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<MaintenanceTask | null>(null);
  const [maintenanceTypes, setMaintenanceTypes] = useState<DropdownOption[]>(
    []
  );
  const [priorities, setPriorities] = useState<DropdownOption[]>([]);
  const [statuses, setStatuses] = useState<DropdownOption[]>([]);
  const [technicians, setTechnicians] = useState<DropdownOption[]>([]);
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    type: &apos;&apos;,
    task: &apos;&apos;,
    dueDate: &apos;&apos;,
    priority: &apos;&apos;,
    status: &apos;&apos;,
    assignedTo: &apos;&apos;,
    estimatedDuration: &apos;&apos;,
    cost: &apos;&apos;,
    notes: &apos;&apos;,
  });

  useEffect(() => {
    loadData();
  }, [maintenanceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch maintenance task and config data in parallel
      const [
        taskData,
        types,
        priorityOptions,
        statusOptions,
        technicianOptions,
      ] = await Promise.all([
        fetchMaintenanceTaskById(maintenanceId),
        fetchConfig(&apos;maintenanceTypes&apos;),
        fetchConfig(&apos;priorityLevels&apos;),
        fetchConfig(&apos;maintenanceStatuses&apos;),
        fetchUsersByRole(&apos;technician&apos;),
      ]);

      if (!taskData) {
        throw new Error(&apos;Maintenance task not found&apos;);
      }

      setTask(taskData);
      setMaintenanceTypes(types);
      setPriorities(priorityOptions);
      setStatuses(statusOptions);
      setTechnicians(technicianOptions);

      // Initialize form with task data
      setFormData({
        type: taskData.type,
        task: taskData.task,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status,
        assignedTo: taskData.assignedTo,
        estimatedDuration: taskData.estimatedDuration?.toString() || &apos;&apos;,
        cost: taskData.cost || &apos;&apos;,
        notes: taskData.notes || &apos;&apos;,
      });
    } catch (err) {
      // console.error(&apos;Error loading maintenance task:&apos;, err);
      setError(
        err instanceof Error ? err.message : &apos;Failed to load maintenance task&apos;
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!task) return;

      // Build updates object with only changed fields
      const updates: Partial<MaintenanceTask> = {};
      const changes: Array<{ field: string; from: string; to: string }> = [];

      if (formData.type !== task.type) {
        updates.type = formData.type;
        changes.push({ field: &apos;Type&apos;, from: task.type, to: formData.type });
      }
      if (formData.task !== task.task) {
        updates.task = formData.task;
        changes.push({
          field: &apos;Task Description&apos;,
          from: task.task,
          to: formData.task,
        });
      }
      if (formData.dueDate !== task.dueDate) {
        updates.dueDate = formData.dueDate;
        changes.push({
          field: &apos;Due Date&apos;,
          from: task.dueDate,
          to: formData.dueDate,
        });
      }
      if (formData.priority !== task.priority) {
        updates.priority = formData.priority as any;
        changes.push({
          field: &apos;Priority&apos;,
          from: task.priority,
          to: formData.priority,
        });
      }
      if (formData.status !== task.status) {
        updates.status = formData.status as any;
        changes.push({
          field: &apos;Status&apos;,
          from: task.status,
          to: formData.status,
        });
      }
      if (formData.assignedTo !== task.assignedTo) {
        updates.assignedTo = formData.assignedTo;
        changes.push({
          field: &apos;Assigned To&apos;,
          from: task.assignedTo,
          to: formData.assignedTo,
        });
      }
      if (
        formData.estimatedDuration !==
        (task.estimatedDuration?.toString() || &apos;&apos;)
      ) {
        updates.estimatedDuration = formData.estimatedDuration
          ? parseInt(formData.estimatedDuration)
          : undefined;
        changes.push({
          field: &apos;Estimated Duration&apos;,
          from: task.estimatedDuration?.toString() || &apos;-&apos;,
          to: formData.estimatedDuration || &apos;-&apos;,
        });
      }
      if (formData.cost !== (task.cost || &apos;&apos;)) {
        updates.cost = formData.cost;
        changes.push({
          field: &apos;Cost&apos;,
          from: task.cost || &apos;-&apos;,
          to: formData.cost || &apos;-&apos;,
        });
      }
      if (formData.notes !== (task.notes || &apos;&apos;)) {
        updates.notes = formData.notes;
        changes.push({
          field: &apos;Notes&apos;,
          from: task.notes || &apos;-&apos;,
          to: formData.notes || &apos;-&apos;,
        });
      }

      if (changes.length === 0) {
        toast.info(&apos;No changes to save&apos;);
        return;
      }

      // Update the task with audit trail
      const updatedTask = await updateMaintenanceTask(
        maintenanceId,
        updates,
        `Updated maintenance task${fromContext ? ` from ${fromContext}` : &apos;&apos;}`
      );

      if (updatedTask) {
        setTask(updatedTask);
        toast.success(&apos;Maintenance task updated&apos;, {
          description: `${changes.length} change${changes.length > 1 ? &apos;s&apos; : &apos;&apos;} saved to audit trail`,
        });

        // Optionally go back after a delay
        setTimeout(() => {
          onBack();
        }, 1000);
      }
    } catch (err) {
      // console.error(&apos;Error saving maintenance task:&apos;, err);
      toast.error(&apos;Failed to save&apos;, {
        description: err instanceof Error ? err.message : &apos;An error occurred&apos;,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message=&apos;Loading maintenance task...&apos; />;
  }

  if (error || !task) {
    return (
      <ErrorState
        message={error || &apos;Maintenance task not found&apos;}
        onRetry={loadData}
      />
    );
  }

  return (
    <PageLayout
      variant=&apos;narrow&apos;
      padding=&apos;lg&apos;
      header={
        <PageHeader
          title={`Edit Maintenance: ${task.id}`}
          description={`${task.assetName} - ${task.assetId}`}
          onBack={onBack}
          actions={
            <div className=&apos;flex gap-2&apos;>
              <Button
                variant=&apos;outline&apos;
                onClick={() => setShowAuditLog(!showAuditLog)}
              >
                <HistoryIcon className=&apos;h-4 w-4 mr-2&apos; />
                {showAuditLog ? &apos;Hide&apos; : &apos;Show&apos;} Audit Log
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className=&apos;h-4 w-4 mr-2&apos; />
                {saving ? &apos;Saving...&apos; : &apos;Save Changes&apos;}
              </Button>
            </div>
          }
        />
      }
    >
      {fromContext && (
        <Card className=&apos;border-blue-200 bg-blue-50&apos;>
          <CardContent className=&apos;pt-4&apos;>
            <div className=&apos;flex items-center gap-2 text-sm text-blue-900&apos;>
              <AlertTriangle className=&apos;h-4 w-4&apos; />
              <span>
                Editing from {fromContext.replace(/-/g, &apos; &apos;)}
                {sourceAssetContext && ` (Asset: ${sourceAssetContext.name})`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className=&apos;grid gap-6 lg:grid-cols-3&apos;>
        {/* Main Form */}
        <div className=&apos;lg:col-span-2 space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Details</CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-4&apos;>
              <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;type&apos;>Maintenance Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={value =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger id=&apos;type&apos;>
                      <SelectValue placeholder=&apos;Select type&apos; />
                    </SelectTrigger>
                    <SelectContent>
                      {maintenanceTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;priority&apos;>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={value =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger id=&apos;priority&apos;>
                      <SelectValue placeholder=&apos;Select priority&apos; />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className=&apos;flex items-center gap-2&apos;>
                            <PriorityBadge priority={priority.value} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;task&apos;>Task Description</Label>
                <Textarea
                  id=&apos;task&apos;
                  value={formData.task}
                  onChange={e =>
                    setFormData({ ...formData, task: e.target.value })
                  }
                  rows={3}
                  placeholder=&apos;Describe the maintenance task...&apos;
                />
              </div>

              <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;dueDate&apos;>Due Date</Label>
                  <Input
                    id=&apos;dueDate&apos;
                    type=&apos;date&apos;
                    value={formData.dueDate}
                    onChange={e =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;status&apos;>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id=&apos;status&apos;>
                      <SelectValue placeholder=&apos;Select status&apos; />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className=&apos;flex items-center gap-2&apos;>
                            <StatusBadge status={status.value} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;assignedTo&apos;>Assigned To</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={value =>
                      setFormData({ ...formData, assignedTo: value })
                    }
                  >
                    <SelectTrigger id=&apos;assignedTo&apos;>
                      <SelectValue placeholder=&apos;Select technician&apos; />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map(tech => (
                        <SelectItem key={tech.value} value={tech.label}>
                          {tech.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className=&apos;space-y-2&apos;>
                  <Label htmlFor=&apos;estimatedDuration&apos;>
                    Estimated Duration (minutes)
                  </Label>
                  <Input
                    id=&apos;estimatedDuration&apos;
                    type=&apos;number&apos;
                    value={formData.estimatedDuration}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        estimatedDuration: e.target.value,
                      })
                    }
                    placeholder=&apos;e.g., 120&apos;
                  />
                </div>
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;cost&apos;>Cost</Label>
                <Input
                  id=&apos;cost&apos;
                  type=&apos;text&apos;
                  value={formData.cost}
                  onChange={e =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  placeholder=&apos;e.g., $150.00&apos;
                />
              </div>

              <div className=&apos;space-y-2&apos;>
                <Label htmlFor=&apos;notes&apos;>Notes</Label>
                <Textarea
                  id=&apos;notes&apos;
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  placeholder=&apos;Add any additional notes...&apos;
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className=&apos;space-y-6&apos;>
          {/* Asset Info */}
          <Card>
            <CardHeader>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <Package className=&apos;h-4 w-4&apos; />
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-2&apos;>
              <div>
                <p className=&apos;text-sm text-muted-foreground&apos;>Asset Name</p>
                <p>{task.assetName}</p>
              </div>
              <div>
                <p className=&apos;text-sm text-muted-foreground&apos;>Asset ID</p>
                <p>{task.assetId}</p>
              </div>
              <div>
                <p className=&apos;text-sm text-muted-foreground&apos;>Current Status</p>
                <StatusBadge status={task.status} />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Task Metadata</CardTitle>
            </CardHeader>
            <CardContent className=&apos;space-y-2 text-sm&apos;>
              {task.createdAt && (
                <div>
                  <p className=&apos;text-muted-foreground&apos;>Created</p>
                  <p>{new Date(task.createdAt).toLocaleString()}</p>
                </div>
              )}
              {task.updatedAt && (
                <div>
                  <p className=&apos;text-muted-foreground&apos;>Last Updated</p>
                  <p>{new Date(task.updatedAt).toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className=&apos;text-muted-foreground&apos;>Audit Entries</p>
                <p>{task.auditLog.length} entries</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Audit Log */}
      {showAuditLog && (
        <AuditLogList
          entries={task.auditLog.map((entry, index) => ({
            id: `audit-${index}`,
            timestamp: entry.timestamp,
            action: entry.action,
            changedBy: entry.user,
            changes: entry.changes,
            notes: entry.notes,
          }))}
          title=&apos;Audit Log&apos;
          description=&apos;Track all changes made to this maintenance task&apos;
          variant=&apos;card&apos;
        />
      )}
    </PageLayout>
  );
}

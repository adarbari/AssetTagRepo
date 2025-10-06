import { useState, useEffect } from &apos;react&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from &apos;../ui/dialog&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Textarea } from &apos;../ui/textarea&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { Calendar } from &apos;../ui/calendar&apos;;
import { Popover, PopoverContent, PopoverTrigger } from &apos;../ui/popover&apos;;
import { cn } from &apos;../ui/utils&apos;;
import { Calendar as CalendarIcon, Edit, History } from &apos;lucide-react&apos;;
import { format } from &apos;date-fns&apos;;
import { toast } from &apos;sonner&apos;;

interface EditMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: {
    id: string;
    assetId: string;
    assetName: string;
    type: string;
    task: string;
    dueDate: string;
    priority: string;
    status: string;
    assignedTo: string;
  } | null;
  onSave?: (
    taskId: string,
    changes: Array<{ field: string; from: string; to: string }>,
    notes: string
  ) => void;
}

export function EditMaintenanceDialog({
  open,
  onOpenChange,
  task,
  onSave,
}: EditMaintenanceDialogProps) {
  const [maintenanceType, setMaintenanceType] = useState(&apos;&apos;);
  const [priority, setPriority] = useState(&apos;&apos;);
  const [assignedTo, setAssignedTo] = useState(&apos;&apos;);
  const [status, setStatus] = useState(&apos;&apos;);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [description, setDescription] = useState(&apos;&apos;);

  // Update form when task changes
  useEffect(() => {
    if (task) {
      setMaintenanceType(task.type.toLowerCase());
      setPriority(task.priority);
      setAssignedTo(task.assignedTo.toLowerCase().replace(&apos; &apos;, &apos;-&apos;));
      setStatus(task.status);
      setScheduledDate(new Date(task.dueDate));
      setDescription(task.task);
    }
  }, [task]);

  const handleSubmit = () => {
    if (!task) return;

    const changes: Array<{ field: string; from: string; to: string }> = [];

    // Track changes
    const newType =
      maintenanceType.charAt(0).toUpperCase() + maintenanceType.slice(1);
    if (newType !== task.type) {
      changes.push({ field: &apos;Type&apos;, from: task.type, to: newType });
    }

    const newPriority = priority.charAt(0).toUpperCase() + priority.slice(1);
    if (newPriority !== task.priority) {
      changes.push({ field: &apos;Priority&apos;, from: task.priority, to: newPriority });
    }

    const newStatus = status;
    if (newStatus !== task.status) {
      changes.push({ field: &apos;Status&apos;, from: task.status, to: newStatus });
    }

    const newDate = scheduledDate
      ? format(scheduledDate, &apos;yyyy-MM-dd&apos;)
      : task.dueDate;
    if (newDate !== task.dueDate) {
      changes.push({ field: &apos;Due Date&apos;, from: task.dueDate, to: newDate });
    }

    // Convert assignedTo back to display name
    const assignedToMap: Record<string, string> = {
      &apos;mike-wilson&apos;: &apos;Mike Wilson&apos;,
      &apos;sarah-johnson&apos;: &apos;Sarah Johnson&apos;,
      &apos;john-smith&apos;: &apos;John Smith&apos;,
      &apos;emily-davis&apos;: &apos;Emily Davis&apos;,
    };
    const newAssignedTo = assignedToMap[assignedTo] || assignedTo;
    if (newAssignedTo !== task.assignedTo) {
      changes.push({
        field: &apos;Assigned To&apos;,
        from: task.assignedTo,
        to: newAssignedTo,
      });
    }

    if (description !== task.task) {
      changes.push({
        field: &apos;Task Description&apos;,
        from: task.task,
        to: description,
      });
    }

    if (onSave && changes.length > 0) {
      onSave(task.id, changes, &apos;Task details updated&apos;);
    }

    toast.success(&apos;Maintenance task updated&apos;, {
      description: `${changes.length} change${changes.length !== 1 ? &apos;s&apos; : &apos;&apos;} saved and logged to audit trail`,
    });
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=&apos;max-w-2xl&apos;>
        <DialogHeader>
          <DialogTitle className=&apos;flex items-center gap-2&apos;>
            <Edit className=&apos;h-5 w-5&apos; />
            Edit Maintenance Task
          </DialogTitle>
          <DialogDescription>
            Update maintenance task details for {task.assetName}
          </DialogDescription>
        </DialogHeader>

        <div className=&apos;space-y-4 py-4&apos;>
          <div className=&apos;p-4 bg-muted rounded-lg&apos;>
            <div className=&apos;flex items-center justify-between&apos;>
              <div>
                <h4>{task.assetName}</h4>
                <p className=&apos;text-sm text-muted-foreground&apos;>{task.assetId}</p>
              </div>
              <p className=&apos;text-sm text-muted-foreground&apos;>
                Task ID: {task.id}
              </p>
            </div>
          </div>

          <div className=&apos;grid md:grid-cols-2 gap-4&apos;>
            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;edit-type&apos;>Maintenance Type</Label>
              <Select
                value={maintenanceType}
                onValueChange={setMaintenanceType}
              >
                <SelectTrigger id=&apos;edit-type&apos;>
                  <SelectValue placeholder=&apos;Select type&apos; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;preventive&apos;>
                    Preventive Maintenance
                  </SelectItem>
                  <SelectItem value=&apos;inspection&apos;>Safety Inspection</SelectItem>
                  <SelectItem value=&apos;calibration&apos;>Calibration</SelectItem>
                  <SelectItem value=&apos;repair&apos;>Repair</SelectItem>
                  <SelectItem value=&apos;replacement&apos;>Part Replacement</SelectItem>
                  <SelectItem value=&apos;cleaning&apos;>
                    Cleaning & Lubrication
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;edit-status&apos;>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id=&apos;edit-status&apos;>
                  <SelectValue placeholder=&apos;Select status&apos; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;scheduled&apos;>Scheduled</SelectItem>
                  <SelectItem value=&apos;in-progress&apos;>In Progress</SelectItem>
                  <SelectItem value=&apos;overdue&apos;>Overdue</SelectItem>
                  <SelectItem value=&apos;completed&apos;>Completed</SelectItem>
                  <SelectItem value=&apos;cancelled&apos;>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className=&apos;grid md:grid-cols-2 gap-4&apos;>
            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;edit-priority&apos;>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id=&apos;edit-priority&apos;>
                  <SelectValue placeholder=&apos;Select priority&apos; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;critical&apos;>Critical</SelectItem>
                  <SelectItem value=&apos;high&apos;>High</SelectItem>
                  <SelectItem value=&apos;medium&apos;>Medium</SelectItem>
                  <SelectItem value=&apos;low&apos;>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className=&apos;space-y-2&apos;>
              <Label htmlFor=&apos;edit-assigned&apos;>Assign To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger id=&apos;edit-assigned&apos;>
                  <SelectValue placeholder=&apos;Select technician&apos; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;mike-wilson&apos;>Mike Wilson</SelectItem>
                  <SelectItem value=&apos;sarah-johnson&apos;>Sarah Johnson</SelectItem>
                  <SelectItem value=&apos;john-smith&apos;>John Smith</SelectItem>
                  <SelectItem value=&apos;emily-davis&apos;>Emily Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className=&apos;space-y-2&apos;>
            <Label>Scheduled Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant=&apos;outline&apos;
                  className={cn(
                    &apos;w-full justify-start text-left&apos;,
                    !scheduledDate && &apos;text-muted-foreground&apos;
                  )}
                >
                  <CalendarIcon className=&apos;mr-2 h-4 w-4&apos; />
                  {scheduledDate ? format(scheduledDate, &apos;PPP&apos;) : &apos;Pick a date&apos;}
                </Button>
              </PopoverTrigger>
              <PopoverContent className=&apos;w-auto p-0&apos; align=&apos;start&apos;>
                <Calendar
                  mode=&apos;single&apos;
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className=&apos;space-y-2&apos;>
            <Label htmlFor=&apos;edit-description&apos;>Task Description</Label>
            <Textarea
              id=&apos;edit-description&apos;
              placeholder=&apos;Describe the maintenance task...&apos;
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className=&apos;space-y-2&apos;>
            <Label htmlFor=&apos;edit-notes&apos;>Additional Notes (Optional)</Label>
            <Textarea
              id=&apos;edit-notes&apos;
              placeholder=&apos;Add any notes or special instructions...&apos;
              rows={3}
            />
          </div>
        </div>

        <div className=&apos;p-3 bg-blue-50 border border-blue-200 rounded-lg&apos;>
          <div className=&apos;flex items-start gap-2&apos;>
            <History className=&apos;h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0&apos; />
            <p className=&apos;text-sm text-blue-900&apos;>
              All changes to this maintenance task will be automatically logged
              in the audit trail with your user information and timestamp.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant=&apos;outline&apos; onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Edit className=&apos;h-4 w-4 mr-2&apos; />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

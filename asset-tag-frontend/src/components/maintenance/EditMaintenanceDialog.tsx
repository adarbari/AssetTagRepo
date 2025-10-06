import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../ui/utils';
import { Calendar as CalendarIcon, Edit, History } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
  const [maintenanceType, setMaintenanceType] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [description, setDescription] = useState('');

  // Update form when task changes
  useEffect(() => {
    if (task) {
      setMaintenanceType(task.type.toLowerCase());
      setPriority(task.priority);
      setAssignedTo(task.assignedTo.toLowerCase().replace(' ', '-'));
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
      changes.push({ field: 'Type', from: task.type, to: newType });
    }

    const newPriority = priority.charAt(0).toUpperCase() + priority.slice(1);
    if (newPriority !== task.priority) {
      changes.push({ field: 'Priority', from: task.priority, to: newPriority });
    }

    const newStatus = status;
    if (newStatus !== task.status) {
      changes.push({ field: 'Status', from: task.status, to: newStatus });
    }

    const newDate = scheduledDate
      ? format(scheduledDate, 'yyyy-MM-dd')
      : task.dueDate;
    if (newDate !== task.dueDate) {
      changes.push({ field: 'Due Date', from: task.dueDate, to: newDate });
    }

    // Convert assignedTo back to display name
    const assignedToMap: Record<string, string> = {
      'mike-wilson': 'Mike Wilson',
      'sarah-johnson': 'Sarah Johnson',
      'john-smith': 'John Smith',
      'emily-davis': 'Emily Davis',
    };
    const newAssignedTo = assignedToMap[assignedTo] || assignedTo;
    if (newAssignedTo !== task.assignedTo) {
      changes.push({
        field: 'Assigned To',
        from: task.assignedTo,
        to: newAssignedTo,
      });
    }

    if (description !== task.task) {
      changes.push({
        field: 'Task Description',
        from: task.task,
        to: description,
      });
    }

    if (onSave && changes.length > 0) {
      onSave(task.id, changes, 'Task details updated');
    }

    toast.success('Maintenance task updated', {
      description: `${changes.length} change${changes.length !== 1 ? 's' : ''} saved and logged to audit trail`,
    });
    onOpenChange(false);
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Edit className='h-5 w-5' />
            Edit Maintenance Task
          </DialogTitle>
          <DialogDescription>
            Update maintenance task details for {task.assetName}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='p-4 bg-muted rounded-lg'>
            <div className='flex items-center justify-between'>
              <div>
                <h4>{task.assetName}</h4>
                <p className='text-sm text-muted-foreground'>{task.assetId}</p>
              </div>
              <p className='text-sm text-muted-foreground'>
                Task ID: {task.id}
              </p>
            </div>
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-type'>Maintenance Type</Label>
              <Select
                value={maintenanceType}
                onValueChange={setMaintenanceType}
              >
                <SelectTrigger id='edit-type'>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='preventive'>
                    Preventive Maintenance
                  </SelectItem>
                  <SelectItem value='inspection'>Safety Inspection</SelectItem>
                  <SelectItem value='calibration'>Calibration</SelectItem>
                  <SelectItem value='repair'>Repair</SelectItem>
                  <SelectItem value='replacement'>Part Replacement</SelectItem>
                  <SelectItem value='cleaning'>
                    Cleaning & Lubrication
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-status'>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id='edit-status'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='scheduled'>Scheduled</SelectItem>
                  <SelectItem value='in-progress'>In Progress</SelectItem>
                  <SelectItem value='overdue'>Overdue</SelectItem>
                  <SelectItem value='completed'>Completed</SelectItem>
                  <SelectItem value='cancelled'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-priority'>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id='edit-priority'>
                  <SelectValue placeholder='Select priority' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='critical'>Critical</SelectItem>
                  <SelectItem value='high'>High</SelectItem>
                  <SelectItem value='medium'>Medium</SelectItem>
                  <SelectItem value='low'>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-assigned'>Assign To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger id='edit-assigned'>
                  <SelectValue placeholder='Select technician' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='mike-wilson'>Mike Wilson</SelectItem>
                  <SelectItem value='sarah-johnson'>Sarah Johnson</SelectItem>
                  <SelectItem value='john-smith'>John Smith</SelectItem>
                  <SelectItem value='emily-davis'>Emily Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Scheduled Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-full justify-start text-left',
                    !scheduledDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-description'>Task Description</Label>
            <Textarea
              id='edit-description'
              placeholder='Describe the maintenance task...'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-notes'>Additional Notes (Optional)</Label>
            <Textarea
              id='edit-notes'
              placeholder='Add any notes or special instructions...'
              rows={3}
            />
          </div>
        </div>

        <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <div className='flex items-start gap-2'>
            <History className='h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0' />
            <p className='text-sm text-blue-900'>
              All changes to this maintenance task will be automatically logged
              in the audit trail with your user information and timestamp.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Edit className='h-4 w-4 mr-2' />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Save, Package, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { PageHeader, StatusBadge, PriorityBadge, PageLayout } from '../common';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { AuditLogList } from '../common';
import {
  fetchMaintenanceTaskById,
  updateMaintenanceTask,
  type MaintenanceTask,
} from '../../services/maintenanceService';
import { fetchConfig } from '../../services/configService';
import { fetchUsersByRole } from '../../services/configService';
import type { DropdownOption } from '../../data/dropdownOptions';

interface EditMaintenanceProps {
  maintenanceId: string;
  onBack: () => void;
  fromContext?: 'predictive-alert' | 'maintenance-list' | 'asset-details';
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
    type: '',
    task: '',
    dueDate: '',
    priority: '',
    status: '',
    assignedTo: '',
    estimatedDuration: '',
    cost: '',
    notes: '',
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
        fetchConfig('maintenanceTypes'),
        fetchConfig('priorityLevels'),
        fetchConfig('maintenanceStatuses'),
        fetchUsersByRole('technician'),
      ]);

      if (!taskData) {
        throw new Error('Maintenance task not found');
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
        estimatedDuration: taskData.estimatedDuration?.toString() || '',
        cost: taskData.cost || '',
        notes: taskData.notes || '',
      });
    } catch (err) {
    // console.error('Error loading maintenance task:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load maintenance task'
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
        changes.push({ field: 'Type', from: task.type, to: formData.type });
      }
      if (formData.task !== task.task) {
        updates.task = formData.task;
        changes.push({
          field: 'Task Description',
          from: task.task,
          to: formData.task,
        });
      }
      if (formData.dueDate !== task.dueDate) {
        updates.dueDate = formData.dueDate;
        changes.push({
          field: 'Due Date',
          from: task.dueDate,
          to: formData.dueDate,
        });
      }
      if (formData.priority !== task.priority) {
        updates.priority = formData.priority as any;
        changes.push({
          field: 'Priority',
          from: task.priority,
          to: formData.priority,
        });
      }
      if (formData.status !== task.status) {
        updates.status = formData.status as any;
        changes.push({
          field: 'Status',
          from: task.status,
          to: formData.status,
        });
      }
      if (formData.assignedTo !== task.assignedTo) {
        updates.assignedTo = formData.assignedTo;
        changes.push({
          field: 'Assigned To',
          from: task.assignedTo,
          to: formData.assignedTo,
        });
      }
      if (
        formData.estimatedDuration !==
        (task.estimatedDuration?.toString() || '')
      ) {
        updates.estimatedDuration = formData.estimatedDuration
          ? parseInt(formData.estimatedDuration)
          : undefined;
        changes.push({
          field: 'Estimated Duration',
          from: task.estimatedDuration?.toString() || '-',
          to: formData.estimatedDuration || '-',
        });
      }
      if (formData.cost !== (task.cost || '')) {
        updates.cost = formData.cost;
        changes.push({
          field: 'Cost',
          from: task.cost || '-',
          to: formData.cost || '-',
        });
      }
      if (formData.notes !== (task.notes || '')) {
        updates.notes = formData.notes;
        changes.push({
          field: 'Notes',
          from: task.notes || '-',
          to: formData.notes || '-',
        });
      }

      if (changes.length === 0) {
        toast.info('No changes to save');
        return;
      }

      // Update the task with audit trail
      const updatedTask = await updateMaintenanceTask(
        maintenanceId,
        updates,
        `Updated maintenance task${fromContext ? ` from ${fromContext}` : ''}`
      );

      if (updatedTask) {
        setTask(updatedTask);
        toast.success('Maintenance task updated', {
          description: `${changes.length} change${changes.length > 1 ? 's' : ''} saved to audit trail`,
        });

        // Optionally go back after a delay
        setTimeout(() => {
          onBack();
        }, 1000);
      }
    } catch (err) {
    // console.error('Error saving maintenance task:', err);
      toast.error('Failed to save', {
        description: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message='Loading maintenance task...' />;
  }

  if (error || !task) {
    return (
      <ErrorState
        message={error || 'Maintenance task not found'}
        onRetry={loadData}
      />
    );
  }

  return (
    <PageLayout
      variant='narrow'
      padding='lg'
      header={
        <PageHeader
          title={`Edit Maintenance: ${task.id}`}
          description={`${task.assetName} - ${task.assetId}`}
          onBack={onBack}
          actions={
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => setShowAuditLog(!showAuditLog)}
              >
                <HistoryIcon className='h-4 w-4 mr-2' />
                {showAuditLog ? 'Hide' : 'Show'} Audit Log
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className='h-4 w-4 mr-2' />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          }
        />
      }
    >
      {fromContext && (
        <Card className='border-blue-200 bg-blue-50'>
          <CardContent className='pt-4'>
            <div className='flex items-center gap-2 text-sm text-blue-900'>
              <AlertTriangle className='h-4 w-4' />
              <span>
                Editing from {fromContext.replace(/-/g, ' ')}
                {sourceAssetContext && ` (Asset: ${sourceAssetContext.name})`}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Main Form */}
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='type'>Maintenance Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={value =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger id='type'>
                      <SelectValue placeholder='Select type' />
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

                <div className='space-y-2'>
                  <Label htmlFor='priority'>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={value =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger id='priority'>
                      <SelectValue placeholder='Select priority' />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className='flex items-center gap-2'>
                            <PriorityBadge priority={priority.value} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='task'>Task Description</Label>
                <Textarea
                  id='task'
                  value={formData.task}
                  onChange={e =>
                    setFormData({ ...formData, task: e.target.value })
                  }
                  rows={3}
                  placeholder='Describe the maintenance task...'
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='dueDate'>Due Date</Label>
                  <Input
                    id='dueDate'
                    type='date'
                    value={formData.dueDate}
                    onChange={e =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='status'>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id='status'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className='flex items-center gap-2'>
                            <StatusBadge status={status.value} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='assignedTo'>Assigned To</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={value =>
                      setFormData({ ...formData, assignedTo: value })
                    }
                  >
                    <SelectTrigger id='assignedTo'>
                      <SelectValue placeholder='Select technician' />
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

                <div className='space-y-2'>
                  <Label htmlFor='estimatedDuration'>
                    Estimated Duration (minutes)
                  </Label>
                  <Input
                    id='estimatedDuration'
                    type='number'
                    value={formData.estimatedDuration}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        estimatedDuration: e.target.value,
                      })
                    }
                    placeholder='e.g., 120'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='cost'>Cost</Label>
                <Input
                  id='cost'
                  type='text'
                  value={formData.cost}
                  onChange={e =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  placeholder='e.g., $150.00'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  placeholder='Add any additional notes...'
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Asset Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-4 w-4' />
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div>
                <p className='text-sm text-muted-foreground'>Asset Name</p>
                <p>{task.assetName}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Asset ID</p>
                <p>{task.assetId}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Current Status</p>
                <StatusBadge status={task.status} />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Task Metadata</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              {task.createdAt && (
                <div>
                  <p className='text-muted-foreground'>Created</p>
                  <p>{new Date(task.createdAt).toLocaleString()}</p>
                </div>
              )}
              {task.updatedAt && (
                <div>
                  <p className='text-muted-foreground'>Last Updated</p>
                  <p>{new Date(task.updatedAt).toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className='text-muted-foreground'>Audit Entries</p>
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
          title='Audit Log'
          description='Track all changes made to this maintenance task'
          variant='card'
        />
      )}
    </PageLayout>
  );
}

/**
 * Maintenance Service
 *
 * Centralized service for managing maintenance schedules, history, and predictive alerts.
 * Designed to integrate with backend API.
 */

export interface MaintenanceTask {
  id: string;
  assetId: string;
  assetName: string;
  type: string;
  task: string;
  dueDate: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'overdue' | 'in-progress' | 'scheduled' | 'completed' | 'cancelled';
  assignedTo: string;
  estimatedDuration?: number;
  actualDuration?: number;
  cost?: string;
  notes?: string;
  completedDate?: string;
  auditLog: AuditEntry[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface MaintenanceHistory {
  id: string;
  assetId: string;
  assetName: string;
  task: string;
  completedDate: string;
  technician: string;
  cost: string;
  duration?: number;
  notes: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface PredictiveAlert {
  id: string;
  assetId: string;
  assetName: string;
  prediction: string;
  confidence: number;
  basedOn: string;
  recommendedAction: string;
  createdAt?: string;
  dismissed?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AuditEntry {
  timestamp: string;
  user: string;
  action: string;
  changes: Array<{ field: string; from: string; to: string }>;
  notes: string;
}

// Mock data that will be replaced by backend calls
const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: 'MNT-001',
    assetId: 'AST-1045',
    assetName: 'Generator 2000W',
    type: 'Preventive',
    task: 'Oil change and filter replacement',
    dueDate: '2024-10-15',
    priority: 'high',
    status: 'overdue',
    assignedTo: 'Mike Wilson',
    estimatedDuration: 120,
    cost: '$180.00',
    notes: 'Regular maintenance schedule',
    auditLog: [
      {
        timestamp: '2024-10-04 14:23:15',
        user: 'John Smith',
        action: 'Task Updated',
        changes: [
          { field: 'Due Date', from: '2024-10-10', to: '2024-10-15' },
          { field: 'Priority', from: 'Medium', to: 'High' },
        ],
        notes: 'Rescheduled due to parts availability',
      },
      {
        timestamp: '2024-09-20 09:15:00',
        user: 'System',
        action: 'Task Created',
        changes: [
          { field: 'Type', from: '-', to: 'Preventive' },
          { field: 'Assigned To', from: '-', to: 'Mike Wilson' },
        ],
        notes: 'Automated maintenance schedule based on usage hours',
      },
    ],
  },
  {
    id: 'MNT-002',
    assetId: 'AST-2341',
    assetName: 'Concrete Mixer',
    type: 'Inspection',
    task: 'Safety inspection and certification',
    dueDate: '2024-10-18',
    priority: 'high',
    status: 'scheduled',
    assignedTo: 'Sarah Johnson',
    estimatedDuration: 90,
    auditLog: [
      {
        timestamp: '2024-10-04 13:45:22',
        user: 'Sarah Johnson',
        action: 'Task Created',
        changes: [
          { field: 'Type', from: '-', to: 'Safety Inspection' },
          { field: 'Priority', from: '-', to: 'High' },
        ],
        notes: 'Annual safety compliance check required',
      },
    ],
  },
  {
    id: 'MNT-003',
    assetId: 'AST-3782',
    assetName: 'Laser Level Pro',
    type: 'Calibration',
    task: 'Precision calibration check',
    dueDate: '2024-10-22',
    priority: 'medium',
    status: 'scheduled',
    assignedTo: 'John Smith',
    estimatedDuration: 60,
    auditLog: [
      {
        timestamp: '2024-10-01 10:30:00',
        user: 'John Smith',
        action: 'Task Created',
        changes: [
          { field: 'Type', from: '-', to: 'Calibration' },
          { field: 'Assigned To', from: '-', to: 'John Smith' },
        ],
        notes: 'Regular calibration maintenance',
      },
    ],
  },
  {
    id: 'MNT-004',
    assetId: 'AST-4521',
    assetName: 'Air Compressor',
    type: 'Repair',
    task: 'Replace pressure valve',
    dueDate: '2024-10-10',
    priority: 'critical',
    status: 'in-progress',
    assignedTo: 'Mike Wilson',
    estimatedDuration: 180,
    auditLog: [
      {
        timestamp: '2024-10-03 16:20:00',
        user: 'Mike Wilson',
        action: 'Status Changed',
        changes: [{ field: 'Status', from: 'Scheduled', to: 'In Progress' }],
        notes: 'Started repair work',
      },
      {
        timestamp: '2024-10-02 11:00:00',
        user: 'System',
        action: 'Task Created',
        changes: [
          { field: 'Type', from: '-', to: 'Repair' },
          { field: 'Priority', from: '-', to: 'Critical' },
        ],
        notes: 'Created from predictive alert: Pressure anomaly detected',
      },
    ],
  },
];

const mockMaintenanceHistory: MaintenanceHistory[] = [
  {
    id: 'MNT-H-001',
    assetId: 'AST-1045',
    assetName: 'Generator 2000W',
    task: 'Annual service and inspection',
    completedDate: '2024-09-15',
    technician: 'Mike Wilson',
    cost: '$245.00',
    duration: 135,
    notes: 'All systems operational. Replaced air filter.',
  },
  {
    id: 'MNT-H-002',
    assetId: 'AST-2341',
    assetName: 'Concrete Mixer',
    task: 'Belt replacement',
    completedDate: '2024-09-08',
    technician: 'Sarah Johnson',
    cost: '$125.00',
    duration: 45,
    notes: 'Replaced worn drive belt. Tested successfully.',
  },
  {
    id: 'MNT-H-003',
    assetId: 'AST-3782',
    assetName: 'Laser Level Pro',
    task: 'Calibration check',
    completedDate: '2024-08-22',
    technician: 'John Smith',
    cost: '$75.00',
    duration: 30,
    notes: 'Calibration verified within tolerance.',
  },
];

const mockPredictiveAlerts: PredictiveAlert[] = [
  {
    id: 'PA-001',
    assetId: 'AST-5672',
    assetName: 'Hydraulic Jack',
    prediction: 'Seal failure likely within 30 days',
    confidence: 87,
    basedOn: 'Usage pattern analysis',
    recommendedAction: 'Schedule preventive seal replacement',
  },
  {
    id: 'PA-002',
    assetId: 'AST-6783',
    assetName: 'Electric Drill',
    prediction: 'Battery replacement needed soon',
    confidence: 92,
    basedOn: 'Charge cycle degradation',
    recommendedAction: 'Order replacement battery',
  },
];

// In-memory storage (will be replaced by backend)
const maintenanceTasks = [...mockMaintenanceTasks];
const maintenanceHistory = [...mockMaintenanceHistory];
const predictiveAlerts = [...mockPredictiveAlerts];

/**
 * Fetch all maintenance tasks
 */
export async function fetchMaintenanceTasks(filters?: {
  status?: string;
  assetId?: string;
  priority?: string;
}): Promise<MaintenanceTask[]> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/maintenance/tasks', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(filters)
  // });
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 100));

  let filtered = [...maintenanceTasks];

  if (filters?.status) {
    filtered = filtered.filter(t => t.status === filters.status);
  }

  if (filters?.assetId) {
    filtered = filtered.filter(t => t.assetId === filters.assetId);
  }

  if (filters?.priority) {
    filtered = filtered.filter(t => t.priority === filters.priority);
  }

  return filtered;
}

/**
 * Fetch a single maintenance task by ID
 */
export async function fetchMaintenanceTaskById(
  id: string
): Promise<MaintenanceTask | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/maintenance/tasks/${id}`);
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 50));

  return maintenanceTasks.find(t => t.id === id) || null;
}

/**
 * Create a new maintenance task
 */
export async function createMaintenanceTask(
  task: Omit<MaintenanceTask, 'id' | 'auditLog' | 'createdAt' | 'updatedAt'>
): Promise<MaintenanceTask> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/maintenance/tasks', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(task)
  // });
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 100));

  const newTask: MaintenanceTask = {
    ...task,
    id: `MNT-${Date.now()}`,
    auditLog: [
      {
        timestamp: new Date().toISOString(),
        user: 'Current User',
        action: 'Task Created',
        changes: [
          { field: 'Type', from: '-', to: task.type },
          { field: 'Priority', from: '-', to: task.priority },
        ],
        notes: 'Maintenance task created',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  maintenanceTasks.push(newTask);
  return newTask;
}

/**
 * Update a maintenance task
 */
export async function updateMaintenanceTask(
  id: string,
  updates: Partial<MaintenanceTask>,
  auditNote?: string
): Promise<MaintenanceTask | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/maintenance/tasks/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ updates, auditNote })
  // });
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 100));

  const taskIndex = maintenanceTasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return null;

  const oldTask = maintenanceTasks[taskIndex];
  const changes: Array<{ field: string; from: string; to: string }> = [];

  // Track changes for audit log
  Object.keys(updates).forEach(key => {
    if (
      key !== 'auditLog' &&
      updates[key as keyof MaintenanceTask] !==
        oldTask[key as keyof MaintenanceTask]
    ) {
      changes.push({
        field:
          key.charAt(0).toUpperCase() +
          key
            .slice(1)
            .replace(/([A-Z])/g, ' $1')
            .trim(),
        from: String(oldTask[key as keyof MaintenanceTask] || '-'),
        to: String(updates[key as keyof MaintenanceTask] || '-'),
      });
    }
  });

  const auditEntry: AuditEntry = {
    timestamp: new Date().toISOString(),
    user: 'Current User',
    action: 'Task Updated',
    changes,
    notes: auditNote || 'Maintenance task updated',
  };

  const updatedTask = {
    ...oldTask,
    ...updates,
    auditLog: [auditEntry, ...oldTask.auditLog],
    updatedAt: new Date().toISOString(),
  };

  maintenanceTasks[taskIndex] = updatedTask;
  return updatedTask;
}

/**
 * Delete a maintenance task
 */
export async function deleteMaintenanceTask(id: string): Promise<boolean> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/maintenance/tasks/${id}`, {
  //   method: 'DELETE'
  // });
  // return response.ok;

  await new Promise(resolve => setTimeout(resolve, 100));

  const index = maintenanceTasks.findIndex(t => t.id === id);
  if (index === -1) return false;

  maintenanceTasks.splice(index, 1);
  return true;
}

/**
 * Fetch maintenance history
 */
export async function fetchMaintenanceHistory(
  assetId?: string
): Promise<MaintenanceHistory[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/maintenance/history?assetId=${assetId || ''}`);
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 100));

  if (assetId) {
    return maintenanceHistory.filter(h => h.assetId === assetId);
  }

  return [...maintenanceHistory];
}

/**
 * Fetch predictive alerts
 */
export async function fetchPredictiveAlerts(
  dismissed = false
): Promise<PredictiveAlert[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/maintenance/predictive?dismissed=${dismissed}`);
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 100));

  return predictiveAlerts.filter(a => !!a.dismissed === dismissed);
}

/**
 * Dismiss a predictive alert
 */
export async function dismissPredictiveAlert(
  id: string,
  reason?: string
): Promise<boolean> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/maintenance/predictive/${id}/dismiss`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ reason })
  // });
  // return response.ok;

  await new Promise(resolve => setTimeout(resolve, 100));

  const alert = predictiveAlerts.find(a => a.id === id);
  if (alert) {
    alert.dismissed = true;
    return true;
  }

  return false;
}

/**
 * Get maintenance statistics
 */
export async function getMaintenanceStats(): Promise<{
  overdue: number;
  inProgress: number;
  scheduled: number;
  predictiveAlerts: number;
}> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/maintenance/stats');
  // return response.json();

  await new Promise(resolve => setTimeout(resolve, 50));

  return {
    overdue: maintenanceTasks.filter(t => t.status === 'overdue').length,
    inProgress: maintenanceTasks.filter(t => t.status === 'in-progress').length,
    scheduled: maintenanceTasks.filter(t => t.status === 'scheduled').length,
    predictiveAlerts: predictiveAlerts.filter(a => !a.dismissed).length,
  };
}

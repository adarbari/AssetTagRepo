import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Search,
  Plus,
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  FileText,
  TrendingUp,
  Package,
  History,
  User,
} from "lucide-react";
import { TaskAuditLogDialog } from "../TaskAuditLogDialog";
import { toast } from "sonner";
import { useNavigation } from "../../contexts/NavigationContext";
import {
  fetchMaintenanceTasks,
  fetchMaintenanceHistory,
  fetchPredictiveAlerts,
  getMaintenanceStats,
  updateMaintenanceTask,
  dismissPredictiveAlert,
  type MaintenanceTask,
  type MaintenanceHistory as MaintenanceHistoryType,
  type PredictiveAlert,
} from "../../services/maintenanceService";
import { LoadingState } from "../common/LoadingState";
import { AuditLogList, type AuditLogEntry } from "../common";

// Data will be loaded from service

interface MaintenanceProps {
  onAssetClick: (asset: any) => void;
}

export function Maintenance({ onAssetClick }: MaintenanceProps) {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAuditLogDialogOpen, setIsAuditLogDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [maintenanceHistoryData, setMaintenanceHistoryData] = useState<MaintenanceHistoryType[]>([]);
  const [stats, setStats] = useState({
    overdue: 0,
    inProgress: 0,
    scheduled: 0,
    predictiveAlerts: 0,
  });

  // Compute consolidated audit log from all tasks
  const auditLogs = useMemo(() => {
    const allLogs: Array<{
      id: string;
      timestamp: string;
      user: string;
      action: string;
      taskId: string;
      assetName: string;
      changes: Array<{ field: string; from: string; to: string }>;
      notes: string;
    }> = [];

    maintenanceTasks.forEach(task => {
      task.auditLog.forEach((entry, index) => {
        allLogs.push({
          id: `${task.id}-${index}`,
          timestamp: entry.timestamp,
          user: entry.user,
          action: entry.action,
          taskId: task.id,
          assetName: task.assetName,
          changes: entry.changes,
          notes: entry.notes,
        });
      });
    });

    // Sort by timestamp, newest first
    return allLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [maintenanceTasks]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [tasks, history, alerts, statistics] = await Promise.all([
        fetchMaintenanceTasks(),
        fetchMaintenanceHistory(),
        fetchPredictiveAlerts(false),
        getMaintenanceStats(),
      ]);
      
      setMaintenanceTasks(tasks);
      setMaintenanceHistoryData(history);
      setPredictiveAlerts(alerts);
      setStats(statistics);
    } catch (error) {
      console.error("Error loading maintenance data:", error);
      toast.error("Failed to load maintenance data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (taskId: string, taskName: string) => {
    try {
      const updatedTask = await updateMaintenanceTask(
        taskId,
        { status: "completed" },
        "Task marked as completed"
      );
      
      if (updatedTask) {
        setMaintenanceTasks(prevTasks =>
          prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );
        
        toast.success("Task marked as completed", {
          description: `${taskName} completed and logged to audit trail`,
        });
        
        // Refresh stats
        const newStats = await getMaintenanceStats();
        setStats(newStats);
      }
    } catch (error) {
      toast.error("Failed to mark task as complete");
    }
  };

  const handleStartWork = async (taskId: string, taskName: string) => {
    try {
      const updatedTask = await updateMaintenanceTask(
        taskId,
        { status: "in-progress" },
        "Work started on maintenance task"
      );
      
      if (updatedTask) {
        setMaintenanceTasks(prevTasks =>
          prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );
        
        toast.success("Work started", {
          description: `Status change logged to audit trail`,
        });
        
        // Refresh stats
        const newStats = await getMaintenanceStats();
        setStats(newStats);
      }
    } catch (error) {
      toast.error("Failed to start work");
    }
  };

  const handleEditTask = (task: MaintenanceTask) => {
    navigation.navigateToEditMaintenance({
      maintenanceId: task.id,
      fromContext: 'maintenance-list',
    });
  };

  const handleViewDetails = (task: MaintenanceTask) => {
    // Find the asset from mock data to pass full context
    import("../../data/mockData").then(({ mockAssets }) => {
      const asset = mockAssets.find(a => a.id === task.assetId);
      if (asset) {
        navigation.navigateToAssetDetails(asset);
      } else {
        toast.error("Asset not found");
      }
    });
  };

  const handleViewAuditLog = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsAuditLogDialogOpen(true);
  };

  const handleCancelTask = async (taskId: string, taskName: string) => {
    try {
      const updatedTask = await updateMaintenanceTask(
        taskId,
        { status: "cancelled" },
        "Maintenance task cancelled by user"
      );
      
      if (updatedTask) {
        setMaintenanceTasks(prevTasks =>
          prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );
        
        toast.error("Task cancelled", {
          description: `Cancellation logged to audit trail`,
        });
        
        // Refresh stats
        const newStats = await getMaintenanceStats();
        setStats(newStats);
      }
    } catch (error) {
      toast.error("Failed to cancel task");
    }
  };

  const handleScheduleFromPredictive = (alert: PredictiveAlert) => {
    // Find the asset from mock data to pass full context
    import("../../data/mockData").then(({ mockAssets }) => {
      const asset = mockAssets.find(a => a.id === alert.assetId);
      navigation.navigateToCreateMaintenance({
        preSelectedAsset: alert.assetId,
        preSelectedAssetName: alert.assetName,
        assetContext: asset,
      });
    });
  };

  const handleViewAssetDetails = (assetId: string, assetName: string) => {
    // Pass full asset context
    import("../../data/mockData").then(({ mockAssets }) => {
      const asset = mockAssets.find(a => a.id === assetId);
      if (asset) {
        navigation.navigateToAssetDetails(asset);
      } else {
        toast.error("Asset not found");
      }
    });
  };

  const handleDismissAlert = async (alertId: string, assetName: string) => {
    try {
      const success = await dismissPredictiveAlert(alertId, "User dismissed alert");
      
      if (success) {
        setPredictiveAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
        
        toast.success("Alert dismissed", {
          description: `Predictive alert for ${assetName} has been dismissed and logged to audit trail`,
        });
        
        // Refresh stats
        const newStats = await getMaintenanceStats();
        setStats(newStats);
      }
    } catch (error) {
      toast.error("Failed to dismiss alert");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200";
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "scheduled":
        return "bg-green-100 text-green-700 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return <LoadingState message="Loading maintenance data..." />;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Maintenance Management</h1>
          <p className="text-muted-foreground">
            Schedule, track, and optimize asset maintenance
          </p>
        </div>
        <Button onClick={() => navigation.navigateToCreateMaintenance()}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently being serviced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Predictive Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.predictiveAlerts}</div>
            <p className="text-xs text-muted-foreground">AI-detected issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Maintenance Schedule
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileText className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="predictive">
            <TrendingUp className="h-4 w-4 mr-2" />
            Predictive Alerts
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Maintenance</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceTasks.map((task) => (
                    <TableRow 
                      key={task.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEditTask(task)}
                    >
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{task.assetName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.assetId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{task.task}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{task.dueDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{task.assignedTo}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleMarkComplete(task.id, task.task)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStartWork(task.id, task.task)}>
                              <Wrench className="h-4 w-4 mr-2" />
                              Start Work
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(task)}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Asset Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewAuditLog(task)}>
                              <History className="h-4 w-4 mr-2" />
                              View Audit Log
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleCancelTask(task.id, task.task)}
                            >
                              Cancel Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Completed Date</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceHistoryData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div>{record.assetName}</div>
                          <p className="text-sm text-muted-foreground">{record.assetId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{record.task}</TableCell>
                      <TableCell className="text-sm">{record.completedDate}</TableCell>
                      <TableCell className="text-sm">{record.technician}</TableCell>
                      <TableCell>{record.cost}</TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          {record.notes}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Alerts Tab */}
        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI-Powered Predictive Maintenance</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Proactive alerts based on usage patterns and asset health analytics
                  </p>
                </div>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                  {predictiveAlerts.length} Alert{predictiveAlerts.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {predictiveAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="mb-2">No Predictive Alerts</h3>
                  <p className="text-muted-foreground">
                    All predictive maintenance alerts have been addressed or dismissed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictiveAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                          <h4>{alert.assetName}</h4>
                          <Badge variant="outline">{alert.assetId}</Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{alert.prediction}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-orange-100 text-orange-700 border-orange-200"
                      >
                        {alert.confidence}% confidence
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Based on: </span>
                        <span>{alert.basedOn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recommended: </span>
                        <span>{alert.recommendedAction}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleScheduleFromPredictive(alert)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Maintenance
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewAssetDetails(alert.assetId, alert.assetName)}
                      >
                        View Asset Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDismissAlert(alert.id, alert.assetName)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Maintenance Audit Log</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search audit logs..."
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AuditLogList
                entries={auditLogs.map((log) => ({
                  id: log.id,
                  timestamp: log.timestamp,
                  action: log.action,
                  changedBy: log.user,
                  changes: log.changes,
                  notes: log.notes,
                }))}
                variant="inline"
                showEmptyState={true}
                emptyStateTitle="No Audit Log Entries"
                emptyStateDescription="No maintenance activities have been recorded yet."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Audit Log Dialog */}
      <TaskAuditLogDialog
        open={isAuditLogDialogOpen}
        onOpenChange={setIsAuditLogDialogOpen}
        task={selectedTask}
      />
    </div>
  );
}

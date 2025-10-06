import React, { useState, useEffect, useMemo } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &apos;../ui/table&apos;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &apos;../ui/dropdown-menu&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
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
} from &apos;lucide-react&apos;;
import { TaskAuditLogDialog } from &apos;../TaskAuditLogDialog&apos;;
import { toast } from &apos;sonner&apos;;
import { useNavigation } from &apos;../../contexts/NavigationContext&apos;;
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
} from &apos;../../services/maintenanceService&apos;;
import { LoadingState, StatusBadge, PriorityBadge } from &apos;../common&apos;;
import { AuditLogList, PageLayout } from &apos;../common&apos;;

// Data will be loaded from service

interface MaintenanceProps {
  onAssetClick: (_asset: any) => void;
}

export function Maintenance({ onAssetClick: _onAssetClick }: MaintenanceProps) {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState(&apos;&apos;);
  const [loading, setLoading] = useState(true);
  const [isAuditLogDialogOpen, setIsAuditLogDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    null
  );
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>(
    []
  );
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(
    []
  );
  const [maintenanceHistoryData, setMaintenanceHistoryData] = useState<
    MaintenanceHistoryType[]
  >([]);
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
    return allLogs.sort(
      (a, b) =>
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
      // console.error(&apos;Error loading maintenance data:&apos;, error);
      toast.error(&apos;Failed to load maintenance data&apos;);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (taskId: string, taskName: string) => {
    try {
      const updatedTask = await updateMaintenanceTask(
        taskId,
        { status: &apos;completed&apos; },
        &apos;Task marked as completed&apos;
      );

      if (updatedTask) {
        setMaintenanceTasks(prevTasks =>
          prevTasks.map(t => (t.id === taskId ? updatedTask : t))
        );

        toast.success(&apos;Task marked as completed&apos;, {
          description: `${taskName} completed and logged to audit trail`,
        });

        // Refresh stats
        const newStats = await getMaintenanceStats();
        setStats(newStats);
      }
    } catch (error) {
      toast.error(&apos;Failed to mark task as complete&apos;);
    }
  };

  const handleStartWork = async (taskId: string, _taskName: string) => {
    try {
      const updatedTask = await updateMaintenanceTask(
        taskId,
        { status: &apos;in-progress&apos; },
        &apos;Work started on maintenance task&apos;
      );

      if (updatedTask) {
        setMaintenanceTasks(prevTasks =>
          prevTasks.map(t => (t.id === taskId ? updatedTask : t))
        );

        toast.success(&apos;Work started&apos;, {
          description: `Status change logged to audit trail`,
        });

        // Refresh stats
        const newStats = await getMaintenanceStats();
        setStats(newStats);
      }
    } catch (error) {
      toast.error(&apos;Failed to start work&apos;);
    }
  };

  const handleEditTask = (task: MaintenanceTask) => {
    navigation.navigateToEditMaintenance({
      maintenanceId: task.id,
      fromContext: &apos;maintenance-list&apos;,
    });
  };

  const handleViewDetails = (task: MaintenanceTask) => {
    // Find the asset from mock data to pass full context
    import(&apos;../../data/mockData&apos;).then(({ mockAssets }) => {
      const asset = mockAssets.find(a => a.id === task.assetId);
      if (asset) {
        navigation.navigateToAssetDetails(asset);
      } else {
        toast.error(&apos;Asset not found&apos;);
      }
    });
  };

  const handleViewAuditLog = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsAuditLogDialogOpen(true);
  };

  const handleCancelTask = async (taskId: string, _taskName: string) => {
    try {
      const updatedTask = await updateMaintenanceTask(
        taskId,
        { status: &apos;cancelled&apos; },
        &apos;Maintenance task cancelled by user&apos;
      );

      if (updatedTask) {
        setMaintenanceTasks(prevTasks =>
          prevTasks.map(t => (t.id === taskId ? updatedTask : t))
        );

        toast.error(&apos;Task cancelled&apos;, {
          description: `Cancellation logged to audit trail`,
        });

        // Refresh stats
        const newStats = await getMaintenanceStats();
        setStats(newStats);
      }
    } catch (error) {
      toast.error(&apos;Failed to cancel task&apos;);
    }
  };

  const handleScheduleFromPredictive = (alert: PredictiveAlert) => {
    // Find the asset from mock data to pass full context
    import(&apos;../../data/mockData&apos;).then(({ mockAssets }) => {
      const asset = mockAssets.find(a => a.id === alert.assetId);
      navigation.navigateToCreateMaintenance({
        preSelectedAsset: alert.assetId,
        preSelectedAssetName: alert.assetName,
        assetContext: asset,
      });
    });
  };

  const handleViewAssetDetails = (assetId: string, _assetName: string) => {
    // Pass full asset context
    import(&apos;../../data/mockData&apos;).then(({ mockAssets }) => {
      const asset = mockAssets.find(a => a.id === assetId);
      if (asset) {
        navigation.navigateToAssetDetails(asset);
      } else {
        toast.error(&apos;Asset not found&apos;);
      }
    });
  };

  const handleDismissAlert = async (alertId: string, assetName: string) => {
    try {
      const success = await dismissPredictiveAlert(
        alertId,
        &apos;User dismissed alert&apos;
      );

      if (success) {
        setPredictiveAlerts(prevAlerts =>
          prevAlerts.filter(alert => alert.id !== alertId)
        );

        toast.success(&apos;Alert dismissed&apos;, {
          description: `Predictive alert for ${assetName} has been dismissed and logged to audit trail`,
        });

        // Refresh stats
        const newStats = await getMaintenanceStats();
        setStats(newStats);
      }
    } catch (error) {
      toast.error(&apos;Failed to dismiss alert&apos;);
    }
  };

  if (loading) {
    return <LoadingState message=&apos;Loading maintenance data...&apos; />;
  }

  return (
    <PageLayout variant=&apos;wide&apos; padding=&apos;lg&apos;>
      {/* Header */}
      <div className=&apos;flex items-center justify-between&apos;>
        <div>
          <h1>Maintenance Management</h1>
          <p className=&apos;text-muted-foreground&apos;>
            Schedule, track, and optimize asset maintenance
          </p>
        </div>
        <Button onClick={() => navigation.navigateToCreateMaintenance()}>
          <Plus className=&apos;h-4 w-4 mr-2&apos; />
          Schedule Maintenance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className=&apos;grid gap-4 md:grid-cols-4&apos;>
        <Card>
          <CardHeader className=&apos;pb-2&apos;>
            <CardTitle className=&apos;text-sm flex items-center gap-2&apos;>
              <AlertTriangle className=&apos;h-4 w-4 text-red-600&apos; />
              Overdue Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&apos;text-2xl&apos;>{stats.overdue}</div>
            <p className=&apos;text-xs text-muted-foreground&apos;>
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&apos;pb-2&apos;>
            <CardTitle className=&apos;text-sm flex items-center gap-2&apos;>
              <Clock className=&apos;h-4 w-4 text-blue-600&apos; />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&apos;text-2xl&apos;>{stats.inProgress}</div>
            <p className=&apos;text-xs text-muted-foreground&apos;>
              Currently being serviced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&apos;pb-2&apos;>
            <CardTitle className=&apos;text-sm flex items-center gap-2&apos;>
              <Calendar className=&apos;h-4 w-4 text-green-600&apos; />
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&apos;text-2xl&apos;>{stats.scheduled}</div>
            <p className=&apos;text-xs text-muted-foreground&apos;>Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&apos;pb-2&apos;>
            <CardTitle className=&apos;text-sm flex items-center gap-2&apos;>
              <TrendingUp className=&apos;h-4 w-4 text-purple-600&apos; />
              Predictive Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&apos;text-2xl&apos;>{stats.predictiveAlerts}</div>
            <p className=&apos;text-xs text-muted-foreground&apos;>AI-detected issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue=&apos;schedule&apos; className=&apos;space-y-4&apos;>
        <TabsList>
          <TabsTrigger value=&apos;schedule&apos;>
            <Calendar className=&apos;h-4 w-4 mr-2&apos; />
            Maintenance Schedule
          </TabsTrigger>
          <TabsTrigger value=&apos;history&apos;>
            <FileText className=&apos;h-4 w-4 mr-2&apos; />
            History
          </TabsTrigger>
          <TabsTrigger value=&apos;predictive&apos;>
            <TrendingUp className=&apos;h-4 w-4 mr-2&apos; />
            Predictive Alerts
          </TabsTrigger>
          <TabsTrigger value=&apos;audit&apos;>
            <History className=&apos;h-4 w-4 mr-2&apos; />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value=&apos;schedule&apos; className=&apos;space-y-4&apos;>
          <Card>
            <CardHeader>
              <div className=&apos;flex items-center justify-between&apos;>
                <CardTitle>Upcoming Maintenance</CardTitle>
                <div className=&apos;relative w-64&apos;>
                  <Search className=&apos;absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground&apos; />
                  <Input
                    placeholder=&apos;Search tasks...&apos;
                    className=&apos;pl-9&apos;
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
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
                  {maintenanceTasks.map(task => (
                    <TableRow
                      key={task.id}
                      className=&apos;cursor-pointer hover:bg-muted/50&apos;
                      onClick={() => handleEditTask(task)}
                    >
                      <TableCell>
                        <div>
                          <div className=&apos;flex items-center gap-2&apos;>
                            <Package className=&apos;h-4 w-4 text-muted-foreground&apos; />
                            <span>{task.assetName}</span>
                          </div>
                          <p className=&apos;text-sm text-muted-foreground&apos;>
                            {task.assetId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className=&apos;max-w-xs&apos;>
                          <p className=&apos;text-sm&apos;>{task.task}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant=&apos;outline&apos;>{task.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <Calendar className=&apos;h-4 w-4 text-muted-foreground&apos; />
                          <span className=&apos;text-sm&apos;>{task.dueDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={task.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.status} />
                      </TableCell>
                      <TableCell className=&apos;text-sm&apos;>
                        {task.assignedTo}
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant=&apos;ghost&apos; size=&apos;sm&apos;>
                              <MoreVertical className=&apos;h-4 w-4&apos; />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align=&apos;end&apos;>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                handleMarkComplete(task.id, task.task)
                              }
                            >
                              <CheckCircle className=&apos;h-4 w-4 mr-2&apos; />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStartWork(task.id, task.task)
                              }
                            >
                              <Wrench className=&apos;h-4 w-4 mr-2&apos; />
                              Start Work
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditTask(task)}
                            >
                              <Calendar className=&apos;h-4 w-4 mr-2&apos; />
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(task)}
                            >
                              <FileText className=&apos;h-4 w-4 mr-2&apos; />
                              View Asset Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleViewAuditLog(task)}
                            >
                              <History className=&apos;h-4 w-4 mr-2&apos; />
                              View Audit Log
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className=&apos;text-destructive&apos;
                              onClick={() =>
                                handleCancelTask(task.id, task.task)
                              }
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
        <TabsContent value=&apos;history&apos; className=&apos;space-y-4&apos;>
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
                  {maintenanceHistoryData.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div>{record.assetName}</div>
                          <p className=&apos;text-sm text-muted-foreground&apos;>
                            {record.assetId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{record.task}</TableCell>
                      <TableCell className=&apos;text-sm&apos;>
                        {record.completedDate}
                      </TableCell>
                      <TableCell className=&apos;text-sm&apos;>
                        {record.technician}
                      </TableCell>
                      <TableCell>{record.cost}</TableCell>
                      <TableCell>
                        <p className=&apos;text-sm text-muted-foreground max-w-xs&apos;>
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
        <TabsContent value=&apos;predictive&apos; className=&apos;space-y-4&apos;>
          <Card>
            <CardHeader>
              <div className=&apos;flex items-center justify-between&apos;>
                <div>
                  <CardTitle>AI-Powered Predictive Maintenance</CardTitle>
                  <p className=&apos;text-sm text-muted-foreground mt-1&apos;>
                    Proactive alerts based on usage patterns and asset health
                    analytics
                  </p>
                </div>
                <Badge
                  variant=&apos;outline&apos;
                  className=&apos;bg-purple-100 text-purple-700 border-purple-200&apos;
                >
                  {predictiveAlerts.length} Alert
                  {predictiveAlerts.length !== 1 ? &apos;s&apos; : &apos;&apos;}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {predictiveAlerts.length === 0 ? (
                <div className=&apos;text-center py-12&apos;>
                  <CheckCircle className=&apos;h-12 w-12 text-green-600 mx-auto mb-4&apos; />
                  <h3 className=&apos;mb-2&apos;>No Predictive Alerts</h3>
                  <p className=&apos;text-muted-foreground&apos;>
                    All predictive maintenance alerts have been addressed or
                    dismissed.
                  </p>
                </div>
              ) : (
                <div className=&apos;space-y-4&apos;>
                  {predictiveAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className=&apos;p-4 border rounded-lg space-y-3&apos;
                    >
                      <div className=&apos;flex items-start justify-between&apos;>
                        <div className=&apos;flex-1&apos;>
                          <div className=&apos;flex items-center gap-2&apos;>
                            <AlertTriangle className=&apos;h-5 w-5 text-orange-600&apos; />
                            <h4>{alert.assetName}</h4>
                            <Badge variant=&apos;outline&apos;>{alert.assetId}</Badge>
                          </div>
                          <p className=&apos;text-muted-foreground mt-1&apos;>
                            {alert.prediction}
                          </p>
                        </div>
                        <Badge
                          variant=&apos;outline&apos;
                          className=&apos;bg-orange-100 text-orange-700 border-orange-200&apos;
                        >
                          {alert.confidence}% confidence
                        </Badge>
                      </div>

                      <div className=&apos;grid md:grid-cols-2 gap-4 text-sm&apos;>
                        <div>
                          <span className=&apos;text-muted-foreground&apos;>
                            Based on:{&apos; &apos;}
                          </span>
                          <span>{alert.basedOn}</span>
                        </div>
                        <div>
                          <span className=&apos;text-muted-foreground&apos;>
                            Recommended:{&apos; &apos;}
                          </span>
                          <span>{alert.recommendedAction}</span>
                        </div>
                      </div>

                      <div className=&apos;flex gap-2&apos;>
                        <Button
                          size=&apos;sm&apos;
                          onClick={() => handleScheduleFromPredictive(alert)}
                        >
                          <Calendar className=&apos;h-4 w-4 mr-2&apos; />
                          Schedule Maintenance
                        </Button>
                        <Button
                          variant=&apos;outline&apos;
                          size=&apos;sm&apos;
                          onClick={() =>
                            handleViewAssetDetails(
                              alert.assetId,
                              alert.assetName
                            )
                          }
                        >
                          View Asset Details
                        </Button>
                        <Button
                          variant=&apos;ghost&apos;
                          size=&apos;sm&apos;
                          onClick={() =>
                            handleDismissAlert(alert.id, alert.assetName)
                          }
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
        <TabsContent value=&apos;audit&apos; className=&apos;space-y-4&apos;>
          <Card>
            <CardHeader>
              <div className=&apos;flex items-center justify-between&apos;>
                <CardTitle>Maintenance Audit Log</CardTitle>
                <div className=&apos;relative w-64&apos;>
                  <Search className=&apos;absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground&apos; />
                  <Input placeholder=&apos;Search audit logs...&apos; className=&apos;pl-9&apos; />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AuditLogList
                entries={auditLogs.map(log => ({
                  id: log.id,
                  timestamp: log.timestamp,
                  action: log.action,
                  changedBy: log.user,
                  changes: log.changes,
                  notes: log.notes,
                }))}
                variant=&apos;inline&apos;
                showEmptyState={true}
                emptyStateTitle=&apos;No Audit Log Entries&apos;
                emptyStateDescription=&apos;No maintenance activities have been recorded yet.&apos;
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
    </PageLayout>
  );
}

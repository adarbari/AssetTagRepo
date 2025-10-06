import React, {
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from &apos;react&apos;;
import { Card, CardContent } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import {
  Shield,
  Battery,
  AlertTriangle,
  TrendingDown,
  WifiOff,
  MapPin,
  Wrench,
  Search,
  Filter,
  X,
  Settings,
  Layers,
} from &apos;lucide-react&apos;;
import {
  getAllAlerts,
  acknowledgeAlert,
  resolveAlert,
} from &apos;../../services/alertService&apos;;
import type { Alert, AlertType } from &apos;../../types&apos;;
import { AlertCard, PageLayout } from &apos;../common&apos;;
import { toast } from &apos;sonner&apos;;

export interface AlertFilter {
  category?: string;
  severity?: string;
  status?: string;
  searchText?: string;
}

interface AlertsProps {
  initialFilter?: AlertFilter;
  onTakeAction?: (alert: Alert) => void;
  onNavigateToConfiguration?: () => void;
}

export interface AlertsRef {
  refresh: () => Promise<void>;
}

const alertTypeIcons: Record<AlertType, any> = {
  theft: Shield,
  battery: Battery,
  compliance: AlertTriangle,
  underutilized: TrendingDown,
  offline: WifiOff,
  &apos;unauthorized-zone&apos;: MapPin,
  &apos;predictive-maintenance&apos;: Wrench,
};

const alertTypeColors: Record<AlertType, string> = {
  theft: &apos;text-red-600&apos;,
  battery: &apos;text-orange-600&apos;,
  compliance: &apos;text-yellow-600&apos;,
  underutilized: &apos;text-blue-600&apos;,
  offline: &apos;text-gray-600&apos;,
  &apos;unauthorized-zone&apos;: &apos;text-red-600&apos;,
  &apos;predictive-maintenance&apos;: &apos;text-purple-600&apos;,
};

const alertTypeLabels: Record<AlertType, string> = {
  theft: &apos;Theft Alert&apos;,
  battery: &apos;Battery Alert&apos;,
  compliance: &apos;Compliance&apos;,
  underutilized: &apos;Underutilized&apos;,
  offline: &apos;Offline&apos;,
  &apos;unauthorized-zone&apos;: &apos;Unauthorized Zone&apos;,
  &apos;predictive-maintenance&apos;: &apos;Predictive Maintenance&apos;,
};

// Load user preferences from localStorage
const loadUserPreferences = () => {
  try {
    const saved = localStorage.getItem(&apos;alertPreferences&apos;);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
// // // // // // // console.error(&apos;Failed to load alert preferences:&apos;, error);
  }
  return {
    defaultView: &apos;all&apos;,
    groupBy: &apos;none&apos;,
    defaultSeverity: &apos;all&apos;,
  };
};

// Save user preferences to localStorage
const saveUserPreferences = (prefs: any) => {
  try {
    localStorage.setItem(&apos;alertPreferences&apos;, JSON.stringify(prefs));
  } catch (error) {
// // // // // // // console.error(&apos;Failed to save alert preferences:&apos;, error);
  }
};

export const Alerts = forwardRef<AlertsRef, AlertsProps>(
  ({ initialFilter, onTakeAction, onNavigateToConfiguration }, ref) => {
    const userPrefs = loadUserPreferences();

    const [searchText, setSearchText] = useState(
      initialFilter?.searchText || &apos;&apos;
    );
    const [categoryFilter, setCategoryFilter] = useState(
      initialFilter?.category || &apos;all&apos;
    );
    const [severityFilter, setSeverityFilter] = useState(
      initialFilter?.severity || userPrefs.defaultSeverity || &apos;all&apos;
    );
    const [statusFilter, setStatusFilter] = useState(
      initialFilter?.status || &apos;all&apos;
    );
    const [activeTab, setActiveTab] = useState(
      initialFilter?.status === &apos;resolved&apos;
        ? &apos;resolved&apos;
        : userPrefs.defaultView || &apos;all&apos;
    );
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [activeStatFilter, setActiveStatFilter] = useState<string | null>(
      null
    );
    const [groupBy, setGroupBy] = useState<
      &apos;none&apos; | &apos;type&apos; | &apos;severity&apos; | &apos;asset&apos;
    >(userPrefs.groupBy || &apos;none&apos;);

    // Load alerts from service
    useEffect(() => {
      const loadAlerts = async () => {
        try {
          setLoading(true);
          const alertsData = await getAllAlerts();
          setAlerts(alertsData);
        } catch (error) {
// // // // // // // console.error(&apos;Failed to load alerts:&apos;, error);
          toast.error(&apos;Failed to load alerts&apos;);
        } finally {
          setLoading(false);
        }
      };

      loadAlerts();
    }, []);

    // Update filters when initialFilter changes
    useEffect(() => {
      if (initialFilter) {
        setSearchText(initialFilter.searchText || &apos;&apos;);
        setCategoryFilter(initialFilter.category || &apos;all&apos;);
        setSeverityFilter(initialFilter.severity || &apos;all&apos;);
        setStatusFilter(initialFilter.status || &apos;all&apos;);
        if (initialFilter.status === &apos;resolved&apos;) {
          setActiveTab(&apos;resolved&apos;);
        } else if (initialFilter.status === &apos;active&apos;) {
          setActiveTab(&apos;all&apos;);
        }
      }
    }, [initialFilter]);

    // Filter alerts based on search and filters
    const filteredAlerts = useMemo(() => {
      return alerts.filter(alert => {
        // Search filter
        if (searchText) {
          const searchLower = searchText.toLowerCase();
          const matchesSearch =
            alert.message.toLowerCase().includes(searchLower) ||
            alert.asset.toLowerCase().includes(searchLower) ||
            alert.id.toLowerCase().includes(searchLower) ||
            (alert.reason && alert.reason.toLowerCase().includes(searchLower));
          if (!matchesSearch) return false;
        }

        // Category filter
        if (categoryFilter !== &apos;all&apos; && alert.type !== categoryFilter) {
          return false;
        }

        // Severity filter
        if (severityFilter !== &apos;all&apos; && alert.severity !== severityFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== &apos;all&apos; && alert.status !== statusFilter) {
          return false;
        }

        return true;
      });
    }, [searchText, categoryFilter, severityFilter, statusFilter, alerts]);

    // Split filtered alerts by status
    const activeAlerts = filteredAlerts.filter(a => a.status === &apos;active&apos;);
    const acknowledgedAlerts = filteredAlerts.filter(
      a => a.status === &apos;acknowledged&apos;
    );
    const resolvedAlerts = filteredAlerts.filter(a => a.status === &apos;resolved&apos;);

    // Group alerts based on groupBy setting
    const groupedAlerts = useMemo(() => {
      if (groupBy === &apos;none&apos;) return null;

      const groups: Record<string, Alert[]> = {};
      const alertsToGroup =
        activeTab === &apos;all&apos;
          ? filteredAlerts
          : activeTab === &apos;active&apos;
            ? activeAlerts
            : activeTab === &apos;acknowledged&apos;
              ? acknowledgedAlerts
              : resolvedAlerts;

      alertsToGroup.forEach(alert => {
        let key = &apos;&apos;;
        if (groupBy === &apos;type&apos;) {
          key = alertTypeLabels[alert.type];
        } else if (groupBy === &apos;severity&apos;) {
          key =
            alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1);
        } else if (groupBy === &apos;asset&apos;) {
          key = alert.asset;
        }

        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(alert);
      });
      return groups;
    }, [
      filteredAlerts,
      activeAlerts,
      acknowledgedAlerts,
      resolvedAlerts,
      groupBy,
      activeTab,
    ]);

    const hasActiveFilters =
      searchText ||
      categoryFilter !== &apos;all&apos; ||
      severityFilter !== &apos;all&apos; ||
      statusFilter !== &apos;all&apos; ||
      activeStatFilter;

    // Save user preferences when they change
    useEffect(() => {
      const prefs = {
        defaultView: activeTab,
        groupBy: groupBy,
        defaultSeverity: severityFilter,
      };
      saveUserPreferences(prefs);
    }, [activeTab, groupBy, severityFilter]);

    const clearFilters = () => {
      setSearchText(&apos;&apos;);
      setCategoryFilter(&apos;all&apos;);
      setSeverityFilter(&apos;all&apos;);
      setStatusFilter(&apos;all&apos;);
      setActiveStatFilter(null);
    };

    const handleStatCardClick = (
      filterType:
        | &apos;total&apos;
        | &apos;active&apos;
        | &apos;critical&apos;
        | &apos;theft&apos;
        | &apos;battery&apos;
        | &apos;compliance&apos;
        | &apos;offline&apos;
    ) => {
      // Clear all filters first
      setSearchText(&apos;&apos;);
      setActiveStatFilter(filterType);

      switch (filterType) {
        case &apos;total&apos;:
          // Show all alerts
          setCategoryFilter(&apos;all&apos;);
          setSeverityFilter(&apos;all&apos;);
          setStatusFilter(&apos;all&apos;);
          setActiveTab(&apos;all&apos;);
          break;
        case &apos;active&apos;:
          // Show only active alerts
          setCategoryFilter(&apos;all&apos;);
          setSeverityFilter(&apos;all&apos;);
          setStatusFilter(&apos;active&apos;);
          setActiveTab(&apos;active&apos;);
          break;
        case &apos;critical&apos;:
          // Show only critical severity alerts that are active
          setCategoryFilter(&apos;all&apos;);
          setSeverityFilter(&apos;critical&apos;);
          setStatusFilter(&apos;active&apos;);
          setActiveTab(&apos;all&apos;);
          break;
        case &apos;theft&apos;:
          // Show only theft alerts that are active
          setCategoryFilter(&apos;theft&apos;);
          setSeverityFilter(&apos;all&apos;);
          setStatusFilter(&apos;active&apos;);
          setActiveTab(&apos;all&apos;);
          break;
        case &apos;battery&apos;:
          // Show only battery alerts that are active
          setCategoryFilter(&apos;battery&apos;);
          setSeverityFilter(&apos;all&apos;);
          setStatusFilter(&apos;active&apos;);
          setActiveTab(&apos;all&apos;);
          break;
        case &apos;compliance&apos;:
          // Show only compliance alerts that are active
          setCategoryFilter(&apos;compliance&apos;);
          setSeverityFilter(&apos;all&apos;);
          setStatusFilter(&apos;active&apos;);
          setActiveTab(&apos;all&apos;);
          break;
        case &apos;offline&apos;:
          // Show only offline alerts that are active
          setCategoryFilter(&apos;offline&apos;);
          setSeverityFilter(&apos;all&apos;);
          setStatusFilter(&apos;active&apos;);
          setActiveTab(&apos;all&apos;);
          break;
      }
    };

    const handleTakeAction = (alert: Alert) => {
      if (onTakeAction) {
        onTakeAction(alert);
      }
    };

    const handleQuickAcknowledge = async (
      alertId: string,
      e: React.MouseEvent
    ) => {
      e.stopPropagation();

      try {
        await acknowledgeAlert(alertId);
        // Refresh alerts to get updated data
        const updatedAlerts = await getAllAlerts();
        setAlerts(updatedAlerts);
        toast.success(&apos;Alert acknowledged&apos;);
      } catch (error) {
// // // // // // // console.error(&apos;Failed to acknowledge alert:&apos;, error);
        toast.error(&apos;Failed to acknowledge alert&apos;);
      }
    };

    const handleQuickResolve = async (alertId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      try {
        await resolveAlert(alertId);
        // Refresh alerts to get updated data
        const updatedAlerts = await getAllAlerts();
        setAlerts(updatedAlerts);
        toast.success(&apos;Alert resolved&apos;);
      } catch (error) {
// // // // // // // console.error(&apos;Failed to resolve alert:&apos;, error);
        toast.error(&apos;Failed to resolve alert&apos;);
      }
    };

    const handleRefresh = async () => {
      try {
        setLoading(true);
        const updatedAlerts = await getAllAlerts();
        setAlerts(updatedAlerts);
        toast.success(&apos;Alerts refreshed&apos;);
      } catch (error) {
// // // // // // // console.error(&apos;Failed to refresh alerts:&apos;, error);
        toast.error(&apos;Failed to refresh alerts&apos;);
      } finally {
        setLoading(false);
      }
    };

    // Expose refresh function to parent components
    useImperativeHandle(ref, () => ({
      refresh: handleRefresh,
    }));

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

    const renderAlertCard = (alert: Alert) => {
      return (
        <AlertCard
          key={alert.id}
          alert={alert}
          onTakeAction={handleTakeAction}
          onQuickAcknowledge={handleQuickAcknowledge}
          onQuickResolve={handleQuickResolve}
          showQuickActions={true}
          getTimeAgo={getTimeAgo}
        />
      );
    };

    const renderAlertsList = (alerts: Alert[]) => {
      if (alerts.length === 0) {
        return (
          <Card>
            <CardContent className=&apos;p-8 text-center text-muted-foreground&apos;>
              No alerts found
            </CardContent>
          </Card>
        );
      }

      if (groupBy === &apos;none&apos;) {
        return <>{alerts.map(renderAlertCard)}</>;
      }

      // Render grouped alerts
      if (!groupedAlerts) return null;

      return (
        <div className=&apos;space-y-6&apos;>
          {Object.entries(groupedAlerts)
            .sort(([, a], [, b]) => b.length - a.length) // Sort by count descending
            .map(([groupKey, groupAlerts]) => {
              // Get icon for type grouping
              let groupIcon = null;
              let iconColor = &apos;&apos;;
              if (groupBy === &apos;type&apos;) {
                const alertType = Object.keys(alertTypeLabels).find(
                  key => alertTypeLabels[key as AlertType] === groupKey
                ) as AlertType | undefined;
                if (alertType) {
                  const Icon = alertTypeIcons[alertType];
                  iconColor = alertTypeColors[alertType];
                  groupIcon = <Icon className={`h-5 w-5 ${iconColor}`} />;
                }
              }

              return (
                <div key={groupKey}>
                  <div className=&apos;flex items-center gap-2 mb-3 pb-2 border-b&apos;>
                    {groupIcon}
                    <h3 className=&apos;text-base&apos;>{groupKey}</h3>
                    <Badge variant=&apos;secondary&apos;>{groupAlerts.length}</Badge>
                  </div>
                  <div className=&apos;space-y-3&apos;>
                    {groupAlerts.map(renderAlertCard)}
                  </div>
                </div>
              );
            })}
        </div>
      );
    };

    const stats = useMemo(
      () => ({
        total: alerts.length,
        active: alerts.filter(a => a.status === &apos;active&apos;).length,
        critical: alerts.filter(
          a => a.severity === &apos;critical&apos; && a.status === &apos;active&apos;
        ).length,
        theft: alerts.filter(a => a.type === &apos;theft&apos; && a.status === &apos;active&apos;)
          .length,
        battery: alerts.filter(
          a => a.type === &apos;battery&apos; && a.status === &apos;active&apos;
        ).length,
        compliance: alerts.filter(
          a => a.type === &apos;compliance&apos; && a.status === &apos;active&apos;
        ).length,
        offline: alerts.filter(
          a => a.type === &apos;offline&apos; && a.status === &apos;active&apos;
        ).length,
      }),
      [alerts]
    );

    return (
      <PageLayout variant=&apos;wide&apos; padding=&apos;md&apos;>
        {/* Header */}
        <div className=&apos;flex items-center justify-between&apos;>
          <div>
            <h1>Alert Management</h1>
            <div className=&apos;flex items-center gap-2&apos;>
              <p className=&apos;text-muted-foreground&apos;>
                Monitor and respond to system alerts
              </p>
              {groupBy !== &apos;none&apos; && (
                <Badge variant=&apos;outline&apos; className=&apos;gap-1&apos;>
                  <Layers className=&apos;h-3 w-3&apos; />
                  {groupBy === &apos;type&apos; && &apos;By Type&apos;}
                  {groupBy === &apos;severity&apos; && &apos;By Severity&apos;}
                  {groupBy === &apos;asset&apos; && &apos;By Asset&apos;}
                </Badge>
              )}
            </div>
          </div>
          <Button onClick={onNavigateToConfiguration}>
            <Settings className=&apos;h-4 w-4 mr-2&apos; />
            Configure Rules
          </Button>
        </div>

        {/* Stats */}
        <div className=&apos;grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4&apos;>
          <Card
            className={`cursor-pointer transition-all ${
              activeStatFilter === &apos;total&apos;
                ? &apos;border-primary border-2 shadow-md&apos;
                : &apos;hover:shadow-md hover:border-primary/50&apos;
            }`}
            onClick={() => handleStatCardClick(&apos;total&apos;)}
          >
            <CardContent className=&apos;p-4&apos;>
              <div className=&apos;text-2xl mb-1&apos;>{stats.total}</div>
              <div className=&apos;text-xs text-muted-foreground&apos;>Total Alerts</div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${
              activeStatFilter === &apos;active&apos;
                ? &apos;border-red-500 border-2 shadow-md bg-red-50&apos;
                : &apos;hover:shadow-md hover:border-red-500/50&apos;
            }`}
            onClick={() => handleStatCardClick(&apos;active&apos;)}
          >
            <CardContent className=&apos;p-4&apos;>
              <div className=&apos;text-2xl text-red-600 mb-1&apos;>{stats.active}</div>
              <div className=&apos;text-xs text-muted-foreground&apos;>Active</div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${
              activeStatFilter === &apos;critical&apos;
                ? &apos;border-red-500 border-2 shadow-md bg-red-50&apos;
                : &apos;hover:shadow-md hover:border-red-500/50&apos;
            }`}
            onClick={() => handleStatCardClick(&apos;critical&apos;)}
          >
            <CardContent className=&apos;p-4&apos;>
              <div className=&apos;text-2xl text-red-600 mb-1&apos;>{stats.critical}</div>
              <div className=&apos;text-xs text-muted-foreground&apos;>Critical</div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${
              activeStatFilter === &apos;theft&apos;
                ? &apos;border-red-500 border-2 shadow-md bg-red-50&apos;
                : &apos;hover:shadow-md hover:border-red-500/50&apos;
            }`}
            onClick={() => handleStatCardClick(&apos;theft&apos;)}
          >
            <CardContent className=&apos;p-4&apos;>
              <div className=&apos;text-2xl text-red-600 mb-1&apos;>{stats.theft}</div>
              <div className=&apos;text-xs text-muted-foreground&apos;>Theft</div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${
              activeStatFilter === &apos;battery&apos;
                ? &apos;border-orange-500 border-2 shadow-md bg-orange-50&apos;
                : &apos;hover:shadow-md hover:border-orange-500/50&apos;
            }`}
            onClick={() => handleStatCardClick(&apos;battery&apos;)}
          >
            <CardContent className=&apos;p-4&apos;>
              <div className=&apos;text-2xl text-orange-600 mb-1&apos;>
                {stats.battery}
              </div>
              <div className=&apos;text-xs text-muted-foreground&apos;>Battery</div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${
              activeStatFilter === &apos;compliance&apos;
                ? &apos;border-yellow-500 border-2 shadow-md bg-yellow-50&apos;
                : &apos;hover:shadow-md hover:border-yellow-500/50&apos;
            }`}
            onClick={() => handleStatCardClick(&apos;compliance&apos;)}
          >
            <CardContent className=&apos;p-4&apos;>
              <div className=&apos;text-2xl text-yellow-600 mb-1&apos;>
                {stats.compliance}
              </div>
              <div className=&apos;text-xs text-muted-foreground&apos;>Compliance</div>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all ${
              activeStatFilter === &apos;offline&apos;
                ? &apos;border-gray-500 border-2 shadow-md bg-gray-50&apos;
                : &apos;hover:shadow-md hover:border-gray-500/50&apos;
            }`}
            onClick={() => handleStatCardClick(&apos;offline&apos;)}
          >
            <CardContent className=&apos;p-4&apos;>
              <div className=&apos;text-2xl text-gray-600 mb-1&apos;>{stats.offline}</div>
              <div className=&apos;text-xs text-muted-foreground&apos;>Offline</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className=&apos;p-4&apos;>
            <div className=&apos;grid grid-cols-1 md:grid-cols-5 gap-4&apos;>
              <div className=&apos;relative&apos;>
                <Search className=&apos;absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground&apos; />
                <Input
                  placeholder=&apos;Search alerts...&apos;
                  className=&apos;pl-9&apos;
                  value={searchText}
                  onChange={e => {
                    setSearchText(e.target.value);
                    setActiveStatFilter(null);
                  }}
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={value => {
                  setCategoryFilter(value);
                  setActiveStatFilter(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder=&apos;Alert Type&apos; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;all&apos;>All Types</SelectItem>
                  <SelectItem value=&apos;theft&apos;>Theft Alert</SelectItem>
                  <SelectItem value=&apos;battery&apos;>Battery Alert</SelectItem>
                  <SelectItem value=&apos;compliance&apos;>Compliance</SelectItem>
                  <SelectItem value=&apos;underutilized&apos;>Underutilized</SelectItem>
                  <SelectItem value=&apos;offline&apos;>Offline</SelectItem>
                  <SelectItem value=&apos;unauthorized-zone&apos;>
                    Unauthorized Zone
                  </SelectItem>
                  <SelectItem value=&apos;predictive-maintenance&apos;>
                    Predictive Maintenance
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={severityFilter}
                onValueChange={value => {
                  setSeverityFilter(value);
                  setActiveStatFilter(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder=&apos;Severity&apos; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;all&apos;>All Severities</SelectItem>
                  <SelectItem value=&apos;critical&apos;>Critical</SelectItem>
                  <SelectItem value=&apos;warning&apos;>Warning</SelectItem>
                  <SelectItem value=&apos;info&apos;>Info</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={value => {
                  setStatusFilter(value);
                  setActiveStatFilter(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder=&apos;Status&apos; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;all&apos;>All Statuses</SelectItem>
                  <SelectItem value=&apos;active&apos;>Active</SelectItem>
                  <SelectItem value=&apos;acknowledged&apos;>Acknowledged</SelectItem>
                  <SelectItem value=&apos;resolved&apos;>Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={groupBy}
                onValueChange={(value: any) => setGroupBy(value)}
              >
                <SelectTrigger
                  className={groupBy !== &apos;none&apos; ? &apos;border-primary&apos; : &apos;&apos;}
                >
                  <div className=&apos;flex items-center gap-2&apos;>
                    <Layers className=&apos;h-4 w-4&apos; />
                    <SelectValue placeholder=&apos;Group By&apos; />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;none&apos;>
                    <div className=&apos;flex flex-col&apos;>
                      <span>No Grouping</span>
                      <span className=&apos;text-xs text-muted-foreground&apos;>
                        Show all alerts in a list
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value=&apos;type&apos;>
                    <div className=&apos;flex flex-col&apos;>
                      <span>Group by Type</span>
                      <span className=&apos;text-xs text-muted-foreground&apos;>
                        Organize by alert category
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value=&apos;severity&apos;>
                    <div className=&apos;flex flex-col&apos;>
                      <span>Group by Severity</span>
                      <span className=&apos;text-xs text-muted-foreground&apos;>
                        Organize by priority level
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value=&apos;asset&apos;>
                    <div className=&apos;flex flex-col&apos;>
                      <span>Group by Asset</span>
                      <span className=&apos;text-xs text-muted-foreground&apos;>
                        Organize by asset name
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(hasActiveFilters || groupBy !== &apos;none&apos;) && (
              <div className=&apos;mt-3 flex items-center gap-2 flex-wrap&apos;>
                {activeStatFilter && (
                  <Badge variant=&apos;secondary&apos; className=&apos;gap-1&apos;>
                    Quick filter: {activeStatFilter}
                  </Badge>
                )}
                {groupBy !== &apos;none&apos; && (
                  <Badge variant=&apos;secondary&apos; className=&apos;gap-1&apos;>
                    <Filter className=&apos;h-3 w-3&apos; />
                    Grouped by {groupBy}
                  </Badge>
                )}
                {hasActiveFilters && (
                  <Button variant=&apos;ghost&apos; size=&apos;sm&apos; onClick={clearFilters}>
                    <X className=&apos;h-4 w-4 mr-2&apos; />
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value=&apos;all&apos;>
              All Alerts ({filteredAlerts.length})
            </TabsTrigger>
            <TabsTrigger value=&apos;active&apos;>
              Active ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value=&apos;acknowledged&apos;>
              Acknowledged ({acknowledgedAlerts.length})
            </TabsTrigger>
            <TabsTrigger value=&apos;resolved&apos;>
              Resolved ({resolvedAlerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value=&apos;all&apos; className=&apos;space-y-3 mt-4&apos;>
            {renderAlertsList(filteredAlerts)}
          </TabsContent>

          <TabsContent value=&apos;active&apos; className=&apos;space-y-3 mt-4&apos;>
            {renderAlertsList(activeAlerts)}
          </TabsContent>

          <TabsContent value=&apos;acknowledged&apos; className=&apos;space-y-3 mt-4&apos;>
            {renderAlertsList(acknowledgedAlerts)}
          </TabsContent>

          <TabsContent value=&apos;resolved&apos; className=&apos;space-y-3 mt-4&apos;>
            {renderAlertsList(resolvedAlerts)}
          </TabsContent>
        </Tabs>
      </PageLayout>
    );
  }
);

Alerts.displayName = &apos;Alerts&apos;;

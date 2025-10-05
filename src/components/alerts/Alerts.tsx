import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
} from "lucide-react";
import { mockAlerts } from "../../data/mockData";
import type { Alert, AlertType } from "../../types";
import { AlertCard } from "../common";
import { toast } from "sonner";

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

const alertTypeIcons: Record<AlertType, any> = {
  theft: Shield,
  battery: Battery,
  compliance: AlertTriangle,
  underutilized: TrendingDown,
  offline: WifiOff,
  "unauthorized-zone": MapPin,
  "predictive-maintenance": Wrench,
};

const alertTypeColors: Record<AlertType, string> = {
  theft: "text-red-600",
  battery: "text-orange-600",
  compliance: "text-yellow-600",
  underutilized: "text-blue-600",
  offline: "text-gray-600",
  "unauthorized-zone": "text-red-600",
  "predictive-maintenance": "text-purple-600",
};

const alertTypeLabels: Record<AlertType, string> = {
  theft: "Theft Alert",
  battery: "Battery Alert",
  compliance: "Compliance",
  underutilized: "Underutilized",
  offline: "Offline",
  "unauthorized-zone": "Unauthorized Zone",
  "predictive-maintenance": "Predictive Maintenance",
};

// Load user preferences from localStorage
const loadUserPreferences = () => {
  try {
    const saved = localStorage.getItem('alertPreferences');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load alert preferences:', error);
  }
  return {
    defaultView: 'all',
    groupBy: 'none',
    defaultSeverity: 'all',
  };
};

// Save user preferences to localStorage
const saveUserPreferences = (prefs: any) => {
  try {
    localStorage.setItem('alertPreferences', JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save alert preferences:', error);
  }
};

export function Alerts({ initialFilter, onTakeAction, onNavigateToConfiguration }: AlertsProps) {
  const userPrefs = loadUserPreferences();
  
  const [searchText, setSearchText] = useState(initialFilter?.searchText || "");
  const [categoryFilter, setCategoryFilter] = useState(initialFilter?.category || "all");
  const [severityFilter, setSeverityFilter] = useState(initialFilter?.severity || userPrefs.defaultSeverity || "all");
  const [statusFilter, setStatusFilter] = useState(initialFilter?.status || "all");
  const [activeTab, setActiveTab] = useState(initialFilter?.status === "resolved" ? "resolved" : userPrefs.defaultView || "all");
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [activeStatFilter, setActiveStatFilter] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<'none' | 'type' | 'severity' | 'asset'>(userPrefs.groupBy || 'none');

  // Update filters when initialFilter changes
  useEffect(() => {
    if (initialFilter) {
      setSearchText(initialFilter.searchText || "");
      setCategoryFilter(initialFilter.category || "all");
      setSeverityFilter(initialFilter.severity || "all");
      setStatusFilter(initialFilter.status || "all");
      if (initialFilter.status === "resolved") {
        setActiveTab("resolved");
      } else if (initialFilter.status === "active") {
        setActiveTab("all");
      }
    }
  }, [initialFilter]);

  // Filter alerts based on search and filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
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
      if (categoryFilter !== "all" && alert.type !== categoryFilter) {
        return false;
      }

      // Severity filter
      if (severityFilter !== "all" && alert.severity !== severityFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && alert.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [searchText, categoryFilter, severityFilter, statusFilter, alerts]);

  // Split filtered alerts by status
  const activeAlerts = filteredAlerts.filter((a) => a.status === "active");
  const acknowledgedAlerts = filteredAlerts.filter((a) => a.status === "acknowledged");
  const resolvedAlerts = filteredAlerts.filter((a) => a.status === "resolved");

  // Group alerts based on groupBy setting
  const groupedAlerts = useMemo(() => {
    if (groupBy === 'none') return null;
    
    const groups: Record<string, Alert[]> = {};
    const alertsToGroup = activeTab === 'all' ? filteredAlerts :
                          activeTab === 'active' ? activeAlerts :
                          activeTab === 'acknowledged' ? acknowledgedAlerts :
                          resolvedAlerts;
    
    alertsToGroup.forEach(alert => {
      let key = '';
      if (groupBy === 'type') {
        key = alertTypeLabels[alert.type];
      } else if (groupBy === 'severity') {
        key = alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1);
      } else if (groupBy === 'asset') {
        key = alert.asset;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(alert);
    });
    return groups;
  }, [filteredAlerts, activeAlerts, acknowledgedAlerts, resolvedAlerts, groupBy, activeTab]);

  const hasActiveFilters = searchText || categoryFilter !== "all" || severityFilter !== "all" || statusFilter !== "all" || activeStatFilter;

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
    setSearchText("");
    setCategoryFilter("all");
    setSeverityFilter("all");
    setStatusFilter("all");
    setActiveStatFilter(null);
  };

  const handleStatCardClick = (filterType: 'total' | 'active' | 'critical' | 'theft' | 'battery' | 'compliance' | 'offline') => {
    // Clear all filters first
    setSearchText("");
    setActiveStatFilter(filterType);
    
    switch (filterType) {
      case 'total':
        // Show all alerts
        setCategoryFilter("all");
        setSeverityFilter("all");
        setStatusFilter("all");
        setActiveTab("all");
        break;
      case 'active':
        // Show only active alerts
        setCategoryFilter("all");
        setSeverityFilter("all");
        setStatusFilter("active");
        setActiveTab("active");
        break;
      case 'critical':
        // Show only critical severity alerts that are active
        setCategoryFilter("all");
        setSeverityFilter("critical");
        setStatusFilter("active");
        setActiveTab("all");
        break;
      case 'theft':
        // Show only theft alerts that are active
        setCategoryFilter("theft");
        setSeverityFilter("all");
        setStatusFilter("active");
        setActiveTab("all");
        break;
      case 'battery':
        // Show only battery alerts that are active
        setCategoryFilter("battery");
        setSeverityFilter("all");
        setStatusFilter("active");
        setActiveTab("all");
        break;
      case 'compliance':
        // Show only compliance alerts that are active
        setCategoryFilter("compliance");
        setSeverityFilter("all");
        setStatusFilter("active");
        setActiveTab("all");
        break;
      case 'offline':
        // Show only offline alerts that are active
        setCategoryFilter("offline");
        setSeverityFilter("all");
        setStatusFilter("active");
        setActiveTab("all");
        break;
    }
  };

  const handleTakeAction = (alert: Alert) => {
    if (onTakeAction) {
      onTakeAction(alert);
    }
  };

  const handleQuickAcknowledge = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId ? { ...a, status: "acknowledged" as const } : a
      )
    );
    toast.success("Alert acknowledged");
  };

  const handleQuickResolve = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId ? { ...a, status: "resolved" as const } : a
      )
    );
    toast.success("Alert resolved");
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
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
          <CardContent className="p-8 text-center text-muted-foreground">
            No alerts found
          </CardContent>
        </Card>
      );
    }

    if (groupBy === 'none') {
      return <>{alerts.map(renderAlertCard)}</>;
    }

    // Render grouped alerts
    if (!groupedAlerts) return null;
    
    return (
      <div className="space-y-6">
        {Object.entries(groupedAlerts)
          .sort(([, a], [, b]) => b.length - a.length) // Sort by count descending
          .map(([groupKey, groupAlerts]) => {
            // Get icon for type grouping
            let groupIcon = null;
            let iconColor = '';
            if (groupBy === 'type') {
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
                <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                  {groupIcon}
                  <h3 className="text-base">{groupKey}</h3>
                  <Badge variant="secondary">{groupAlerts.length}</Badge>
                </div>
                <div className="space-y-3">
                  {groupAlerts.map(renderAlertCard)}
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  const stats = useMemo(() => ({
    total: alerts.length,
    active: alerts.filter(a => a.status === "active").length,
    critical: alerts.filter(a => a.severity === "critical" && a.status === "active").length,
    theft: alerts.filter(a => a.type === "theft" && a.status === "active").length,
    battery: alerts.filter(a => a.type === "battery" && a.status === "active").length,
    compliance: alerts.filter(a => a.type === "compliance" && a.status === "active").length,
    offline: alerts.filter(a => a.type === "offline" && a.status === "active").length,
  }), [alerts]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Alert Management</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Monitor and respond to system alerts</p>
            {groupBy !== 'none' && (
              <Badge variant="outline" className="gap-1">
                <Layers className="h-3 w-3" />
                {groupBy === 'type' && 'By Type'}
                {groupBy === 'severity' && 'By Severity'}
                {groupBy === 'asset' && 'By Asset'}
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={onNavigateToConfiguration}>
          <Settings className="h-4 w-4 mr-2" />
          Configure Rules
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${
            activeStatFilter === 'total'
              ? 'border-primary border-2 shadow-md'
              : 'hover:shadow-md hover:border-primary/50'
          }`}
          onClick={() => handleStatCardClick('total')}
        >
          <CardContent className="p-4">
            <div className="text-2xl mb-1">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Alerts</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${
            activeStatFilter === 'active'
              ? 'border-red-500 border-2 shadow-md bg-red-50'
              : 'hover:shadow-md hover:border-red-500/50'
          }`}
          onClick={() => handleStatCardClick('active')}
        >
          <CardContent className="p-4">
            <div className="text-2xl text-red-600 mb-1">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${
            activeStatFilter === 'critical'
              ? 'border-red-500 border-2 shadow-md bg-red-50'
              : 'hover:shadow-md hover:border-red-500/50'
          }`}
          onClick={() => handleStatCardClick('critical')}
        >
          <CardContent className="p-4">
            <div className="text-2xl text-red-600 mb-1">{stats.critical}</div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${
            activeStatFilter === 'theft'
              ? 'border-red-500 border-2 shadow-md bg-red-50'
              : 'hover:shadow-md hover:border-red-500/50'
          }`}
          onClick={() => handleStatCardClick('theft')}
        >
          <CardContent className="p-4">
            <div className="text-2xl text-red-600 mb-1">{stats.theft}</div>
            <div className="text-xs text-muted-foreground">Theft</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${
            activeStatFilter === 'battery'
              ? 'border-orange-500 border-2 shadow-md bg-orange-50'
              : 'hover:shadow-md hover:border-orange-500/50'
          }`}
          onClick={() => handleStatCardClick('battery')}
        >
          <CardContent className="p-4">
            <div className="text-2xl text-orange-600 mb-1">{stats.battery}</div>
            <div className="text-xs text-muted-foreground">Battery</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${
            activeStatFilter === 'compliance'
              ? 'border-yellow-500 border-2 shadow-md bg-yellow-50'
              : 'hover:shadow-md hover:border-yellow-500/50'
          }`}
          onClick={() => handleStatCardClick('compliance')}
        >
          <CardContent className="p-4">
            <div className="text-2xl text-yellow-600 mb-1">{stats.compliance}</div>
            <div className="text-xs text-muted-foreground">Compliance</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${
            activeStatFilter === 'offline'
              ? 'border-gray-500 border-2 shadow-md bg-gray-50'
              : 'hover:shadow-md hover:border-gray-500/50'
          }`}
          onClick={() => handleStatCardClick('offline')}
        >
          <CardContent className="p-4">
            <div className="text-2xl text-gray-600 mb-1">{stats.offline}</div>
            <div className="text-xs text-muted-foreground">Offline</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                className="pl-9"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setActiveStatFilter(null);
                }}
              />
            </div>
            <Select 
              value={categoryFilter} 
              onValueChange={(value) => {
                setCategoryFilter(value);
                setActiveStatFilter(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Alert Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="theft">Theft Alert</SelectItem>
                <SelectItem value="battery">Battery Alert</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="underutilized">Underutilized</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="unauthorized-zone">Unauthorized Zone</SelectItem>
                <SelectItem value="predictive-maintenance">Predictive Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={severityFilter} 
              onValueChange={(value) => {
                setSeverityFilter(value);
                setActiveStatFilter(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={statusFilter} 
              onValueChange={(value) => {
                setStatusFilter(value);
                setActiveStatFilter(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
              <SelectTrigger className={groupBy !== 'none' ? 'border-primary' : ''}>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <SelectValue placeholder="Group By" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex flex-col">
                    <span>No Grouping</span>
                    <span className="text-xs text-muted-foreground">Show all alerts in a list</span>
                  </div>
                </SelectItem>
                <SelectItem value="type">
                  <div className="flex flex-col">
                    <span>Group by Type</span>
                    <span className="text-xs text-muted-foreground">Organize by alert category</span>
                  </div>
                </SelectItem>
                <SelectItem value="severity">
                  <div className="flex flex-col">
                    <span>Group by Severity</span>
                    <span className="text-xs text-muted-foreground">Organize by priority level</span>
                  </div>
                </SelectItem>
                <SelectItem value="asset">
                  <div className="flex flex-col">
                    <span>Group by Asset</span>
                    <span className="text-xs text-muted-foreground">Organize by asset name</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(hasActiveFilters || groupBy !== 'none') && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {activeStatFilter && (
                <Badge variant="secondary" className="gap-1">
                  Quick filter: {activeStatFilter}
                </Badge>
              )}
              {groupBy !== 'none' && (
                <Badge variant="secondary" className="gap-1">
                  <Filter className="h-3 w-3" />
                  Grouped by {groupBy}
                </Badge>
              )}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
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
          <TabsTrigger value="all">
            All Alerts ({filteredAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="acknowledged">
            Acknowledged ({acknowledgedAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {renderAlertsList(filteredAlerts)}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 mt-4">
          {renderAlertsList(activeAlerts)}
        </TabsContent>

        <TabsContent value="acknowledged" className="space-y-3 mt-4">
          {renderAlertsList(acknowledgedAlerts)}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-3 mt-4">
          {renderAlertsList(resolvedAlerts)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

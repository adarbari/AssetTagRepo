import { useState, useEffect } from "react";
import { ViewType } from "../App";
import { AlertFilter } from "./alerts/Alerts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { LoadingState, StatsCard, Section } from "./common";
import {
  Activity,
  Package,
  MapPin,
  AlertTriangle,
  Battery,
  TrendingUp,
  Clock,
  Shield,
  BarChart3,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardStats,
  getLocationData,
  getAssetsByType,
  getBatteryStatus,
  getRecentActivity,
  getAlertBreakdown,
  type DashboardStats,
  type LocationDataPoint,
  type AssetTypeDistribution,
  type BatteryStatusRange,
  type RecentActivity as RecentActivityType,
  type AlertBreakdown as AlertBreakdownType,
} from "../data/mockDashboardData";

interface DashboardProps {
  onViewChange: (view: ViewType) => void;
  onNavigateToAlerts: (filter?: AlertFilter) => void;
}

export function Dashboard({ onViewChange, onNavigateToAlerts }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [locationData, setLocationData] = useState<LocationDataPoint[]>([]);
  const [assetsByType, setAssetsByType] = useState<AssetTypeDistribution[]>([]);
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatusRange[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivityType[]>([]);
  const [alertBreakdown, setAlertBreakdown] = useState<AlertBreakdownType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          statsData,
          locData,
          assetsData,
          batteryData,
          activityData,
          alertsData,
        ] = await Promise.all([
          getDashboardStats(),
          getLocationData(),
          getAssetsByType(),
          getBatteryStatus(),
          getRecentActivity(5),
          getAlertBreakdown(),
        ]);

        setStats(statsData);
        setLocationData(locData);
        setAssetsByType(assetsData);
        setBatteryStatus(batteryData);
        setRecentActivity(activityData);
        setAlertBreakdown(alertsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return <LoadingState message="Loading dashboard..." fullScreen />;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted-foreground">Real-time asset tracking overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            System Status: {stats.systemStatus === "online" ? "Online" : stats.systemStatus === "degraded" ? "Degraded" : "Offline"}
          </Badge>
        </div>
      </div>

      {/* SECTION 1: Asset & Location Overview */}
      <Section
        title="Asset & Location Overview"
        icon={Package}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <StatsCard
            title="Total Assets"
            value={stats.totalAssets.toLocaleString()}
            icon={Package}
            description={`+${stats.assetsAddedThisMonth} added this month`}
            trend={{ value: stats.assetsAddedThisMonth, direction: "up" }}
            onClick={() => onViewChange("inventory")}
          />
          <StatsCard
            title="Active Locations"
            value={stats.activeLocations.toLocaleString()}
            icon={MapPin}
            description={`${stats.trackingAccuracy}% tracking accuracy`}
            onClick={() => onViewChange("map")}
          />
        </div>
      </Section>

      <Separator />

      {/* SECTION 2: Alerts & Issues Requiring Attention */}
      <Section
        title="Alerts & Issues"
        icon={AlertTriangle}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <StatsCard
            title="Active Alerts"
            value={stats.activeAlerts}
            icon={AlertTriangle}
            description={`${stats.criticalAlerts} critical • ${stats.activeAlerts - stats.criticalAlerts} medium`}
            onClick={() => onNavigateToAlerts({ status: 'active' })}
            variant="warning"
            className="border-l-4 border-l-orange-500"
          />
          <StatsCard
            title="Battery Alerts"
            value={stats.batteryAlerts}
            icon={Battery}
            description="Require attention <20%"
            onClick={() => onNavigateToAlerts({ category: 'battery', status: 'active' })}
            variant="warning"
            className="border-l-4 border-l-amber-500"
          />
        </div>
      </Section>

      <Separator />

      {/* SECTION 3: Analytics & Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <div className="text-xl text-muted-foreground">Analytics & Insights</div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Asset Distribution */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => onViewChange("inventory")}
          >
            <CardHeader>
              <CardTitle>Assets by Type</CardTitle>
              <p className="text-sm text-muted-foreground">Click to view inventory</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assetsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Location Activity */}
          <Card 
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => onViewChange("map")}
          >
            <CardHeader>
              <CardTitle>Location Updates (24h)</CardTitle>
              <p className="text-sm text-muted-foreground">Click to view live map</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="observations"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                    name="Observations"
                  />
                  <Area
                    type="monotone"
                    dataKey="assets"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                    name="Active Assets"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* SECTION 4: Battery & Maintenance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-muted-foreground" />
          <div className="text-xl text-muted-foreground">Battery & Maintenance</div>
        </div>
        
        <Card 
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => onViewChange("reports")}
        >
          <CardHeader>
            <CardTitle>Battery Status Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Click to view detailed reports</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={batteryStatus}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="range" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* SECTION 5: System Health & Infrastructure */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div className="text-xl text-muted-foreground">System Health & Infrastructure</div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <CardTitle className="text-sm">Uptime</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">99.97%</div>
              <p className="text-xs text-green-600 mt-1">All systems operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm">Avg Latency</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">2.3s</div>
              <p className="text-xs text-muted-foreground mt-1">Last update: 2 hours ago</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <CardTitle className="text-sm">Observations/sec</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">87,432</div>
              <p className="text-xs text-muted-foreground mt-1">BLE observations rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm">Active Gateways</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">2,341</div>
              <p className="text-xs text-muted-foreground mt-1">Vehicle & Asset gateways</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

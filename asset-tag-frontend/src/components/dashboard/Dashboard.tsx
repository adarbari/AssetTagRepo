import React from &apos;react&apos;;
import { ViewType } from &apos;../../App&apos;;
import { AlertFilter } from &apos;../alerts/Alerts&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import {
  LoadingState,
  StatsCard,
  Section,
  PageLayout,
  PageHeader,
} from &apos;../common&apos;;
import { useAsyncDataAll } from &apos;../../hooks/useAsyncData&apos;;
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
} from &apos;lucide-react&apos;;
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
} from &apos;recharts&apos;;
import {
  getDashboardStats,
  getLocationData,
  getAssetsByType,
  getBatteryStatus,
  getRecentActivity,
  getAlertBreakdown,
} from &apos;../../data/mockDashboardData&apos;;

interface DashboardProps {
  onViewChange: (view: ViewType) => void;
  onNavigateToAlerts: (filter?: AlertFilter) => void;
}

export function Dashboard({
  onViewChange,
  onNavigateToAlerts,
}: DashboardProps) {
  const { data, loading, error } = useAsyncDataAll({
    stats: () => getDashboardStats(),
    locationData: () => getLocationData(),
    assetsByType: () => getAssetsByType(),
    batteryStatus: () => getBatteryStatus(),
    recentActivity: () => getRecentActivity(5),
    alertBreakdown: () => getAlertBreakdown(),
  });

  if (loading) {
    return <LoadingState message=&apos;Loading dashboard...&apos; fullScreen />;
  }

  if (error) {
    return (
      <div className=&apos;p-8&apos;>
        <div className=&apos;text-center&apos;>
          <h2 className=&apos;text-lg font-semibold text-red-600&apos;>
            Failed to load dashboard
          </h2>
          <p className=&apos;text-muted-foreground mt-2&apos;>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { stats, locationData, assetsByType, batteryStatus } = data;

  return (
    <PageLayout
      variant=&apos;standard&apos;
      padding=&apos;lg&apos;
      header={
        <div className=&apos;border-b bg-background px-8 py-6&apos;>
          <PageHeader
            title=&apos;Dashboard&apos;
            description=&apos;Real-time asset tracking overview&apos;
            icon={BarChart3}
            actions={
              <Badge variant=&apos;outline&apos; className=&apos;gap-1&apos;>
                <Activity className=&apos;h-3 w-3&apos; />
                System Status:{&apos; &apos;}
                {stats.systemStatus === &apos;online&apos;
                  ? &apos;Online&apos;
                  : stats.systemStatus === &apos;degraded&apos;
                    ? &apos;Degraded&apos;
                    : &apos;Offline&apos;}
              </Badge>
            }
          />
        </div>
      }
    >
      {/* SECTION 1: Asset & Location Overview */}
      <Section title=&apos;Asset & Location Overview&apos; icon={Package}>
        <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
          <StatsCard
            title=&apos;Total Assets&apos;
            value={stats.totalAssets.toLocaleString()}
            icon={Package}
            description={`+${stats.assetsAddedThisMonth} added this month`}
            trend={{ value: stats.assetsAddedThisMonth, direction: &apos;up&apos; }}
            onClick={() => onViewChange(&apos;inventory&apos;)}
          />
          <StatsCard
            title=&apos;Active Locations&apos;
            value={stats.activeLocations.toLocaleString()}
            icon={MapPin}
            description={`${stats.trackingAccuracy}% tracking accuracy`}
            onClick={() => onViewChange(&apos;map&apos;)}
          />
        </div>
      </Section>

      <Separator />

      {/* SECTION 2: Alerts & Issues Requiring Attention */}
      <Section title=&apos;Alerts & Issues&apos; icon={AlertTriangle}>
        <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
          <StatsCard
            title=&apos;Active Alerts&apos;
            value={stats.activeAlerts}
            icon={AlertTriangle}
            description={`${stats.criticalAlerts} critical • ${stats.activeAlerts - stats.criticalAlerts} medium`}
            onClick={() => onNavigateToAlerts({ status: &apos;active&apos; })}
            variant=&apos;warning&apos;
            className=&apos;border-l-4 border-l-orange-500&apos;
          />
          <StatsCard
            title=&apos;Battery Alerts&apos;
            value={stats.batteryAlerts}
            icon={Battery}
            description=&apos;Require attention <20%&apos;
            onClick={() =>
              onNavigateToAlerts({ category: &apos;battery&apos;, status: &apos;active&apos; })
            }
            variant=&apos;warning&apos;
            className=&apos;border-l-4 border-l-amber-500&apos;
          />
        </div>
      </Section>

      <Separator />

      {/* SECTION 3: Analytics & Insights */}
      <div className=&apos;space-y-4&apos;>
        <div className=&apos;flex items-center gap-2&apos;>
          <BarChart3 className=&apos;h-5 w-5 text-muted-foreground&apos; />
          <div className=&apos;text-xl text-muted-foreground&apos;>
            Analytics & Insights
          </div>
        </div>

        <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
          {/* Asset Distribution */}
          <Card
            className=&apos;cursor-pointer transition-all hover:shadow-md&apos;
            onClick={() => onViewChange(&apos;inventory&apos;)}
          >
            <CardHeader>
              <CardTitle>Assets by Type</CardTitle>
              <p className=&apos;text-sm text-muted-foreground&apos;>
                Click to view inventory
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width=&apos;100%&apos; height={300}>
                <PieChart>
                  <Pie
                    data={assetsByType}
                    cx=&apos;50%&apos;
                    cy=&apos;50%&apos;
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill=&apos;#8884d8&apos;
                    dataKey=&apos;value&apos;
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
            className=&apos;cursor-pointer transition-all hover:shadow-md&apos;
            onClick={() => onViewChange(&apos;map&apos;)}
          >
            <CardHeader>
              <CardTitle>Location Updates (24h)</CardTitle>
              <p className=&apos;text-sm text-muted-foreground&apos;>
                Click to view live map
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width=&apos;100%&apos; height={300}>
                <AreaChart data={locationData}>
                  <CartesianGrid
                    strokeDasharray=&apos;3 3&apos;
                    className=&apos;stroke-muted&apos;
                  />
                  <XAxis dataKey=&apos;time&apos; className=&apos;text-xs&apos; />
                  <YAxis className=&apos;text-xs&apos; />
                  <Tooltip />
                  <Legend />
                  <Area
                    type=&apos;monotone&apos;
                    dataKey=&apos;observations&apos;
                    stroke=&apos;hsl(var(--chart-1))&apos;
                    fill=&apos;hsl(var(--chart-1))&apos;
                    fillOpacity={0.6}
                    name=&apos;Observations&apos;
                  />
                  <Area
                    type=&apos;monotone&apos;
                    dataKey=&apos;assets&apos;
                    stroke=&apos;hsl(var(--chart-2))&apos;
                    fill=&apos;hsl(var(--chart-2))&apos;
                    fillOpacity={0.6}
                    name=&apos;Active Assets&apos;
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* SECTION 4: Battery & Maintenance */}
      <div className=&apos;space-y-4&apos;>
        <div className=&apos;flex items-center gap-2&apos;>
          <Zap className=&apos;h-5 w-5 text-muted-foreground&apos; />
          <div className=&apos;text-xl text-muted-foreground&apos;>
            Battery & Maintenance
          </div>
        </div>

        <Card
          className=&apos;cursor-pointer transition-all hover:shadow-md&apos;
          onClick={() => onViewChange(&apos;reports&apos;)}
        >
          <CardHeader>
            <CardTitle>Battery Status Distribution</CardTitle>
            <p className=&apos;text-sm text-muted-foreground&apos;>
              Click to view detailed reports
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width=&apos;100%&apos; height={300}>
              <BarChart data={batteryStatus}>
                <CartesianGrid strokeDasharray=&apos;3 3&apos; className=&apos;stroke-muted&apos; />
                <XAxis dataKey=&apos;range&apos; className=&apos;text-xs&apos; />
                <YAxis className=&apos;text-xs&apos; />
                <Tooltip />
                <Bar dataKey=&apos;count&apos; fill=&apos;hsl(var(--chart-3))&apos; />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* SECTION 5: System Health & Infrastructure */}
      <div className=&apos;space-y-4&apos;>
        <div className=&apos;flex items-center gap-2&apos;>
          <Shield className=&apos;h-5 w-5 text-muted-foreground&apos; />
          <div className=&apos;text-xl text-muted-foreground&apos;>
            System Health & Infrastructure
          </div>
        </div>

        <div className=&apos;grid gap-4 md:grid-cols-2 lg:grid-cols-4&apos;>
          <Card>
            <CardHeader className=&apos;pb-2&apos;>
              <div className=&apos;flex items-center gap-2&apos;>
                <Shield className=&apos;h-4 w-4 text-green-600&apos; />
                <CardTitle className=&apos;text-sm&apos;>Uptime</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className=&apos;text-2xl&apos;>99.97%</div>
              <p className=&apos;text-xs text-green-600 mt-1&apos;>
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&apos;pb-2&apos;>
              <div className=&apos;flex items-center gap-2&apos;>
                <Clock className=&apos;h-4 w-4 text-blue-600&apos; />
                <CardTitle className=&apos;text-sm&apos;>Avg Latency</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className=&apos;text-2xl&apos;>2.3s</div>
              <p className=&apos;text-xs text-muted-foreground mt-1&apos;>
                Last update: 2 hours ago
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&apos;pb-2&apos;>
              <div className=&apos;flex items-center gap-2&apos;>
                <TrendingUp className=&apos;h-4 w-4 text-purple-600&apos; />
                <CardTitle className=&apos;text-sm&apos;>Observations/sec</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className=&apos;text-2xl&apos;>87,432</div>
              <p className=&apos;text-xs text-muted-foreground mt-1&apos;>
                BLE observations rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&apos;pb-2&apos;>
              <div className=&apos;flex items-center gap-2&apos;>
                <Activity className=&apos;h-4 w-4 text-orange-600&apos; />
                <CardTitle className=&apos;text-sm&apos;>Active Gateways</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className=&apos;text-2xl&apos;>2,341</div>
              <p className=&apos;text-xs text-muted-foreground mt-1&apos;>
                Vehicle & Asset gateways
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

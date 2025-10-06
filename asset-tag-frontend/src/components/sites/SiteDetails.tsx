import React, { useState, useEffect } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import { ScrollArea } from &apos;../ui/scroll-area&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Calendar } from &apos;../ui/calendar&apos;;
import { Popover, PopoverContent, PopoverTrigger } from &apos;../ui/popover&apos;;
import { Skeleton } from &apos;../ui/skeleton&apos;;
import { PageLayout, PageHeader, StatsCard } from &apos;../common&apos;;
import {
  fetchSiteActivity,
  getPresetDateRange,
  type SiteActivityData,
} from &apos;../../services/api&apos;;
import { GeofenceMapEditor } from &apos;../geofences/GeofenceMapEditor&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &apos;../ui/table&apos;;
import {
  Building2,
  Users,
  Package,
  Edit,
  Save,
  X,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Truck,
  Container,
  Navigation,
  Calendar as CalendarIcon,
  Shield,
  Plus,
} from &apos;lucide-react&apos;;
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from &apos;recharts&apos;;
import type { Site as SharedSite, Geofence } from &apos;../../types&apos;;

type SiteStatus = &apos;active&apos; | &apos;maintenance&apos; | &apos;inactive&apos;;

interface Site {
  id: string;
  name: string;
  address: string;
  boundary: string;
  tolerance: number;
  assets: number;
  personnel: number;
  status: SiteStatus;
  lastActivity: string;
  coordinates: {
    lat: number;
    lng: number;
    radius: number;
  };
  details: {
    contactPerson?: string;
    phone?: string;
    email?: string;
    operatingHours?: string;
    timezone?: string;
    established?: string;
  };
}

interface SiteDetailsProps {
  site: SharedSite;
  onBack: () => void;
  onCreateGeofence?: (
    data: {
      siteId?: string;
      siteName?: string;
      latitude?: number;
      longitude?: number;
      radius?: number;
      tolerance?: number;
    },
    currentTab?: string
  ) => void;
  onEditGeofence?: (
    geofenceId: string,
    data: {
      siteId?: string;
      siteName?: string;
      latitude?: number;
      longitude?: number;
      radius?: number;
      tolerance?: number;
      name?: string;
      alertOnEntry?: boolean;
      alertOnExit?: boolean;
    },
    currentTab?: string
  ) => void;
  onSiteUpdate?: (updatedSite: SharedSite) => void;
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

// Mock asset types distribution
const assetTypeData = [
  { name: &apos;Equipment&apos;, value: 95, count: 95, color: &apos;#3b82f6&apos; },
  { name: &apos;Vehicles&apos;, value: 52, count: 52, color: &apos;#22c55e&apos; },
  { name: &apos;Tools&apos;, value: 67, count: 67, color: &apos;#f59e0b&apos; },
  { name: &apos;Containers&apos;, value: 20, count: 20, color: &apos;#8b5cf6&apos; },
];

// Mock recent events
const recentEvents = [
  {
    id: 1,
    type: &apos;arrival&apos;,
    asset: &apos;Excavator CAT 320&apos;,
    assetId: &apos;AT-42891&apos;,
    timestamp: &apos;2 min ago&apos;,
    icon: Wrench,
  },
  {
    id: 2,
    type: &apos;departure&apos;,
    asset: &apos;Delivery Truck F-350&apos;,
    assetId: &apos;AT-78234&apos;,
    timestamp: &apos;15 min ago&apos;,
    icon: Truck,
  },
  {
    id: 3,
    type: &apos;arrival&apos;,
    asset: &apos;Tool Container #5&apos;,
    assetId: &apos;AT-33421&apos;,
    timestamp: &apos;32 min ago&apos;,
    icon: Container,
  },
  {
    id: 4,
    type: &apos;alert&apos;,
    asset: &apos;Forklift Toyota 8FG&apos;,
    assetId: &apos;AT-55678&apos;,
    timestamp: &apos;1 hour ago&apos;,
    icon: AlertTriangle,
    message: &apos;Low battery warning&apos;,
  },
  {
    id: 5,
    type: &apos;departure&apos;,
    asset: &apos;Service Van Mercedes&apos;,
    assetId: &apos;AT-98765&apos;,
    timestamp: &apos;2 hours ago&apos;,
    icon: Truck,
  },
];

// Mock assets at site
const assetsAtSite = [
  {
    id: &apos;AT-42891&apos;,
    name: &apos;Excavator CAT 320&apos;,
    type: &apos;equipment&apos;,
    battery: 87,
    status: &apos;active&apos;,
    duration: &apos;2 days 4 hrs&apos;,
  },
  {
    id: &apos;AT-78234&apos;,
    name: &apos;Delivery Truck F-350&apos;,
    type: &apos;vehicles&apos;,
    battery: 92,
    status: &apos;idle&apos;,
    duration: &apos;5 hrs 23 min&apos;,
  },
  {
    id: &apos;AT-33421&apos;,
    name: &apos;Tool Container #5&apos;,
    type: &apos;containers&apos;,
    battery: 78,
    status: &apos;active&apos;,
    duration: &apos;1 day 18 hrs&apos;,
  },
  {
    id: &apos;AT-55678&apos;,
    name: &apos;Forklift Toyota 8FG&apos;,
    type: &apos;equipment&apos;,
    battery: 34,
    status: &apos;active&apos;,
    duration: &apos;8 hrs 12 min&apos;,
  },
  {
    id: &apos;AT-11223&apos;,
    name: &apos;Compressor Atlas 225&apos;,
    type: &apos;equipment&apos;,
    battery: 65,
    status: &apos;idle&apos;,
    duration: &apos;3 days 2 hrs&apos;,
  },
];

export function SiteDetails({
  site: sharedSite,
  onBack,
  onCreateGeofence,
  onEditGeofence,
  onSiteUpdate,
  initialTab = &apos;overview&apos;,
  onTabChange,
}: SiteDetailsProps) {
  // Convert shared site to local format
  const siteData: Site = {
    id: sharedSite.id,
    name: sharedSite.name,
    address:
      sharedSite.address || sharedSite.location || &apos;Address not available&apos;,
    boundary: sharedSite.area || &apos;Boundary not defined&apos;,
    tolerance: sharedSite.tolerance || 50,
    assets: sharedSite.assets || 0,
    personnel: 0, // Not in shared type
    status: sharedSite.status === &apos;active&apos; ? &apos;active&apos; : &apos;inactive&apos;,
    lastActivity: &apos;Unknown&apos;, // Not in shared type
    coordinates: sharedSite.coordinates
      ? {
          lat: sharedSite.coordinates.lat,
          lng: sharedSite.coordinates.lng,
          radius: sharedSite.coordinates.radius,
        }
      : { lat: 0, lng: 0, radius: 500 },
    details: {
      contactPerson: sharedSite.manager,
      phone: sharedSite.phone,
      email: sharedSite.email,
      operatingHours: &apos;24/7&apos;,
      timezone: &apos;UTC&apos;,
      established: &apos;2024&apos;,
    },
  };

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSite, setEditedSite] = useState(siteData);
  const [isBoundaryEditing, setIsBoundaryEditing] = useState(false);
  const [activityTimeRange, setActivityTimeRange] = useState<
    &apos;24h&apos; | &apos;7d&apos; | &apos;30d&apos; | &apos;custom&apos;
  >(&apos;24h&apos;);
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(
    undefined
  );
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(
    undefined
  );
  const [activityData, setActivityData] = useState<SiteActivityData[]>([]);
  const [isLoadingActivity, setLoadingActivity] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [siteGeofence, setSiteGeofence] = useState<Geofence | null>(null);

  // Update editedSite when siteData changes (when navigating between sites)
  useEffect(() => {
    setEditedSite(siteData);
    setIsBoundaryEditing(false);

    // Load associated geofence if it exists
    if (sharedSite.geofenceId) {
      // Fetch geofence from mock data
      import(&apos;../../data/mockData&apos;).then(({ getGeofenceById }) => {
        if (sharedSite.geofenceId) {
          const geofence = getGeofenceById(sharedSite.geofenceId);
          if (geofence) {
            setSiteGeofence(geofence);
          } else {
            // Geofence ID exists but geofence not found, clear it
            setSiteGeofence(null);
          }
        }
      });
    } else {
      setSiteGeofence(null);
    }
  }, [sharedSite.id, sharedSite.geofenceId]);

  // Fetch activity data when time range or custom dates change
  useEffect(() => {
    const fetchActivityData = async () => {
      setLoadingActivity(true);
      setActivityError(null);

      try {
        let startDate: Date;
        let endDate: Date;
        let granularity: &apos;hourly&apos; | &apos;daily&apos; = &apos;daily&apos;;

        if (activityTimeRange === &apos;custom&apos;) {
          if (!customStartDate || !customEndDate) {
            setActivityData([]);
            setLoadingActivity(false);
            return;
          }
          startDate = customStartDate;
          endDate = customEndDate;

          // Determine granularity based on date range
          const daysDiff = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          granularity = daysDiff <= 2 ? &apos;hourly&apos; : &apos;daily&apos;;
        } else {
          const range = getPresetDateRange(activityTimeRange);
          startDate = range.start;
          endDate = range.end;
          granularity = range.granularity;
        }

        const response = await fetchSiteActivity(
          sharedSite.id,
          startDate,
          endDate,
          granularity
        );

        setActivityData(response.data);
      } catch (error) {
// // // // // // // console.error(&apos;Error fetching activity data:&apos;, error);
        setActivityError(&apos;Failed to load activity data. Please try again.&apos;);
        setActivityData([]);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchActivityData();
  }, [activityTimeRange, customStartDate, customEndDate, sharedSite.id]);

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSite(siteData);
    setIsEditing(false);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case &apos;arrival&apos;:
        return <CheckCircle2 className=&apos;h-4 w-4 text-green-600&apos; />;
      case &apos;departure&apos;:
        return <Navigation className=&apos;h-4 w-4 text-blue-600&apos; />;
      case &apos;alert&apos;:
        return <AlertTriangle className=&apos;h-4 w-4 text-yellow-600&apos; />;
      default:
        return <Activity className=&apos;h-4 w-4 text-muted-foreground&apos; />;
    }
  };

  return (
    <PageLayout
      variant=&apos;standard&apos;
      padding=&apos;lg&apos;
      header={
        <div className=&apos;border-b bg-background px-8 py-6&apos;>
          <PageHeader
            title={editedSite.name}
            description={editedSite.id}
            icon={Building2}
            badge={{
              label: editedSite.status,
              variant: editedSite.status === &apos;active&apos; ? &apos;default&apos; : &apos;secondary&apos;,
            }}
            onBack={onBack}
            actions={
              <div className=&apos;flex items-center gap-2&apos;>
                {isEditing ? (
                  <>
                    <Button variant=&apos;outline&apos; onClick={handleCancel}>
                      <X className=&apos;h-4 w-4 mr-2&apos; />
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className=&apos;h-4 w-4 mr-2&apos; />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className=&apos;h-4 w-4 mr-2&apos; />
                    Edit Site
                  </Button>
                )}
              </div>
            }
          />
        </div>
      }
    >
      {/* Stats Cards */}
      <div className=&apos;grid gap-4 md:grid-cols-4&apos;>
        <StatsCard
          title=&apos;Assets On-Site&apos;
          value={editedSite.assets.toString()}
          icon={Package}
          variant=&apos;info&apos;
        />
        <StatsCard
          title=&apos;Personnel&apos;
          value={editedSite.personnel.toString()}
          icon={Users}
          variant=&apos;info&apos;
        />
        <StatsCard
          title=&apos;Active Assets&apos;
          value=&apos;178&apos;
          icon={Activity}
          variant=&apos;success&apos;
        />
        <StatsCard
          title=&apos;Utilization&apos;
          value=&apos;76%&apos;
          icon={TrendingUp}
          variant=&apos;warning&apos;
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={tab => {
          setActiveTab(tab);
          onTabChange?.(tab);
        }}
      >
        <TabsList>
          <TabsTrigger value=&apos;overview&apos;>Overview</TabsTrigger>
          <TabsTrigger value=&apos;assets&apos;>Assets</TabsTrigger>
          <TabsTrigger value=&apos;location&apos;>Location & Boundary</TabsTrigger>
          <TabsTrigger value=&apos;activity&apos;>Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value=&apos;overview&apos; className=&apos;space-y-6&apos;>
          <div className=&apos;grid gap-6 md:grid-cols-2&apos;>
            {/* Site Information */}
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
              </CardHeader>
              <CardContent className=&apos;space-y-4&apos;>
                {isEditing ? (
                  <>
                    <div className=&apos;space-y-2&apos;>
                      <Label>Site Name</Label>
                      <Input
                        value={editedSite.name}
                        onChange={e =>
                          setEditedSite({ ...editedSite, name: e.target.value })
                        }
                      />
                    </div>
                    <div className=&apos;space-y-2&apos;>
                      <Label>Address</Label>
                      <Input
                        value={editedSite.address}
                        onChange={e =>
                          setEditedSite({
                            ...editedSite,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className=&apos;space-y-2&apos;>
                      <Label>Tolerance (feet)</Label>
                      <Input
                        type=&apos;number&apos;
                        value={editedSite.tolerance}
                        onChange={e =>
                          setEditedSite({
                            ...editedSite,
                            tolerance: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className=&apos;space-y-2&apos;>
                      <Label>Status</Label>
                      <Select
                        value={editedSite.status}
                        onValueChange={(value: SiteStatus) =>
                          setEditedSite({ ...editedSite, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=&apos;active&apos;>Active</SelectItem>
                          <SelectItem value=&apos;maintenance&apos;>
                            Maintenance
                          </SelectItem>
                          <SelectItem value=&apos;inactive&apos;>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className=&apos;text-sm text-muted-foreground&apos;>Address</p>
                      <p>{editedSite.address}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className=&apos;text-sm text-muted-foreground&apos;>Boundary</p>
                      <p>{editedSite.boundary}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className=&apos;text-sm text-muted-foreground&apos;>Tolerance</p>
                      <p>±{editedSite.tolerance} feet</p>
                    </div>
                    <Separator />
                    <div>
                      <p className=&apos;text-sm text-muted-foreground&apos;>
                        Contact Person
                      </p>
                      <p>{editedSite.details.contactPerson}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className=&apos;text-sm text-muted-foreground&apos;>Phone</p>
                      <p>{editedSite.details.phone}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className=&apos;text-sm text-muted-foreground&apos;>Email</p>
                      <p>{editedSite.details.email}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className=&apos;text-sm text-muted-foreground&apos;>
                        Operating Hours
                      </p>
                      <p>{editedSite.details.operatingHours}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className=&apos;text-sm text-muted-foreground&apos;>
                        Established
                      </p>
                      <p>{editedSite.details.established}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Asset Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&apos;h-64&apos;>
                  <ResponsiveContainer width=&apos;100%&apos; height=&apos;100%&apos;>
                    <PieChart>
                      <Pie
                        data={assetTypeData}
                        cx=&apos;50%&apos;
                        cy=&apos;50%&apos;
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey=&apos;value&apos;
                      >
                        {assetTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className=&apos;bg-background border rounded-lg p-2 shadow-lg&apos;>
                                <p className=&apos;font-medium&apos;>{payload[0].name}</p>
                                <p className=&apos;text-sm text-muted-foreground&apos;>
                                  {payload[0].value} assets
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className=&apos;grid grid-cols-2 gap-4 mt-4&apos;>
                  {assetTypeData.map(item => (
                    <div key={item.name} className=&apos;flex items-center gap-2&apos;>
                      <div
                        className=&apos;w-3 h-3 rounded-full&apos;
                        style={{ backgroundColor: item.color }}
                      />
                      <div className=&apos;flex-1&apos;>
                        <p className=&apos;text-sm&apos;>{item.name}</p>
                        <p className=&apos;text-sm text-muted-foreground&apos;>
                          {item.count}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className=&apos;h-64&apos;>
                <div className=&apos;space-y-4&apos;>
                  {recentEvents.map(event => (
                    <div key={event.id} className=&apos;flex items-start gap-4&apos;>
                      <div className=&apos;mt-1&apos;>{getEventIcon(event.type)}</div>
                      <div className=&apos;flex-1&apos;>
                        <div className=&apos;flex items-center justify-between&apos;>
                          <p>{event.asset}</p>
                          <p className=&apos;text-sm text-muted-foreground&apos;>
                            {event.timestamp}
                          </p>
                        </div>
                        <p className=&apos;text-sm text-muted-foreground&apos;>
                          {event.assetId}
                        </p>
                        {event.message && (
                          <p className=&apos;text-sm text-yellow-600 mt-1&apos;>
                            {event.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value=&apos;assets&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Assets Currently at Site</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetsAtSite.map(asset => (
                    <TableRow key={asset.id}>
                      <TableCell>{asset.id}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>
                        <Badge variant=&apos;outline&apos;>{asset.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <div className=&apos;w-16 h-2 bg-muted rounded-full overflow-hidden&apos;>
                            <div
                              className={`h-full ${
                                asset.battery > 50
                                  ? &apos;bg-green-500&apos;
                                  : asset.battery > 20
                                    ? &apos;bg-yellow-500&apos;
                                    : &apos;bg-red-500&apos;
                              }`}
                              style={{ width: `${asset.battery}%` }}
                            />
                          </div>
                          <span className=&apos;text-sm&apos;>{asset.battery}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant=&apos;outline&apos;
                          className={
                            asset.status === &apos;active&apos;
                              ? &apos;bg-green-100 text-green-700 border-green-200&apos;
                              : &apos;bg-gray-100 text-gray-700 border-gray-200&apos;
                          }
                        >
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value=&apos;location&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <div className=&apos;flex items-center justify-between&apos;>
                <CardTitle>Site Location & Boundary</CardTitle>
                {!isBoundaryEditing ? (
                  <Button
                    size=&apos;sm&apos;
                    variant=&apos;outline&apos;
                    onClick={() => setIsBoundaryEditing(true)}
                  >
                    <Edit className=&apos;mr-2 h-4 w-4&apos; />
                    Edit Boundary
                  </Button>
                ) : (
                  <div className=&apos;flex gap-2&apos;>
                    <Button
                      size=&apos;sm&apos;
                      variant=&apos;outline&apos;
                      onClick={() => {
                        setEditedSite(siteData);
                        setIsBoundaryEditing(false);
                      }}
                    >
                      <X className=&apos;mr-2 h-4 w-4&apos; />
                      Cancel
                    </Button>
                    <Button
                      size=&apos;sm&apos;
                      onClick={() => {
                        // Update the site with new boundary data
                        const updatedSharedSite: SharedSite = {
                          ...sharedSite,
                          coordinates: {
                            lat: editedSite.coordinates.lat,
                            lng: editedSite.coordinates.lng,
                            radius: editedSite.coordinates.radius,
                          },
                          tolerance: editedSite.tolerance,
                        };

                        // Call the update callback if provided
                        if (onSiteUpdate) {
                          onSiteUpdate(updatedSharedSite);
                        }

                        // Show success message
                        import(&apos;sonner&apos;).then(({ toast }) => {
                          toast.success(&apos;Site boundary updated successfully&apos;);
                        });

                        setIsBoundaryEditing(false);
                      }}
                    >
                      <Save className=&apos;mr-2 h-4 w-4&apos; />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className=&apos;space-y-4&apos;>
              <GeofenceMapEditor
                coordinates={editedSite.coordinates}
                tolerance={editedSite.tolerance}
                name={editedSite.name}
                isEditing={isBoundaryEditing}
                siteGeofence={siteGeofence}
                onCoordinatesChange={coordinates => {
                  setEditedSite(prev => ({
                    ...prev,
                    coordinates,
                  }));
                }}
                onToleranceChange={tolerance => {
                  setEditedSite(prev => ({
                    ...prev,
                    tolerance,
                  }));
                }}
              />
            </CardContent>
          </Card>

          {/* Geofence Management */}
          <Card>
            <CardHeader>
              <div className=&apos;flex items-center justify-between&apos;>
                <div className=&apos;flex items-center gap-2&apos;>
                  <Shield className=&apos;h-5 w-5 text-blue-600&apos; />
                  <CardTitle>Geofence</CardTitle>
                </div>
                {!siteGeofence && onCreateGeofence && (
                  <Button
                    size=&apos;sm&apos;
                    onClick={() =>
                      onCreateGeofence(
                        {
                          siteId: editedSite.id,
                          siteName: editedSite.name,
                          latitude: editedSite.coordinates.lat,
                          longitude: editedSite.coordinates.lng,
                          radius: editedSite.coordinates.radius,
                          tolerance: editedSite.tolerance,
                        },
                        activeTab
                      )
                    }
                  >
                    <Plus className=&apos;mr-2 h-4 w-4&apos; />
                    Create Geofence
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!siteGeofence ? (
                <div className=&apos;text-center py-6 text-muted-foreground&apos;>
                  <Shield className=&apos;h-10 w-10 mx-auto mb-2 opacity-20&apos; />
                  <p className=&apos;text-sm&apos;>
                    No geofence configured for this site
                  </p>
                  <p className=&apos;text-xs mt-1&apos;>
                    Create a geofence to enable entry/exit alerts
                  </p>
                </div>
              ) : (
                <div className=&apos;space-y-4&apos;>
                  <div className=&apos;flex items-start justify-between&apos;>
                    <div className=&apos;space-y-3 flex-1&apos;>
                      <div className=&apos;flex items-center gap-3&apos;>
                        <h4>{siteGeofence.name}</h4>
                        <Badge
                          variant=&apos;outline&apos;
                          className={
                            siteGeofence.status === &apos;active&apos;
                              ? &apos;bg-green-100 text-green-700 border-green-200&apos;
                              : &apos;bg-gray-100 text-gray-700 border-gray-200&apos;
                          }
                        >
                          {siteGeofence.status}
                        </Badge>
                      </div>

                      <div className=&apos;grid grid-cols-3 gap-4 text-sm&apos;>
                        <div>
                          <p className=&apos;text-muted-foreground&apos;>Geofence ID</p>
                          <p className=&apos;font-mono text-xs&apos;>{siteGeofence.id}</p>
                        </div>
                        <div>
                          <p className=&apos;text-muted-foreground&apos;>Radius</p>
                          <p>{siteGeofence.radius} feet</p>
                        </div>
                        <div>
                          <p className=&apos;text-muted-foreground&apos;>Tolerance</p>
                          <p>±{siteGeofence.tolerance} feet</p>
                        </div>
                      </div>

                      <div className=&apos;flex items-center gap-4 text-sm&apos;>
                        <div className=&apos;flex items-center gap-1&apos;>
                          {siteGeofence.alertOnEntry ? (
                            <CheckCircle2 className=&apos;h-4 w-4 text-green-600&apos; />
                          ) : (
                            <X className=&apos;h-4 w-4 text-muted-foreground&apos; />
                          )}
                          <span>Entry alerts</span>
                        </div>
                        <div className=&apos;flex items-center gap-1&apos;>
                          {siteGeofence.alertOnExit ? (
                            <CheckCircle2 className=&apos;h-4 w-4 text-green-600&apos; />
                          ) : (
                            <X className=&apos;h-4 w-4 text-muted-foreground&apos; />
                          )}
                          <span>Exit alerts</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size=&apos;sm&apos;
                      variant=&apos;outline&apos;
                      onClick={() => {
                        if (onEditGeofence && siteGeofence.center) {
                          onEditGeofence(
                            siteGeofence.id,
                            {
                              siteId: editedSite.id,
                              siteName: editedSite.name,
                              latitude: siteGeofence.center[0],
                              longitude: siteGeofence.center[1],
                              radius: siteGeofence.radius,
                              tolerance: siteGeofence.tolerance,
                              name: siteGeofence.name,
                              // Note: siteGeofence.type is the shape (circular/polygon)
                              alertOnEntry: siteGeofence.alertOnEntry,
                              alertOnExit: siteGeofence.alertOnExit,
                            },
                            activeTab
                          );
                        }
                      }}
                    >
                      <Edit className=&apos;h-4 w-4 mr-2&apos; />
                      Edit
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value=&apos;activity&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <div className=&apos;flex items-center justify-between&apos;>
                <CardTitle>
                  {activityTimeRange === &apos;24h&apos; && &apos;24-Hour Activity&apos;}
                  {activityTimeRange === &apos;7d&apos; && &apos;7-Day Activity&apos;}
                  {activityTimeRange === &apos;30d&apos; && &apos;30-Day Activity&apos;}
                  {activityTimeRange === &apos;custom&apos; && &apos;Custom Range Activity&apos;}
                </CardTitle>
                <div className=&apos;flex items-center gap-2&apos;>
                  <Select
                    value={activityTimeRange}
                    onValueChange={(value: any) => setActivityTimeRange(value)}
                  >
                    <SelectTrigger className=&apos;w-40&apos;>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&apos;24h&apos;>24 Hours</SelectItem>
                      <SelectItem value=&apos;7d&apos;>7 Days</SelectItem>
                      <SelectItem value=&apos;30d&apos;>30 Days</SelectItem>
                      <SelectItem value=&apos;custom&apos;>Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activityTimeRange === &apos;custom&apos; && (
                <div className=&apos;space-y-3 mt-4 pt-4 border-t&apos;>
                  <div className=&apos;flex items-center gap-4&apos;>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <Label className=&apos;text-sm&apos;>From:</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant=&apos;outline&apos;
                            size=&apos;sm&apos;
                            className=&apos;w-40 justify-start&apos;
                          >
                            <CalendarIcon className=&apos;mr-2 h-4 w-4&apos; />
                            {customStartDate
                              ? customStartDate.toLocaleDateString()
                              : &apos;Start date&apos;}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className=&apos;w-auto p-0&apos; align=&apos;start&apos;>
                          <Calendar
                            mode=&apos;single&apos;
                            selected={customStartDate}
                            onSelect={date => {
                              setCustomStartDate(date);
                              // If end date is before the new start date, clear it
                              if (
                                date &&
                                customEndDate &&
                                customEndDate < date
                              ) {
                                setCustomEndDate(undefined);
                              }
                            }}
                            disabled={date => date > new Date()}
                            defaultMonth={customStartDate}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className=&apos;flex items-center gap-2&apos;>
                      <Label className=&apos;text-sm&apos;>To:</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant=&apos;outline&apos;
                            size=&apos;sm&apos;
                            className=&apos;w-40 justify-start&apos;
                          >
                            <CalendarIcon className=&apos;mr-2 h-4 w-4&apos; />
                            {customEndDate
                              ? customEndDate.toLocaleDateString()
                              : &apos;End date&apos;}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className=&apos;w-auto p-0&apos; align=&apos;start&apos;>
                          <Calendar
                            mode=&apos;single&apos;
                            selected={customEndDate}
                            onSelect={date => setCustomEndDate(date)}
                            disabled={date => {
                              if (date > new Date()) return true;
                              if (customStartDate && date < customStartDate)
                                return true;
                              return false;
                            }}
                            defaultMonth={customEndDate || customStartDate}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {customStartDate && customEndDate && (
                    <div className=&apos;text-sm text-muted-foreground&apos;>
                      Showing data from {customStartDate.toLocaleDateString()}{&apos; &apos;}
                      to {customEndDate.toLocaleDateString()}(
                      {Math.ceil(
                        (customEndDate.getTime() - customStartDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{&apos; &apos;}
                      days)
                    </div>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {activityTimeRange === &apos;custom&apos; &&
              (!customStartDate || !customEndDate) ? (
                <div className=&apos;h-80 flex items-center justify-center text-muted-foreground&apos;>
                  Please select both start and end dates to view activity data
                </div>
              ) : isLoadingActivity ? (
                <div className=&apos;h-80 space-y-4 p-4&apos;>
                  <Skeleton className=&apos;h-8 w-full&apos; />
                  <Skeleton className=&apos;h-8 w-full&apos; />
                  <Skeleton className=&apos;h-8 w-full&apos; />
                  <Skeleton className=&apos;h-8 w-full&apos; />
                  <Skeleton className=&apos;h-8 w-full&apos; />
                  <Skeleton className=&apos;h-8 w-full&apos; />
                  <Skeleton className=&apos;h-8 w-full&apos; />
                </div>
              ) : activityError ? (
                <div className=&apos;h-80 flex flex-col items-center justify-center gap-4&apos;>
                  <AlertTriangle className=&apos;h-12 w-12 text-destructive&apos; />
                  <p className=&apos;text-destructive&apos;>{activityError}</p>
                  <Button
                    variant=&apos;outline&apos;
                    onClick={() => {
                      // Trigger refetch by toggling state
                      const currentRange = activityTimeRange;
                      setActivityTimeRange(&apos;24h&apos;);
                      setTimeout(() => setActivityTimeRange(currentRange), 0);
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : activityData.length === 0 ? (
                <div className=&apos;h-80 flex items-center justify-center text-muted-foreground&apos;>
                  No activity data available for the selected period
                </div>
              ) : (
                <div className=&apos;h-80&apos;>
                  <ResponsiveContainer width=&apos;100%&apos; height=&apos;100%&apos;>
                    <AreaChart data={activityData}>
                      <CartesianGrid strokeDasharray=&apos;3 3&apos; />
                      <XAxis dataKey=&apos;time&apos; />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type=&apos;monotone&apos;
                        dataKey=&apos;assets&apos;
                        stroke=&apos;#3b82f6&apos;
                        fill=&apos;#3b82f6&apos;
                        fillOpacity={0.2}
                        name=&apos;Assets&apos;
                      />
                      <Area
                        type=&apos;monotone&apos;
                        dataKey=&apos;personnel&apos;
                        stroke=&apos;#8b5cf6&apos;
                        fill=&apos;#8b5cf6&apos;
                        fillOpacity={0.2}
                        name=&apos;Personnel&apos;
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

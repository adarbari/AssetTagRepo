import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Switch } from '../ui/switch';
import { Skeleton } from '../ui/skeleton';
import { PageLayout, StatusBadge, PageHeader, StatsCard } from '../common';
import {
  fetchSiteActivity,
  getPresetDateRange,
  type SiteActivityData,
} from '../../services/api';
import { GeofenceMapEditor } from '../geofences/GeofenceMapEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Users,
  Package,
  Edit,
  Save,
  X,
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Truck,
  Container,
  Navigation,
  Calendar as CalendarIcon,
  Shield,
  Plus,
  Link as LinkIcon,
  BellRing,
} from 'lucide-react';
import {
  LineChart,
  Line,
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
} from 'recharts';
import type { Site as SharedSite, Geofence } from '../../types';

type SiteStatus = 'active' | 'maintenance' | 'inactive';

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
  { name: 'Equipment', value: 95, count: 95, color: '#3b82f6' },
  { name: 'Vehicles', value: 52, count: 52, color: '#22c55e' },
  { name: 'Tools', value: 67, count: 67, color: '#f59e0b' },
  { name: 'Containers', value: 20, count: 20, color: '#8b5cf6' },
];

// Mock recent events
const recentEvents = [
  {
    id: 1,
    type: 'arrival',
    asset: 'Excavator CAT 320',
    assetId: 'AT-42891',
    timestamp: '2 min ago',
    icon: Wrench,
  },
  {
    id: 2,
    type: 'departure',
    asset: 'Delivery Truck F-350',
    assetId: 'AT-78234',
    timestamp: '15 min ago',
    icon: Truck,
  },
  {
    id: 3,
    type: 'arrival',
    asset: 'Tool Container #5',
    assetId: 'AT-33421',
    timestamp: '32 min ago',
    icon: Container,
  },
  {
    id: 4,
    type: 'alert',
    asset: 'Forklift Toyota 8FG',
    assetId: 'AT-55678',
    timestamp: '1 hour ago',
    icon: AlertTriangle,
    message: 'Low battery warning',
  },
  {
    id: 5,
    type: 'departure',
    asset: 'Service Van Mercedes',
    assetId: 'AT-98765',
    timestamp: '2 hours ago',
    icon: Truck,
  },
];

// Mock assets at site
const assetsAtSite = [
  {
    id: 'AT-42891',
    name: 'Excavator CAT 320',
    type: 'equipment',
    battery: 87,
    status: 'active',
    duration: '2 days 4 hrs',
  },
  {
    id: 'AT-78234',
    name: 'Delivery Truck F-350',
    type: 'vehicles',
    battery: 92,
    status: 'idle',
    duration: '5 hrs 23 min',
  },
  {
    id: 'AT-33421',
    name: 'Tool Container #5',
    type: 'containers',
    battery: 78,
    status: 'active',
    duration: '1 day 18 hrs',
  },
  {
    id: 'AT-55678',
    name: 'Forklift Toyota 8FG',
    type: 'equipment',
    battery: 34,
    status: 'active',
    duration: '8 hrs 12 min',
  },
  {
    id: 'AT-11223',
    name: 'Compressor Atlas 225',
    type: 'equipment',
    battery: 65,
    status: 'idle',
    duration: '3 days 2 hrs',
  },
];

export function SiteDetails({
  site: sharedSite,
  onBack,
  onCreateGeofence,
  onEditGeofence,
  onSiteUpdate,
  initialTab = 'overview',
  onTabChange,
}: SiteDetailsProps) {
  // Convert shared site to local format
  const siteData: Site = {
    id: sharedSite.id,
    name: sharedSite.name,
    address:
      sharedSite.address || sharedSite.location || 'Address not available',
    boundary: sharedSite.area || 'Boundary not defined',
    tolerance: sharedSite.tolerance || 50,
    assets: sharedSite.assets || 0,
    personnel: 0, // Not in shared type
    status: sharedSite.status === 'active' ? 'active' : 'inactive',
    lastActivity: 'Unknown', // Not in shared type
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
      operatingHours: '24/7',
      timezone: 'UTC',
      established: '2024',
    },
  };

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSite, setEditedSite] = useState(siteData);
  const [isBoundaryEditing, setIsBoundaryEditing] = useState(false);
  const [activityTimeRange, setActivityTimeRange] = useState<
    '24h' | '7d' | '30d' | 'custom'
  >('24h');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(
    undefined
  );
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(
    undefined
  );
  const [activityData, setActivityData] = useState<SiteActivityData[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [siteGeofence, setSiteGeofence] = useState<Geofence | null>(null);

  // Update editedSite when siteData changes (when navigating between sites)
  useEffect(() => {
    setEditedSite(siteData);
    setIsBoundaryEditing(false);

    // Load associated geofence if it exists
    if (sharedSite.geofenceId) {
      // Fetch geofence from mock data
      import('../../data/mockData').then(({ getGeofenceById }) => {
        const geofence = getGeofenceById(sharedSite.geofenceId!);
        if (geofence) {
          setSiteGeofence(geofence);
        } else {
          // Geofence ID exists but geofence not found, clear it
          setSiteGeofence(null);
        }
      });
    } else {
      setSiteGeofence(null);
    }
  }, [sharedSite.id, sharedSite.geofenceId]);

  // Fetch activity data when time range or custom dates change
  useEffect(() => {
    const fetchActivityData = async () => {
      setIsLoadingActivity(true);
      setActivityError(null);

      try {
        let startDate: Date;
        let endDate: Date;
        let granularity: 'hourly' | 'daily' = 'daily';

        if (activityTimeRange === 'custom') {
          if (!customStartDate || !customEndDate) {
            setActivityData([]);
            setIsLoadingActivity(false);
            return;
          }
          startDate = customStartDate;
          endDate = customEndDate;

          // Determine granularity based on date range
          const daysDiff = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          granularity = daysDiff <= 2 ? 'hourly' : 'daily';
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
        console.error('Error fetching activity data:', error);
        setActivityError('Failed to load activity data. Please try again.');
        setActivityData([]);
      } finally {
        setIsLoadingActivity(false);
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
      case 'arrival':
        return <CheckCircle2 className='h-4 w-4 text-green-600' />;
      case 'departure':
        return <Navigation className='h-4 w-4 text-blue-600' />;
      case 'alert':
        return <AlertTriangle className='h-4 w-4 text-yellow-600' />;
      default:
        return <Activity className='h-4 w-4 text-muted-foreground' />;
    }
  };

  return (
    <PageLayout
      variant='standard'
      padding='lg'
      header={
        <div className='border-b bg-background px-8 py-6'>
          <PageHeader
            title={editedSite.name}
            description={editedSite.id}
            icon={Building2}
            badge={{
              label: editedSite.status,
              variant: editedSite.status === 'active' ? 'default' : 'secondary',
            }}
            onBack={onBack}
            actions={
              <div className='flex items-center gap-2'>
                {isEditing ? (
                  <>
                    <Button variant='outline' onClick={handleCancel}>
                      <X className='h-4 w-4 mr-2' />
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className='h-4 w-4 mr-2' />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className='h-4 w-4 mr-2' />
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
      <div className='grid gap-4 md:grid-cols-4'>
        <StatsCard
          title='Assets On-Site'
          value={editedSite.assets.toString()}
          icon={Package}
          variant='info'
        />
        <StatsCard
          title='Personnel'
          value={editedSite.personnel.toString()}
          icon={Users}
          variant='info'
        />
        <StatsCard
          title='Active Assets'
          value='178'
          icon={Activity}
          variant='success'
        />
        <StatsCard
          title='Utilization'
          value='76%'
          icon={TrendingUp}
          variant='warning'
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
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='assets'>Assets</TabsTrigger>
          <TabsTrigger value='location'>Location & Boundary</TabsTrigger>
          <TabsTrigger value='activity'>Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Site Information */}
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {isEditing ? (
                  <>
                    <div className='space-y-2'>
                      <Label>Site Name</Label>
                      <Input
                        value={editedSite.name}
                        onChange={e =>
                          setEditedSite({ ...editedSite, name: e.target.value })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
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
                    <div className='space-y-2'>
                      <Label>Tolerance (feet)</Label>
                      <Input
                        type='number'
                        value={editedSite.tolerance}
                        onChange={e =>
                          setEditedSite({
                            ...editedSite,
                            tolerance: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
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
                          <SelectItem value='active'>Active</SelectItem>
                          <SelectItem value='maintenance'>
                            Maintenance
                          </SelectItem>
                          <SelectItem value='inactive'>Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className='text-sm text-muted-foreground'>Address</p>
                      <p>{editedSite.address}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className='text-sm text-muted-foreground'>Boundary</p>
                      <p>{editedSite.boundary}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className='text-sm text-muted-foreground'>Tolerance</p>
                      <p>±{editedSite.tolerance} feet</p>
                    </div>
                    <Separator />
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Contact Person
                      </p>
                      <p>{editedSite.details.contactPerson}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className='text-sm text-muted-foreground'>Phone</p>
                      <p>{editedSite.details.phone}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className='text-sm text-muted-foreground'>Email</p>
                      <p>{editedSite.details.email}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Operating Hours
                      </p>
                      <p>{editedSite.details.operatingHours}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className='text-sm text-muted-foreground'>
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
                <div className='h-64'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={assetTypeData}
                        cx='50%'
                        cy='50%'
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey='value'
                      >
                        {assetTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className='bg-background border rounded-lg p-2 shadow-lg'>
                                <p className='font-medium'>{payload[0].name}</p>
                                <p className='text-sm text-muted-foreground'>
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
                <div className='grid grid-cols-2 gap-4 mt-4'>
                  {assetTypeData.map(item => (
                    <div key={item.name} className='flex items-center gap-2'>
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{ backgroundColor: item.color }}
                      />
                      <div className='flex-1'>
                        <p className='text-sm'>{item.name}</p>
                        <p className='text-sm text-muted-foreground'>
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
              <ScrollArea className='h-64'>
                <div className='space-y-4'>
                  {recentEvents.map(event => (
                    <div key={event.id} className='flex items-start gap-4'>
                      <div className='mt-1'>{getEventIcon(event.type)}</div>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <p>{event.asset}</p>
                          <p className='text-sm text-muted-foreground'>
                            {event.timestamp}
                          </p>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {event.assetId}
                        </p>
                        {event.message && (
                          <p className='text-sm text-yellow-600 mt-1'>
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
        <TabsContent value='assets' className='space-y-6'>
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
                        <Badge variant='outline'>{asset.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <div className='w-16 h-2 bg-muted rounded-full overflow-hidden'>
                            <div
                              className={`h-full ${
                                asset.battery > 50
                                  ? 'bg-green-500'
                                  : asset.battery > 20
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${asset.battery}%` }}
                            />
                          </div>
                          <span className='text-sm'>{asset.battery}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={
                            asset.status === 'active'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
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
        <TabsContent value='location' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Site Location & Boundary</CardTitle>
                {!isBoundaryEditing ? (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setIsBoundaryEditing(true)}
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Edit Boundary
                  </Button>
                ) : (
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setEditedSite(siteData);
                        setIsBoundaryEditing(false);
                      }}
                    >
                      <X className='mr-2 h-4 w-4' />
                      Cancel
                    </Button>
                    <Button
                      size='sm'
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
                        import('sonner').then(({ toast }) => {
                          toast.success('Site boundary updated successfully');
                        });

                        setIsBoundaryEditing(false);
                      }}
                    >
                      <Save className='mr-2 h-4 w-4' />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
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
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Shield className='h-5 w-5 text-blue-600' />
                  <CardTitle>Geofence</CardTitle>
                </div>
                {!siteGeofence && onCreateGeofence && (
                  <Button
                    size='sm'
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
                    <Plus className='mr-2 h-4 w-4' />
                    Create Geofence
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!siteGeofence ? (
                <div className='text-center py-6 text-muted-foreground'>
                  <Shield className='h-10 w-10 mx-auto mb-2 opacity-20' />
                  <p className='text-sm'>
                    No geofence configured for this site
                  </p>
                  <p className='text-xs mt-1'>
                    Create a geofence to enable entry/exit alerts
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-3 flex-1'>
                      <div className='flex items-center gap-3'>
                        <h4>{siteGeofence.name}</h4>
                        <Badge
                          variant='outline'
                          className={
                            siteGeofence.status === 'active'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }
                        >
                          {siteGeofence.status}
                        </Badge>
                      </div>

                      <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div>
                          <p className='text-muted-foreground'>Geofence ID</p>
                          <p className='font-mono text-xs'>{siteGeofence.id}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground'>Radius</p>
                          <p>{siteGeofence.radius} feet</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground'>Tolerance</p>
                          <p>±{siteGeofence.tolerance} feet</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-4 text-sm'>
                        <div className='flex items-center gap-1'>
                          {siteGeofence.alertOnEntry ? (
                            <CheckCircle2 className='h-4 w-4 text-green-600' />
                          ) : (
                            <X className='h-4 w-4 text-muted-foreground' />
                          )}
                          <span>Entry alerts</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          {siteGeofence.alertOnExit ? (
                            <CheckCircle2 className='h-4 w-4 text-green-600' />
                          ) : (
                            <X className='h-4 w-4 text-muted-foreground' />
                          )}
                          <span>Exit alerts</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size='sm'
                      variant='outline'
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
                      <Edit className='h-4 w-4 mr-2' />
                      Edit
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value='activity' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>
                  {activityTimeRange === '24h' && '24-Hour Activity'}
                  {activityTimeRange === '7d' && '7-Day Activity'}
                  {activityTimeRange === '30d' && '30-Day Activity'}
                  {activityTimeRange === 'custom' && 'Custom Range Activity'}
                </CardTitle>
                <div className='flex items-center gap-2'>
                  <Select
                    value={activityTimeRange}
                    onValueChange={(value: any) => setActivityTimeRange(value)}
                  >
                    <SelectTrigger className='w-40'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='24h'>24 Hours</SelectItem>
                      <SelectItem value='7d'>7 Days</SelectItem>
                      <SelectItem value='30d'>30 Days</SelectItem>
                      <SelectItem value='custom'>Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activityTimeRange === 'custom' && (
                <div className='space-y-3 mt-4 pt-4 border-t'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                      <Label className='text-sm'>From:</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-40 justify-start'
                          >
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {customStartDate
                              ? customStartDate.toLocaleDateString()
                              : 'Start date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
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

                    <div className='flex items-center gap-2'>
                      <Label className='text-sm'>To:</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-40 justify-start'
                          >
                            <CalendarIcon className='mr-2 h-4 w-4' />
                            {customEndDate
                              ? customEndDate.toLocaleDateString()
                              : 'End date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
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
                    <div className='text-sm text-muted-foreground'>
                      Showing data from {customStartDate.toLocaleDateString()}{' '}
                      to {customEndDate.toLocaleDateString()}(
                      {Math.ceil(
                        (customEndDate.getTime() - customStartDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days)
                    </div>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {activityTimeRange === 'custom' &&
              (!customStartDate || !customEndDate) ? (
                <div className='h-80 flex items-center justify-center text-muted-foreground'>
                  Please select both start and end dates to view activity data
                </div>
              ) : isLoadingActivity ? (
                <div className='h-80 space-y-4 p-4'>
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ) : activityError ? (
                <div className='h-80 flex flex-col items-center justify-center gap-4'>
                  <AlertTriangle className='h-12 w-12 text-destructive' />
                  <p className='text-destructive'>{activityError}</p>
                  <Button
                    variant='outline'
                    onClick={() => {
                      // Trigger refetch by toggling state
                      const currentRange = activityTimeRange;
                      setActivityTimeRange('24h');
                      setTimeout(() => setActivityTimeRange(currentRange), 0);
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : activityData.length === 0 ? (
                <div className='h-80 flex items-center justify-center text-muted-foreground'>
                  No activity data available for the selected period
                </div>
              ) : (
                <div className='h-80'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={activityData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='time' />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type='monotone'
                        dataKey='assets'
                        stroke='#3b82f6'
                        fill='#3b82f6'
                        fillOpacity={0.2}
                        name='Assets'
                      />
                      <Area
                        type='monotone'
                        dataKey='personnel'
                        stroke='#8b5cf6'
                        fill='#8b5cf6'
                        fillOpacity={0.2}
                        name='Personnel'
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

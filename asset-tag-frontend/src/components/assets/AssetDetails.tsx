import React, { useState, useRef, useEffect } from &apos;react&apos;;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &apos;../ui/tabs&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import { ScrollArea } from &apos;../ui/scroll-area&apos;;
import { LoadingState, AlertCard, PageLayout, StatusBadge } from &apos;../common&apos;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &apos;../ui/table&apos;;
import { ExportDialog } from &apos;../reports/ExportDialog&apos;;
import { mockAssets, getAssetById } from &apos;../../data/mockData&apos;;
import QRCode from &apos;qrcode&apos;;
import { EditMaintenanceDialog } from &apos;../maintenance/EditMaintenanceDialog&apos;;
import { toast } from &apos;sonner&apos;;
import { useNavigation } from &apos;../../contexts/NavigationContext&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import {
  ArrowLeft,
  MapPin,
  Battery,
  Clock,
  Activity,
  AlertTriangle,
  Calendar,
  Download,
  Edit,
  Wrench,
  Truck,
  Package as PackageIcon,
  Container,
  Navigation,
  TrendingUp,
  CheckCircle2,
  Circle,
  Route,
  LogIn,
  LogOut,
  History,
  ArrowRight,
  Loader2,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
} from &apos;lucide-react&apos;;
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from &apos;recharts&apos;;
import type { Asset } from &apos;../types&apos;;
import {
  useBatteryHistory,
  useLocationHistory,
  useActivityLog,
  useMaintenanceSchedule,
  useAssetAlerts,
  useAssetMutations,
} from &apos;../../hooks/useAssetDetails&apos;;
import {
  assetTypes,
  assetStatuses,
  getOptionValue,
} from &apos;../../data/dropdownOptions&apos;;

interface AssetDetailsProps {
  asset: Asset;
  onBack: () => void;
  onShowOnMap?: (asset: Asset) => void;
  onViewHistoricalPlayback?: (asset: Asset) => void;
  onAssetUpdate?: (updates: Partial<Asset>) => void;
}

// Helper function to map alert category to AlertType
function mapAlertCategoryToType(category: string): string {
  const mapping: Record<string, string> = {
    Battery: &apos;battery&apos;,
    Geofence: &apos;unauthorized-zone&apos;,
    Maintenance: &apos;predictive-maintenance&apos;,
    Anomaly: &apos;theft&apos;,
    Theft: &apos;theft&apos;,
    Temperature: &apos;predictive-maintenance&apos;,
    Offline: &apos;offline&apos;,
    Movement: &apos;theft&apos;,
  };
  return mapping[category] || &apos;compliance&apos;;
}

export function AssetDetails({
  asset,
  onBack,
  onShowOnMap,
  onViewHistoricalPlayback,
  onAssetUpdate,
}: AssetDetailsProps) {
  // Component state
  const navigation = useNavigation();
  const [currentAsset, setCurrentAsset] = useState<Asset>(asset);
  const [activeTab, setActiveTab] = useState(&apos;overview&apos;);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditMaintenanceOpen, setIsEditMaintenanceOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: asset.name,
    type: asset.type,
    status: asset.status,
    manufacturer: asset.manufacturer || &apos;&apos;,
    model: asset.model || &apos;&apos;,
    serialNumber: asset.serialNumber || &apos;&apos;,
    assignedTo: asset.assignedTo || &apos;&apos;,
  });

  // Fetch asset data using hooks
  const batteryData = useBatteryHistory(asset.id, { days: 1 });
  const locationData = useLocationHistory(asset.id, { days: 2 });
  const activityData = useActivityLog(asset.id, { pageSize: 50 });
  const maintenanceData = useMaintenanceSchedule(asset.id);
  const alertData = useAssetAlerts(asset.id);
  const { updateAsset, loading: updateLoading } = useAssetMutations(asset.id);

  // Extract data with fallbacks
  const batteryHistory = batteryData.data?.dataPoints || [];
  const fullLocationHistory = locationData.data?.trackingPoints || [];
  const locationHistory = fullLocationHistory.slice(0, 6); // Summary view
  const activityLog = activityData.data?.entries || [];
  const upcomingMaintenance = maintenanceData.data?.upcoming || [];
  const maintenanceRecords = maintenanceData.data?.history || [];
  const alerts = alertData.data?.alerts || [];

  // Loading state
  const isLoading =
    batteryData.loading ||
    locationData.loading ||
    activityData.loading ||
    maintenanceData.loading ||
    alertData.loading;

  // Update local asset state when prop changes
  useEffect(() => {
    setCurrentAsset(asset);
    setEditForm({
      name: asset.name,
      type: asset.type,
      status: asset.status,
      manufacturer: asset.manufacturer || &apos;&apos;,
      model: asset.model || &apos;&apos;,
      serialNumber: asset.serialNumber || &apos;&apos;,
      assignedTo: asset.assignedTo || &apos;&apos;,
    });
  }, [asset]);

  const handleEditModeToggle = () => {
    if (isEditMode) {
      // Cancel edit, reset form
      setEditForm({
        name: currentAsset.name,
        type: currentAsset.type,
        status: currentAsset.status,
        manufacturer: currentAsset.manufacturer || &apos;&apos;,
        model: currentAsset.model || &apos;&apos;,
        serialNumber: currentAsset.serialNumber || &apos;&apos;,
        assignedTo: currentAsset.assignedTo || &apos;&apos;,
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveChanges = async () => {
    try {
      const updatedAsset = await updateAsset(editForm);
      setCurrentAsset(updatedAsset);
      setIsEditMode(false);

      // Also update mock data for consistency across components
      const assetIndex = mockAssets.findIndex(a => a.id === asset.id);
      if (assetIndex !== -1) {
        Object.assign(mockAssets[assetIndex], updatedAsset);
      }

      toast.success(&apos;Asset updated successfully&apos;);
    } catch (error) {
      toast.error(&apos;Failed to update asset&apos;);
// // // // // // console.error(&apos;Error updating asset:&apos;, error);
    }
  };

  // Handler for after check-in/out completes in embedded view
  const handleCheckInOutComplete = (updates: Partial<Asset>) => {
// // // // // // console.log(&apos;🔄 handleCheckInOutComplete called with updates:&apos;, updates);
// // // // // // console.log(&apos;🔄 Current asset status before update:&apos;, currentAsset.status);

    // Refresh the asset from the mock data layer to get the latest state
    const refreshedAsset = getAssetById(currentAsset.id);
// // // // // // console.log(&apos;🔄 Refreshed asset from mock data:&apos;, refreshedAsset);

    if (refreshedAsset) {
// // // // // // console.log(
        &apos;✅ Updating asset state with refreshed data, new status:&apos;,
        refreshedAsset.status
      );
      setCurrentAsset(refreshedAsset);
      // Also update the edit form to reflect the new status
      setEditForm(prev => ({
        ...prev,
        status: refreshedAsset.status,
        assignedTo: refreshedAsset.assignedTo || &apos;&apos;,
      }));
    } else {
// // // // // // console.log(&apos;⚠️ Asset not found in mock data, using fallback update&apos;);
      // Fallback: update local state if asset not found in mock data
      const updatedAsset = { ...currentAsset, ...updates };
// // // // // // console.log(
        &apos;✅ Updating asset state with fallback data, new status:&apos;,
        updatedAsset.status
      );
      setCurrentAsset(updatedAsset);
      setEditForm(prev => ({
        ...prev,
        status: updatedAsset.status,
        assignedTo: updatedAsset.assignedTo || &apos;&apos;,
      }));
    }
  };

  // Adapt the asset to the format expected by this component&apos;s UI
  const mockAsset = {
    id: currentAsset.id,
    name: currentAsset.name,
    type: currentAsset.type as any,
    status: currentAsset.status as any,
    battery: currentAsset.battery,
    lastUpdate: currentAsset.lastSeen,
    location: {
      lat: currentAsset.coordinates?.[0] || 37.7749,
      lng: currentAsset.coordinates?.[1] || -122.4194,
      address: currentAsset.location,
      site: currentAsset.site || &apos;Unknown&apos;,
    },
    specifications: {
      manufacturer: currentAsset.manufacturer || &apos;N/A&apos;,
      model: currentAsset.model || &apos;N/A&apos;,
      serialNumber: currentAsset.serialNumber || &apos;N/A&apos;,
      yearOfManufacture: currentAsset.purchaseDate?.split(&apos;-&apos;)[0] || &apos;N/A&apos;,
      purchaseDate: currentAsset.purchaseDate || &apos;N/A&apos;,
      warrantyExpiry: currentAsset.warrantyExpiry || &apos;N/A&apos;,
    },
    assignedTo: currentAsset.assignedTo || &apos;Unassigned&apos;,
    costCenter: &apos;CC-001 - Construction Division&apos;,
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case &apos;equipment&apos;:
        return <Wrench className=&apos;h-5 w-5&apos; />;
      case &apos;vehicles&apos;:
        return <Truck className=&apos;h-5 w-5&apos; />;
      case &apos;tools&apos;:
        return <PackageIcon className=&apos;h-5 w-5&apos; />;
      case &apos;containers&apos;:
        return <Container className=&apos;h-5 w-5&apos; />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case &apos;location&apos;:
        return <MapPin className=&apos;h-4 w-4 text-blue-600&apos; />;
      case &apos;status&apos;:
        return <Activity className=&apos;h-4 w-4 text-purple-600&apos; />;
      case &apos;checkout&apos;:
      case &apos;checkin&apos;:
        return <CheckCircle2 className=&apos;h-4 w-4 text-green-600&apos; />;
      case &apos;maintenance&apos;:
        return <Wrench className=&apos;h-4 w-4 text-orange-600&apos; />;
      case &apos;alert&apos;:
        return <AlertTriangle className=&apos;h-4 w-4 text-red-600&apos; />;
      default:
        return <Circle className=&apos;h-4 w-4 text-gray-600&apos; />;
    }
  };

  // QR Code Component
  const QRCodeComponent = ({
    value,
    assetId,
    assetName,
  }: {
    value: string;
    assetId: string;
    assetName: string;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (!canvasRef.current) return;

      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: 160,
          margin: 1,
          color: {
            dark: &apos;#000000&apos;,
            light: &apos;#FFFFFF&apos;,
          },
        },
        (error: Error | null | undefined) => {
          if (error) // // // // // console.error(&apos;QR Code generation error:&apos;, error);
        }
      );
    }, [value]);

    return (
      <div className=&apos;flex flex-col items-center gap-2&apos;>
        <canvas ref={canvasRef} />
        <div className=&apos;text-center&apos;>
          <p className=&apos;text-xs font-mono&apos;>{assetId}</p>
          <p className=&apos;text-xs text-muted-foreground&apos;>{assetName}</p>
        </div>
      </div>
    );
  };

  // Download QR Code as PNG
  const downloadQRCode = async (assetId: string, assetName: string) => {
    try {
      const url = `https://assettrack.example.com/assets/${assetId}`;

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: &apos;#000000&apos;,
          light: &apos;#FFFFFF&apos;,
        },
      });

      // Create a temporary link and trigger download
      const link = document.createElement(&apos;a&apos;);
      link.download = `${assetId}_${assetName.replace(/\s+/g, &apos;_&apos;)}_QRCode.png`;
      link.href = qrDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(&apos;QR code downloaded successfully&apos;);
    } catch (error) {
// // // // // // console.error(&apos;Error downloading QR code:&apos;, error);
      toast.error(&apos;Failed to download QR code&apos;);
    }
  };

  // Show loading state while initial data is being fetched
  if (isLoading && !batteryHistory.length && !activityLog.length) {
    return <LoadingState message=&apos;Loading asset details...&apos; fullScreen />;
  }

  return (
    <PageLayout
      variant=&apos;standard&apos;
      padding=&apos;md&apos;
      header={
        <div className=&apos;border-b bg-background px-8 py-4&apos;>
          <div className=&apos;flex items-center justify-between&apos;>
            <div className=&apos;flex items-center gap-4&apos;>
              <Button variant=&apos;ghost&apos; size=&apos;icon&apos; onClick={onBack}>
                <ArrowLeft className=&apos;h-5 w-5&apos; />
              </Button>
              <div className=&apos;flex items-center gap-3&apos;>
                {getAssetIcon(currentAsset.type)}
                <div>
                  {isEditMode ? (
                    <Input
                      value={editForm.name}
                      onChange={e =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className=&apos;h-8 max-w-xs&apos;
                    />
                  ) : (
                    <h1>{currentAsset.name}</h1>
                  )}
                  <p className=&apos;text-muted-foreground&apos;>
                    Asset ID: {currentAsset.id}
                  </p>
                </div>
              </div>
            </div>
            <div className=&apos;flex items-center gap-2&apos;>
              <StatusBadge status={currentAsset.status} />
              {!isEditMode && (
                <>
                  {/* Conditionally show Check Out button for assets that can be checked out */}
                  {(() => {
                    const canCheckOut =
                      currentAsset.status === &apos;active&apos; ||
                      currentAsset.status === &apos;inactive&apos; ||
                      currentAsset.status === &apos;maintenance&apos;;
// // // // // // console.log(
                      &apos;🔴 Check Out button logic - Asset status:&apos;,
                      currentAsset.status,
                      &apos;Can check out:&apos;,
                      canCheckOut
                    );
                    return canCheckOut;
                  })() && (
                    <Button
                      variant=&apos;default&apos;
                      size=&apos;sm&apos;
                      onClick={() => {
// // // // // // console.log(&apos;🔴 Check Out button clicked!&apos;);
                        navigation.navigateToCheckInOut({
                          assetId: currentAsset.id,
                          assetName: currentAsset.name,
                          currentStatus: currentAsset.status,
                          mode: &apos;check-out&apos;,
                          assetContext: currentAsset,
                          onComplete: (updates: Partial<Asset>) => {
                            handleCheckInOutComplete(updates);
                            // Also notify parent component to update selectedAsset
                            if (onAssetUpdate) {
                              onAssetUpdate(updates);
                            }
                          },
                        });
                      }}
                    >
                      <LogOut className=&apos;h-4 w-4 mr-2&apos; />
                      Check Out
                    </Button>
                  )}
                  {/* Conditionally show Check In button for checked-out assets */}
                  {(() => {
                    const canCheckIn = currentAsset.status === &apos;checked-out&apos;;
// // // // // // console.log(
                      &apos;🟢 Check In button logic - Asset status:&apos;,
                      currentAsset.status,
                      &apos;Can check in:&apos;,
                      canCheckIn
                    );
                    return canCheckIn;
                  })() && (
                    <Button
                      variant=&apos;default&apos;
                      size=&apos;sm&apos;
                      onClick={() => {
// // // // // // console.log(&apos;🟢 Check In button clicked!&apos;);
                        navigation.navigateToCheckInOut({
                          assetId: currentAsset.id,
                          assetName: currentAsset.name,
                          currentStatus: currentAsset.status,
                          mode: &apos;check-in&apos;,
                          assetContext: currentAsset,
                          onComplete: (updates: Partial<Asset>) => {
                            handleCheckInOutComplete(updates);
                            // Also notify parent component to update selectedAsset
                            if (onAssetUpdate) {
                              onAssetUpdate(updates);
                            }
                          },
                        });
                      }}
                    >
                      <LogIn className=&apos;h-4 w-4 mr-2&apos; />
                      Check In
                    </Button>
                  )}
                  {/* Note: No check-in/out button shown for &apos;in-transit&apos; status */}
                </>
              )}
              {isEditMode ? (
                <>
                  <Button
                    variant=&apos;outline&apos;
                    size=&apos;sm&apos;
                    onClick={handleEditModeToggle}
                    disabled={updateLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant=&apos;default&apos;
                    size=&apos;sm&apos;
                    onClick={handleSaveChanges}
                    disabled={updateLoading}
                  >
                    {updateLoading && (
                      <Loader2 className=&apos;mr-2 h-4 w-4 animate-spin&apos; />
                    )}
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant=&apos;outline&apos;
                    size=&apos;sm&apos;
                    onClick={handleEditModeToggle}
                  >
                    <Edit className=&apos;h-4 w-4 mr-2&apos; />
                    Edit
                  </Button>
                  <Button
                    variant=&apos;outline&apos;
                    size=&apos;sm&apos;
                    onClick={() => setIsExportOpen(true)}
                  >
                    <Download className=&apos;h-4 w-4 mr-2&apos; />
                    Export
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      }
    >
      {/* Quick Stats */}
      <div className=&apos;grid gap-4 md:grid-cols-4&apos;>
        <Card>
          <CardContent className=&apos;pt-6&apos;>
            <div className=&apos;flex items-center justify-between&apos;>
              <div>
                <p className=&apos;text-sm text-muted-foreground&apos;>Battery Level</p>
                <div className=&apos;flex items-baseline gap-2 mt-1&apos;>
                  <span className=&apos;text-2xl&apos;>{mockAsset.battery}%</span>
                </div>
              </div>
              <Battery
                className={`h-8 w-8 ${mockAsset.battery < 20 ? &apos;text-red-600&apos; : &apos;text-green-600&apos;}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&apos;pt-6&apos;>
            <div className=&apos;flex items-center justify-between&apos;>
              <div>
                <p className=&apos;text-sm text-muted-foreground&apos;>Last Update</p>
                <div className=&apos;flex items-baseline gap-2 mt-1&apos;>
                  <span className=&apos;text-2xl&apos;>{mockAsset.lastUpdate}</span>
                </div>
              </div>
              <Clock className=&apos;h-8 w-8 text-blue-600&apos; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&apos;pt-6&apos;>
            <div className=&apos;flex items-center justify-between&apos;>
              <div>
                <p className=&apos;text-sm text-muted-foreground&apos;>Current Site</p>
                <div className=&apos;flex items-baseline gap-2 mt-1&apos;>
                  <span className=&apos;text-lg&apos;>{mockAsset.location.site}</span>
                </div>
              </div>
              <MapPin className=&apos;h-8 w-8 text-purple-600&apos; />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className=&apos;pt-6&apos;>
            <div className=&apos;flex items-center justify-between&apos;>
              <div className=&apos;flex-1&apos;>
                <p className=&apos;text-sm text-muted-foreground&apos;>Assigned To</p>
                {isEditMode ? (
                  <Input
                    value={editForm.assignedTo}
                    onChange={e =>
                      setEditForm({ ...editForm, assignedTo: e.target.value })
                    }
                    className=&apos;h-8 mt-1&apos;
                    placeholder=&apos;Assigned To&apos;
                  />
                ) : (
                  <div className=&apos;flex items-baseline gap-2 mt-1&apos;>
                    <span className=&apos;text-lg&apos;>{mockAsset.assignedTo}</span>
                  </div>
                )}
              </div>
              <Activity className=&apos;h-8 w-8 text-orange-600 ml-2&apos; />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className=&apos;space-y-4&apos;
      >
        <TabsList>
          <TabsTrigger value=&apos;overview&apos;>Overview</TabsTrigger>
          <TabsTrigger value=&apos;history&apos;>Track History</TabsTrigger>
          <TabsTrigger value=&apos;activity&apos;>Activity Log</TabsTrigger>
          <TabsTrigger value=&apos;maintenance&apos;>Maintenance</TabsTrigger>
          <TabsTrigger value=&apos;alerts&apos;>Alerts</TabsTrigger>
          <TabsTrigger value=&apos;notifications&apos;>Notifications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value=&apos;overview&apos; className=&apos;space-y-6&apos;>
          <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
            <Card>
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent className=&apos;space-y-4&apos;>
                <div className=&apos;space-y-3&apos;>
                  <div className=&apos;flex justify-between items-center&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Status
                    </span>
                    {isEditMode ? (
                      <Select
                        value={getOptionValue(assetStatuses, editForm.status)}
                        onValueChange={value => {
                          const statusValue =
                            assetStatuses.find(s => s.value === value)?.value ||
                            value;
                          setEditForm({ ...editForm, status: statusValue });
                        }}
                      >
                        <SelectTrigger className=&apos;w-[180px] h-8&apos;>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {assetStatuses.map(assetStatus => (
                            <SelectItem
                              key={assetStatus.value}
                              value={assetStatus.value}
                            >
                              {assetStatus.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={currentAsset.status} />
                    )}
                  </div>
                  <Separator />
                  <div className=&apos;flex justify-between items-center&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Asset Type
                    </span>
                    {isEditMode ? (
                      <Select
                        value={getOptionValue(assetTypes, editForm.type)}
                        onValueChange={value => {
                          const typeLabel =
                            assetTypes.find(t => t.value === value)?.label ||
                            value;
                          setEditForm({ ...editForm, type: typeLabel });
                        }}
                      >
                        <SelectTrigger className=&apos;w-[180px] h-8&apos;>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {assetTypes.map(assetType => (
                            <SelectItem
                              key={assetType.value}
                              value={assetType.value}
                            >
                              {assetType.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className=&apos;text-sm capitalize&apos;>
                        {mockAsset.type}
                      </span>
                    )}
                  </div>
                  <Separator />
                  <div className=&apos;flex justify-between items-center&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Manufacturer
                    </span>
                    {isEditMode ? (
                      <Input
                        value={editForm.manufacturer}
                        onChange={e =>
                          setEditForm({
                            ...editForm,
                            manufacturer: e.target.value,
                          })
                        }
                        className=&apos;w-[180px] h-8&apos;
                        placeholder=&apos;Manufacturer&apos;
                      />
                    ) : (
                      <span className=&apos;text-sm&apos;>
                        {mockAsset.specifications.manufacturer}
                      </span>
                    )}
                  </div>
                  <Separator />
                  <div className=&apos;flex justify-between items-center&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>Model</span>
                    {isEditMode ? (
                      <Input
                        value={editForm.model}
                        onChange={e =>
                          setEditForm({ ...editForm, model: e.target.value })
                        }
                        className=&apos;w-[180px] h-8&apos;
                        placeholder=&apos;Model&apos;
                      />
                    ) : (
                      <span className=&apos;text-sm&apos;>
                        {mockAsset.specifications.model}
                      </span>
                    )}
                  </div>
                  <Separator />
                  <div className=&apos;flex justify-between items-center&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Serial Number
                    </span>
                    {isEditMode ? (
                      <Input
                        value={editForm.serialNumber}
                        onChange={e =>
                          setEditForm({
                            ...editForm,
                            serialNumber: e.target.value,
                          })
                        }
                        className=&apos;w-[180px] h-8 font-mono&apos;
                        placeholder=&apos;Serial Number&apos;
                      />
                    ) : (
                      <span className=&apos;text-sm font-mono&apos;>
                        {mockAsset.specifications.serialNumber}
                      </span>
                    )}
                  </div>
                  <Separator />
                  <div className=&apos;flex justify-between&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Year of Manufacture
                    </span>
                    <span className=&apos;text-sm&apos;>
                      {mockAsset.specifications.yearOfManufacture}
                    </span>
                  </div>
                  <Separator />
                  <div className=&apos;flex justify-between&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Purchase Date
                    </span>
                    <span className=&apos;text-sm&apos;>
                      {mockAsset.specifications.purchaseDate}
                    </span>
                  </div>
                  <Separator />
                  <div className=&apos;flex justify-between&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Warranty Expiry
                    </span>
                    <span className=&apos;text-sm&apos;>
                      {mockAsset.specifications.warrantyExpiry}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Location</CardTitle>
              </CardHeader>
              <CardContent className=&apos;space-y-4&apos;>
                <div className=&apos;space-y-3&apos;>
                  <div className=&apos;flex justify-between&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Address
                    </span>
                    <span className=&apos;text-sm text-right&apos;>
                      {mockAsset.location.address}
                    </span>
                  </div>
                  <Separator />
                  <div className=&apos;flex justify-between&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Coordinates
                    </span>
                    <span className=&apos;text-sm font-mono&apos;>
                      {mockAsset.location.lat.toFixed(4)},{&apos; &apos;}
                      {mockAsset.location.lng.toFixed(4)}
                    </span>
                  </div>
                  <Separator />
                  <div className=&apos;flex justify-between&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>Site</span>
                    <span className=&apos;text-sm&apos;>{mockAsset.location.site}</span>
                  </div>
                  <Separator />
                  <div className=&apos;flex justify-between&apos;>
                    <span className=&apos;text-sm text-muted-foreground&apos;>
                      Cost Center
                    </span>
                    <span className=&apos;text-sm&apos;>{mockAsset.costCenter}</span>
                  </div>
                </div>
                <div className=&apos;pt-4&apos;>
                  <Button
                    variant=&apos;outline&apos;
                    className=&apos;w-full&apos;
                    onClick={() => onShowOnMap?.(asset)}
                  >
                    <Navigation className=&apos;h-4 w-4 mr-2&apos; />
                    View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Availability Card */}
            {(currentAsset.hourlyRate !== undefined ||
              currentAsset.availability) && (
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Availability</CardTitle>
                </CardHeader>
                <CardContent className=&apos;space-y-4&apos;>
                  <div className=&apos;space-y-3&apos;>
                    {currentAsset.hourlyRate !== undefined && (
                      <>
                        <div className=&apos;flex justify-between&apos;>
                          <span className=&apos;text-sm text-muted-foreground&apos;>
                            Hourly Rate
                          </span>
                          <span className=&apos;text-sm&apos;>
                            ${currentAsset.hourlyRate.toFixed(2)} / hour
                          </span>
                        </div>
                        <Separator />
                      </>
                    )}
                    {currentAsset.availability && (
                      <>
                        <div className=&apos;flex justify-between items-center&apos;>
                          <span className=&apos;text-sm text-muted-foreground&apos;>
                            Availability
                          </span>
                          <Badge
                            variant=&apos;outline&apos;
                            className={
                              currentAsset.availability === &apos;available&apos;
                                ? &apos;bg-green-100 text-green-700 border-green-200&apos;
                                : currentAsset.availability === &apos;assigned&apos; ||
                                    currentAsset.availability === &apos;in-use&apos;
                                  ? &apos;bg-blue-100 text-blue-700 border-blue-200&apos;
                                  : currentAsset.availability === &apos;maintenance&apos;
                                    ? &apos;bg-orange-100 text-orange-700 border-orange-200&apos;
                                    : &apos;bg-gray-100 text-gray-700 border-gray-200&apos;
                            }
                          >
                            {currentAsset.availability === &apos;in-use&apos;
                              ? &apos;In Use&apos;
                              : currentAsset.availability === &apos;assigned&apos;
                                ? &apos;Assigned to Job&apos;
                                : currentAsset.availability
                                    .charAt(0)
                                    .toUpperCase() +
                                  currentAsset.availability.slice(1)}
                          </Badge>
                        </div>
                        <Separator />
                      </>
                    )}
                    {currentAsset.assignedJobId && (
                      <>
                        <div className=&apos;flex justify-between&apos;>
                          <span className=&apos;text-sm text-muted-foreground&apos;>
                            Assigned Job
                          </span>
                          <span className=&apos;text-sm&apos;>
                            {currentAsset.assignedJobName ||
                              currentAsset.assignedJobId}
                          </span>
                        </div>
                        {(currentAsset.assignmentStartDate ||
                          currentAsset.assignmentEndDate) && (
                          <>
                            <Separator />
                            <div className=&apos;space-y-2&apos;>
                              <span className=&apos;text-sm text-muted-foreground&apos;>
                                Assignment Period
                              </span>
                              <div className=&apos;flex flex-col gap-1&apos;>
                                {currentAsset.assignmentStartDate && (
                                  <div className=&apos;flex items-center gap-2 text-sm&apos;>
                                    <Clock className=&apos;h-3.5 w-3.5 text-muted-foreground&apos; />
                                    <span className=&apos;text-muted-foreground&apos;>
                                      From:
                                    </span>
                                    <span>
                                      {new Date(
                                        currentAsset.assignmentStartDate
                                      ).toLocaleDateString()}{&apos; &apos;}
                                      {new Date(
                                        currentAsset.assignmentStartDate
                                      ).toLocaleTimeString([], {
                                        hour: &apos;2-digit&apos;,
                                        minute: &apos;2-digit&apos;,
                                      })}
                                    </span>
                                  </div>
                                )}
                                {currentAsset.assignmentEndDate && (
                                  <div className=&apos;flex items-center gap-2 text-sm&apos;>
                                    <Clock className=&apos;h-3.5 w-3.5 text-muted-foreground&apos; />
                                    <span className=&apos;text-muted-foreground&apos;>
                                      To:
                                    </span>
                                    <span>
                                      {new Date(
                                        currentAsset.assignmentEndDate
                                      ).toLocaleDateString()}{&apos; &apos;}
                                      {new Date(
                                        currentAsset.assignmentEndDate
                                      ).toLocaleTimeString([], {
                                        hour: &apos;2-digit&apos;,
                                        minute: &apos;2-digit&apos;,
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Battery History (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width=&apos;100%&apos; height={200}>
                <AreaChart data={batteryHistory}>
                  <CartesianGrid
                    strokeDasharray=&apos;3 3&apos;
                    className=&apos;stroke-muted&apos;
                  />
                  <XAxis dataKey=&apos;time&apos; className=&apos;text-xs&apos; />
                  <YAxis className=&apos;text-xs&apos; domain={[0, 100]} />
                  <Tooltip />
                  <Area
                    type=&apos;monotone&apos;
                    dataKey=&apos;battery&apos;
                    stroke=&apos;hsl(var(--chart-2))&apos;
                    fill=&apos;hsl(var(--chart-2))&apos;
                    fillOpacity={0.6}
                    name=&apos;Battery %&apos;
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className=&apos;space-y-2&apos;>
                {/* Show Check Out button only for active, inactive, or maintenance status */}
                {(currentAsset.status === &apos;active&apos; ||
                  currentAsset.status === &apos;inactive&apos; ||
                  currentAsset.status === &apos;maintenance&apos;) && (
                  <Button
                    variant=&apos;outline&apos;
                    className=&apos;w-full justify-start&apos;
                    onClick={() => {
// // // // // // console.log(&apos;🔴 Quick Actions Check Out button clicked!&apos;);
                      navigation.navigateToCheckInOut({
                        assetId: currentAsset.id,
                        assetName: currentAsset.name,
                        currentStatus: currentAsset.status,
                        mode: &apos;check-out&apos;,
                        assetContext: currentAsset,
                        onComplete: (updates: Partial<Asset>) => {
                          handleCheckInOutComplete(updates);
                          // Also notify parent component to update selectedAsset
                          if (onAssetUpdate) {
                            onAssetUpdate(updates);
                          }
                        },
                      });
                    }}
                  >
                    <LogOut className=&apos;h-4 w-4 mr-2&apos; />
                    Check Out Asset
                  </Button>
                )}
                {/* Show Check In button only for checked-out status */}
                {currentAsset.status === &apos;checked-out&apos; && (
                  <Button
                    variant=&apos;outline&apos;
                    className=&apos;w-full justify-start&apos;
                    onClick={() => {
// // // // // // console.log(&apos;🟢 Quick Actions Check In button clicked!&apos;);
                      navigation.navigateToCheckInOut({
                        assetId: currentAsset.id,
                        assetName: currentAsset.name,
                        currentStatus: currentAsset.status,
                        mode: &apos;check-in&apos;,
                        assetContext: currentAsset,
                        onComplete: (updates: Partial<Asset>) => {
                          handleCheckInOutComplete(updates);
                          // Also notify parent component to update selectedAsset
                          if (onAssetUpdate) {
                            onAssetUpdate(updates);
                          }
                        },
                      });
                    }}
                  >
                    <LogIn className=&apos;h-4 w-4 mr-2&apos; />
                    Check In Asset
                  </Button>
                )}
                {/* Show Schedule Maintenance for all statuses except maintenance */}
                {currentAsset.status !== &apos;maintenance&apos; && (
                  <Button
                    variant=&apos;outline&apos;
                    className=&apos;w-full justify-start&apos;
                    onClick={() => {
                      navigation.navigateToCreateMaintenance({
                        preSelectedAsset: currentAsset.id,
                        preSelectedAssetName: currentAsset.name,
                        assetContext: currentAsset,
                      });
                    }}
                  >
                    <Wrench className=&apos;h-4 w-4 mr-2&apos; />
                    Schedule Maintenance
                  </Button>
                )}
                {/* Report Issue is available for all statuses */}
                <Button
                  variant=&apos;outline&apos;
                  className=&apos;w-full justify-start&apos;
                  onClick={() => {
                    navigation.navigateToReportIssue({
                      assetId: currentAsset.id,
                      assetName: currentAsset.name,
                      assetContext: currentAsset,
                    });
                  }}
                >
                  <AlertTriangle className=&apos;h-4 w-4 mr-2&apos; />
                  Report Issue
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset QR Code</CardTitle>
              </CardHeader>
              <CardContent className=&apos;flex flex-col items-center justify-center py-4&apos;>
                <div
                  ref={qrCodeRef}
                  className=&apos;w-48 h-48 bg-white p-4 flex items-center justify-center rounded-lg mb-4 border-2 border-border&apos;
                >
                  <QRCodeComponent
                    value={`https://assettrack.example.com/assets/${mockAsset.id}`}
                    assetId={mockAsset.id}
                    assetName={mockAsset.name}
                  />
                </div>
                <p className=&apos;text-sm text-muted-foreground mb-3&apos;>
                  Scan to view asset details
                </p>
                <div className=&apos;flex gap-2&apos;>
                  <Button
                    variant=&apos;outline&apos;
                    size=&apos;sm&apos;
                    onClick={() => downloadQRCode(mockAsset.id, mockAsset.name)}
                  >
                    <Download className=&apos;h-4 w-4 mr-2&apos; />
                    Download QR Code
                  </Button>
                  <Button
                    variant=&apos;outline&apos;
                    size=&apos;sm&apos;
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://assettrack.example.com/assets/${mockAsset.id}`
                      );
                      toast.success(&apos;QR code link copied to clipboard&apos;);
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Track History Tab */}
        <TabsContent value=&apos;history&apos; className=&apos;space-y-6&apos;>
          {/* Quick Stats */}
          <div className=&apos;grid gap-4 md:grid-cols-4&apos;>
            <Card>
              <CardContent className=&apos;pt-6&apos;>
                <div className=&apos;flex items-center justify-between&apos;>
                  <div className=&apos;flex-1&apos;>
                    <p className=&apos;text-sm text-muted-foreground&apos;>
                      Distance (24h)
                    </p>
                    <div className=&apos;text-2xl mt-1&apos;>15.8 mi</div>
                  </div>
                  <Route className=&apos;h-8 w-8 text-blue-600&apos; />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className=&apos;pt-6&apos;>
                <div className=&apos;flex items-center justify-between&apos;>
                  <div className=&apos;flex-1&apos;>
                    <p className=&apos;text-sm text-muted-foreground&apos;>
                      Sites Visited
                    </p>
                    <div className=&apos;text-2xl mt-1&apos;>4</div>
                  </div>
                  <MapPin className=&apos;h-8 w-8 text-purple-600&apos; />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className=&apos;pt-6&apos;>
                <div className=&apos;flex items-center justify-between&apos;>
                  <div className=&apos;flex-1&apos;>
                    <p className=&apos;text-sm text-muted-foreground&apos;>Total Stops</p>
                    <div className=&apos;text-2xl mt-1&apos;>12</div>
                  </div>
                  <Navigation className=&apos;h-8 w-8 text-orange-600&apos; />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className=&apos;pt-6&apos;>
                <div className=&apos;flex items-center justify-between&apos;>
                  <div className=&apos;flex-1&apos;>
                    <p className=&apos;text-sm text-muted-foreground&apos;>
                      Movement Time
                    </p>
                    <div className=&apos;text-2xl mt-1&apos;>6.5h</div>
                  </div>
                  <TrendingUp className=&apos;h-8 w-8 text-green-600&apos; />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* View Full History CTA */}
          <Card className=&apos;border-2 border-dashed border-primary/20 bg-primary/5&apos;>
            <CardContent className=&apos;pt-6&apos;>
              <div className=&apos;flex items-center justify-between&apos;>
                <div className=&apos;flex items-center gap-4&apos;>
                  <div className=&apos;h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center&apos;>
                    <History className=&apos;h-6 w-6 text-primary&apos; />
                  </div>
                  <div>
                    <h3 className=&apos;font-medium mb-1&apos;>
                      Advanced Historical Playback
                    </h3>
                    <p className=&apos;text-sm text-muted-foreground&apos;>
                      View interactive maps with playback controls, custom date
                      ranges, and detailed route analysis
                    </p>
                  </div>
                </div>
                <Button
                  size=&apos;lg&apos;
                  onClick={() => onViewHistoricalPlayback?.(asset)}
                >
                  View Full History
                  <ArrowRight className=&apos;h-4 w-4 ml-2&apos; />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Location Pings */}
          <Card>
            <CardHeader>
              <div className=&apos;flex items-center justify-between&apos;>
                <CardTitle>Recent Location Pings (Last 24 Hours)</CardTitle>
                <Badge variant=&apos;outline&apos;>{locationHistory.length} pings</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locationHistory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <Clock className=&apos;h-4 w-4 text-muted-foreground&apos; />
                          <span className=&apos;text-sm&apos;>{item.timestamp}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <MapPin className=&apos;h-4 w-4 text-blue-600&apos; />
                          <span>{item.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className=&apos;text-xs bg-muted px-2 py-1 rounded&apos;>
                          {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant=&apos;outline&apos; className=&apos;capitalize text-xs&apos;>
                          {item.event}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {index === 0 && (
                          <Badge className=&apos;bg-green-100 text-green-700 border-green-200&apos;>
                            Current
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Location Timeline - Compact Version */}
          <Card>
            <CardHeader>
              <CardTitle>Location Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className=&apos;h-[300px] pr-4&apos;>
                <div className=&apos;space-y-4&apos;>
                  {locationHistory.map((item, index) => (
                    <div key={index} className=&apos;flex gap-4&apos;>
                      <div className=&apos;flex flex-col items-center&apos;>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === 0
                              ? &apos;bg-green-500&apos;
                              : index === locationHistory.length - 1
                                ? &apos;bg-blue-500&apos;
                                : &apos;bg-gray-300&apos;
                          }`}
                        />
                        {index !== locationHistory.length - 1 && (
                          <div className=&apos;w-0.5 h-full bg-gray-200 my-1&apos; />
                        )}
                      </div>
                      <div className=&apos;flex-1 pb-4&apos;>
                        <div className=&apos;flex items-center justify-between mb-1&apos;>
                          <span className=&apos;font-medium&apos;>{item.location}</span>
                          <Badge
                            variant=&apos;outline&apos;
                            className=&apos;text-xs capitalize&apos;
                          >
                            {item.event}
                          </Badge>
                        </div>
                        <p className=&apos;text-sm text-muted-foreground&apos;>
                          {item.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value=&apos;activity&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className=&apos;h-[500px] pr-4&apos;>
                <div className=&apos;space-y-4&apos;>
                  {activityLog.map(item => (
                    <div
                      key={item.id}
                      className=&apos;flex gap-4 pb-4 border-b last:border-0&apos;
                    >
                      <div className=&apos;mt-1&apos;>{getActivityIcon(item.type)}</div>
                      <div className=&apos;flex-1&apos;>
                        <p className=&apos;text-sm&apos;>{item.description}</p>
                        <div className=&apos;flex items-center gap-2 mt-1&apos;>
                          <p className=&apos;text-xs text-muted-foreground&apos;>
                            {item.timestamp}
                          </p>
                          <span className=&apos;text-xs text-muted-foreground&apos;>
                            •
                          </span>
                          <p className=&apos;text-xs text-muted-foreground&apos;>
                            {item.user}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value=&apos;maintenance&apos; className=&apos;space-y-6&apos;>
          {/* Upcoming Maintenance */}
          <Card>
            <CardHeader>
              <div className=&apos;flex items-center justify-between&apos;>
                <CardTitle>Upcoming Maintenance</CardTitle>
                <Button
                  size=&apos;sm&apos;
                  onClick={() => {
                    navigation.navigateToCreateMaintenance({
                      preSelectedAsset: currentAsset.id,
                      preSelectedAssetName: currentAsset.name,
                      assetContext: currentAsset,
                    });
                  }}
                >
                  <Calendar className=&apos;h-4 w-4 mr-2&apos; />
                  Schedule Maintenance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className=&apos;space-y-4&apos;>
                {upcomingMaintenance.map(maintenance => (
                  <div key={maintenance.id} className=&apos;border rounded-lg p-4&apos;>
                    <div className=&apos;flex items-start justify-between mb-2&apos;>
                      <div className=&apos;flex-1&apos;>
                        <div className=&apos;flex items-center gap-2 mb-1&apos;>
                          <h4>{maintenance.description}</h4>
                          <Badge variant=&apos;outline&apos; className=&apos;text-xs&apos;>
                            {maintenance.type}
                          </Badge>
                          <Badge
                            variant=&apos;outline&apos;
                            className={
                              maintenance.priority === &apos;High&apos;
                                ? &apos;bg-red-50 text-red-700 border-red-200 text-xs&apos;
                                : maintenance.priority === &apos;Medium&apos;
                                  ? &apos;bg-yellow-50 text-yellow-700 border-yellow-200 text-xs&apos;
                                  : &apos;bg-blue-50 text-blue-700 border-blue-200 text-xs&apos;
                            }
                          >
                            {maintenance.priority}
                          </Badge>
                        </div>
                        <p className=&apos;text-sm text-muted-foreground&apos;>
                          Due Date: {maintenance.date}
                        </p>
                      </div>
                      <Button
                        variant=&apos;outline&apos;
                        size=&apos;sm&apos;
                        onClick={() => {
                          setSelectedMaintenance({
                            id: maintenance.id,
                            assetId: mockAsset.id,
                            assetName: mockAsset.name,
                            type: maintenance.type,
                            task: maintenance.description,
                            dueDate: maintenance.date,
                            priority: maintenance.priority,
                            status: &apos;scheduled&apos;,
                            assignedTo: maintenance.assignedTo,
                          });
                          setIsEditMaintenanceOpen(true);
                        }}
                      >
                        <Edit className=&apos;h-4 w-4 mr-2&apos; />
                        Edit
                      </Button>
                    </div>
                    <Separator className=&apos;my-3&apos; />
                    <div className=&apos;grid grid-cols-2 gap-4 text-sm&apos;>
                      <div>
                        <span className=&apos;text-muted-foreground&apos;>
                          Assigned To:
                        </span>
                        <p>{maintenance.assignedTo}</p>
                      </div>
                      <div>
                        <span className=&apos;text-muted-foreground&apos;>
                          Technician:
                        </span>
                        <p>{maintenance.technician}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completed Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&apos;space-y-4&apos;>
                {maintenanceRecords.map(record => (
                  <div key={record.id} className=&apos;border rounded-lg p-4&apos;>
                    <div className=&apos;flex items-start justify-between mb-2&apos;>
                      <div>
                        <div className=&apos;flex items-center gap-2 mb-1&apos;>
                          <h4>{record.description}</h4>
                          <Badge variant=&apos;outline&apos; className=&apos;text-xs&apos;>
                            {record.type}
                          </Badge>
                        </div>
                        <p className=&apos;text-sm text-muted-foreground&apos;>
                          Date: {record.date}
                        </p>
                      </div>
                      <Badge
                        variant=&apos;outline&apos;
                        className=&apos;bg-green-50 text-green-700 border-green-200&apos;
                      >
                        {record.status}
                      </Badge>
                    </div>
                    <Separator className=&apos;my-3&apos; />
                    <div className=&apos;grid grid-cols-2 gap-4 text-sm&apos;>
                      <div>
                        <span className=&apos;text-muted-foreground&apos;>
                          Technician:
                        </span>
                        <p>{record.technician}</p>
                      </div>
                      <div>
                        <span className=&apos;text-muted-foreground&apos;>Next Due:</span>
                        <p>{record.nextDue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value=&apos;alerts&apos; className=&apos;space-y-6&apos;>
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&apos;space-y-3&apos;>
                {alerts.map((alert, index) => {
                  // Convert AssetAlert to Alert type for the AlertCard component
                  const alertForCard: any = {
                    id: alert.id,
                    type: mapAlertCategoryToType(alert.category),
                    severity: alert.severity,
                    message: alert.message,
                    status: alert.status,
                    timestamp: alert.date,
                    asset: currentAsset.name,
                    assetId: currentAsset.id,
                  };

                  return (
                    <AlertCard
                      key={alert.id || index}
                      alert={alertForCard}
                      onTakeAction={alertData => {
                        // Convert alert data for navigation
                        const alertForWorkflow: any = {
                          id: alertData.id,
                          type: alertData.type,
                          severity: alertData.severity,
                          message: alertData.message,
                          status: alertData.status,
                          timestamp: alertData.timestamp,
                          assetId: currentAsset.id,
                          assetName: currentAsset.name,
                        };
                        navigation.navigateToAlertWorkflow(alertForWorkflow);
                      }}
                      onQuickAcknowledge={(alertId, e) => {
                        e.stopPropagation();
                        toast.success(&apos;Alert acknowledged&apos;);
                        // In a real app, this would update the alert via API
                        // For now, just show the toast
                      }}
                      onQuickResolve={(alertId, e) => {
                        e.stopPropagation();
                        toast.success(&apos;Alert resolved&apos;);
                        // In a real app, this would update the alert via API
                        // For now, just show the toast
                      }}
                      showQuickActions={true}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value=&apos;notifications&apos; className=&apos;space-y-6&apos;>
          <Card className=&apos;border-2 border-dashed border-primary/20 bg-primary/5&apos;>
            <CardContent className=&apos;pt-6&apos;>
              <div className=&apos;flex items-center justify-between&apos;>
                <div className=&apos;flex items-center gap-4&apos;>
                  <div className=&apos;h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center&apos;>
                    <Bell className=&apos;h-6 w-6 text-primary&apos; />
                  </div>
                  <div>
                    <h3 className=&apos;font-medium mb-1&apos;>
                      Notification Preferences
                    </h3>
                    <p className=&apos;text-sm text-muted-foreground&apos;>
                      Configure how you receive notifications for this asset in
                      the main notification settings
                    </p>
                  </div>
                </div>
                <Button
                  size=&apos;lg&apos;
                  onClick={() => {
                    navigation.handleViewChange(&apos;notifications&apos;);
                    // Store asset context for filtering if needed
                    sessionStorage.setItem(
                      &apos;notification-asset-context&apos;,
                      JSON.stringify({
                        assetId: currentAsset.id,
                        assetName: currentAsset.name,
                      })
                    );
                  }}
                >
                  Configure Notifications
                  <ArrowRight className=&apos;h-4 w-4 ml-2&apos; />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Recent notifications for {currentAsset.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&apos;space-y-3&apos;>
                {/* Show a preview of recent notifications */}
                <div className=&apos;flex items-start gap-3 p-3 border rounded-lg&apos;>
                  <Mail className=&apos;h-5 w-5 mt-0.5 text-blue-600&apos; />
                  <div className=&apos;flex-1&apos;>
                    <p className=&apos;text-sm&apos;>Low battery alert sent</p>
                    <p className=&apos;text-xs text-muted-foreground mt-1&apos;>
                      2 hours ago • Via Email
                    </p>
                  </div>
                </div>
                <div className=&apos;flex items-start gap-3 p-3 border rounded-lg&apos;>
                  <MessageSquare className=&apos;h-5 w-5 mt-0.5 text-green-600&apos; />
                  <div className=&apos;flex-1&apos;>
                    <p className=&apos;text-sm&apos;>Maintenance reminder sent</p>
                    <p className=&apos;text-xs text-muted-foreground mt-1&apos;>
                      1 day ago • Via SMS
                    </p>
                  </div>
                </div>
                <div className=&apos;flex items-start gap-3 p-3 border rounded-lg&apos;>
                  <Smartphone className=&apos;h-5 w-5 mt-0.5 text-purple-600&apos; />
                  <div className=&apos;flex-1&apos;>
                    <p className=&apos;text-sm&apos;>Asset check-in notification sent</p>
                    <p className=&apos;text-xs text-muted-foreground mt-1&apos;>
                      3 days ago • Via Push
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        title=&apos;Export Asset Details&apos;
        description=&apos;Export asset information and history&apos;
      />

      {/* Edit Maintenance Dialog */}
      <EditMaintenanceDialog
        open={isEditMaintenanceOpen}
        onOpenChange={setIsEditMaintenanceOpen}
        task={selectedMaintenance}
      />
    </PageLayout>
  );
}

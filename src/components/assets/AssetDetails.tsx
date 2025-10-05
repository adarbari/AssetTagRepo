import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "../ui/slider";
import { LoadingState, PageHeader, AlertCard, PageLayout, StatusBadge } from "../common";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ExportDialog } from "../reports/ExportDialog";
import { mockAssets, getAssetById } from "../../data/mockData";
import QRCode from "qrcode";
import { EditMaintenanceDialog } from "../maintenance/EditMaintenanceDialog";
import { toast } from "sonner";
import { useNavigation } from "../../contexts/NavigationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  ArrowLeft,
  MapPin,
  Battery,
  Clock,
  Activity,
  AlertTriangle,
  Calendar,
  QrCode,
  Download,
  Edit,
  Trash2,
  Wrench,
  Truck,
  Package as PackageIcon,
  Container,
  Navigation,
  TrendingUp,
  Zap,
  CheckCircle2,
  XCircle,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Route,
  Timer,
  LogIn,
  LogOut,
  History,
  ArrowRight,
  Loader2,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  DollarSign,
} from "lucide-react";
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
} from "recharts";
import type { Asset } from "../types";
import {
  useBatteryHistory,
  useLocationHistory,
  useActivityLog,
  useMaintenanceSchedule,
  useAssetAlerts,
  useAssetMutations,
} from "../../hooks/useAssetDetails";
import { assetTypes, assetStatuses, getOptionValue } from "../../data/dropdownOptions";

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
    "Battery": "battery",
    "Geofence": "unauthorized-zone",
    "Maintenance": "predictive-maintenance",
    "Anomaly": "theft",
    "Theft": "theft",
    "Temperature": "predictive-maintenance",
    "Offline": "offline",
    "Movement": "theft",
  };
  return mapping[category] || "compliance";
}

export function AssetDetails({ asset, onBack, onShowOnMap, onViewHistoricalPlayback, onAssetUpdate }: AssetDetailsProps) {
  // Component state
  const navigation = useNavigation();
  const [currentAsset, setCurrentAsset] = useState<Asset>(asset);
  const [activeTab, setActiveTab] = useState("overview");
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
    manufacturer: asset.manufacturer || "",
    model: asset.model || "",
    serialNumber: asset.serialNumber || "",
    assignedTo: asset.assignedTo || "",
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
  const isLoading = batteryData.loading || locationData.loading || activityData.loading || maintenanceData.loading || alertData.loading;

  // Update local asset state when prop changes
  useEffect(() => {
    setCurrentAsset(asset);
    setEditForm({
      name: asset.name,
      type: asset.type,
      status: asset.status,
      manufacturer: asset.manufacturer || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
      assignedTo: asset.assignedTo || "",
    });
  }, [asset]);

  const handleEditModeToggle = () => {
    if (isEditMode) {
      // Cancel edit, reset form
      setEditForm({
        name: currentAsset.name,
        type: currentAsset.type,
        status: currentAsset.status,
        manufacturer: currentAsset.manufacturer || "",
        model: currentAsset.model || "",
        serialNumber: currentAsset.serialNumber || "",
        assignedTo: currentAsset.assignedTo || "",
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

      toast.success("Asset updated successfully");
    } catch (error) {
      toast.error("Failed to update asset");
      console.error("Error updating asset:", error);
    }
  };

  // Handler for after check-in/out completes in embedded view
  const handleCheckInOutComplete = (updates: Partial<Asset>) => {
    console.log("🔄 handleCheckInOutComplete called with updates:", updates);
    console.log("🔄 Current asset status before update:", currentAsset.status);
    
    // Refresh the asset from the mock data layer to get the latest state
    const refreshedAsset = getAssetById(currentAsset.id);
    console.log("🔄 Refreshed asset from mock data:", refreshedAsset);
    
    if (refreshedAsset) {
      console.log("✅ Updating asset state with refreshed data, new status:", refreshedAsset.status);
      setCurrentAsset(refreshedAsset);
      // Also update the edit form to reflect the new status
      setEditForm(prev => ({
        ...prev,
        status: refreshedAsset.status,
        assignedTo: refreshedAsset.assignedTo || "",
      }));
    } else {
      console.log("⚠️ Asset not found in mock data, using fallback update");
      // Fallback: update local state if asset not found in mock data
      const updatedAsset = { ...currentAsset, ...updates };
      console.log("✅ Updating asset state with fallback data, new status:", updatedAsset.status);
      setCurrentAsset(updatedAsset);
      setEditForm(prev => ({
        ...prev,
        status: updatedAsset.status,
        assignedTo: updatedAsset.assignedTo || "",
      }));
    }
  };

  // Adapt the asset to the format expected by this component's UI
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
      site: currentAsset.site || "Unknown",
    },
    specifications: {
      manufacturer: currentAsset.manufacturer || "N/A",
      model: currentAsset.model || "N/A",
      serialNumber: currentAsset.serialNumber || "N/A",
      yearOfManufacture: currentAsset.purchaseDate?.split("-")[0] || "N/A",
      purchaseDate: currentAsset.purchaseDate || "N/A",
      warrantyExpiry: currentAsset.warrantyExpiry || "N/A",
    },
    assignedTo: currentAsset.assignedTo || "Unassigned",
    costCenter: "CC-001 - Construction Division",
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "equipment":
        return <Wrench className="h-5 w-5" />;
      case "vehicles":
        return <Truck className="h-5 w-5" />;
      case "tools":
        return <PackageIcon className="h-5 w-5" />;
      case "containers":
        return <Container className="h-5 w-5" />;
    }
  };


  const getActivityIcon = (type: string) => {
    switch (type) {
      case "location":
        return <MapPin className="h-4 w-4 text-blue-600" />;
      case "status":
        return <Activity className="h-4 w-4 text-purple-600" />;
      case "checkout":
      case "checkin":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "maintenance":
        return <Wrench className="h-4 w-4 text-orange-600" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-600" />;
    }
  };

  // QR Code Component
  const QRCodeComponent = ({ value, assetId, assetName }: { value: string; assetId: string; assetName: string }) => {
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
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error: Error | null | undefined) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }, [value]);

    return (
      <div className="flex flex-col items-center gap-2">
        <canvas ref={canvasRef} />
        <div className="text-center">
          <p className="text-xs font-mono">{assetId}</p>
          <p className="text-xs text-muted-foreground">{assetName}</p>
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
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.download = `${assetId}_${assetName.replace(/\s+/g, "_")}_QRCode.png`;
      link.href = qrDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("QR code downloaded successfully");
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Failed to download QR code");
    }
  };

  // Show loading state while initial data is being fetched
  if (isLoading && !batteryHistory.length && !activityLog.length) {
    return <LoadingState message="Loading asset details..." fullScreen />;
  }

  return (
    <PageLayout 
      variant="standard" 
      padding="md"
      header={
        <div className="border-b bg-background px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              {getAssetIcon(currentAsset.type)}
              <div>
                {isEditMode ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-8 max-w-xs"
                  />
                ) : (
                  <h1>{currentAsset.name}</h1>
                )}
                <p className="text-muted-foreground">Asset ID: {currentAsset.id}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={currentAsset.status} />
            {!isEditMode && (
              <>
                {/* Conditionally show Check Out button for assets that can be checked out */}
                {(() => {
                  const canCheckOut = currentAsset.status === "active" || 
                    currentAsset.status === "inactive" || 
                    currentAsset.status === "maintenance";
                  console.log("🔴 Check Out button logic - Asset status:", currentAsset.status, "Can check out:", canCheckOut);
                  return canCheckOut;
                })() && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => {
                      console.log("🔴 Check Out button clicked!");
                      navigation.navigateToCheckInOut({
                        assetId: currentAsset.id,
                        assetName: currentAsset.name,
                        currentStatus: currentAsset.status,
                        mode: "check-out",
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
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out
                  </Button>
                )}
                {/* Conditionally show Check In button for checked-out assets */}
                {(() => {
                  const canCheckIn = currentAsset.status === "checked-out";
                  console.log("🟢 Check In button logic - Asset status:", currentAsset.status, "Can check in:", canCheckIn);
                  return canCheckIn;
                })() && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => {
                      console.log("🟢 Check In button clicked!");
                      navigation.navigateToCheckInOut({
                        assetId: currentAsset.id,
                        assetName: currentAsset.name,
                        currentStatus: currentAsset.status,
                        mode: "check-in",
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
                    <LogIn className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                )}
                {/* Note: No check-in/out button shown for 'in-transit' status */}
              </>
            )}
            {isEditMode ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditModeToggle}
                  disabled={updateLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleSaveChanges}
                  disabled={updateLoading}
                >
                  {updateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleEditModeToggle}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsExportOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
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
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Battery Level</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl">{mockAsset.battery}%</span>
                    </div>
                  </div>
                  <Battery className={`h-8 w-8 ${mockAsset.battery < 20 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Update</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl">{mockAsset.lastUpdate}</span>
                    </div>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Site</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg">{mockAsset.location.site}</span>
                    </div>
                  </div>
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Assigned To</p>
                    {isEditMode ? (
                      <Input
                        value={editForm.assignedTo}
                        onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                        className="h-8 mt-1"
                        placeholder="Assigned To"
                      />
                    ) : (
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg">{mockAsset.assignedTo}</span>
                      </div>
                    )}
                  </div>
                  <Activity className="h-8 w-8 text-orange-600 ml-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Track History</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status</span>
                        {isEditMode ? (
                          <Select 
                            value={getOptionValue(assetStatuses, editForm.status)} 
                            onValueChange={(value) => {
                              const statusValue = assetStatuses.find(s => s.value === value)?.value || value;
                              setEditForm({ ...editForm, status: statusValue });
                            }}
                          >
                            <SelectTrigger className="w-[180px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {assetStatuses.map((assetStatus) => (
                                <SelectItem key={assetStatus.value} value={assetStatus.value}>
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Asset Type</span>
                        {isEditMode ? (
                          <Select 
                            value={getOptionValue(assetTypes, editForm.type)} 
                            onValueChange={(value) => {
                              const typeLabel = assetTypes.find(t => t.value === value)?.label || value;
                              setEditForm({ ...editForm, type: typeLabel });
                            }}
                          >
                            <SelectTrigger className="w-[180px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {assetTypes.map((assetType) => (
                                <SelectItem key={assetType.value} value={assetType.value}>
                                  {assetType.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm capitalize">{mockAsset.type}</span>
                        )}
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Manufacturer</span>
                        {isEditMode ? (
                          <Input
                            value={editForm.manufacturer}
                            onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
                            className="w-[180px] h-8"
                            placeholder="Manufacturer"
                          />
                        ) : (
                          <span className="text-sm">{mockAsset.specifications.manufacturer}</span>
                        )}
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Model</span>
                        {isEditMode ? (
                          <Input
                            value={editForm.model}
                            onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                            className="w-[180px] h-8"
                            placeholder="Model"
                          />
                        ) : (
                          <span className="text-sm">{mockAsset.specifications.model}</span>
                        )}
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Serial Number</span>
                        {isEditMode ? (
                          <Input
                            value={editForm.serialNumber}
                            onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
                            className="w-[180px] h-8 font-mono"
                            placeholder="Serial Number"
                          />
                        ) : (
                          <span className="text-sm font-mono">{mockAsset.specifications.serialNumber}</span>
                        )}
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Year of Manufacture</span>
                        <span className="text-sm">{mockAsset.specifications.yearOfManufacture}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Purchase Date</span>
                        <span className="text-sm">{mockAsset.specifications.purchaseDate}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Warranty Expiry</span>
                        <span className="text-sm">{mockAsset.specifications.warrantyExpiry}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Current Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Address</span>
                        <span className="text-sm text-right">{mockAsset.location.address}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Coordinates</span>
                        <span className="text-sm font-mono">
                          {mockAsset.location.lat.toFixed(4)}, {mockAsset.location.lng.toFixed(4)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Site</span>
                        <span className="text-sm">{mockAsset.location.site}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cost Center</span>
                        <span className="text-sm">{mockAsset.costCenter}</span>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => onShowOnMap?.(asset)}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        View on Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing & Availability Card */}
                {(currentAsset.hourlyRate !== undefined || currentAsset.availability) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing & Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {currentAsset.hourlyRate !== undefined && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Hourly Rate</span>
                              <span className="text-sm">${currentAsset.hourlyRate.toFixed(2)} / hour</span>
                            </div>
                            <Separator />
                          </>
                        )}
                        {currentAsset.availability && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Availability</span>
                              <Badge 
                                variant="outline" 
                                className={
                                  currentAsset.availability === "available" 
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : currentAsset.availability === "assigned" || currentAsset.availability === "in-use"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : currentAsset.availability === "maintenance"
                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }
                              >
                                {currentAsset.availability === "in-use" ? "In Use" : 
                                 currentAsset.availability === "assigned" ? "Assigned to Job" :
                                 currentAsset.availability.charAt(0).toUpperCase() + currentAsset.availability.slice(1)}
                              </Badge>
                            </div>
                            <Separator />
                          </>
                        )}
                        {currentAsset.assignedJobId && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Assigned Job</span>
                              <span className="text-sm">{currentAsset.assignedJobName || currentAsset.assignedJobId}</span>
                            </div>
                            {(currentAsset.assignmentStartDate || currentAsset.assignmentEndDate) && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <span className="text-sm text-muted-foreground">Assignment Period</span>
                                  <div className="flex flex-col gap-1">
                                    {currentAsset.assignmentStartDate && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-muted-foreground">From:</span>
                                        <span>{new Date(currentAsset.assignmentStartDate).toLocaleDateString()} {new Date(currentAsset.assignmentStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                    )}
                                    {currentAsset.assignmentEndDate && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-muted-foreground">To:</span>
                                        <span>{new Date(currentAsset.assignmentEndDate).toLocaleDateString()} {new Date(currentAsset.assignmentEndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={batteryHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 100]} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="battery"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.6}
                        name="Battery %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Show Check Out button only for active, inactive, or maintenance status */}
                    {(currentAsset.status === "active" || 
                      currentAsset.status === "inactive" || 
                      currentAsset.status === "maintenance") && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => {
                          console.log("🔴 Quick Actions Check Out button clicked!");
                          navigation.navigateToCheckInOut({
                            assetId: currentAsset.id,
                            assetName: currentAsset.name,
                            currentStatus: currentAsset.status,
                            mode: "check-out",
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
                        <LogOut className="h-4 w-4 mr-2" />
                        Check Out Asset
                      </Button>
                    )}
                    {/* Show Check In button only for checked-out status */}
                    {currentAsset.status === "checked-out" && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => {
                          console.log("🟢 Quick Actions Check In button clicked!");
                          navigation.navigateToCheckInOut({
                            assetId: currentAsset.id,
                            assetName: currentAsset.name,
                            currentStatus: currentAsset.status,
                            mode: "check-in",
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
                        <LogIn className="h-4 w-4 mr-2" />
                        Check In Asset
                      </Button>
                    )}
                    {/* Show Schedule Maintenance for all statuses except maintenance */}
                    {currentAsset.status !== "maintenance" && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigation.navigateToCreateMaintenance({
                            preSelectedAsset: currentAsset.id,
                            preSelectedAssetName: currentAsset.name,
                            assetContext: currentAsset,
                          });
                        }}
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Schedule Maintenance
                      </Button>
                    )}
                    {/* Report Issue is available for all statuses */}
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        navigation.navigateToReportIssue({
                          assetId: currentAsset.id,
                          assetName: currentAsset.name,
                          assetContext: currentAsset,
                        });
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Report Issue
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Asset QR Code</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-4">
                    <div 
                      ref={qrCodeRef}
                      className="w-48 h-48 bg-white p-4 flex items-center justify-center rounded-lg mb-4 border-2 border-border"
                    >
                      <QRCodeComponent 
                        value={`https://assettrack.example.com/assets/${mockAsset.id}`}
                        assetId={mockAsset.id}
                        assetName={mockAsset.name}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Scan to view asset details</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadQRCode(mockAsset.id, mockAsset.name)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download QR Code
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://assettrack.example.com/assets/${mockAsset.id}`);
                          toast.success("QR code link copied to clipboard");
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
            <TabsContent value="history" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Distance (24h)</p>
                        <div className="text-2xl mt-1">15.8 mi</div>
                      </div>
                      <Route className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Sites Visited</p>
                        <div className="text-2xl mt-1">4</div>
                      </div>
                      <MapPin className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Total Stops</p>
                        <div className="text-2xl mt-1">12</div>
                      </div>
                      <Navigation className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Movement Time</p>
                        <div className="text-2xl mt-1">6.5h</div>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* View Full History CTA */}
              <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <History className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Advanced Historical Playback</h3>
                        <p className="text-sm text-muted-foreground">
                          View interactive maps with playback controls, custom date ranges, and detailed route analysis
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => onViewHistoricalPlayback?.(asset)}
                    >
                      View Full History
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Location Pings */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Location Pings (Last 24 Hours)</CardTitle>
                    <Badge variant="outline">{locationHistory.length} pings</Badge>
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
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.timestamp}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span>{item.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-xs">
                              {item.event}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {index === 0 && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
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
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {locationHistory.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 
                                ? 'bg-green-500' 
                                : index === locationHistory.length - 1 
                                ? 'bg-blue-500' 
                                : 'bg-gray-300'
                            }`} />
                            {index !== locationHistory.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{item.location}</span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.event}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Log Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                      {activityLog.map((item) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="mt-1">
                            {getActivityIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">{item.user}</p>
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
            <TabsContent value="maintenance" className="space-y-6">
              {/* Upcoming Maintenance */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Maintenance</CardTitle>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        navigation.navigateToCreateMaintenance({
                          preSelectedAsset: currentAsset.id,
                          preSelectedAssetName: currentAsset.name,
                          assetContext: currentAsset,
                        });
                      }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Maintenance
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingMaintenance.map((maintenance) => (
                      <div key={maintenance.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4>{maintenance.description}</h4>
                              <Badge variant="outline" className="text-xs">
                                {maintenance.type}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  maintenance.priority === "High"
                                    ? "bg-red-50 text-red-700 border-red-200 text-xs"
                                    : maintenance.priority === "Medium"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                                    : "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                }
                              >
                                {maintenance.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Due Date: {maintenance.date}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMaintenance({
                                id: maintenance.id,
                                assetId: mockAsset.id,
                                assetName: mockAsset.name,
                                type: maintenance.type,
                                task: maintenance.description,
                                dueDate: maintenance.date,
                                priority: maintenance.priority,
                                status: "scheduled",
                                assignedTo: maintenance.assignedTo,
                              });
                              setIsEditMaintenanceOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Assigned To:</span>
                            <p>{maintenance.assignedTo}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Technician:</span>
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
                  <div className="space-y-4">
                    {maintenanceRecords.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4>{record.description}</h4>
                              <Badge variant="outline" className="text-xs">
                                {record.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Date: {record.date}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            {record.status}
                          </Badge>
                        </div>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Technician:</span>
                            <p>{record.technician}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Next Due:</span>
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
            <TabsContent value="alerts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alert History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.map((alert) => {
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
                          alert={alertForCard}
                          onTakeAction={(alertData) => {
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
                            toast.success("Alert acknowledged");
                            // In a real app, this would update the alert via API
                            // For now, just show the toast
                          }}
                          onQuickResolve={(alertId, e) => {
                            e.stopPropagation();
                            toast.success("Alert resolved");
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
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bell className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Notification Preferences</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure how you receive notifications for this asset in the main notification settings
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="lg"
                      onClick={() => {
                        navigation.handleViewChange("notifications");
                        // Store asset context for filtering if needed
                        sessionStorage.setItem('notification-asset-context', JSON.stringify({
                          assetId: currentAsset.id,
                          assetName: currentAsset.name,
                        }));
                      }}
                    >
                      Configure Notifications
                      <ArrowRight className="h-4 w-4 ml-2" />
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
                  <div className="space-y-3">
                    {/* Show a preview of recent notifications */}
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Mail className="h-5 w-5 mt-0.5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm">Low battery alert sent</p>
                        <p className="text-xs text-muted-foreground mt-1">2 hours ago • Via Email</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <MessageSquare className="h-5 w-5 mt-0.5 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm">Maintenance reminder sent</p>
                        <p className="text-xs text-muted-foreground mt-1">1 day ago • Via SMS</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Smartphone className="h-5 w-5 mt-0.5 text-purple-600" />
                      <div className="flex-1">
                        <p className="text-sm">Asset check-in notification sent</p>
                        <p className="text-xs text-muted-foreground mt-1">3 days ago • Via Push</p>
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
        title="Export Asset Details"
        description="Export asset information and history"
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

/**
 * Vehicle-Asset Pairing Component
 * 
 * Comprehensive vehicle and asset management system with:
 * - Vehicle list with loaded assets
 * - Asset assignment with expiration mechanisms:
 *   - Time-based expiration
 *   - Geofence-based expiration (unload when leaving/entering geofence)
 *   - Manual expiration
 * - Automatic unpairing when conditions are met
 * - Pairing history and tracking
 * - Multi-asset loading to vehicles
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { PageHeader, EmptyState, CapacityBar, StatusBadge, InfoRow, PageLayout } from "../common";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DateTimeInput } from "../ui/datetime-input";
import {
  Search,
  Truck,
  Package,
  Plus,
  MoreVertical,
  MapPin,
  User,
  Link as LinkIcon,
  Unlink,
  TrendingUp,
  Clock,
  AlertCircle,
  History,
  Settings,
  X,
  Calendar,
  Shield,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { mockAssets, getAvailableGeofences } from "../../data/mockData";
import { expirationMechanisms } from "../../data/dropdownOptions";
import type { Asset } from "../types";
import { useNavigation } from "../../contexts/NavigationContext";

// Expiration mechanism types - pulled from dropdown config
export type ExpirationMechanism = 
  | "manual"           // Manual unload only
  | "time-based"       // Unload at specific date/time
  | "geofence-exit"    // Unload when vehicle exits geofence
  | "geofence-enter"   // Unload when vehicle enters geofence
  | "time-and-geofence"; // Combination of time and geofence

interface AssetPairing {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  pairedAt: Date;
  pairedBy: string;
  expirationMechanism: ExpirationMechanism;
  expirationDateTime?: Date;
  geofenceId?: string;
  geofenceName?: string;
  geofenceAction?: "exit" | "enter";
  notes?: string;
  autoUnload: boolean;
}

interface VehicleWithPairings {
  id: string;
  name: string;
  licensePlate: string;
  type: string;
  driver?: string;
  status: "active" | "inactive" | "maintenance";
  location?: string;
  capacity: number;
  pairings: AssetPairing[];
}

interface VehicleAssetPairingProps {
  onBack?: () => void;
}

export function VehicleAssetPairing({ onBack }: VehicleAssetPairingProps) {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get geofences from centralized data
  const availableGeofences = getAvailableGeofences();
  
  const [vehicles, setVehicles] = useState<VehicleWithPairings[]>([
    {
      id: "VEH-001",
      name: "Truck Alpha",
      licensePlate: "ABC-123",
      type: "Pickup Truck",
      driver: "Mike Wilson",
      status: "active",
      location: "Construction Site A",
      capacity: 10,
      pairings: [
        {
          id: "pair-001",
          assetId: "AT-42891",
          assetName: "Excavator CAT 320",
          assetType: "Heavy Equipment",
          pairedAt: new Date("2025-10-04T08:00:00"),
          pairedBy: "Mike Wilson",
          expirationMechanism: "time-based",
          expirationDateTime: new Date("2025-10-04T18:00:00"),
          autoUnload: true,
        },
      ],
    },
    {
      id: "VEH-002",
      name: "Truck Beta",
      licensePlate: "XYZ-789",
      type: "Box Truck",
      driver: "Sarah Johnson",
      status: "active",
      location: "Warehouse B",
      capacity: 20,
      pairings: [],
    },
    {
      id: "VEH-003",
      name: "Van Gamma",
      licensePlate: "DEF-456",
      type: "Cargo Van",
      driver: "John Smith",
      status: "active",
      location: "Office Parking",
      capacity: 8,
      pairings: [],
    },
  ]);

  // Add Asset Dialog State
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [expirationMechanism, setExpirationMechanism] = useState<ExpirationMechanism>("manual");
  const [expirationDateTime, setExpirationDateTime] = useState<Date | undefined>();
  const [selectedGeofenceId, setSelectedGeofenceId] = useState("");
  const [geofenceAction, setGeofenceAction] = useState<"exit" | "enter">("exit");
  const [autoUnload, setAutoUnload] = useState(true);
  const [pairingNotes, setPairingNotes] = useState("");

  // View pairing details
  const [viewPairingDialog, setViewPairingDialog] = useState(false);
  const [selectedPairing, setSelectedPairing] = useState<AssetPairing | null>(null);

  // Check for expired pairings
  useEffect(() => {
    const checkExpirations = setInterval(() => {
      const now = new Date();
      
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        pairings: vehicle.pairings.filter(pairing => {
          // Check time-based expiration
          if (
            pairing.autoUnload &&
            (pairing.expirationMechanism === "time-based" || pairing.expirationMechanism === "time-and-geofence") &&
            pairing.expirationDateTime &&
            pairing.expirationDateTime <= now
          ) {
            toast.info(`Auto-unloaded: ${pairing.assetName}`, {
              description: `Removed from ${vehicle.name} due to time expiration`,
            });
            return false; // Remove the pairing
          }
          
          // In production, we would also check geofence-based expiration
          // by comparing vehicle location with geofence boundaries
          
          return true; // Keep the pairing
        }),
      })));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkExpirations);
  }, []);

  const handleAddAssets = () => {
    if (!selectedVehicleId || selectedAssets.length === 0) {
      toast.error("Please select a vehicle and at least one asset");
      return;
    }

    // Validate expiration settings
    if (expirationMechanism === "time-based" || expirationMechanism === "time-and-geofence") {
      if (!expirationDateTime) {
        toast.error("Please select an expiration date/time");
        return;
      }
      if (expirationDateTime <= new Date()) {
        toast.error("Expiration date/time must be in the future");
        return;
      }
    }

    if (
      (expirationMechanism === "geofence-exit" || 
       expirationMechanism === "geofence-enter" ||
       expirationMechanism === "time-and-geofence") &&
      !selectedGeofenceId
    ) {
      toast.error("Please select a geofence");
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (!vehicle) return;

    // Check capacity
    if (vehicle.pairings.length + selectedAssets.length > vehicle.capacity) {
      toast.error(`Capacity exceeded! ${vehicle.name} can only hold ${vehicle.capacity} assets`);
      return;
    }

    // Create pairings
    const newPairings: AssetPairing[] = selectedAssets.map(assetId => {
      const asset = mockAssets.find(a => a.id === assetId);
      if (!asset) throw new Error("Asset not found");

      const geofence = availableGeofences.find(g => g.value === selectedGeofenceId);

      return {
        id: `pair-${Date.now()}-${assetId}`,
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.type,
        pairedAt: new Date(),
        pairedBy: vehicle.driver || "Unknown",
        expirationMechanism,
        expirationDateTime: expirationMechanism === "time-based" || expirationMechanism === "time-and-geofence" 
          ? expirationDateTime 
          : undefined,
        geofenceId: selectedGeofenceId || undefined,
        geofenceName: geofence?.label,
        geofenceAction: geofenceAction,
        notes: pairingNotes || undefined,
        autoUnload,
      };
    });

    // Update vehicle with new pairings
    setVehicles(prev => prev.map(v => 
      v.id === selectedVehicleId
        ? { ...v, pairings: [...v.pairings, ...newPairings] }
        : v
    ));

    const assetNames = newPairings.map(p => p.assetName).join(", ");
    toast.success(`Assets loaded successfully`, {
      description: `${assetNames} loaded onto ${vehicle.name}`,
    });

    // Reset form
    setShowAddAssetDialog(false);
    setSelectedVehicleId("");
    setSelectedAssets([]);
    setExpirationMechanism("manual");
    setExpirationDateTime(undefined);
    setSelectedGeofenceId("");
    setAutoUnload(true);
    setPairingNotes("");
  };

  const handleUnloadAsset = (vehicleId: string, pairingId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const pairing = vehicle?.pairings.find(p => p.id === pairingId);
    
    if (!vehicle || !pairing) return;

    setVehicles(prev => prev.map(v =>
      v.id === vehicleId
        ? { ...v, pairings: v.pairings.filter(p => p.id !== pairingId) }
        : v
    ));

    toast.success("Asset unloaded", {
      description: `${pairing.assetName} removed from ${vehicle.name}`,
    });
  };

  const handleViewPairing = (pairing: AssetPairing) => {
    setSelectedPairing(pairing);
    setViewPairingDialog(true);
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  // Get assets that are not currently paired
  const getAvailableAssets = () => {
    const pairedAssetIds = vehicles.flatMap(v => v.pairings.map(p => p.assetId));
    return mockAssets.filter(asset => !pairedAssetIds.includes(asset.id));
  };

  const availableAssets = getAvailableAssets();
  const activeVehicles = vehicles.filter(v => v.status === "active");
  const totalPairings = vehicles.reduce((sum, v) => sum + v.pairings.length, 0);
  
  // Calculate expiring soon (within 2 hours)
  const expiringSoon = vehicles.flatMap(v => 
    v.pairings.filter(p => 
      p.expirationDateTime && 
      p.expirationDateTime <= new Date(Date.now() + 2 * 60 * 60 * 1000)
    )
  ).length;

  const filteredVehicles = vehicles.filter(vehicle =>
    searchTerm === "" ||
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.pairings.some(p => p.assetName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getExpirationDisplay = (pairing: AssetPairing) => {
    switch (pairing.expirationMechanism) {
      case "manual":
        return "Manual unload only";
      case "time-based":
        return pairing.expirationDateTime 
          ? `${format(pairing.expirationDateTime, "MMM d, yyyy 'at' h:mm a")}`
          : "No expiration set";
      case "geofence-exit":
        return `On exit: ${pairing.geofenceName || "Unknown geofence"}`;
      case "geofence-enter":
        return `On enter: ${pairing.geofenceName || "Unknown geofence"}`;
      case "time-and-geofence":
        return `${format(pairing.expirationDateTime!, "MMM d, h:mm a")} or ${pairing.geofenceAction} ${pairing.geofenceName}`;
      default:
        return "Unknown";
    }
  };

  const getExpirationIcon = (mechanism: ExpirationMechanism) => {
    switch (mechanism) {
      case "time-based":
      case "time-and-geofence":
        return Clock;
      case "geofence-exit":
      case "geofence-enter":
        return MapPin;
      default:
        return Settings;
    }
  };

  return (
    <PageLayout 
      variant="wide" 
      padding="md"
      header={
        <PageHeader
          title="Vehicle-Asset Pairing"
          description="Manage asset loading with automatic expiration mechanisms"
          action={
            <Button onClick={() => setShowAddAssetDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Load Assets
            </Button>
          }
        />
      }
    >
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                Active Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{activeVehicles.length}</div>
              <p className="text-xs text-muted-foreground">On the road</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-green-600" />
                Active Pairings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalPairings}</div>
              <p className="text-xs text-muted-foreground">Assets loaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                Available Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{availableAssets.length}</div>
              <p className="text-xs text-muted-foreground">Ready to load</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{expiringSoon}</div>
              <p className="text-xs text-muted-foreground">Within 2 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles, drivers, or assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Vehicles List */}
        <div className="space-y-4">
          {filteredVehicles.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No vehicles found"
              description="Try adjusting your search criteria"
            />
          ) : (
            filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5" />
                        <div>
                          <CardTitle>{vehicle.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {vehicle.licensePlate} • {vehicle.type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigation.navigateToEditVehicle({
                            vehicleId: vehicle.id,
                            onVehicleUpdated: (updatedVehicle) => {
                              setVehicles(prev => prev.map(v => 
                                v.id === updatedVehicle.id 
                                  ? { ...v, ...updatedVehicle }
                                  : v
                              ));
                              toast.success("Vehicle updated successfully");
                            }
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <StatusBadge status={vehicle.status} type="vehicle" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Vehicle Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {vehicle.driver && (
                      <InfoRow icon={User}>
                        <span className="text-muted-foreground">Driver:</span>
                        <span>{vehicle.driver}</span>
                      </InfoRow>
                    )}
                    {vehicle.location && (
                      <InfoRow icon={MapPin}>
                        <span className="text-muted-foreground">Location:</span>
                        <span>{vehicle.location}</span>
                      </InfoRow>
                    )}
                  </div>

                  {/* Capacity Progress */}
                  <CapacityBar 
                    current={vehicle.pairings.length} 
                    total={vehicle.capacity} 
                  />

                  {/* Loaded Assets */}
                  {vehicle.pairings.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4>Loaded Assets</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedVehicleId(vehicle.id);
                            setShowAddAssetDialog(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add More
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {vehicle.pairings.map((pairing) => {
                          const ExpirationIcon = getExpirationIcon(pairing.expirationMechanism);
                          const isExpiringSoon = 
                            pairing.expirationDateTime && 
                            pairing.expirationDateTime <= new Date(Date.now() + 2 * 60 * 60 * 1000);

                          return (
                            <div
                              key={pairing.id}
                              className={`p-3 bg-muted rounded-lg space-y-2 ${
                                isExpiringSoon ? "border-2 border-orange-300" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-2 flex-1">
                                  <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium">{pairing.assetName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {pairing.assetType} • Loaded {formatDistanceToNow(pairing.pairedAt, { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewPairing(pairing)}
                                  >
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUnloadAsset(vehicle.id, pairing.id)}
                                  >
                                    <Unlink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs">
                                <ExpirationIcon className="h-3 w-3" />
                                <span className={isExpiringSoon ? "text-orange-600 font-medium" : "text-muted-foreground"}>
                                  {getExpirationDisplay(pairing)}
                                </span>
                                {pairing.autoUnload && (
                                  <Badge variant="secondary" className="text-xs">
                                    Auto-unload
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <EmptyState
                        icon={Package}
                        title="No assets loaded"
                        description="Load assets to this vehicle"
                        action={
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedVehicleId(vehicle.id);
                              setShowAddAssetDialog(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Load Assets
                          </Button>
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Assets Dialog */}
      <Dialog open={showAddAssetDialog} onOpenChange={setShowAddAssetDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Assets to Vehicle</DialogTitle>
            <DialogDescription>
              Select assets and configure expiration mechanism for automatic unloading
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Vehicle Selection */}
            <div className="space-y-2">
              <Label>Vehicle *</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {activeVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.pairings.length}/{vehicle.capacity} loaded
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset Selection */}
            <div className="space-y-2">
              <Label>Assets * (Select multiple)</Label>
              <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                {availableAssets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No available assets to load
                  </p>
                ) : (
                  availableAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedAssets.includes(asset.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleAssetSelection(asset.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedAssets.includes(asset.id)
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}>
                          {selectedAssets.includes(asset.id) && (
                            <div className="w-2 h-2 bg-white rounded-sm" />
                          )}
                        </div>
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {asset.id} • {asset.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {selectedAssets.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedAssets.length} asset{selectedAssets.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            <Separator />

            {/* Expiration Mechanism */}
            <div className="space-y-4">
              <Label>Expiration Mechanism *</Label>
              
              <Select value={expirationMechanism} onValueChange={(value) => setExpirationMechanism(value as ExpirationMechanism)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expirationMechanisms.map((mechanism) => {
                    const Icon = mechanism.value === "manual" ? Settings 
                      : mechanism.value === "time-based" ? Clock
                      : mechanism.value.includes("geofence") && !mechanism.value.includes("time") ? MapPin
                      : Shield;
                    
                    return (
                      <SelectItem key={mechanism.value} value={mechanism.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {mechanism.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Time-Based Configuration */}
              {(expirationMechanism === "time-based" || expirationMechanism === "time-and-geofence") && (
                <DateTimeInput
                  label="Expiration Date & Time *"
                  value={expirationDateTime}
                  onChange={setExpirationDateTime}
                  placeholder="Select when to unload assets"
                  minDate={new Date()}
                />
              )}

              {/* Geofence Configuration */}
              {(expirationMechanism === "geofence-exit" || 
                expirationMechanism === "geofence-enter" ||
                expirationMechanism === "time-and-geofence") && (
                <>
                  <div className="space-y-2">
                    <Label>Geofence *</Label>
                    <Select value={selectedGeofenceId} onValueChange={setSelectedGeofenceId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a geofence" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGeofences.map((geofence) => (
                          <SelectItem key={geofence.value} value={geofence.value}>
                            {geofence.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {expirationMechanism === "time-and-geofence" && (
                    <div className="space-y-2">
                      <Label>Geofence Action</Label>
                      <Select value={geofenceAction} onValueChange={(value: "exit" | "enter") => setGeofenceAction(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exit">Unload on Exit</SelectItem>
                          <SelectItem value="enter">Unload on Entry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {/* Auto-Unload Toggle */}
              {expirationMechanism !== "manual" && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Automatic Unload</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically unload when expiration condition is met
                    </p>
                  </div>
                  <Switch checked={autoUnload} onCheckedChange={setAutoUnload} />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Add notes about this pairing..."
                  value={pairingNotes}
                  onChange={(e) => setPairingNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Expiration Summary */}
            {expirationMechanism !== "manual" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Expiration Summary</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {expirationMechanism === "time-based" && expirationDateTime && (
                        <>Assets will {autoUnload ? "automatically unload" : "be marked for unload"} on {format(expirationDateTime, "MMMM d, yyyy 'at' h:mm a")}</>
                      )}
                      {expirationMechanism === "geofence-exit" && selectedGeofenceId && (
                        <>Assets will {autoUnload ? "automatically unload" : "be marked for unload"} when vehicle exits {availableGeofences.find(g => g.value === selectedGeofenceId)?.label}</>
                      )}
                      {expirationMechanism === "geofence-enter" && selectedGeofenceId && (
                        <>Assets will {autoUnload ? "automatically unload" : "be marked for unload"} when vehicle enters {availableGeofences.find(g => g.value === selectedGeofenceId)?.label}</>
                      )}
                      {expirationMechanism === "time-and-geofence" && expirationDateTime && selectedGeofenceId && (
                        <>Assets will {autoUnload ? "automatically unload" : "be marked for unload"} on {format(expirationDateTime, "MMM d 'at' h:mm a")} OR when vehicle {geofenceAction === "exit" ? "exits" : "enters"} {availableGeofences.find(g => g.value === selectedGeofenceId)?.label}</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAssetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAssets}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Load {selectedAssets.length} Asset{selectedAssets.length !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Pairing Details Dialog */}
      <Dialog open={viewPairingDialog} onOpenChange={setViewPairingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pairing Details</DialogTitle>
          </DialogHeader>

          {selectedPairing && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div>
                  <Label>Asset</Label>
                  <p className="text-sm mt-1">{selectedPairing.assetName}</p>
                  <p className="text-xs text-muted-foreground">{selectedPairing.assetType}</p>
                </div>

                <Separator />

                <div>
                  <Label>Paired At</Label>
                  <p className="text-sm mt-1">
                    {format(selectedPairing.pairedAt, "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(selectedPairing.pairedAt, { addSuffix: true })}
                  </p>
                </div>

                <Separator />

                <div>
                  <Label>Expiration Mechanism</Label>
                  <p className="text-sm mt-1">{getExpirationDisplay(selectedPairing)}</p>
                </div>

                {selectedPairing.notes && (
                  <>
                    <Separator />
                    <div>
                      <Label>Notes</Label>
                      <p className="text-sm mt-1">{selectedPairing.notes}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <Label>Automatic Unload</Label>
                  <Badge variant={selectedPairing.autoUnload ? "default" : "secondary"}>
                    {selectedPairing.autoUnload ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPairingDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

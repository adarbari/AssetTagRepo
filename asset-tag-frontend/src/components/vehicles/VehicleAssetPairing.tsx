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

import React, { useState, useEffect } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import {
  PageHeader,
  EmptyState,
  CapacityBar,
  StatusBadge,
  InfoRow,
  PageLayout,
} from &apos;../common&apos;;
import { Separator } from &apos;../ui/separator&apos;;
import { Switch } from &apos;../ui/switch&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from &apos;../ui/dialog&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import { DateTimeInput } from &apos;../ui/datetime-input&apos;;
import {
  Search,
  Truck,
  Package,
  Plus,
  MapPin,
  User,
  Link as LinkIcon,
  Unlink,
  Clock,
  AlertCircle,
  Settings,
  Shield,
  Edit,
} from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;
import { format, formatDistanceToNow } from &apos;date-fns&apos;;
import { mockAssets, getAvailableGeofences } from &apos;../../data/mockData&apos;;
import { expirationMechanisms } from &apos;../../data/dropdownOptions&apos;;
import { useNavigation } from &apos;../../contexts/NavigationContext&apos;;

// Expiration mechanism types - pulled from dropdown config
export type ExpirationMechanism =
  | &apos;manual&apos; // Manual unload only
  | &apos;time-based&apos; // Unload at specific date/time
  | &apos;geofence-exit&apos; // Unload when vehicle exits geofence
  | &apos;geofence-enter&apos; // Unload when vehicle enters geofence
  | &apos;time-and-geofence&apos;; // Combination of time and geofence

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
  geofenceAction?: &apos;exit&apos; | &apos;enter&apos;;
  notes?: string;
  autoUnload: boolean;
}

interface VehicleWithPairings {
  id: string;
  name: string;
  licensePlate: string;
  type: string;
  driver?: string;
  status: &apos;active&apos; | &apos;inactive&apos; | &apos;maintenance&apos;;
  location?: string;
  capacity: number;
  pairings: AssetPairing[];
}

interface VehicleAssetPairingProps {
  onBack?: () => void;
}

export function VehicleAssetPairing({
  onBack: _onBack,
}: VehicleAssetPairingProps) {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState(&apos;&apos;);

  // Get geofences from centralized data
  const availableGeofences = getAvailableGeofences();

  const [vehicles, setVehicles] = useState<VehicleWithPairings[]>([
    {
      id: &apos;VEH-001&apos;,
      name: &apos;Truck Alpha&apos;,
      licensePlate: &apos;ABC-123&apos;,
      type: &apos;Pickup Truck&apos;,
      driver: &apos;Mike Wilson&apos;,
      status: &apos;active&apos;,
      location: &apos;Construction Site A&apos;,
      capacity: 10,
      pairings: [
        {
          id: &apos;pair-001&apos;,
          assetId: &apos;AT-42891&apos;,
          assetName: &apos;Excavator CAT 320&apos;,
          assetType: &apos;Heavy Equipment&apos;,
          pairedAt: new Date(&apos;2025-10-04T08:00:00&apos;),
          pairedBy: &apos;Mike Wilson&apos;,
          expirationMechanism: &apos;time-based&apos;,
          expirationDateTime: new Date(&apos;2025-10-04T18:00:00&apos;),
          autoUnload: true,
        },
      ],
    },
    {
      id: &apos;VEH-002&apos;,
      name: &apos;Truck Beta&apos;,
      licensePlate: &apos;XYZ-789&apos;,
      type: &apos;Box Truck&apos;,
      driver: &apos;Sarah Johnson&apos;,
      status: &apos;active&apos;,
      location: &apos;Warehouse B&apos;,
      capacity: 20,
      pairings: [],
    },
    {
      id: &apos;VEH-003&apos;,
      name: &apos;Van Gamma&apos;,
      licensePlate: &apos;DEF-456&apos;,
      type: &apos;Cargo Van&apos;,
      driver: &apos;John Smith&apos;,
      status: &apos;active&apos;,
      location: &apos;Office Parking&apos;,
      capacity: 8,
      pairings: [],
    },
  ]);

  // Add Asset Dialog State
  const [showAddAssetDialog, setShowAddAssetDialog] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(&apos;&apos;);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [expirationMechanism, setExpirationMechanism] =
    useState<ExpirationMechanism>(&apos;manual&apos;);
  const [expirationDateTime, setExpirationDateTime] = useState<
    Date | undefined
  >();
  const [selectedGeofenceId, setSelectedGeofenceId] = useState(&apos;&apos;);
  const [geofenceAction, setGeofenceAction] = useState<&apos;exit&apos; | &apos;enter&apos;>(
    &apos;exit&apos;
  );
  const [autoUnload, setAutoUnload] = useState(true);
  const [pairingNotes, setPairingNotes] = useState(&apos;&apos;);

  // View pairing details
  const [viewPairingDialog, setViewPairingDialog] = useState(false);
  const [selectedPairing, setSelectedPairing] = useState<AssetPairing | null>(
    null
  );

  // Check for expired pairings
  useEffect(() => {
    const checkExpirations = setInterval(() => {
      const now = new Date();

      setVehicles(prev =>
        prev.map(vehicle => ({
          ...vehicle,
          pairings: vehicle.pairings.filter(pairing => {
            // Check time-based expiration
            if (
              pairing.autoUnload &&
              (pairing.expirationMechanism === &apos;time-based&apos; ||
                pairing.expirationMechanism === &apos;time-and-geofence&apos;) &&
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
        }))
      );
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkExpirations);
  }, []);

  const handleAddAssets = () => {
    if (!selectedVehicleId || selectedAssets.length === 0) {
      toast.error(&apos;Please select a vehicle and at least one asset&apos;);
      return;
    }

    // Validate expiration settings
    if (
      expirationMechanism === &apos;time-based&apos; ||
      expirationMechanism === &apos;time-and-geofence&apos;
    ) {
      if (!expirationDateTime) {
        toast.error(&apos;Please select an expiration date/time&apos;);
        return;
      }
      if (expirationDateTime <= new Date()) {
        toast.error(&apos;Expiration date/time must be in the future&apos;);
        return;
      }
    }

    if (
      (expirationMechanism === &apos;geofence-exit&apos; ||
        expirationMechanism === &apos;geofence-enter&apos; ||
        expirationMechanism === &apos;time-and-geofence&apos;) &&
      !selectedGeofenceId
    ) {
      toast.error(&apos;Please select a geofence&apos;);
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (!vehicle) return;

    // Check capacity
    if (vehicle.pairings.length + selectedAssets.length > vehicle.capacity) {
      toast.error(
        `Capacity exceeded! ${vehicle.name} can only hold ${vehicle.capacity} assets`
      );
      return;
    }

    // Create pairings
    const newPairings: AssetPairing[] = selectedAssets.map(assetId => {
      const asset = mockAssets.find(a => a.id === assetId);
      if (!asset) throw new Error(&apos;Asset not found&apos;);

      const geofence = availableGeofences.find(
        g => g.value === selectedGeofenceId
      );

      return {
        id: `pair-${Date.now()}-${assetId}`,
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.type,
        pairedAt: new Date(),
        pairedBy: vehicle.driver || &apos;Unknown&apos;,
        expirationMechanism,
        expirationDateTime:
          expirationMechanism === &apos;time-based&apos; ||
          expirationMechanism === &apos;time-and-geofence&apos;
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
    setVehicles(prev =>
      prev.map(v =>
        v.id === selectedVehicleId
          ? { ...v, pairings: [...v.pairings, ...newPairings] }
          : v
      )
    );

    const assetNames = newPairings.map(p => p.assetName).join(&apos;, &apos;);
    toast.success(`Assets loaded successfully`, {
      description: `${assetNames} loaded onto ${vehicle.name}`,
    });

    // Reset form
    setShowAddAssetDialog(false);
    setSelectedVehicleId(&apos;&apos;);
    setSelectedAssets([]);
    setExpirationMechanism(&apos;manual&apos;);
    setExpirationDateTime(undefined);
    setSelectedGeofenceId(&apos;&apos;);
    setAutoUnload(true);
    setPairingNotes(&apos;&apos;);
  };

  const handleUnloadAsset = (vehicleId: string, pairingId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const pairing = vehicle?.pairings.find(p => p.id === pairingId);

    if (!vehicle || !pairing) return;

    setVehicles(prev =>
      prev.map(v =>
        v.id === vehicleId
          ? { ...v, pairings: v.pairings.filter(p => p.id !== pairingId) }
          : v
      )
    );

    toast.success(&apos;Asset unloaded&apos;, {
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
    const pairedAssetIds = vehicles.flatMap(v =>
      v.pairings.map(p => p.assetId)
    );
    return mockAssets.filter(asset => !pairedAssetIds.includes(asset.id));
  };

  const availableAssets = getAvailableAssets();
  const activeVehicles = vehicles.filter(v => v.status === &apos;active&apos;);
  const totalPairings = vehicles.reduce((sum, v) => sum + v.pairings.length, 0);

  // Calculate expiring soon (within 2 hours)
  const expiringSoon = vehicles.flatMap(v =>
    v.pairings.filter(
      p =>
        p.expirationDateTime &&
        p.expirationDateTime <= new Date(Date.now() + 2 * 60 * 60 * 1000)
    )
  ).length;

  const filteredVehicles = vehicles.filter(
    vehicle =>
      searchTerm === &apos;&apos; ||
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.pairings.some(p =>
        p.assetName.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const getExpirationDisplay = (pairing: AssetPairing) => {
    switch (pairing.expirationMechanism) {
      case &apos;manual&apos;:
        return &apos;Manual unload only&apos;;
      case &apos;time-based&apos;:
        return pairing.expirationDateTime
          ? `${format(pairing.expirationDateTime, &quot;MMM d, yyyy &apos;at&apos; h:mm a&quot;)}`
          : &apos;No expiration set&apos;;
      case &apos;geofence-exit&apos;:
        return `On exit: ${pairing.geofenceName || &apos;Unknown geofence&apos;}`;
      case &apos;geofence-enter&apos;:
        return `On enter: ${pairing.geofenceName || &apos;Unknown geofence&apos;}`;
      case &apos;time-and-geofence&apos;:
        return `${pairing.expirationDateTime ? format(pairing.expirationDateTime, &apos;MMM d, h:mm a&apos;) : &apos;No date&apos;} or ${pairing.geofenceAction} ${pairing.geofenceName}`;
      default:
        return &apos;Unknown&apos;;
    }
  };

  const getExpirationIcon = (mechanism: ExpirationMechanism) => {
    switch (mechanism) {
      case &apos;time-based&apos;:
      case &apos;time-and-geofence&apos;:
        return Clock;
      case &apos;geofence-exit&apos;:
      case &apos;geofence-enter&apos;:
        return MapPin;
      default:
        return Settings;
    }
  };

  return (
    <PageLayout
      variant=&apos;wide&apos;
      padding=&apos;md&apos;
      header={
        <PageHeader
          title=&apos;Vehicle-Asset Pairing&apos;
          description=&apos;Manage asset loading with automatic expiration mechanisms&apos;
          action={
            <Button onClick={() => setShowAddAssetDialog(true)}>
              <Plus className=&apos;h-4 w-4 mr-2&apos; />
              Load Assets
            </Button>
          }
        />
      }
    >
      <div className=&apos;flex-1 overflow-auto p-6 space-y-6&apos;>
        {/* Summary Cards */}
        <div className=&apos;grid grid-cols-1 md:grid-cols-4 gap-4&apos;>
          <Card>
            <CardHeader className=&apos;pb-2&apos;>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <Truck className=&apos;h-4 w-4 text-blue-600&apos; />
                Active Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&apos;text-2xl&apos;>{activeVehicles.length}</div>
              <p className=&apos;text-xs text-muted-foreground&apos;>On the road</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&apos;pb-2&apos;>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <LinkIcon className=&apos;h-4 w-4 text-green-600&apos; />
                Active Pairings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&apos;text-2xl&apos;>{totalPairings}</div>
              <p className=&apos;text-xs text-muted-foreground&apos;>Assets loaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&apos;pb-2&apos;>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <Package className=&apos;h-4 w-4 text-gray-600&apos; />
                Available Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&apos;text-2xl&apos;>{availableAssets.length}</div>
              <p className=&apos;text-xs text-muted-foreground&apos;>Ready to load</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className=&apos;pb-2&apos;>
              <CardTitle className=&apos;flex items-center gap-2&apos;>
                <AlertCircle className=&apos;h-4 w-4 text-orange-600&apos; />
                Expiring Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&apos;text-2xl&apos;>{expiringSoon}</div>
              <p className=&apos;text-xs text-muted-foreground&apos;>Within 2 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className=&apos;relative&apos;>
          <Search className=&apos;absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground&apos; />
          <Input
            placeholder=&apos;Search vehicles, drivers, or assets...&apos;
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className=&apos;pl-10&apos;
          />
        </div>

        {/* Vehicles List */}
        <div className=&apos;space-y-4&apos;>
          {filteredVehicles.length === 0 ? (
            <EmptyState
              icon={Truck}
              title=&apos;No vehicles found&apos;
              description=&apos;Try adjusting your search criteria&apos;
            />
          ) : (
            filteredVehicles.map(vehicle => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <div className=&apos;flex items-start justify-between&apos;>
                    <div className=&apos;flex-1&apos;>
                      <div className=&apos;flex items-center gap-3&apos;>
                        <Truck className=&apos;h-5 w-5&apos; />
                        <div>
                          <CardTitle>{vehicle.name}</CardTitle>
                          <p className=&apos;text-sm text-muted-foreground mt-1&apos;>
                            {vehicle.licensePlate} • {vehicle.type}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className=&apos;flex items-center gap-2&apos;>
                      <Button
                        variant=&apos;ghost&apos;
                        size=&apos;sm&apos;
                        onClick={() => {
                          navigation.navigateToEditVehicle({
                            vehicleId: vehicle.id,
                            onVehicleUpdated: updatedVehicle => {
                              setVehicles(prev =>
                                prev.map(v =>
                                  v.id === updatedVehicle.id
                                    ? { ...v, ...updatedVehicle }
                                    : v
                                )
                              );
                              toast.success(&apos;Vehicle updated successfully&apos;);
                            },
                          });
                        }}
                        aria-label=&apos;Edit vehicle&apos;
                      >
                        <Edit className=&apos;h-4 w-4&apos; />
                      </Button>
                      <StatusBadge status={vehicle.status} type=&apos;vehicle&apos; />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className=&apos;space-y-4&apos;>
                  {/* Vehicle Info */}
                  <div className=&apos;grid grid-cols-2 gap-4 text-sm&apos;>
                    {vehicle.driver && (
                      <InfoRow icon={User}>
                        <span className=&apos;text-muted-foreground&apos;>Driver:</span>
                        <span>{vehicle.driver}</span>
                      </InfoRow>
                    )}
                    {vehicle.location && (
                      <InfoRow icon={MapPin}>
                        <span className=&apos;text-muted-foreground&apos;>Location:</span>
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
                    <div className=&apos;space-y-2&apos;>
                      <div className=&apos;flex items-center justify-between&apos;>
                        <h4>Loaded Assets</h4>
                        <Button
                          size=&apos;sm&apos;
                          variant=&apos;outline&apos;
                          onClick={() => {
                            setSelectedVehicleId(vehicle.id);
                            setShowAddAssetDialog(true);
                          }}
                        >
                          <Plus className=&apos;h-3 w-3 mr-1&apos; />
                          Add More
                        </Button>
                      </div>
                      <div className=&apos;space-y-2&apos;>
                        {vehicle.pairings.map(pairing => {
                          const ExpirationIcon = getExpirationIcon(
                            pairing.expirationMechanism
                          );
                          const isExpiringSoon =
                            pairing.expirationDateTime &&
                            pairing.expirationDateTime <=
                              new Date(Date.now() + 2 * 60 * 60 * 1000);

                          return (
                            <div
                              key={pairing.id}
                              className={`p-3 bg-muted rounded-lg space-y-2 ${
                                isExpiringSoon
                                  ? &apos;border-2 border-orange-300&apos;
                                  : &apos;&apos;
                              }`}
                            >
                              <div className=&apos;flex items-start justify-between&apos;>
                                <div className=&apos;flex items-start gap-2 flex-1&apos;>
                                  <Package className=&apos;h-4 w-4 text-muted-foreground mt-0.5&apos; />
                                  <div className=&apos;flex-1 min-w-0&apos;>
                                    <p className=&apos;font-medium&apos;>
                                      {pairing.assetName}
                                    </p>
                                    <p className=&apos;text-xs text-muted-foreground&apos;>
                                      {pairing.assetType} • Loaded{&apos; &apos;}
                                      {formatDistanceToNow(pairing.pairedAt, {
                                        addSuffix: true,
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className=&apos;flex gap-1&apos;>
                                  <Button
                                    size=&apos;sm&apos;
                                    variant=&apos;ghost&apos;
                                    onClick={() => handleViewPairing(pairing)}
                                    aria-label=&apos;View pairing settings&apos;
                                  >
                                    <Settings className=&apos;h-4 w-4&apos; />
                                  </Button>
                                  <Button
                                    size=&apos;sm&apos;
                                    variant=&apos;ghost&apos;
                                    onClick={() =>
                                      handleUnloadAsset(vehicle.id, pairing.id)
                                    }
                                    aria-label=&apos;Unload asset&apos;
                                  >
                                    <Unlink className=&apos;h-4 w-4&apos; />
                                  </Button>
                                </div>
                              </div>

                              <div className=&apos;flex items-center gap-2 text-xs&apos;>
                                <ExpirationIcon className=&apos;h-3 w-3&apos; />
                                <span
                                  className={
                                    isExpiringSoon
                                      ? &apos;text-orange-600 font-medium&apos;
                                      : &apos;text-muted-foreground&apos;
                                  }
                                >
                                  {getExpirationDisplay(pairing)}
                                </span>
                                {pairing.autoUnload && (
                                  <Badge
                                    variant=&apos;secondary&apos;
                                    className=&apos;text-xs&apos;
                                  >
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
                    <div className=&apos;py-8&apos;>
                      <EmptyState
                        icon={Package}
                        title=&apos;No assets loaded&apos;
                        description=&apos;Load assets to this vehicle&apos;
                        action={
                          <Button
                            size=&apos;sm&apos;
                            onClick={() => {
                              setSelectedVehicleId(vehicle.id);
                              setShowAddAssetDialog(true);
                            }}
                          >
                            <Plus className=&apos;h-4 w-4 mr-2&apos; />
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
        <DialogContent className=&apos;max-w-2xl max-h-[90vh] overflow-y-auto&apos;>
          <DialogHeader>
            <DialogTitle>Load Assets to Vehicle</DialogTitle>
            <DialogDescription>
              Select assets and configure expiration mechanism for automatic
              unloading
            </DialogDescription>
          </DialogHeader>

          <div className=&apos;space-y-6 py-4&apos;>
            {/* Vehicle Selection */}
            <div className=&apos;space-y-2&apos;>
              <Label>Vehicle *</Label>
              <Select
                value={selectedVehicleId}
                onValueChange={setSelectedVehicleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder=&apos;Select a vehicle&apos; />
                </SelectTrigger>
                <SelectContent>
                  {activeVehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.pairings.length}/
                      {vehicle.capacity} loaded
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset Selection */}
            <div className=&apos;space-y-2&apos;>
              <Label>Assets * (Select multiple)</Label>
              <div className=&apos;border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto&apos;>
                {availableAssets.length === 0 ? (
                  <p className=&apos;text-sm text-muted-foreground text-center py-4&apos;>
                    No available assets to load
                  </p>
                ) : (
                  availableAssets.map(asset => (
                    <div
                      key={asset.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedAssets.includes(asset.id)
                          ? &apos;border-primary bg-primary/5&apos;
                          : &apos;border-border hover:border-primary/50&apos;
                      }`}
                      onClick={() => toggleAssetSelection(asset.id)}
                    >
                      <div className=&apos;flex items-center gap-3&apos;>
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedAssets.includes(asset.id)
                              ? &apos;border-primary bg-primary&apos;
                              : &apos;border-border&apos;
                          }`}
                        >
                          {selectedAssets.includes(asset.id) && (
                            <div className=&apos;w-2 h-2 bg-white rounded-sm&apos; />
                          )}
                        </div>
                        <Package className=&apos;h-4 w-4 text-muted-foreground&apos; />
                        <div className=&apos;flex-1&apos;>
                          <p className=&apos;font-medium&apos;>{asset.name}</p>
                          <p className=&apos;text-xs text-muted-foreground&apos;>
                            {asset.id} • {asset.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {selectedAssets.length > 0 && (
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  {selectedAssets.length} asset
                  {selectedAssets.length > 1 ? &apos;s&apos; : &apos;&apos;} selected
                </p>
              )}
            </div>

            <Separator />

            {/* Expiration Mechanism */}
            <div className=&apos;space-y-4&apos;>
              <Label>Expiration Mechanism *</Label>

              <Select
                value={expirationMechanism}
                onValueChange={value =>
                  setExpirationMechanism(value as ExpirationMechanism)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expirationMechanisms.map(mechanism => {
                    const Icon =
                      mechanism.value === &apos;manual&apos;
                        ? Settings
                        : mechanism.value === &apos;time-based&apos;
                          ? Clock
                          : mechanism.value.includes(&apos;geofence&apos;) &&
                              !mechanism.value.includes(&apos;time&apos;)
                            ? MapPin
                            : Shield;

                    return (
                      <SelectItem key={mechanism.value} value={mechanism.value}>
                        <div className=&apos;flex items-center gap-2&apos;>
                          <Icon className=&apos;h-4 w-4&apos; />
                          {mechanism.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Time-Based Configuration */}
              {(expirationMechanism === &apos;time-based&apos; ||
                expirationMechanism === &apos;time-and-geofence&apos;) && (
                <DateTimeInput
                  label=&apos;Expiration Date & Time *&apos;
                  value={expirationDateTime}
                  onChange={setExpirationDateTime}
                  placeholder=&apos;Select when to unload assets&apos;
                  minDate={new Date()}
                />
              )}

              {/* Geofence Configuration */}
              {(expirationMechanism === &apos;geofence-exit&apos; ||
                expirationMechanism === &apos;geofence-enter&apos; ||
                expirationMechanism === &apos;time-and-geofence&apos;) && (
                <>
                  <div className=&apos;space-y-2&apos;>
                    <Label>Geofence *</Label>
                    <Select
                      value={selectedGeofenceId}
                      onValueChange={setSelectedGeofenceId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder=&apos;Select a geofence&apos; />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGeofences.map(geofence => (
                          <SelectItem
                            key={geofence.value}
                            value={geofence.value}
                          >
                            {geofence.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {expirationMechanism === &apos;time-and-geofence&apos; && (
                    <div className=&apos;space-y-2&apos;>
                      <Label>Geofence Action</Label>
                      <Select
                        value={geofenceAction}
                        onValueChange={(value: &apos;exit&apos; | &apos;enter&apos;) =>
                          setGeofenceAction(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=&apos;exit&apos;>Unload on Exit</SelectItem>
                          <SelectItem value=&apos;enter&apos;>Unload on Entry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              {/* Auto-Unload Toggle */}
              {expirationMechanism !== &apos;manual&apos; && (
                <div className=&apos;flex items-center justify-between p-4 bg-muted rounded-lg&apos;>
                  <div className=&apos;space-y-0.5&apos;>
                    <Label>Automatic Unload</Label>
                    <p className=&apos;text-sm text-muted-foreground&apos;>
                      Automatically unload when expiration condition is met
                    </p>
                  </div>
                  <Switch
                    checked={autoUnload}
                    onCheckedChange={setAutoUnload}
                  />
                </div>
              )}

              {/* Notes */}
              <div className=&apos;space-y-2&apos;>
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder=&apos;Add notes about this pairing...&apos;
                  value={pairingNotes}
                  onChange={e => setPairingNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Expiration Summary */}
            {expirationMechanism !== &apos;manual&apos; && (
              <div className=&apos;p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2&apos;>
                <div className=&apos;flex items-start gap-2&apos;>
                  <AlertCircle className=&apos;h-5 w-5 text-blue-600 mt-0.5&apos; />
                  <div>
                    <p className=&apos;text-sm font-medium text-blue-900&apos;>
                      Expiration Summary
                    </p>
                    <p className=&apos;text-sm text-blue-700 mt-1&apos;>
                      {expirationMechanism === &apos;time-based&apos; &&
                        expirationDateTime && (
                          <>
                            Assets will{&apos; &apos;}
                            {autoUnload
                              ? &apos;automatically unload&apos;
                              : &apos;be marked for unload&apos;}{&apos; &apos;}
                            on{&apos; &apos;}
                            {format(
                              expirationDateTime,
                              &quot;MMMM d, yyyy &apos;at&apos; h:mm a&quot;
                            )}
                          </>
                        )}
                      {expirationMechanism === &apos;geofence-exit&apos; &&
                        selectedGeofenceId && (
                          <>
                            Assets will{&apos; &apos;}
                            {autoUnload
                              ? &apos;automatically unload&apos;
                              : &apos;be marked for unload&apos;}{&apos; &apos;}
                            when vehicle exits{&apos; &apos;}
                            {
                              availableGeofences.find(
                                g => g.value === selectedGeofenceId
                              )?.label
                            }
                          </>
                        )}
                      {expirationMechanism === &apos;geofence-enter&apos; &&
                        selectedGeofenceId && (
                          <>
                            Assets will{&apos; &apos;}
                            {autoUnload
                              ? &apos;automatically unload&apos;
                              : &apos;be marked for unload&apos;}{&apos; &apos;}
                            when vehicle enters{&apos; &apos;}
                            {
                              availableGeofences.find(
                                g => g.value === selectedGeofenceId
                              )?.label
                            }
                          </>
                        )}
                      {expirationMechanism === &apos;time-and-geofence&apos; &&
                        expirationDateTime &&
                        selectedGeofenceId && (
                          <>
                            Assets will{&apos; &apos;}
                            {autoUnload
                              ? &apos;automatically unload&apos;
                              : &apos;be marked for unload&apos;}{&apos; &apos;}
                            on {format(expirationDateTime, &quot;MMM d &apos;at&apos; h:mm a&quot;)}{&apos; &apos;}
                            OR when vehicle{&apos; &apos;}
                            {geofenceAction === &apos;exit&apos; ? &apos;exits&apos; : &apos;enters&apos;}{&apos; &apos;}
                            {
                              availableGeofences.find(
                                g => g.value === selectedGeofenceId
                              )?.label
                            }
                          </>
                        )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant=&apos;outline&apos;
              onClick={() => setShowAddAssetDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAssets}>
              <LinkIcon className=&apos;h-4 w-4 mr-2&apos; />
              Load {selectedAssets.length} Asset
              {selectedAssets.length !== 1 ? &apos;s&apos; : &apos;&apos;}
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
            <div className=&apos;space-y-4 py-4&apos;>
              <div className=&apos;space-y-3&apos;>
                <div>
                  <Label>Asset</Label>
                  <p className=&apos;text-sm mt-1&apos;>{selectedPairing.assetName}</p>
                  <p className=&apos;text-xs text-muted-foreground&apos;>
                    {selectedPairing.assetType}
                  </p>
                </div>

                <Separator />

                <div>
                  <Label>Paired At</Label>
                  <p className=&apos;text-sm mt-1&apos;>
                    {format(
                      selectedPairing.pairedAt,
                      &quot;MMMM d, yyyy &apos;at&apos; h:mm a&quot;
                    )}
                  </p>
                  <p className=&apos;text-xs text-muted-foreground&apos;>
                    {formatDistanceToNow(selectedPairing.pairedAt, {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                <Separator />

                <div>
                  <Label>Expiration Mechanism</Label>
                  <p className=&apos;text-sm mt-1&apos;>
                    {getExpirationDisplay(selectedPairing)}
                  </p>
                </div>

                {selectedPairing.notes && (
                  <>
                    <Separator />
                    <div>
                      <Label>Notes</Label>
                      <p className=&apos;text-sm mt-1&apos;>{selectedPairing.notes}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className=&apos;flex items-center justify-between&apos;>
                  <Label>Automatic Unload</Label>
                  <Badge
                    variant={
                      selectedPairing.autoUnload ? &apos;default&apos; : &apos;secondary&apos;
                    }
                  >
                    {selectedPairing.autoUnload ? &apos;Enabled&apos; : &apos;Disabled&apos;}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant=&apos;outline&apos;
              onClick={() => setViewPairingDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

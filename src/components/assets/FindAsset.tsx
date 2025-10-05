import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Search,
  MapPin,
  Navigation,
  Radio,
  Bell,
  Volume2,
  Compass,
  TrendingUp,
  Target,
  CheckCircle,
} from "lucide-react";
import { cn } from "../ui/utils";
import { PageLayout } from "../common";
import { toast } from "sonner";
import type { Asset } from "../types";

// Mock nearby assets - using real asset IDs from mockData
const mockNearbyAssets = [
  {
    id: "AT-42892",
    name: "Generator Diesel 50kW",
    type: "Power Equipment",
    distance: 12,
    signalStrength: 85,
    direction: "NE",
    lastSeen: "2 seconds ago",
  },
  {
    id: "AT-42893",
    name: "Concrete Mixer M400",
    type: "Heavy Equipment",
    distance: 28,
    signalStrength: 65,
    direction: "SW",
    lastSeen: "5 seconds ago",
  },
  {
    id: "AT-42894",
    name: "Tool Kit Professional",
    type: "Precision Tools",
    distance: 45,
    signalStrength: 42,
    direction: "N",
    lastSeen: "8 seconds ago",
  },
  {
    id: "AT-42891",
    name: "Excavator CAT 320",
    type: "Heavy Equipment",
    distance: 67,
    signalStrength: 28,
    direction: "SE",
    lastSeen: "12 seconds ago",
  },
];

interface FindAssetProps {
  onShowOnMap?: (asset: Asset) => void;
}

export function FindAsset({ onShowOnMap }: FindAssetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<typeof mockNearbyAssets[0] | null>(null);
  const [isBeaconing, setIsBeaconing] = useState(false);
  const [findingMode, setFindingMode] = useState<"nearby" | "search">("nearby");

  const handleBeacon = () => {
    setIsBeaconing(true);
    toast.success("Beacon activated", {
      description: "Asset will emit sound and vibration for 30 seconds",
    });
    setTimeout(() => setIsBeaconing(false), 30000);
  };

  const handleShowOnMap = async () => {
    if (selectedAsset && onShowOnMap) {
      // Fetch the full asset data from mockData
      const { getAssetById } = await import("../data/mockData");
      const asset = getAssetById(selectedAsset.id);
      
      if (asset) {
        onShowOnMap(asset);
        toast.success("Navigating to map", {
          description: `Showing ${selectedAsset.name} on map`,
        });
      } else {
        toast.error("Asset not found", {
          description: `Could not find asset ${selectedAsset.id}`,
        });
      }
    }
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 70) return "text-green-600";
    if (strength >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getSignalBars = (strength: number) => {
    if (strength >= 70) return 4;
    if (strength >= 50) return 3;
    if (strength >= 30) return 2;
    return 1;
  };

  const getProximityLevel = (distance: number) => {
    if (distance <= 15) return { level: "Very Close", color: "text-green-600", progress: 90 };
    if (distance <= 30) return { level: "Close", color: "text-blue-600", progress: 70 };
    if (distance <= 50) return { level: "Near", color: "text-yellow-600", progress: 50 };
    return { level: "Far", color: "text-orange-600", progress: 25 };
  };

  const getDirectionIcon = (direction: string) => {
    return <Compass className="h-5 w-5" />;
  };

  return (
    <PageLayout variant="narrow" padding="lg">
      {/* Header */}
      <div>
        <h1>Find Asset</h1>
        <p className="text-muted-foreground">
          Locate assets nearby using BLE signal strength and proximity detection
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-2">
        <Button
          variant={findingMode === "nearby" ? "default" : "outline"}
          onClick={() => setFindingMode("nearby")}
        >
          <Radio className="h-4 w-4 mr-2" />
          Nearby Assets
        </Button>
        <Button
          variant={findingMode === "search" ? "default" : "outline"}
          onClick={() => setFindingMode("search")}
        >
          <Search className="h-4 w-4 mr-2" />
          Search Asset
        </Button>
      </div>

      {findingMode === "search" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by asset name, ID, or tag..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Enter an asset ID or name to start finding. The system will guide you to the asset's location.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Finding Session */}
      {selectedAsset && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Finding: {selectedAsset.name}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedAsset(null)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Distance and Proximity */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
                <div className="text-center">
                  <div className="text-4xl">{selectedAsset.distance}</div>
                  <div className="text-sm text-muted-foreground">meters</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Target className={cn("h-5 w-5", getProximityLevel(selectedAsset.distance).color)} />
                  <span className={cn("text-lg", getProximityLevel(selectedAsset.distance).color)}>
                    {getProximityLevel(selectedAsset.distance).level}
                  </span>
                </div>
                <Progress value={getProximityLevel(selectedAsset.distance).progress} className="h-2" />
              </div>
            </div>

            {/* Direction Indicator */}
            <div className="flex items-center justify-center gap-8 p-6 bg-muted rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background mb-2">
                  <Navigation className="h-8 w-8 text-primary" style={{ transform: "rotate(45deg)" }} />
                </div>
                <div className="text-sm">Direction</div>
                <div>{selectedAsset.direction}</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background mb-2">
                  <div className="flex gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 rounded-full transition-all",
                          i < getSignalBars(selectedAsset.signalStrength)
                            ? cn("bg-primary", getSignalColor(selectedAsset.signalStrength))
                            : "bg-muted-foreground/30"
                        )}
                        style={{ height: `${(i + 1) * 6}px` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-sm">Signal</div>
                <div>{selectedAsset.signalStrength}%</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={isBeaconing ? "secondary" : "default"}
                onClick={handleBeacon}
                disabled={isBeaconing}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {isBeaconing ? "Beaconing..." : "Activate Beacon"}
              </Button>
              <Button variant="outline" onClick={handleShowOnMap}>
                <MapPin className="h-4 w-4 mr-2" />
                Show on Map
              </Button>
            </div>

            {/* Tips */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-blue-900">Finding Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Move slowly and watch the distance indicator</li>
                    <li>• Signal strength improves as you get closer</li>
                    <li>• Use beacon when within 15 meters</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nearby Assets List */}
      {findingMode === "nearby" && !selectedAsset && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nearby Assets</CardTitle>
              <Badge variant="outline">{mockNearbyAssets.length} detected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockNearbyAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center justify-center w-16">
                      <div className="text-2xl">{asset.distance}m</div>
                      <div className="text-xs text-muted-foreground">{asset.direction}</div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4>{asset.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {asset.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{asset.id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-1 rounded-full",
                                i < getSignalBars(asset.signalStrength)
                                  ? "bg-primary"
                                  : "bg-muted-foreground/30"
                              )}
                              style={{ height: `${(i + 1) * 4}px` }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {asset.signalStrength}% • {asset.lastSeen}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button size="sm">
                    <Target className="h-4 w-4 mr-2" />
                    Find
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {findingMode === "search" && searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Searching for assets matching "{searchTerm}"...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!selectedAsset && (
        <Card>
          <CardHeader>
            <CardTitle>How to Find Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Radio className="h-6 w-6 text-primary" />
                </div>
                <h4>1. Detect Nearby</h4>
                <p className="text-sm text-muted-foreground">
                  View all assets within BLE range (up to 100m). Assets are automatically detected based on signal strength.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Navigation className="h-6 w-6 text-primary" />
                </div>
                <h4>2. Follow Direction</h4>
                <p className="text-sm text-muted-foreground">
                  Use the distance and direction indicators to navigate toward the asset. Signal strength increases as you get closer.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <Volume2 className="h-6 w-6 text-primary" />
                </div>
                <h4>3. Activate Beacon</h4>
                <p className="text-sm text-muted-foreground">
                  When within 15 meters, trigger the beacon to make the asset emit sound and vibration for easy location.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

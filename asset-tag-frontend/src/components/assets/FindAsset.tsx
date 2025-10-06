import { useState } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { Progress } from &apos;../ui/progress&apos;;
import {
  Search,
  MapPin,
  Navigation,
  Radio,
  Volume2,
  TrendingUp,
  Target,
} from &apos;lucide-react&apos;;
import { cn } from &apos;../ui/utils&apos;;
import { PageLayout } from &apos;../common&apos;;
import { toast } from &apos;sonner&apos;;
import type { Asset } from &apos;../types&apos;;

// Mock nearby assets - using real asset IDs from mockData
const mockNearbyAssets = [
  {
    id: &apos;AT-42892&apos;,
    name: &apos;Generator Diesel 50kW&apos;,
    type: &apos;Power Equipment&apos;,
    distance: 12,
    signalStrength: 85,
    direction: &apos;NE&apos;,
    lastSeen: &apos;2 seconds ago&apos;,
  },
  {
    id: &apos;AT-42893&apos;,
    name: &apos;Concrete Mixer M400&apos;,
    type: &apos;Heavy Equipment&apos;,
    distance: 28,
    signalStrength: 65,
    direction: &apos;SW&apos;,
    lastSeen: &apos;5 seconds ago&apos;,
  },
  {
    id: &apos;AT-42894&apos;,
    name: &apos;Tool Kit Professional&apos;,
    type: &apos;Precision Tools&apos;,
    distance: 45,
    signalStrength: 42,
    direction: &apos;N&apos;,
    lastSeen: &apos;8 seconds ago&apos;,
  },
  {
    id: &apos;AT-42891&apos;,
    name: &apos;Excavator CAT 320&apos;,
    type: &apos;Heavy Equipment&apos;,
    distance: 67,
    signalStrength: 28,
    direction: &apos;SE&apos;,
    lastSeen: &apos;12 seconds ago&apos;,
  },
];

interface FindAssetProps {
  onShowOnMap?: (asset: Asset) => void;
}

export function FindAsset({ onShowOnMap }: FindAssetProps) {
  const [searchTerm, setSearchTerm] = useState(&apos;&apos;);
  const [selectedAsset, setSelectedAsset] = useState<
    (typeof mockNearbyAssets)[0] | null
  >(null);
  const [isBeaconing, setIsBeaconing] = useState(false);
  const [findingMode, setFindingMode] = useState<&apos;nearby&apos; | &apos;search&apos;>(&apos;nearby&apos;);

  const handleBeacon = () => {
    setIsBeaconing(true);
    toast.success(&apos;Beacon activated&apos;, {
      description: &apos;Asset will emit sound and vibration for 30 seconds&apos;,
    });
    setTimeout(() => setIsBeaconing(false), 30000);
  };

  const handleShowOnMap = async () => {
    if (selectedAsset && onShowOnMap) {
      // Fetch the full asset data from mockData
      const { getAssetById } = await import(&apos;../data/mockData&apos;);
      const asset = getAssetById(selectedAsset.id);

      if (asset) {
        onShowOnMap(asset);
        toast.success(&apos;Navigating to map&apos;, {
          description: `Showing ${selectedAsset.name} on map`,
        });
      } else {
        toast.error(&apos;Asset not found&apos;, {
          description: `Could not find asset ${selectedAsset.id}`,
        });
      }
    }
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 70) return &apos;text-green-600&apos;;
    if (strength >= 40) return &apos;text-yellow-600&apos;;
    return &apos;text-red-600&apos;;
  };

  const getSignalBars = (strength: number) => {
    if (strength >= 70) return 4;
    if (strength >= 50) return 3;
    if (strength >= 30) return 2;
    return 1;
  };

  const getProximityLevel = (distance: number) => {
    if (distance <= 15)
      return { level: &apos;Very Close&apos;, color: &apos;text-green-600&apos;, progress: 90 };
    if (distance <= 30)
      return { level: &apos;Close&apos;, color: &apos;text-blue-600&apos;, progress: 70 };
    if (distance <= 50)
      return { level: &apos;Near&apos;, color: &apos;text-yellow-600&apos;, progress: 50 };
    return { level: &apos;Far&apos;, color: &apos;text-orange-600&apos;, progress: 25 };
  };

  return (
    <PageLayout variant=&apos;narrow&apos; padding=&apos;lg&apos;>
      {/* Header */}
      <div>
        <h1>Find Asset</h1>
        <p className=&apos;text-muted-foreground&apos;>
          Locate assets nearby using BLE signal strength and proximity detection
        </p>
      </div>

      {/* Mode Selector */}
      <div className=&apos;flex items-center gap-2&apos;>
        <Button
          variant={findingMode === &apos;nearby&apos; ? &apos;default&apos; : &apos;outline&apos;}
          onClick={() => setFindingMode(&apos;nearby&apos;)}
        >
          <Radio className=&apos;h-4 w-4 mr-2&apos; />
          Nearby Assets
        </Button>
        <Button
          variant={findingMode === &apos;search&apos; ? &apos;default&apos; : &apos;outline&apos;}
          onClick={() => setFindingMode(&apos;search&apos;)}
        >
          <Search className=&apos;h-4 w-4 mr-2&apos; />
          Search Asset
        </Button>
      </div>

      {findingMode === &apos;search&apos; && (
        <Card>
          <CardContent className=&apos;pt-6&apos;>
            <div className=&apos;space-y-4&apos;>
              <div className=&apos;relative&apos;>
                <Search className=&apos;absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground&apos; />
                <Input
                  placeholder=&apos;Search by asset name, ID, or tag...&apos;
                  className=&apos;pl-9&apos;
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className=&apos;text-sm text-muted-foreground&apos;>
                Enter an asset ID or name to start finding. The system will
                guide you to the asset&apos;s location.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Finding Session */}
      {selectedAsset && (
        <Card className=&apos;border-primary&apos;>
          <CardHeader>
            <div className=&apos;flex items-center justify-between&apos;>
              <CardTitle>Finding: {selectedAsset.name}</CardTitle>
              <Button
                variant=&apos;outline&apos;
                size=&apos;sm&apos;
                onClick={() => setSelectedAsset(null)}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className=&apos;space-y-6&apos;>
            {/* Distance and Proximity */}
            <div className=&apos;text-center space-y-4&apos;>
              <div className=&apos;inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 relative&apos;>
                <div className=&apos;absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse&apos; />
                <div className=&apos;text-center&apos;>
                  <div className=&apos;text-4xl&apos;>{selectedAsset.distance}</div>
                  <div className=&apos;text-sm text-muted-foreground&apos;>meters</div>
                </div>
              </div>

              <div className=&apos;space-y-2&apos;>
                <div className=&apos;flex items-center justify-center gap-2&apos;>
                  <Target
                    className={cn(
                      &apos;h-5 w-5&apos;,
                      getProximityLevel(selectedAsset.distance).color
                    )}
                  />
                  <span
                    className={cn(
                      &apos;text-lg&apos;,
                      getProximityLevel(selectedAsset.distance).color
                    )}
                  >
                    {getProximityLevel(selectedAsset.distance).level}
                  </span>
                </div>
                <Progress
                  value={getProximityLevel(selectedAsset.distance).progress}
                  className=&apos;h-2&apos;
                />
              </div>
            </div>

            {/* Direction Indicator */}
            <div className=&apos;flex items-center justify-center gap-8 p-6 bg-muted rounded-lg&apos;>
              <div className=&apos;text-center&apos;>
                <div className=&apos;flex items-center justify-center w-16 h-16 rounded-full bg-background mb-2&apos;>
                  <Navigation
                    className=&apos;h-8 w-8 text-primary&apos;
                    style={{ transform: &apos;rotate(45deg)&apos; }}
                  />
                </div>
                <div className=&apos;text-sm&apos;>Direction</div>
                <div>{selectedAsset.direction}</div>
              </div>

              <div className=&apos;text-center&apos;>
                <div className=&apos;flex items-center justify-center w-16 h-16 rounded-full bg-background mb-2&apos;>
                  <div className=&apos;flex gap-0.5&apos;>
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          &apos;w-1 rounded-full transition-all&apos;,
                          i < getSignalBars(selectedAsset.signalStrength)
                            ? cn(
                                &apos;bg-primary&apos;,
                                getSignalColor(selectedAsset.signalStrength)
                              )
                            : &apos;bg-muted-foreground/30&apos;
                        )}
                        style={{ height: `${(i + 1) * 6}px` }}
                      />
                    ))}
                  </div>
                </div>
                <div className=&apos;text-sm&apos;>Signal</div>
                <div>{selectedAsset.signalStrength}%</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className=&apos;grid grid-cols-2 gap-3&apos;>
              <Button
                variant={isBeaconing ? &apos;secondary&apos; : &apos;default&apos;}
                onClick={handleBeacon}
                disabled={isBeaconing}
              >
                <Volume2 className=&apos;h-4 w-4 mr-2&apos; />
                {isBeaconing ? &apos;Beaconing...&apos; : &apos;Activate Beacon&apos;}
              </Button>
              <Button variant=&apos;outline&apos; onClick={handleShowOnMap}>
                <MapPin className=&apos;h-4 w-4 mr-2&apos; />
                Show on Map
              </Button>
            </div>

            {/* Tips */}
            <div className=&apos;p-4 bg-blue-50 border border-blue-200 rounded-lg&apos;>
              <div className=&apos;flex gap-2&apos;>
                <TrendingUp className=&apos;h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0&apos; />
                <div className=&apos;space-y-1&apos;>
                  <h4 className=&apos;text-blue-900&apos;>Finding Tips</h4>
                  <ul className=&apos;text-sm text-blue-700 space-y-1&apos;>
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
      {findingMode === &apos;nearby&apos; && !selectedAsset && (
        <Card>
          <CardHeader>
            <div className=&apos;flex items-center justify-between&apos;>
              <CardTitle>Nearby Assets</CardTitle>
              <Badge variant=&apos;outline&apos;>
                {mockNearbyAssets.length} detected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className=&apos;space-y-3&apos;>
              {mockNearbyAssets.map(asset => (
                <div
                  key={asset.id}
                  className=&apos;flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors&apos;
                  onClick={() => setSelectedAsset(asset)}
                >
                  <div className=&apos;flex items-center gap-4 flex-1&apos;>
                    <div className=&apos;flex flex-col items-center justify-center w-16&apos;>
                      <div className=&apos;text-2xl&apos;>{asset.distance}m</div>
                      <div className=&apos;text-xs text-muted-foreground&apos;>
                        {asset.direction}
                      </div>
                    </div>

                    <div className=&apos;flex-1&apos;>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <h4>{asset.name}</h4>
                        <Badge variant=&apos;outline&apos; className=&apos;text-xs&apos;>
                          {asset.type}
                        </Badge>
                      </div>
                      <p className=&apos;text-sm text-muted-foreground&apos;>
                        {asset.id}
                      </p>
                      <div className=&apos;flex items-center gap-2 mt-1&apos;>
                        <div className=&apos;flex gap-0.5&apos;>
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                &apos;w-1 rounded-full&apos;,
                                i < getSignalBars(asset.signalStrength)
                                  ? &apos;bg-primary&apos;
                                  : &apos;bg-muted-foreground/30&apos;
                              )}
                              style={{ height: `${(i + 1) * 4}px` }}
                            />
                          ))}
                        </div>
                        <span className=&apos;text-xs text-muted-foreground&apos;>
                          {asset.signalStrength}% • {asset.lastSeen}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button size=&apos;sm&apos;>
                    <Target className=&apos;h-4 w-4 mr-2&apos; />
                    Find
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {findingMode === &apos;search&apos; && searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=&apos;text-center py-8 text-muted-foreground&apos;>
              <Search className=&apos;h-12 w-12 mx-auto mb-4 opacity-50&apos; />
              <p>Searching for assets matching &quot;{searchTerm}&quot;...</p>
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
            <div className=&apos;grid md:grid-cols-3 gap-4&apos;>
              <div className=&apos;space-y-2&apos;>
                <div className=&apos;flex items-center justify-center w-12 h-12 rounded-full bg-primary/10&apos;>
                  <Radio className=&apos;h-6 w-6 text-primary&apos; />
                </div>
                <h4>1. Detect Nearby</h4>
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  View all assets within BLE range (up to 100m). Assets are
                  automatically detected based on signal strength.
                </p>
              </div>
              <div className=&apos;space-y-2&apos;>
                <div className=&apos;flex items-center justify-center w-12 h-12 rounded-full bg-primary/10&apos;>
                  <Navigation className=&apos;h-6 w-6 text-primary&apos; />
                </div>
                <h4>2. Follow Direction</h4>
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  Use the distance and direction indicators to navigate toward
                  the asset. Signal strength increases as you get closer.
                </p>
              </div>
              <div className=&apos;space-y-2&apos;>
                <div className=&apos;flex items-center justify-center w-12 h-12 rounded-full bg-primary/10&apos;>
                  <Volume2 className=&apos;h-6 w-6 text-primary&apos; />
                </div>
                <h4>3. Activate Beacon</h4>
                <p className=&apos;text-sm text-muted-foreground&apos;>
                  When within 15 meters, trigger the beacon to make the asset
                  emit sound and vibration for easy location.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

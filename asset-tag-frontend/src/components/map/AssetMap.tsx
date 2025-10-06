import React, { useState, useEffect, useRef } from &apos;react&apos;;
import { Card, CardContent, CardHeader, CardTitle } from &apos;../ui/card&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import { StatusBadge } from &apos;../common&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Checkbox } from &apos;../ui/checkbox&apos;;
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from &apos;../ui/collapsible&apos;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &apos;../ui/select&apos;;
import {
  Search,
  Layers,
  Maximize2,
  MapPin,
  Navigation,
  Truck,
  Wrench,
  Package as PackageIcon,
  Container,
  Battery,
  Clock,
  X,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
} from &apos;lucide-react&apos;;
import type {
  Asset as SharedAsset,
  Geofence as SharedGeofence,
} from &apos;../../types&apos;;
import {
  mockAssets as sharedMockAssets,
  mockGeofences as sharedMockGeofences,
} from &apos;../../data/mockData&apos;;

// Local types for this component
type AssetStatus = &apos;active&apos; | &apos;idle&apos; | &apos;in-transit&apos; | &apos;offline&apos;;
type AssetType = &apos;tools&apos; | &apos;vehicles&apos; | &apos;equipment&apos; | &apos;containers&apos;;

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  lat: number;
  lng: number;
  status: AssetStatus;
  battery: number;
  lastUpdate: string;
}

interface Site {
  id: string;
  name: string;
  center: [number, number];
  radius: number;
}

// Convert shared assets to local format for map display
const mockAssets: Asset[] = sharedMockAssets
  .filter(asset => asset.coordinates && asset.coordinates.length >= 2)
  .map(asset => ({
    id: asset.id,
    name: asset.name,
    type: asset.type.toLowerCase().includes(&apos;vehicle&apos;)
      ? &apos;vehicles&apos;
      : asset.type.toLowerCase().includes(&apos;tool&apos;)
        ? &apos;tools&apos;
        : asset.type.toLowerCase().includes(&apos;container&apos;)
          ? &apos;containers&apos;
          : &apos;equipment&apos;,
    lat: asset.coordinates?.[0] || 0,
    lng: asset.coordinates?.[1] || 0,
    status: asset.status as AssetStatus,
    battery: asset.battery,
    lastUpdate: asset.lastSeen,
  }));

const mockSites: Site[] = [
  {
    id: &apos;ST-1&apos;,
    name: &apos;Main Warehouse&apos;,
    center: [37.7849, -122.4194],
    radius: 100,
  },
  {
    id: &apos;ST-2&apos;,
    name: &apos;Construction Site B&apos;,
    center: [37.7649, -122.4194],
    radius: 150,
  },
];

interface AssetMapProps {
  onAssetClick?: (asset: SharedAsset) => void;
  onTrackHistory?: (asset: SharedAsset) => void;
  highlightAsset?: SharedAsset | null;
  onClearHighlight?: () => void;
  onBack?: () => void;
  filteredAssetIds?: string[];
  violationMode?: boolean;
  violatingGeofenceId?: string;
  expectedAssetIds?: string[];
  actualAssetIds?: string[];
}

export function AssetMap({
  onAssetClick,
  onTrackHistory,
  highlightAsset,
  onClearHighlight,
  onBack,
  filteredAssetIds,
  violationMode = false,
  violatingGeofenceId,
  expectedAssetIds,
  actualAssetIds,
}: AssetMapProps = {}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<unknown[]>([]);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchText, setSearchText] = useState(&apos;&apos;);
  const [typeFilter, setTypeFilter] = useState(&apos;all&apos;);
  const [statusFilter, setStatusFilter] = useState(&apos;all&apos;);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [showSites, setShowSites] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showExpectedAssets, setShowExpectedAssets] = useState(false);
  const [showActualAssets, setShowActualAssets] = useState(false);
  const [showViolatingAssets, setShowViolatingAssets] = useState(true);

  // Helper to find shared asset from local asset ID
  const findSharedAsset = (localAsset: Asset): SharedAsset | undefined => {
    return sharedMockAssets.find(a => a.id === localAsset.id);
  };

  // Helper to convert shared asset to local format for map display
  const toLocalAsset = (sharedAsset: SharedAsset): Asset | null => {
    if (!sharedAsset.coordinates || sharedAsset.coordinates.length < 2)
      return null;
    return {
      id: sharedAsset.id,
      name: sharedAsset.name,
      type: sharedAsset.type as AssetType,
      lat: sharedAsset.coordinates[0],
      lng: sharedAsset.coordinates[1],
      status: sharedAsset.status as AssetStatus,
      battery: sharedAsset.battery,
      lastUpdate: sharedAsset.lastSeen,
    };
  };

  // Filter assets
  const filteredAssets = mockAssets.filter(asset => {
    // If filteredAssetIds is provided (e.g., from Find Asset or violation mode), show only those assets
    if (filteredAssetIds && filteredAssetIds.length > 0) {
      return filteredAssetIds.includes(asset.id);
    }

    // If highlighting a specific asset without filteredAssetIds, show only that asset
    if (
      highlightAsset &&
      (!filteredAssetIds || filteredAssetIds.length === 0)
    ) {
      return asset.id === highlightAsset.id;
    }

    // Otherwise apply normal filters
    if (
      searchText &&
      !asset.name.toLowerCase().includes(searchText.toLowerCase()) &&
      !asset.id.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return false;
    }
    if (typeFilter !== &apos;all&apos; && asset.type !== typeFilter) {
      return false;
    }
    if (statusFilter !== &apos;all&apos; && asset.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically load Leaflet CSS
    const link = document.createElement(&apos;link&apos;);
    link.rel = &apos;stylesheet&apos;;
    link.href = &apos;https://unpkg.com/leaflet/dist/leaflet.css&apos;;
    document.head.appendChild(link);

    // Load Leaflet JS
    import(&apos;leaflet&apos;).then(L => {
      // Fix for default marker icon issue with webpack/vite
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          &apos;https://unpkg.com/leaflet/dist/images/marker-icon-2x.png&apos;,
        iconUrl: &apos;https://unpkg.com/leaflet/dist/images/marker-icon.png&apos;,
        shadowUrl: &apos;https://unpkg.com/leaflet/dist/images/marker-shadow.png&apos;,
      });

      // Initialize map centered on San Francisco
      if (!mapRef.current) return;
      const map = L.map(mapRef.current).setView([37.7749, -122.4194], 13);

      // Add OpenStreetMap tiles
      L.tileLayer(&apos;https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png&apos;, {
        attribution: &apos;© OpenStreetMap contributors&apos;,
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);

      // Cleanup
      return () => {
        map.remove();
      };
    });
  }, []);

  // Update markers when filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    import(&apos;leaflet&apos;).then(L => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Asset marker icons
      const getMarkerIcon = (type: AssetType, status: AssetStatus) => {
        const colors: Record<AssetStatus, string> = {
          active: &apos;#22c55e&apos;,
          idle: &apos;#fbbf24&apos;,
          &apos;in-transit&apos;: &apos;#3b82f6&apos;,
          offline: &apos;#ef4444&apos;,
        };

        const iconHtml = `
          <div style=&quot;
            background-color: ${colors[status]};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
          &quot;>
            <div style=&quot;transform: rotate(45deg); color: white; font-weight: bold; font-size: 12px;&quot;>
              ${type[0].toUpperCase()}
            </div>
          </div>
        `;

        return L.divIcon({
          html: iconHtml,
          className: &apos;custom-marker&apos;,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });
      };

      // Add asset markers
      filteredAssets.forEach(asset => {
        // In violation mode, use red markers
        const markerIcon = violationMode
          ? getMarkerIcon(asset.type, &apos;offline&apos;) // Use red color for violations
          : getMarkerIcon(asset.type, asset.status);

        const marker = L.marker([asset.lat, asset.lng], {
          icon: markerIcon,
        }).addTo(mapInstanceRef.current);

        const violationBadge = violationMode
          ? &apos;<div style=&quot;background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 8px;&quot;>⚠️ GEOFENCE VIOLATION</div>&apos;
          : &apos;&apos;;

        const popupContent = `
          <div style=&quot;min-width: 200px;&quot;>
            ${violationBadge}
            <div style=&quot;font-weight: 600; margin-bottom: 8px;&quot;>${asset.name}</div>
            <div style=&quot;font-size: 12px; color: #666; margin-bottom: 4px;&quot;>ID: ${asset.id}</div>
            <div style=&quot;font-size: 12px; margin-bottom: 4px;&quot;>
              <strong>Type:</strong> ${asset.type}
            </div>
            <div style=&quot;font-size: 12px; margin-bottom: 4px;&quot;>
              <strong>Status:</strong> ${asset.status}
            </div>
            <div style=&quot;font-size: 12px; margin-bottom: 4px;&quot;>
              <strong>Battery:</strong> ${asset.battery}%
            </div>
            <div style=&quot;font-size: 12px; color: #666;&quot;>
              ${asset.lastUpdate}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on(&apos;click&apos;, () => {
          setSelectedAsset(asset);
        });

        markersRef.current.push(marker);
      });

      // Add geofences
      if (showGeofences) {
        // Filter geofences based on violation mode
        let geofencesToShow: SharedGeofence[] = [];

        if (violationMode && violatingGeofenceId) {
          // In violation mode, only show the specific geofence
          const specificGeofence = sharedMockGeofences.find(
            g => g.id === violatingGeofenceId
          );
          if (specificGeofence) {
            geofencesToShow = [specificGeofence];
          }
        } else {
          // Show all geofences in normal mode
          geofencesToShow = sharedMockGeofences;
        }

        geofencesToShow.forEach(geofence => {
          // Determine color based on geofence type
          const color = violationMode
            ? &apos;#ef4444&apos; // Red for violation mode
            : geofence.geofenceType === &apos;restricted&apos;
              ? &apos;#ef4444&apos; // Red for restricted zones
              : &apos;#3b82f6&apos;; // Blue for authorized zones

          if (
            geofence.type === &apos;circular&apos; &&
            geofence.center &&
            geofence.radius
          ) {
            // Render circular geofence
            const circle = L.circle(geofence.center as [number, number], {
              color: color,
              fillColor: color,
              fillOpacity: 0.2,
              radius: geofence.radius, // radius is in feet, Leaflet uses meters
              weight: 3,
            }).addTo(mapInstanceRef.current);

            const popupContent = violationMode
              ? `<div style=&quot;min-width: 200px;&quot;>
                   <div style=&quot;background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 8px;&quot;>⚠️ EXPECTED BOUNDARY</div>
                   <strong>${geofence.name}</strong>
                   <div style=&quot;font-size: 12px; margin-top: 4px;&quot;>Assets should be within this zone</div>
                 </div>`
              : `<strong>${geofence.name}</strong>`;

            circle.bindPopup(popupContent);
            markersRef.current.push(circle);
          } else if (geofence.type === &apos;polygon&apos; && geofence.coordinates) {
            // Render polygon geofence
            const polygon = L.polygon(
              geofence.coordinates as [number, number][],
              {
                color: color,
                fillColor: color,
                fillOpacity: 0.2,
                weight: 3,
              }
            ).addTo(mapInstanceRef.current);

            const popupContent = violationMode
              ? `<div style=&quot;min-width: 200px;&quot;>
                   <div style=&quot;background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 8px;&quot;>⚠️ EXPECTED BOUNDARY</div>
                   <strong>${geofence.name}</strong>
                   <div style=&quot;font-size: 12px; margin-top: 4px;&quot;>Assets should be within this zone</div>
                 </div>`
              : `<strong>${geofence.name}</strong>`;

            polygon.bindPopup(popupContent);
            markersRef.current.push(polygon);
          }
        });
      }

      // Add sites (don&apos;t show sites in violation mode)
      if (showSites && !violationMode) {
        mockSites.forEach(site => {
          const circle = L.circle(site.center, {
            color: &apos;#8b5cf6&apos;,
            fillColor: &apos;#8b5cf6&apos;,
            fillOpacity: 0.1,
            radius: site.radius,
            weight: 2,
            dashArray: &apos;5, 5&apos;,
          }).addTo(mapInstanceRef.current);

          circle.bindPopup(`<strong>${site.name}</strong>`);
          markersRef.current.push(circle);
        });
      }
    });
  }, [
    filteredAssets,
    showGeofences,
    showSites,
    mapLoaded,
    violationMode,
    violatingGeofenceId,
  ]);

  // Handle highlighted asset from Find Asset page
  useEffect(() => {
    if (highlightAsset && mapLoaded) {
      const localAsset = toLocalAsset(highlightAsset);
      if (localAsset) {
        flyToAsset(localAsset);
      }
    }
  }, [highlightAsset, mapLoaded]);

  // Auto-center map on geofence in violation mode
  useEffect(() => {
    if (
      violationMode &&
      violatingGeofenceId &&
      mapLoaded &&
      mapInstanceRef.current
    ) {
      const geofence = sharedMockGeofences.find(
        g => g.id === violatingGeofenceId
      );
      if (geofence) {
        if (geofence.type === &apos;circular&apos; && geofence.center) {
          // Center on circular geofence
          mapInstanceRef.current.setView(
            geofence.center as [number, number],
            14
          );
        } else if (
          geofence.type === &apos;polygon&apos; &&
          geofence.coordinates &&
          geofence.coordinates.length > 0
        ) {
          // Center on polygon geofence center
          const lats = geofence.coordinates.map(c => c[0]);
          const lngs = geofence.coordinates.map(c => c[1]);
          const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
          const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
          mapInstanceRef.current.setView([centerLat, centerLng], 14);
        }
      }
    }
  }, [violationMode, violatingGeofenceId, mapLoaded]);

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case &apos;equipment&apos;:
        return <Wrench className=&apos;h-4 w-4&apos; />;
      case &apos;vehicles&apos;:
        return <Truck className=&apos;h-4 w-4&apos; />;
      case &apos;tools&apos;:
        return <PackageIcon className=&apos;h-4 w-4&apos; />;
      case &apos;containers&apos;:
        return <Container className=&apos;h-4 w-4&apos; />;
    }
  };

  const flyToAsset = (asset: Asset) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([asset.lat, asset.lng], 16, {
        duration: 1,
      });
      setSelectedAsset(asset);
    }
  };

  const recenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([37.7749, -122.4194], 13);
    }
  };

  return (
    <div className=&apos;h-screen flex flex-col&apos;>
      {/* Header */}
      <div className=&apos;border-b bg-background px-8 py-4&apos;>
        <div className=&apos;flex items-center justify-between&apos;>
          <div className=&apos;flex items-center gap-4&apos;>
            {onBack && (
              <Button variant=&apos;ghost&apos; size=&apos;icon&apos; onClick={onBack}>
                <ArrowLeft className=&apos;h-5 w-5&apos; />
              </Button>
            )}
            <div>
              <h1>Live Asset Map</h1>
              <p className=&apos;text-muted-foreground&apos;>
                {violationMode
                  ? &apos;Showing assets outside their designated geofence boundaries&apos;
                  : &apos;Real-time location tracking with OpenStreetMap&apos;}
              </p>
            </div>
          </div>
          <div className=&apos;flex items-center gap-2&apos;>
            {violationMode && (
              <Badge
                variant=&apos;outline&apos;
                className=&apos;bg-red-50 text-red-700 border-red-200&apos;
              >
                ⚠️ {filteredAssets.length} Violation
                {filteredAssets.length !== 1 ? &apos;s&apos; : &apos;&apos;}
              </Badge>
            )}
            {!violationMode && (
              <>
                <Badge variant=&apos;outline&apos;>
                  {
                    sharedMockAssets.filter(
                      a => a.coordinates && a.coordinates.length >= 2
                    ).length
                  }{&apos; &apos;}
                  Assets Tracked
                </Badge>
                <Badge
                  variant=&apos;outline&apos;
                  className=&apos;bg-green-50 text-green-700 border-green-200&apos;
                >
                  {filteredAssets.length} Visible
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map and Controls */}
      <div className=&apos;flex-1 flex overflow-hidden&apos;>
        {/* Sidebar Filters */}
        <div className=&apos;w-80 border-r bg-background overflow-y-auto&apos;>
          <div className=&apos;p-4 space-y-4&apos;>
            {violationMode &&
              violatingGeofenceId &&
              (() => {
                const geofence = sharedMockGeofences.find(
                  g => g.id === violatingGeofenceId
                );

                return geofence ? (
                  <div className=&apos;p-4 bg-red-50 border border-red-200 rounded-lg space-y-3&apos;>
                    <div className=&apos;flex items-start gap-2&apos;>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <MapPin className=&apos;h-4 w-4 text-red-600&apos; />
                        <span className=&apos;text-sm text-red-900&apos;>
                          Geofence Violations
                        </span>
                      </div>
                    </div>

                    <div className=&apos;space-y-2&apos;>
                      <p className=&apos;text-xs text-red-800&apos;>
                        <strong>Geofence:</strong> {geofence.name}
                      </p>
                      <div className=&apos;space-y-2 text-xs&apos;>
                        {/* Expected Assets */}
                        <Collapsible
                          open={showExpectedAssets}
                          onOpenChange={setShowExpectedAssets}
                        >
                          <div className=&apos;flex justify-between items-center&apos;>
                            <span className=&apos;text-gray-700&apos;>
                              Expected Assets:
                            </span>
                            <div className=&apos;flex items-center gap-2&apos;>
                              <Badge variant=&apos;outline&apos; className=&apos;text-xs&apos;>
                                {expectedAssetIds?.length || 0}
                              </Badge>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant=&apos;ghost&apos;
                                  size=&apos;sm&apos;
                                  className=&apos;h-5 w-5 p-0&apos;
                                >
                                  {showExpectedAssets ? (
                                    <ChevronDown className=&apos;h-3 w-3&apos; />
                                  ) : (
                                    <ChevronRight className=&apos;h-3 w-3&apos; />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent className=&apos;mt-2 space-y-1 pl-2&apos;>
                            {expectedAssetIds?.map(id => {
                              const asset = sharedMockAssets.find(
                                a => a.id === id
                              );
                              return asset ? (
                                <div key={id} className=&apos;text-xs text-gray-600&apos;>
                                  • {asset.name} ({id})
                                </div>
                              ) : null;
                            })}
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Assets Inside Boundary */}
                        <Collapsible
                          open={showActualAssets}
                          onOpenChange={setShowActualAssets}
                        >
                          <div className=&apos;flex justify-between items-center&apos;>
                            <span className=&apos;text-green-700&apos;>
                              Inside Boundary:
                            </span>
                            <div className=&apos;flex items-center gap-2&apos;>
                              <Badge
                                variant=&apos;outline&apos;
                                className=&apos;text-xs bg-green-50 text-green-700 border-green-200&apos;
                              >
                                {actualAssetIds?.length || 0}
                              </Badge>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant=&apos;ghost&apos;
                                  size=&apos;sm&apos;
                                  className=&apos;h-5 w-5 p-0&apos;
                                >
                                  {showActualAssets ? (
                                    <ChevronDown className=&apos;h-3 w-3&apos; />
                                  ) : (
                                    <ChevronRight className=&apos;h-3 w-3&apos; />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent className=&apos;mt-2 space-y-1 pl-2&apos;>
                            {actualAssetIds?.map(id => {
                              const asset = sharedMockAssets.find(
                                a => a.id === id
                              );
                              return asset ? (
                                <div
                                  key={id}
                                  className=&apos;text-xs text-green-700&apos;
                                >
                                  • {asset.name} ({id})
                                </div>
                              ) : null;
                            })}
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Assets Outside Boundary (Violations) */}
                        <Collapsible
                          open={showViolatingAssets}
                          onOpenChange={setShowViolatingAssets}
                        >
                          <div className=&apos;flex justify-between items-center&apos;>
                            <span className=&apos;text-red-700&apos;>
                              Outside Boundary:
                            </span>
                            <div className=&apos;flex items-center gap-2&apos;>
                              <Badge
                                variant=&apos;outline&apos;
                                className=&apos;text-xs bg-red-50 text-red-700 border-red-200&apos;
                              >
                                {filteredAssets.length}
                              </Badge>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant=&apos;ghost&apos;
                                  size=&apos;sm&apos;
                                  className=&apos;h-5 w-5 p-0&apos;
                                >
                                  {showViolatingAssets ? (
                                    <ChevronDown className=&apos;h-3 w-3&apos; />
                                  ) : (
                                    <ChevronRight className=&apos;h-3 w-3&apos; />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent className=&apos;mt-2 space-y-1 pl-2&apos;>
                            {filteredAssetIds?.map(id => {
                              const asset = sharedMockAssets.find(
                                a => a.id === id
                              );
                              return asset ? (
                                <div key={id} className=&apos;text-xs text-red-700&apos;>
                                  • {asset.name} ({id})
                                </div>
                              ) : null;
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>

                    <p className=&apos;text-xs text-red-700 pt-2 border-t border-red-200&apos;>
                      Map shows only the {filteredAssets.length} violating asset
                      {filteredAssets.length !== 1 ? &apos;s&apos; : &apos;&apos;}
                    </p>
                  </div>
                ) : null;
              })()}

            {highlightAsset && (
              <div className=&apos;p-4 bg-blue-50 border border-blue-200 rounded-lg&apos;>
                <div className=&apos;flex items-start justify-between gap-2 mb-2&apos;>
                  <div className=&apos;flex items-center gap-2&apos;>
                    <MapPin className=&apos;h-4 w-4 text-blue-600&apos; />
                    <span className=&apos;text-sm text-blue-900&apos;>
                      Showing single asset
                    </span>
                  </div>
                  <Button
                    variant=&apos;ghost&apos;
                    size=&apos;sm&apos;
                    className=&apos;h-6 w-6 p-0&apos;
                    onClick={onClearHighlight}
                    title=&apos;Show all assets&apos;
                  >
                    <X className=&apos;h-4 w-4&apos; />
                  </Button>
                </div>
                <p className=&apos;text-xs text-blue-700&apos;>
                  Click × to show all assets
                </p>
              </div>
            )}

            <div>
              <label className=&apos;text-sm mb-2 block&apos;>Search Assets</label>
              <div className=&apos;relative&apos;>
                <Search className=&apos;absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground&apos; />
                <Input
                  placeholder=&apos;Search by name or ID...&apos;
                  className=&apos;pl-9&apos;
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  disabled={!!highlightAsset || violationMode}
                />
              </div>
            </div>

            <div>
              <label className=&apos;text-sm mb-2 block&apos;>Asset Type</label>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
                disabled={!!highlightAsset || violationMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;all&apos;>All Types</SelectItem>
                  <SelectItem value=&apos;tools&apos;>Tools</SelectItem>
                  <SelectItem value=&apos;vehicles&apos;>Vehicles</SelectItem>
                  <SelectItem value=&apos;equipment&apos;>Equipment</SelectItem>
                  <SelectItem value=&apos;containers&apos;>Containers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className=&apos;text-sm mb-2 block&apos;>Status</label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                disabled={!!highlightAsset || violationMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&apos;all&apos;>All Statuses</SelectItem>
                  <SelectItem value=&apos;active&apos;>Active</SelectItem>
                  <SelectItem value=&apos;idle&apos;>Idle</SelectItem>
                  <SelectItem value=&apos;in-transit&apos;>In Transit</SelectItem>
                  <SelectItem value=&apos;offline&apos;>Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!violationMode && (
              <div className=&apos;pt-4 border-t&apos;>
                <div className=&apos;flex items-center justify-between mb-3&apos;>
                  <span className=&apos;text-sm&apos;>Map Layers</span>
                  <Layers className=&apos;h-4 w-4 text-muted-foreground&apos; />
                </div>
                <div className=&apos;space-y-3&apos;>
                  <div className=&apos;flex items-center gap-2&apos;>
                    <Checkbox
                      id=&apos;geofences&apos;
                      checked={showGeofences}
                      onCheckedChange={checked =>
                        setShowGeofences(checked as boolean)
                      }
                    />
                    <label
                      htmlFor=&apos;geofences&apos;
                      className=&apos;text-sm cursor-pointer&apos;
                    >
                      Geofences
                    </label>
                  </div>
                  <div className=&apos;flex items-center gap-2&apos;>
                    <Checkbox
                      id=&apos;sites&apos;
                      checked={showSites}
                      onCheckedChange={checked =>
                        setShowSites(checked as boolean)
                      }
                    />
                    <label htmlFor=&apos;sites&apos; className=&apos;text-sm cursor-pointer&apos;>
                      Site Boundaries
                    </label>
                  </div>
                  <div className=&apos;flex items-center gap-2&apos;>
                    <Checkbox
                      id=&apos;clusters&apos;
                      checked={showClusters}
                      onCheckedChange={checked =>
                        setShowClusters(checked as boolean)
                      }
                    />
                    <label
                      htmlFor=&apos;clusters&apos;
                      className=&apos;text-sm cursor-pointer&apos;
                    >
                      Asset Clusters
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className=&apos;pt-4 border-t&apos;>
              <div className=&apos;text-sm mb-3&apos;>Status Legend</div>
              <div className=&apos;space-y-2&apos;>
                <div className=&apos;flex items-center gap-2 text-sm&apos;>
                  <div className=&apos;w-3 h-3 rounded-full bg-green-500&apos;></div>
                  <span>Active</span>
                </div>
                <div className=&apos;flex items-center gap-2 text-sm&apos;>
                  <div className=&apos;w-3 h-3 rounded-full bg-yellow-500&apos;></div>
                  <span>Idle</span>
                </div>
                <div className=&apos;flex items-center gap-2 text-sm&apos;>
                  <div className=&apos;w-3 h-3 rounded-full bg-blue-500&apos;></div>
                  <span>In Transit</span>
                </div>
                <div className=&apos;flex items-center gap-2 text-sm&apos;>
                  <div className=&apos;w-3 h-3 rounded-full bg-red-500&apos;></div>
                  <span>Offline</span>
                </div>
              </div>
            </div>
          </div>

          {/* Asset List */}
          <div className=&apos;border-t p-4&apos;>
            <div className=&apos;flex items-center justify-between mb-3&apos;>
              <h3>Assets ({filteredAssets.length})</h3>
            </div>
            <div className=&apos;space-y-2&apos;>
              {filteredAssets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => flyToAsset(asset)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedAsset?.id === asset.id
                      ? &apos;bg-primary/5 border-primary shadow-sm&apos;
                      : &apos;bg-card hover:bg-accent hover:shadow-sm&apos;
                  }`}
                >
                  <div className=&apos;flex items-start justify-between gap-2&apos;>
                    <div className=&apos;flex-1 min-w-0&apos;>
                      <div className=&apos;flex items-center gap-2 mb-1&apos;>
                        {getAssetIcon(asset.type)}
                        <div className=&apos;text-sm truncate&apos;>{asset.name}</div>
                      </div>
                      <div className=&apos;text-xs text-muted-foreground mb-2&apos;>
                        {asset.id}
                      </div>
                      <div className=&apos;flex items-center gap-2&apos;>
                        <StatusBadge
                          status={asset.status}
                          className=&apos;text-xs&apos;
                        />
                        <span className=&apos;text-xs text-muted-foreground flex items-center gap-1&apos;>
                          <Battery className=&apos;h-3 w-3&apos; />
                          {asset.battery}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className=&apos;flex-1 relative&apos;>
          <div ref={mapRef} className=&apos;absolute inset-0&apos; />

          {/* Map Controls */}
          <div className=&apos;absolute top-4 right-4 flex flex-col gap-2 z-[1000]&apos;>
            <Button
              size=&apos;icon&apos;
              variant=&apos;secondary&apos;
              className=&apos;bg-background shadow-lg&apos;
              onClick={recenterMap}
              title=&apos;Recenter map&apos;
            >
              <Navigation className=&apos;h-4 w-4&apos; />
            </Button>
            <Button
              size=&apos;icon&apos;
              variant=&apos;secondary&apos;
              className=&apos;bg-background shadow-lg&apos;
              title=&apos;Fullscreen&apos;
            >
              <Maximize2 className=&apos;h-4 w-4&apos; />
            </Button>
          </div>

          {/* Selected Asset Info Card */}
          {selectedAsset && (
            <Card className=&apos;absolute bottom-4 left-4 w-96 z-[1000] shadow-xl&apos;>
              <CardHeader className=&apos;pb-3&apos;>
                <div className=&apos;flex items-start justify-between&apos;>
                  <div className=&apos;flex items-center gap-2&apos;>
                    {getAssetIcon(selectedAsset.type)}
                    <CardTitle className=&apos;text-base&apos;>
                      {selectedAsset.name}
                    </CardTitle>
                  </div>
                  <Button
                    size=&apos;icon&apos;
                    variant=&apos;ghost&apos;
                    className=&apos;h-6 w-6&apos;
                    onClick={() => setSelectedAsset(null)}
                  >
                    <X className=&apos;h-4 w-4&apos; />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className=&apos;space-y-3&apos;>
                <div className=&apos;flex justify-between text-sm&apos;>
                  <span className=&apos;text-muted-foreground&apos;>Asset ID:</span>
                  <span className=&apos;font-mono&apos;>{selectedAsset.id}</span>
                </div>
                <div className=&apos;flex justify-between text-sm&apos;>
                  <span className=&apos;text-muted-foreground&apos;>Type:</span>
                  <span className=&apos;capitalize&apos;>{selectedAsset.type}</span>
                </div>
                <div className=&apos;flex justify-between text-sm&apos;>
                  <span className=&apos;text-muted-foreground&apos;>Status:</span>
                  <StatusBadge status={selectedAsset.status} />
                </div>
                <div className=&apos;flex justify-between text-sm&apos;>
                  <span className=&apos;text-muted-foreground&apos;>Battery:</span>
                  <span
                    className={
                      selectedAsset.battery < 20
                        ? &apos;text-red-600&apos;
                        : &apos;text-green-600&apos;
                    }
                  >
                    {selectedAsset.battery}%
                  </span>
                </div>
                <div className=&apos;flex justify-between text-sm&apos;>
                  <span className=&apos;text-muted-foreground&apos;>Last Update:</span>
                  <span className=&apos;flex items-center gap-1&apos;>
                    <Clock className=&apos;h-3 w-3&apos; />
                    {selectedAsset.lastUpdate}
                  </span>
                </div>
                <div className=&apos;flex justify-between text-sm&apos;>
                  <span className=&apos;text-muted-foreground&apos;>Location:</span>
                  <span className=&apos;text-xs&apos;>
                    {selectedAsset.lat.toFixed(4)},{&apos; &apos;}
                    {selectedAsset.lng.toFixed(4)}
                  </span>
                </div>
                <div className=&apos;pt-3 border-t flex gap-2&apos;>
                  <Button
                    size=&apos;sm&apos;
                    className=&apos;flex-1&apos;
                    onClick={() => {
                      const sharedAsset = findSharedAsset(selectedAsset);
                      if (sharedAsset) onAssetClick?.(sharedAsset);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size=&apos;sm&apos;
                    variant=&apos;outline&apos;
                    className=&apos;flex-1&apos;
                    onClick={() => {
                      const sharedAsset = findSharedAsset(selectedAsset);
                      if (sharedAsset) onTrackHistory?.(sharedAsset);
                    }}
                  >
                    Track History
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

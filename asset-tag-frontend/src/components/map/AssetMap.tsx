import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { StatusBadge } from '../common';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
} from 'lucide-react';
import type {
  Asset as SharedAsset,
  Geofence as SharedGeofence,
} from '../types';
import {
  mockAssets as sharedMockAssets,
  mockGeofences as sharedMockGeofences,
} from '../../data/mockData';

// Local types for this component
type AssetStatus = 'active' | 'idle' | 'in-transit' | 'offline';
type AssetType = 'tools' | 'vehicles' | 'equipment' | 'containers';

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

interface Geofence {
  id: string;
  name: string;
  coordinates: [number, number][];
  color: string;
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
    type: asset.type.toLowerCase().includes('vehicle')
      ? 'vehicles'
      : asset.type.toLowerCase().includes('tool')
        ? 'tools'
        : asset.type.toLowerCase().includes('container')
          ? 'containers'
          : 'equipment',
    lat: asset.coordinates![0],
    lng: asset.coordinates![1],
    status: asset.status as AssetStatus,
    battery: asset.battery,
    lastUpdate: asset.lastSeen,
  }));

const mockSites: Site[] = [
  {
    id: 'ST-1',
    name: 'Main Warehouse',
    center: [37.7849, -122.4194],
    radius: 100,
  },
  {
    id: 'ST-2',
    name: 'Construction Site B',
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
  const markersRef = useRef<any[]>([]);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
    if (typeFilter !== 'all' && asset.type !== typeFilter) {
      return false;
    }
    if (statusFilter !== 'all' && asset.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    import('leaflet').then(L => {
      // Fix for default marker icon issue with webpack/vite
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
      });

      // Initialize map centered on San Francisco
      const map = L.map(mapRef.current!).setView([37.7749, -122.4194], 13);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
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

    import('leaflet').then(L => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Asset marker icons
      const getMarkerIcon = (type: AssetType, status: AssetStatus) => {
        const colors: Record<AssetStatus, string> = {
          active: '#22c55e',
          idle: '#fbbf24',
          'in-transit': '#3b82f6',
          offline: '#ef4444',
        };

        const iconHtml = `
          <div style="
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
          ">
            <div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 12px;">
              ${type[0].toUpperCase()}
            </div>
          </div>
        `;

        return L.divIcon({
          html: iconHtml,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });
      };

      // Add asset markers
      filteredAssets.forEach(asset => {
        // In violation mode, use red markers
        const markerIcon = violationMode
          ? getMarkerIcon(asset.type, 'offline') // Use red color for violations
          : getMarkerIcon(asset.type, asset.status);

        const marker = L.marker([asset.lat, asset.lng], {
          icon: markerIcon,
        }).addTo(mapInstanceRef.current);

        const violationBadge = violationMode
          ? '<div style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 8px;">⚠️ GEOFENCE VIOLATION</div>'
          : '';

        const popupContent = `
          <div style="min-width: 200px;">
            ${violationBadge}
            <div style="font-weight: 600; margin-bottom: 8px;">${asset.name}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">ID: ${asset.id}</div>
            <div style="font-size: 12px; margin-bottom: 4px;">
              <strong>Type:</strong> ${asset.type}
            </div>
            <div style="font-size: 12px; margin-bottom: 4px;">
              <strong>Status:</strong> ${asset.status}
            </div>
            <div style="font-size: 12px; margin-bottom: 4px;">
              <strong>Battery:</strong> ${asset.battery}%
            </div>
            <div style="font-size: 12px; color: #666;">
              ${asset.lastUpdate}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
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
            ? '#ef4444' // Red for violation mode
            : geofence.geofenceType === 'restricted'
              ? '#ef4444' // Red for restricted zones
              : '#3b82f6'; // Blue for authorized zones

          if (
            geofence.type === 'circular' &&
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
              ? `<div style="min-width: 200px;">
                   <div style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 8px;">⚠️ EXPECTED BOUNDARY</div>
                   <strong>${geofence.name}</strong>
                   <div style="font-size: 12px; margin-top: 4px;">Assets should be within this zone</div>
                 </div>`
              : `<strong>${geofence.name}</strong>`;

            circle.bindPopup(popupContent);
            markersRef.current.push(circle);
          } else if (geofence.type === 'polygon' && geofence.coordinates) {
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
              ? `<div style="min-width: 200px;">
                   <div style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-bottom: 8px;">⚠️ EXPECTED BOUNDARY</div>
                   <strong>${geofence.name}</strong>
                   <div style="font-size: 12px; margin-top: 4px;">Assets should be within this zone</div>
                 </div>`
              : `<strong>${geofence.name}</strong>`;

            polygon.bindPopup(popupContent);
            markersRef.current.push(polygon);
          }
        });
      }

      // Add sites (don't show sites in violation mode)
      if (showSites && !violationMode) {
        mockSites.forEach(site => {
          const circle = L.circle(site.center, {
            color: '#8b5cf6',
            fillColor: '#8b5cf6',
            fillOpacity: 0.1,
            radius: site.radius,
            weight: 2,
            dashArray: '5, 5',
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
        if (geofence.type === 'circular' && geofence.center) {
          // Center on circular geofence
          mapInstanceRef.current.setView(
            geofence.center as [number, number],
            14
          );
        } else if (
          geofence.type === 'polygon' &&
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
      case 'equipment':
        return <Wrench className='h-4 w-4' />;
      case 'vehicles':
        return <Truck className='h-4 w-4' />;
      case 'tools':
        return <PackageIcon className='h-4 w-4' />;
      case 'containers':
        return <Container className='h-4 w-4' />;
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
    <div className='h-screen flex flex-col'>
      {/* Header */}
      <div className='border-b bg-background px-8 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            {onBack && (
              <Button variant='ghost' size='icon' onClick={onBack}>
                <ArrowLeft className='h-5 w-5' />
              </Button>
            )}
            <div>
              <h1>Live Asset Map</h1>
              <p className='text-muted-foreground'>
                {violationMode
                  ? 'Showing assets outside their designated geofence boundaries'
                  : 'Real-time location tracking with OpenStreetMap'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {violationMode && (
              <Badge
                variant='outline'
                className='bg-red-50 text-red-700 border-red-200'
              >
                ⚠️ {filteredAssets.length} Violation
                {filteredAssets.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {!violationMode && (
              <>
                <Badge variant='outline'>
                  {
                    sharedMockAssets.filter(
                      a => a.coordinates && a.coordinates.length >= 2
                    ).length
                  }{' '}
                  Assets Tracked
                </Badge>
                <Badge
                  variant='outline'
                  className='bg-green-50 text-green-700 border-green-200'
                >
                  {filteredAssets.length} Visible
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map and Controls */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Sidebar Filters */}
        <div className='w-80 border-r bg-background overflow-y-auto'>
          <div className='p-4 space-y-4'>
            {violationMode &&
              violatingGeofenceId &&
              (() => {
                const geofence = sharedMockGeofences.find(
                  g => g.id === violatingGeofenceId
                );

                return geofence ? (
                  <div className='p-4 bg-red-50 border border-red-200 rounded-lg space-y-3'>
                    <div className='flex items-start gap-2'>
                      <div className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-red-600' />
                        <span className='text-sm text-red-900'>
                          Geofence Violations
                        </span>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <p className='text-xs text-red-800'>
                        <strong>Geofence:</strong> {geofence.name}
                      </p>
                      <div className='space-y-2 text-xs'>
                        {/* Expected Assets */}
                        <Collapsible
                          open={showExpectedAssets}
                          onOpenChange={setShowExpectedAssets}
                        >
                          <div className='flex justify-between items-center'>
                            <span className='text-gray-700'>
                              Expected Assets:
                            </span>
                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                {expectedAssetIds?.length || 0}
                              </Badge>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-5 w-5 p-0'
                                >
                                  {showExpectedAssets ? (
                                    <ChevronDown className='h-3 w-3' />
                                  ) : (
                                    <ChevronRight className='h-3 w-3' />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent className='mt-2 space-y-1 pl-2'>
                            {expectedAssetIds?.map(id => {
                              const asset = sharedMockAssets.find(
                                a => a.id === id
                              );
                              return asset ? (
                                <div key={id} className='text-xs text-gray-600'>
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
                          <div className='flex justify-between items-center'>
                            <span className='text-green-700'>
                              Inside Boundary:
                            </span>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='text-xs bg-green-50 text-green-700 border-green-200'
                              >
                                {actualAssetIds?.length || 0}
                              </Badge>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-5 w-5 p-0'
                                >
                                  {showActualAssets ? (
                                    <ChevronDown className='h-3 w-3' />
                                  ) : (
                                    <ChevronRight className='h-3 w-3' />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent className='mt-2 space-y-1 pl-2'>
                            {actualAssetIds?.map(id => {
                              const asset = sharedMockAssets.find(
                                a => a.id === id
                              );
                              return asset ? (
                                <div
                                  key={id}
                                  className='text-xs text-green-700'
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
                          <div className='flex justify-between items-center'>
                            <span className='text-red-700'>
                              Outside Boundary:
                            </span>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='text-xs bg-red-50 text-red-700 border-red-200'
                              >
                                {filteredAssets.length}
                              </Badge>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-5 w-5 p-0'
                                >
                                  {showViolatingAssets ? (
                                    <ChevronDown className='h-3 w-3' />
                                  ) : (
                                    <ChevronRight className='h-3 w-3' />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                          <CollapsibleContent className='mt-2 space-y-1 pl-2'>
                            {filteredAssetIds?.map(id => {
                              const asset = sharedMockAssets.find(
                                a => a.id === id
                              );
                              return asset ? (
                                <div key={id} className='text-xs text-red-700'>
                                  • {asset.name} ({id})
                                </div>
                              ) : null;
                            })}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>

                    <p className='text-xs text-red-700 pt-2 border-t border-red-200'>
                      Map shows only the {filteredAssets.length} violating asset
                      {filteredAssets.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                ) : null;
              })()}

            {highlightAsset && (
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-start justify-between gap-2 mb-2'>
                  <div className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-blue-600' />
                    <span className='text-sm text-blue-900'>
                      Showing single asset
                    </span>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0'
                    onClick={onClearHighlight}
                    title='Show all assets'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
                <p className='text-xs text-blue-700'>
                  Click × to show all assets
                </p>
              </div>
            )}

            <div>
              <label className='text-sm mb-2 block'>Search Assets</label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search by name or ID...'
                  className='pl-9'
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  disabled={!!highlightAsset || violationMode}
                />
              </div>
            </div>

            <div>
              <label className='text-sm mb-2 block'>Asset Type</label>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
                disabled={!!highlightAsset || violationMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='tools'>Tools</SelectItem>
                  <SelectItem value='vehicles'>Vehicles</SelectItem>
                  <SelectItem value='equipment'>Equipment</SelectItem>
                  <SelectItem value='containers'>Containers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='text-sm mb-2 block'>Status</label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                disabled={!!highlightAsset || violationMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='idle'>Idle</SelectItem>
                  <SelectItem value='in-transit'>In Transit</SelectItem>
                  <SelectItem value='offline'>Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!violationMode && (
              <div className='pt-4 border-t'>
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-sm'>Map Layers</span>
                  <Layers className='h-4 w-4 text-muted-foreground' />
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id='geofences'
                      checked={showGeofences}
                      onCheckedChange={checked =>
                        setShowGeofences(checked as boolean)
                      }
                    />
                    <label
                      htmlFor='geofences'
                      className='text-sm cursor-pointer'
                    >
                      Geofences
                    </label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id='sites'
                      checked={showSites}
                      onCheckedChange={checked =>
                        setShowSites(checked as boolean)
                      }
                    />
                    <label htmlFor='sites' className='text-sm cursor-pointer'>
                      Site Boundaries
                    </label>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id='clusters'
                      checked={showClusters}
                      onCheckedChange={checked =>
                        setShowClusters(checked as boolean)
                      }
                    />
                    <label
                      htmlFor='clusters'
                      className='text-sm cursor-pointer'
                    >
                      Asset Clusters
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className='pt-4 border-t'>
              <div className='text-sm mb-3'>Status Legend</div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='w-3 h-3 rounded-full bg-green-500'></div>
                  <span>Active</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                  <span>Idle</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                  <span>In Transit</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <div className='w-3 h-3 rounded-full bg-red-500'></div>
                  <span>Offline</span>
                </div>
              </div>
            </div>
          </div>

          {/* Asset List */}
          <div className='border-t p-4'>
            <div className='flex items-center justify-between mb-3'>
              <h3>Assets ({filteredAssets.length})</h3>
            </div>
            <div className='space-y-2'>
              {filteredAssets.map(asset => (
                <button
                  key={asset.id}
                  onClick={() => flyToAsset(asset)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedAsset?.id === asset.id
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'bg-card hover:bg-accent hover:shadow-sm'
                  }`}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        {getAssetIcon(asset.type)}
                        <div className='text-sm truncate'>{asset.name}</div>
                      </div>
                      <div className='text-xs text-muted-foreground mb-2'>
                        {asset.id}
                      </div>
                      <div className='flex items-center gap-2'>
                        <StatusBadge
                          status={asset.status}
                          className='text-xs'
                        />
                        <span className='text-xs text-muted-foreground flex items-center gap-1'>
                          <Battery className='h-3 w-3' />
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
        <div className='flex-1 relative'>
          <div ref={mapRef} className='absolute inset-0' />

          {/* Map Controls */}
          <div className='absolute top-4 right-4 flex flex-col gap-2 z-[1000]'>
            <Button
              size='icon'
              variant='secondary'
              className='bg-background shadow-lg'
              onClick={recenterMap}
              title='Recenter map'
            >
              <Navigation className='h-4 w-4' />
            </Button>
            <Button
              size='icon'
              variant='secondary'
              className='bg-background shadow-lg'
              title='Fullscreen'
            >
              <Maximize2 className='h-4 w-4' />
            </Button>
          </div>

          {/* Selected Asset Info Card */}
          {selectedAsset && (
            <Card className='absolute bottom-4 left-4 w-96 z-[1000] shadow-xl'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-2'>
                    {getAssetIcon(selectedAsset.type)}
                    <CardTitle className='text-base'>
                      {selectedAsset.name}
                    </CardTitle>
                  </div>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='h-6 w-6'
                    onClick={() => setSelectedAsset(null)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Asset ID:</span>
                  <span className='font-mono'>{selectedAsset.id}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Type:</span>
                  <span className='capitalize'>{selectedAsset.type}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Status:</span>
                  <StatusBadge status={selectedAsset.status} />
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Battery:</span>
                  <span
                    className={
                      selectedAsset.battery < 20
                        ? 'text-red-600'
                        : 'text-green-600'
                    }
                  >
                    {selectedAsset.battery}%
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Last Update:</span>
                  <span className='flex items-center gap-1'>
                    <Clock className='h-3 w-3' />
                    {selectedAsset.lastUpdate}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Location:</span>
                  <span className='text-xs'>
                    {selectedAsset.lat.toFixed(4)},{' '}
                    {selectedAsset.lng.toFixed(4)}
                  </span>
                </div>
                <div className='pt-3 border-t flex gap-2'>
                  <Button
                    size='sm'
                    className='flex-1'
                    onClick={() => {
                      const sharedAsset = findSharedAsset(selectedAsset);
                      if (sharedAsset) onAssetClick?.(sharedAsset);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    className='flex-1'
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

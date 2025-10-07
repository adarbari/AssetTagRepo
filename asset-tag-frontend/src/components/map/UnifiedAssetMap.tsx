import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap } from 'react-leaflet';
import { PageLayout } from '../common/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Checkbox } from '../ui/checkbox';
import { StatusBadge } from '../common/StatusBadge';
import { useOverlayState } from '../../hooks/useOverlayState';
import { mockAssets as sharedMockAssets, mockGeofences as sharedMockGeofences, mockSites as sharedMockSites } from '../../data/mockData';
import { Asset, Geofence } from '../../types';
import {
  Search,
  Layers,
  MapPin,
  Truck,
  Wrench,
  PackageIcon,
  Container,
  Battery,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Activity,
  Settings,
  Filter,
  Focus,
  List,
  Maximize2,
  Minimize2,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  Info,
  GripVertical,
  History,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import L from 'leaflet';

// Import new playback components
import { PlaybackControlPanel } from './PlaybackControlPanel';
import { CollapsibleAssetList } from './CollapsibleAssetList';
import { AnimatedMarkers } from './AnimatedMarkers';
import { PathPolylines } from './PathPolylines';
import { PlaybackMapUpdater } from './PlaybackMapUpdater';
import { usePlaybackState } from './usePlaybackState';
import './playback.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface UnifiedAssetMapProps {
  onAssetClick?: (asset: Asset) => void;
  onTrackHistory?: (asset: Asset) => void;
  highlightAsset?: Asset | null;
  onClearHighlight?: () => void;
  onBack?: () => void;
  filteredAssetIds?: string[];
  violationMode?: boolean;
  violatingGeofenceId?: string;
  expectedAssetIds?: string[];
  actualAssetIds?: string[];
}

// Component to update map when assets change (for live mode)
function LiveMapUpdater({ assets }: { assets: Asset[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (assets.length > 0) {
      // Fit map to show all assets
      const bounds = L.latLngBounds(
        assets
          .filter(asset => asset.coordinates && asset.coordinates.length >= 2)
          .map(asset => [asset.coordinates[0], asset.coordinates[1]])
      );
      if (!bounds.isValid()) return;
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [assets, map]);

  return null;
}

export function UnifiedAssetMap({
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
}: UnifiedAssetMapProps = {}) {
  console.log('🚀 UnifiedAssetMap component rendering...');
  
  // View mode state
  const [viewMode, setViewMode] = useState<'live' | 'playback'>('live');
  const [showPlaybackPanel, setShowPlaybackPanel] = useState(false);
  const [isAssetListCollapsed, setIsAssetListCollapsed] = useState(false);
  
  // Map refs
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerOverlayRef = useRef<HTMLDivElement>(null);

  // State management
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitFailed, setMapInitFailed] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showSites, setShowSites] = useState(true);

  // Playback state
  const playbackState = usePlaybackState();

  // Overlay state management with localStorage persistence
  const [isLayerControlsExpanded, setIsLayerControlsExpanded] = useOverlayState('map-layers-expanded', false);

  // Filter assets based on search and filters
  const filteredAssets = sharedMockAssets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                         asset.id?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesFilteredIds = !filteredAssetIds || filteredAssetIds.includes(asset.id);
    
    const matches = matchesSearch && matchesType && matchesStatus && matchesFilteredIds;
    
    // Debug logging
    if (searchText || typeFilter !== 'all' || statusFilter !== 'all') {
      console.log(`Asset ${asset.id} (${asset.name}):`, {
        matchesSearch,
        matchesType,
        matchesStatus,
        matchesFilteredIds,
        matches,
        searchText,
        typeFilter,
        statusFilter,
        assetType: asset.type,
        assetStatus: asset.status
      });
    }
    
    return matches;
  });

  // Click outside to close layer overlay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layerOverlayRef.current && !layerOverlayRef.current.contains(event.target as Node)) {
        setIsLayerControlsExpanded(false);
      }
    };
    
    if (isLayerControlsExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isLayerControlsExpanded]);


  // Load Leaflet CSS on component mount
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  // Asset selection handlers
  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleSelectAllAssets = () => {
    setSelectedAssets(filteredAssets.map(asset => asset.id));
  };

  const handleClearSelection = () => {
    setSelectedAssets([]);
  };

  // Fly to asset on map
  const flyToAsset = (asset: Asset) => {
    if (mapInstanceRef.current && asset.coordinates) {
      mapInstanceRef.current.setView([asset.coordinates[1], asset.coordinates[0]], 16);
      setSelectedAsset(asset);
    }
  };

  // Find shared asset for callbacks
  const findSharedAsset = (asset: Asset): Asset | undefined => {
    return sharedMockAssets.find(a => a.id === asset.id);
  };

  // Get asset icon
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'vehicles': return <Truck className='h-4 w-4' />;
      case 'tools': return <Wrench className='h-4 w-4' />;
      case 'equipment': return <PackageIcon className='h-4 w-4' />;
      case 'containers': return <Container className='h-4 w-4' />;
      default: return <PackageIcon className='h-4 w-4' />;
    }
  };

  // Playback mode handlers
  const handleEnterPlaybackMode = () => {
    // Only load historical data for focused assets (selectedAssets)
    // If no assets are focused, show a message or focus all assets
    const focusedAssetIds = selectedAssets.length > 0 ? selectedAssets : filteredAssets.map(asset => asset.id);
    
    console.log('🎬 Entering playback mode with focused assets:', {
      focusedCount: selectedAssets.length,
      totalFilteredCount: filteredAssets.length,
      focusedAssets: focusedAssetIds.map(id => {
        const asset = filteredAssets.find(a => a.id === id);
        return { id, name: asset?.name || 'Unknown' };
      })
    });
    
    playbackState.loadHistoricalData(focusedAssetIds);
    setViewMode('playback');
    setShowPlaybackPanel(true);
    // Auto-collapse asset panel when entering playback mode
    setIsAssetListCollapsed(true);
  };

  const handleExitPlaybackMode = () => {
    setViewMode('live');
    setShowPlaybackPanel(false);
    playbackState.reset();
  };

  // Invalidate map size when view mode or playback panel visibility changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100); // Small delay to ensure DOM updates are complete

    return () => clearTimeout(timer);
  }, [viewMode, showPlaybackPanel, isAssetListCollapsed]);

  // Map container class - use full height of available space with consistent sizing
  const mapContainerClass = 'h-full max-h-full';

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Header */}
      <div className='flex-shrink-0 border-b bg-background'>
        <div className='flex items-center justify-between p-4'>
        <div className='flex items-center gap-4'>
          {onBack && (
            <Button variant='ghost' size='icon' onClick={onBack}>
              <ArrowLeft className='h-5 w-5' />
            </Button>
          )}
          <div>
            <h1>Asset Intelligence Map</h1>
            <p className='text-muted-foreground'>
              {violationMode
                ? 'Showing assets outside their designated geofence boundaries'
                : viewMode === 'playback' 
                  ? 'Historical asset tracking and analysis'
                  : 'Real-time asset tracking and monitoring'}
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
                {sharedMockAssets.length} Assets
              </Badge>
              {selectedAssets.length > 0 && (
                <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
                  {selectedAssets.length} Focused
                </Badge>
              )}
              <Badge variant={viewMode === 'playback' ? 'default' : 'outline'}>
                {viewMode === 'playback' ? 'Playback Mode' : 'Live Mode'}
              </Badge>
            </>
          )}
          <Button
            variant={viewMode === 'playback' ? 'default' : 'outline'}
            size='sm'
            onClick={viewMode === 'playback' ? handleExitPlaybackMode : handleEnterPlaybackMode}
            className='flex items-center gap-2'
          >
            <History className='w-4 h-4' />
            {viewMode === 'playback' ? 'Live View' : 'Playback'}
          </Button>
        </div>
        </div>
      </div>

      {/* Fixed Search Bar */}
      <div className='flex-shrink-0 border-b bg-background p-4'>
        <div className='flex items-center gap-4'>
          {/* Search Input - Takes remaining space */}
          <div className='flex-1 relative min-w-0'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search assets by name or ID...'
              className='pl-10 pr-10'
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            {searchText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='w-32 md:w-40 flex-shrink-0'>
              <SelectValue placeholder='Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='Vehicle'>Vehicles</SelectItem>
              <SelectItem value='Tools'>Tools</SelectItem>
              <SelectItem value='Equipment'>Equipment</SelectItem>
              <SelectItem value='Heavy Equipment'>Heavy Equipment</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-32 md:w-40 flex-shrink-0'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='checked-out'>Checked Out</SelectItem>
              <SelectItem value='maintenance'>Maintenance</SelectItem>
              <SelectItem value='idle'>Idle</SelectItem>
              <SelectItem value='offline'>Offline</SelectItem>
            </SelectContent>
          </Select>

          {/* Results Count */}
          <div className='text-sm text-muted-foreground hidden sm:block flex-shrink-0'>
            {filteredAssets.length} assets
          </div>
        </div>
      </div>

      {/* Flexible Content Area - Map and Asset Panels */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 min-h-0"
        style={{ 
          height: showPlaybackPanel ? 'calc(100vh - 200px - 120px)' : 'calc(100vh - 200px)',
          maxHeight: showPlaybackPanel ? 'calc(100vh - 200px - 120px)' : 'calc(100vh - 200px)',
          overflow: 'hidden' // Prevent content from overflowing
        }}
      >
        {/* Map Area with Overlays - lg:col-span-2 */}
        <div className='lg:col-span-2 relative flex flex-col h-full max-h-full'>
          {/* Map Container */}
          <div className={`${mapContainerClass} rounded-lg border overflow-hidden relative flex-1`}>
            <MapContainer
              key={`map-${viewMode}-${showPlaybackPanel}`}
              center={[37.7749, -122.4194]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              ref={(map) => {
                if (map) {
                  mapRef.current = map;
                  mapInstanceRef.current = map;
                }
              }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors'
              />
              
              {/* Live Mode: Show current asset positions */}
              {viewMode === 'live' && (
                <>
                  <LiveMapUpdater assets={filteredAssets.filter(asset => selectedAssets.length === 0 || selectedAssets.includes(asset.id))} />
                  
                  {/* Geofences */}
                  {showGeofences && sharedMockGeofences.map(geofence => {
                    if (geofence.type === 'circular' && geofence.center && geofence.radius) {
                      return (
                        <Circle
                          key={geofence.id}
                          center={[geofence.center[0], geofence.center[1]]}
                          radius={geofence.radius * 0.3048} // Convert feet to meters
                          pathOptions={{
                            color: geofence.geofenceType === 'restricted' ? '#ef4444' : '#3b82f6',
                            weight: 2,
                            opacity: 0.8,
                            fillColor: geofence.geofenceType === 'restricted' ? '#fecaca' : '#dbeafe',
                            fillOpacity: 0.2,
                          }}
                        >
                          <Popup>
                            <div className="p-2">
                              <h3 className="font-semibold">{geofence.name}</h3>
                              <p className="text-sm text-muted-foreground">Type: {geofence.type}</p>
                              <p className="text-sm">Status: {geofence.status}</p>
                              <p className="text-sm">Assets: {geofence.assets}</p>
                              <p className="text-sm">Geofence Type: {geofence.geofenceType}</p>
                            </div>
                          </Popup>
                        </Circle>
                      );
                    } else if (geofence.type === 'polygon' && geofence.coordinates) {
                      const positions = geofence.coordinates.map(coord => [coord[0], coord[1]] as [number, number]);
                      return (
                        <Polygon
                          key={geofence.id}
                          positions={positions}
                          pathOptions={{
                            color: geofence.geofenceType === 'restricted' ? '#ef4444' : '#3b82f6',
                            weight: 2,
                            opacity: 0.8,
                            fillColor: geofence.geofenceType === 'restricted' ? '#fecaca' : '#dbeafe',
                            fillOpacity: 0.2,
                          }}
                        >
                          <Popup>
                            <div className="p-2">
                              <h3 className="font-semibold">{geofence.name}</h3>
                              <p className="text-sm text-muted-foreground">Type: {geofence.type}</p>
                              <p className="text-sm">Status: {geofence.status}</p>
                              <p className="text-sm">Assets: {geofence.assets}</p>
                              <p className="text-sm">Geofence Type: {geofence.geofenceType}</p>
                            </div>
                          </Popup>
                        </Polygon>
                      );
                    }
                    return null;
                  })}

                  {/* Site Boundaries */}
                  {showSites && sharedMockSites.map(site => {
                    if (!site.coordinates || !site.coordinates.lat || !site.coordinates.lng || !site.coordinates.radius) {
                      return null;
                    }
                    
                    return (
                      <Circle
                        key={`site-${site.id}`}
                        center={[site.coordinates.lat, site.coordinates.lng]}
                        radius={site.coordinates.radius * 0.3048} // Convert feet to meters
                        pathOptions={{
                          color: '#10b981', // Green color for sites
                          weight: 2,
                          opacity: 0.8,
                          fillColor: '#10b981',
                          fillOpacity: 0.1,
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold text-green-700">{site.name}</h3>
                            <p className="text-sm text-muted-foreground">Site Boundary</p>
                            <p className="text-sm">Status: {site.status}</p>
                            <p className="text-sm">Manager: {site.manager}</p>
                            <p className="text-sm">Assets: {site.assets}</p>
                            <p className="text-sm">Radius: {site.coordinates.radius} ft</p>
                          </div>
                        </Popup>
                      </Circle>
                    );
                  })}

                  {/* Site Markers */}
                  {showSites && sharedMockSites.map(site => {
                    if (!site.coordinates || !site.coordinates.lat || !site.coordinates.lng) {
                      return null;
                    }
                    
                    return (
                      <Marker
                        key={`site-marker-${site.id}`}
                        position={[site.coordinates.lat, site.coordinates.lng]}
                        icon={L.divIcon({
                          className: 'custom-site-marker',
                          html: `
                            <div style="
                              width: 24px;
                              height: 24px;
                              background-color: #10b981;
                              border: 3px solid white;
                              border-radius: 50%;
                              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              font-size: 12px;
                              color: white;
                              font-weight: bold;
                            ">
                              🏢
                            </div>
                          `,
                          iconSize: [24, 24],
                          iconAnchor: [12, 12]
                        })}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold text-green-700">{site.name}</h3>
                            <p className="text-sm text-muted-foreground">{site.location}</p>
                            <p className="text-sm">Status: {site.status}</p>
                            <p className="text-sm">Manager: {site.manager}</p>
                            <p className="text-sm">Assets: {site.assets}</p>
                            <p className="text-sm">Area: {site.area}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Asset Markers - Only show selected/focused assets */}
                  {filteredAssets
                    .filter(asset => selectedAssets.length === 0 || selectedAssets.includes(asset.id))
                    .map(asset => {
                      if (!asset.coordinates || asset.coordinates.length < 2) return null;
                      
                      return (
                        <Marker
                          key={asset.id}
                          position={[asset.coordinates[0], asset.coordinates[1]]}
                          eventHandlers={{
                            click: () => flyToAsset(asset),
                          }}
                        >
                          <Popup>
                            <div className="p-2">
                              <h3 className="font-semibold">{asset.name}</h3>
                              <p className="text-sm text-muted-foreground">ID: {asset.id}</p>
                              <p className="text-sm">Type: {asset.type}</p>
                              <p className="text-sm">Status: {asset.status}</p>
                              <p className="text-sm">Battery: {asset.battery}%</p>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                </>
              )}

              {/* Playback Mode: Show historical positions */}
              {viewMode === 'playback' && (
                <>
                  <PlaybackMapUpdater
                    histories={playbackState.histories}
                    currentTime={playbackState.currentTime}
                    selectedAssets={playbackState.selectedAssets}
                    showPaths={playbackState.showPaths}
                    showMarkers={playbackState.showMarkers}
                  />
                  
                  {playbackState.showPaths && (
                    <PathPolylines
                      histories={playbackState.histories}
                      currentTime={playbackState.currentTime}
                      selectedAssets={playbackState.selectedAssets}
                    />
                  )}
                  
                  {playbackState.showMarkers && (
                    <AnimatedMarkers
                      histories={playbackState.histories}
                      currentTime={playbackState.currentTime}
                      selectedAssets={playbackState.selectedAssets}
                    />
                  )}

                  {/* Site Boundaries - Also show in playback mode */}
                  {showSites && sharedMockSites.map(site => {
                    if (!site.coordinates || !site.coordinates.lat || !site.coordinates.lng || !site.coordinates.radius) {
                      return null;
                    }
                    
                    return (
                      <Circle
                        key={`site-${site.id}`}
                        center={[site.coordinates.lat, site.coordinates.lng]}
                        radius={site.coordinates.radius * 0.3048} // Convert feet to meters
                        pathOptions={{
                          color: '#10b981', // Green color for sites
                          weight: 2,
                          opacity: 0.8,
                          fillColor: '#10b981',
                          fillOpacity: 0.1,
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold text-green-700">{site.name}</h3>
                            <p className="text-sm text-muted-foreground">Site Boundary</p>
                            <p className="text-sm">Status: {site.status}</p>
                            <p className="text-sm">Manager: {site.manager}</p>
                            <p className="text-sm">Assets: {site.assets}</p>
                            <p className="text-sm">Radius: {site.coordinates.radius} ft</p>
                          </div>
                        </Popup>
                      </Circle>
                    );
                  })}

                  {/* Site Markers - Also show in playback mode */}
                  {showSites && sharedMockSites.map(site => {
                    if (!site.coordinates || !site.coordinates.lat || !site.coordinates.lng) {
                      return null;
                    }
                    
                    return (
                      <Marker
                        key={`site-marker-${site.id}`}
                        position={[site.coordinates.lat, site.coordinates.lng]}
                        icon={L.divIcon({
                          className: 'custom-site-marker',
                          html: `
                            <div style="
                              width: 24px;
                              height: 24px;
                              background-color: #10b981;
                              border: 3px solid white;
                              border-radius: 50%;
                              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              font-size: 12px;
                              color: white;
                              font-weight: bold;
                            ">
                              🏢
                            </div>
                          `,
                          iconSize: [24, 24],
                          iconAnchor: [12, 12]
                        })}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold text-green-700">{site.name}</h3>
                            <p className="text-sm text-muted-foreground">{site.location}</p>
                            <p className="text-sm">Status: {site.status}</p>
                            <p className="text-sm">Manager: {site.manager}</p>
                            <p className="text-sm">Assets: {site.assets}</p>
                            <p className="text-sm">Area: {site.area}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </>
              )}
            </MapContainer>

            {/* Map Legend Overlay - Always Visible with Transparent Background */}
            <div className='absolute bottom-4 left-4 z-10 hidden md:block'>
              <Card className='w-48 bg-background/90 backdrop-blur-sm shadow-lg border'>
                <CardHeader className='pb-2 pt-3 px-3'>
                  <CardTitle className='text-xs font-semibold'>Legend</CardTitle>
                </CardHeader>
                <CardContent className='px-3 pb-3'>
                  <div className='space-y-1.5'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-green-500' />
                      <span className='text-xs'>Active</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-yellow-500' />
                      <span className='text-xs'>Idle</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-blue-500' />
                      <span className='text-xs'>In Transit</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-gray-500' />
                      <span className='text-xs'>Offline</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-red-500 border-2 border-white' />
                      <span className='text-xs'>Violation</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-emerald-500 border-2 border-white' />
                      <span className='text-xs'>Site Boundary</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 rounded-full bg-blue-500 border-2 border-white' />
                      <span className='text-xs'>Geofence</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>

          {/* Map Layer Controls Overlay (Top-Right) - Desktop Only with Click Outside */}
          <div ref={layerOverlayRef} className='absolute top-4 right-4 z-10 hidden md:block'>
            <Collapsible open={isLayerControlsExpanded} onOpenChange={setIsLayerControlsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='bg-background shadow-lg border'
                >
                  <Layers className='h-4 w-4 mr-2' />
                  Layers
                  <ChevronDown className='h-3 w-3 ml-2' />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className='mt-2 w-56 bg-background shadow-lg border'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm'>Map Layers</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          id='geofences'
                          checked={showGeofences}
                          onCheckedChange={checked => setShowGeofences(checked as boolean)}
                        />
                        <label htmlFor='geofences' className='text-sm cursor-pointer'>
                          Geofences
                        </label>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          id='sites'
                          checked={showSites}
                          onCheckedChange={checked => setShowSites(checked as boolean)}
                        />
                        <label htmlFor='sites' className='text-sm cursor-pointer'>
                          Site Boundaries
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
                    </div>
                  </div>
                  
        {/* Right Panel - Collapsible Asset List - lg:col-span-1 */}
        <div className='lg:col-span-1 flex flex-col h-full max-h-full'>
          <CollapsibleAssetList
            assets={filteredAssets}
            selectedAssets={selectedAssets}
            onAssetSelect={handleAssetSelect}
            onAssetClick={(asset) => {
                              const sharedAsset = findSharedAsset(asset);
              if (sharedAsset) {
                flyToAsset(sharedAsset);
                onAssetClick?.(sharedAsset);
              }
            }}
            onTrackHistory={(asset) => {
                              const sharedAsset = findSharedAsset(asset);
                              if (sharedAsset) onTrackHistory?.(sharedAsset);
                            }}
            viewMode={viewMode}
            playbackHistories={playbackState.histories}
            currentPlaybackTime={playbackState.currentTime}
            isCollapsed={isAssetListCollapsed}
            onToggleCollapse={() => setIsAssetListCollapsed(!isAssetListCollapsed)}
          />
        </div>
      </div>

      {/* Fixed Playback Control Panel - Bottom of page */}
      {showPlaybackPanel && (
        <div className="flex-shrink-0 border-t bg-background">
          <PlaybackControlPanel
            isPlaying={playbackState.isPlaying}
            playbackSpeed={playbackState.playbackSpeed}
            currentTime={playbackState.currentTime}
            timeRange={playbackState.timeRange}
            progress={playbackState.progress}
            showPaths={playbackState.showPaths}
            showMarkers={playbackState.showMarkers}
            selectedAssetsCount={playbackState.selectedAssets.length}
            onPlayPause={playbackState.playPause}
            onSkipBack={playbackState.skipBack}
            onSkipForward={playbackState.skipForward}
            onReset={playbackState.reset}
            onSpeedChange={playbackState.setPlaybackSpeed}
            onTimeChange={playbackState.setCurrentTime}
            onShowPathsChange={playbackState.setShowPaths}
            onShowMarkersChange={playbackState.setShowMarkers}
            onDateRangeChange={playbackState.setDateRange}
            onClose={handleExitPlaybackMode}
            selectedDateRange={playbackState.selectedDateRange}
          />
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polygon } from 'react-leaflet';
import { PageLayout } from '../common/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { useOverlayState } from '../../hooks/useOverlayState';
import { mockAssets as sharedMockAssets, mockGeofences as sharedMockGeofences } from '../../data/mockData';
import { Asset, Geofence } from '../../types';
// AssetPlaybackMap has been deprecated in favor of UnifiedAssetMap
import { format } from 'date-fns';
import {
  Search,
  MapPin,
  Truck,
  Wrench,
  PackageIcon,
  Container,
  Battery,
  Clock,
  X,
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CalendarIcon,
  History,
  Settings,
  Filter,
  List,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ReactLeafletMapProps {
  assets?: Asset[];
  geofences?: Geofence[];
  selectedAssetId?: string;
  onAssetSelect?: (asset: Asset) => void;
  onTrackHistory?: (asset: Asset) => void;
  highlightAsset?: Asset | null;
  onClearHighlight?: () => void;
  onBack?: () => void;
  showGeofences?: boolean;
  showPaths?: boolean;
  timeRange?: { start: Date; end: Date };
  playbackSpeed?: number;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onTimeChange?: (time: Date) => void;
  filteredAssetIds?: string[];
  violationMode?: boolean;
  violatingGeofenceId?: string;
  expectedAssetIds?: string[];
  actualAssetIds?: string[];
}

// Component to update map when assets change
function MapUpdater({ assets }: { assets: Asset[] }) {
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

export function ReactLeafletMap({
  assets = sharedMockAssets,
  geofences = sharedMockGeofences,
  selectedAssetId,
  onAssetSelect,
  onTrackHistory,
  highlightAsset,
  onClearHighlight,
  onBack,
  showGeofences = true,
  showPaths = false,
  timeRange,
  playbackSpeed = 1,
  isPlaying = false,
  onPlayPause,
  onTimeChange,
  filteredAssetIds,
  violationMode = false,
  violatingGeofenceId,
  expectedAssetIds,
  actualAssetIds,
}: ReactLeafletMapProps = {}) {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetMarkers, setShowAssetMarkers] = useState(true);
  const [localShowGeofences, setLocalShowGeofences] = useState(showGeofences);
  const [localShowPaths, setLocalShowPaths] = useState(showPaths);
  
  // Secondary controls state
  const [showAllAssets, setShowAllAssets] = useState(true);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [localPlaybackSpeed, setLocalPlaybackSpeed] = useState(playbackSpeed);
  
  // Date range picker state
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(timeRange?.start);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(timeRange?.end);
  const [selectedRange, setSelectedRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: timeRange?.start,
    to: timeRange?.end
  });

  // Overlay states (keeping for potential future use)
  const [isPlaybackOpen, togglePlayback] = useOverlayState('playback', false);
  
  console.log('🚀 ReactLeafletMap component rendering...');
  
  // Debug: Log when component mounts
  useEffect(() => {
    console.log('🎯 ReactLeafletMap mounted!');
  }, []);

  console.log('🚀 Component state:', { 
    searchText, 
    selectedAsset, 
    isPlaybackOpen,
    assetsCount: assets.length 
  });

  // Filter assets based on search and filters
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                         asset.id?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesFilteredIds = !filteredAssetIds || filteredAssetIds.includes(asset.id);
    
    const matches = matchesSearch && matchesType && matchesStatus && matchesFilteredIds;
    
    // Debug logging
    if (!matches && (searchText || typeFilter !== 'all' || statusFilter !== 'all')) {
      console.log(`❌ Asset ${asset.id} filtered out:`, {
        name: asset.name,
        type: asset.type,
        status: asset.status,
        matchesSearch,
        matchesType,
        matchesStatus,
        searchText,
        typeFilter,
        statusFilter
      });
    }
    
    return matches;
  });

  // Debug: Log filtered results
  console.log(`🔍 Filtered ${filteredAssets.length} assets from ${assets.length} total`, {
    searchText,
    typeFilter,
    statusFilter,
    filteredCount: filteredAssets.length
  });

  // Utility function to generate filter options from asset data
  // This can be reused when backend integration is added
  const generateFilterOptions = (assets: Asset[], field: keyof Asset) => {
    const counts = assets.reduce((acc, asset) => {
      const value = asset[field];
      if (value && typeof value === 'string') {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  };

  // Generate filter options dynamically from data
  // Note: Using 'assets' prop which can be from mock data or backend API
  // TODO: When backend integration is added, this will be replaced with:
  // - API call to get unique asset types and statuses
  // - Or computed from the assets data received from backend
  
  // Base types from all assets
  const availableTypes = React.useMemo(() => 
    generateFilterOptions(assets, 'type').map(({ value, count }) => ({ type: value, count }))
  , [assets]);

  // Statuses should be filtered based on current type selection
  const availableStatuses = React.useMemo(() => {
    // If a specific type is selected, filter assets by that type first
    const assetsForStatusFilter = typeFilter === 'all' 
      ? assets 
      : assets.filter(asset => asset.type === typeFilter);
    
    return generateFilterOptions(assetsForStatusFilter, 'status').map(({ value, count }) => ({ status: value, count }));
  }, [assets, typeFilter]);

  // Reset status filter if current selection is not available in the filtered statuses
  React.useEffect(() => {
    if (statusFilter !== 'all' && !availableStatuses.some(s => s.status === statusFilter)) {
      setStatusFilter('all');
    }
  }, [availableStatuses, statusFilter]);

  // Asset selection handlers
  const handleAssetSelect = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    handleAssetSelect(asset.id);
    onAssetSelect?.(asset);
  };

  // Get asset icon based on type
  const getAssetIcon = (type: string) => {
    switch (type?.toLowerCase() || 'unknown') {
      case 'vehicle': return <Truck className="h-4 w-4" />;
      case 'equipment': return <Wrench className="h-4 w-4" />;
      case 'container': return <Container className="h-4 w-4" />;
      default: return <PackageIcon className="h-4 w-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase() || 'unknown') {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <PageLayout variant="full" padding="sm">
      <div className="h-screen flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Asset Intelligence Map</h1>
            <p className="text-muted-foreground">
              Real-time asset tracking and geofence monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Legacy Map View
            </Badge>
          </div>
        </div>

        {/* Top Search Bar - Single Line Layout */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search assets by name or ID..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Filter Results Indicator */}
            {(searchText || typeFilter !== 'all' || statusFilter !== 'all') && (
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredAssets.length} of {assets.length} assets
                  {searchText && ` matching "${searchText}"`}
                  {typeFilter !== 'all' && ` • Type: ${typeFilter}`}
                  {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchText('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                  }}
                  className="text-xs h-6 px-2"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types ({assets.length})</SelectItem>
                {availableTypes.map(({ type, count }) => (
                  <SelectItem key={type} value={type}>
                    {type} ({count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All Status ({typeFilter === 'all' ? assets.length : availableStatuses.reduce((sum, s) => sum + s.count, 0)})
                </SelectItem>
                {availableStatuses.map(({ status, count }) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')} ({count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <div 
          className="gap-6 flex-1 min-h-0 flex flex-col" 
        >
          {/* Map and Asset Panel Row */}
          <div 
            className="gap-6 flex-1 min-h-0" 
            style={{ 
              display: 'flex',
              flexDirection: window.innerWidth >= 1024 ? 'row' : 'column',
              height: 'calc(100vh - 200px)' // Fixed height to prevent overflow
            }}
          >
            {/* Map Area with Overlays - takes remaining space */}
            <div 
              className="relative flex flex-col"
              style={{ 
                flex: 1,
                minWidth: 0
              }}
            >
              {/* Map Container */}
              <div 
                className="w-full rounded-lg border overflow-hidden relative bg-gray-100"
                style={{ height: '100%' }}
              >
              <MapContainer
                center={[37.7749, -122.4194]}
                zoom={13}
                style={{ height: '100%', width: '100%', backgroundColor: '#e5e7eb' }}
                key="main-map" // Static key to prevent unnecessary re-renders
                whenReady={() => {
                  console.log('🗺️ Map is ready!');
                  console.log('🗺️ Map container size:', document.querySelector('.leaflet-container')?.getBoundingClientRect());
                }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='© OpenStreetMap contributors © CARTO'
                  eventHandlers={{
                    loading: () => console.log('🔄 Loading CartoDB tiles...'),
                    load: () => console.log('✅ CartoDB tiles loaded successfully!'),
                    tileerror: (e) => {
                      console.error('❌ CartoDB tile loading error:', e);
                      console.log('Error details:', e);
                    },
                  }}
                />
                
                {/* Update map bounds when assets change */}
                <MapUpdater assets={filteredAssets} />
                
                {/* Geofences */}
                {localShowGeofences && geofences.map(geofence => {
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

                {/* Asset Markers */}
                {showAssetMarkers && filteredAssets.map(asset => {
                  if (!asset.coordinates || asset.coordinates.length < 2) {
                    console.log(`❌ Asset ${asset.id} has invalid coordinates:`, asset.coordinates);
                    return null;
                  }
                  
                  console.log(`📍 Asset ${asset.id} at coordinates:`, [asset.coordinates[0], asset.coordinates[1]]);
                  
                  return (
                    <Marker
                      key={asset.id}
                      position={[asset.coordinates[0], asset.coordinates[1]]}
                      eventHandlers={{
                        click: () => handleAssetClick(asset),
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
              </MapContainer>

              {/* Map Legend Overlay - Always Visible with Transparent Background */}
              <div className="absolute bottom-4 left-4 z-10 hidden md:block">
                <Card className="w-48 bg-background/90 backdrop-blur-sm shadow-lg border">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Legend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 space-y-2">
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Active Assets</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Maintenance</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span>Error/Offline</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span>Other Assets</span>
                    </div>
                  </CardContent>
                </Card>
              </div>


            </div>
          </div>

          {/* Right Panel - Asset List */}
          <div 
            className="h-full"
            style={{ 
              width: window.innerWidth >= 1024 ? '320px' : '100%',
              flexShrink: 0
            }}
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center">
                  <List className="h-5 w-5 mr-2" />
                  Assets ({filteredAssets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  {filteredAssets.map(asset => (
                    <div
                      key={asset.id}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedAssets.includes(asset.id) ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleAssetClick(asset)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getAssetIcon(asset.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{asset.name}</h4>
                            <p className="text-xs text-muted-foreground">ID: {asset.id}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {asset.type}
                              </Badge>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(asset.status)}`}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Battery className="h-3 w-3 mr-1" />
                            {asset.battery}%
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {asset.lastSeen && !isNaN(new Date(asset.lastSeen).getTime()) 
                              ? format(new Date(asset.lastSeen), 'HH:mm') 
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

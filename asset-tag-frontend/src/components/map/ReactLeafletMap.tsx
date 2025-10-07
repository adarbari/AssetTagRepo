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
import { AssetPlaybackMap } from './AssetPlaybackMap';
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
  const [showPlaybackMode, setShowPlaybackMode] = useState(false);
  
  console.log('🚀 ReactLeafletMap component rendering...', { showPlaybackMode });
  
  // Debug: Log when component mounts
  useEffect(() => {
    console.log('🎯 ReactLeafletMap mounted!', { showPlaybackMode });
  }, [showPlaybackMode]);

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
              {showPlaybackMode && <span className="ml-2 text-blue-600 font-semibold">(Playback Mode)</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showPlaybackMode ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                console.log('🎯 Playback button clicked!', { currentMode: showPlaybackMode });
                setShowPlaybackMode(!showPlaybackMode);
              }}
              className='flex items-center gap-2'
            >
              📹
              {showPlaybackMode ? 'Live View' : 'Playback'}
            </Button>
            <Button
              variant="destructive"
              size='sm'
              onClick={() => {
                console.log('🚨 Test button clicked!');
                alert('Test button works!');
              }}
            >
              Test
            </Button>
          </div>
        </div>

        {/* Top Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
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
          <div className="flex gap-2">
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

        {/* Conditional Rendering: Playback Mode or Live View */}
        {showPlaybackMode ? (
          <>
            {console.log('🎬 Rendering AssetPlaybackMap')}
            <AssetPlaybackMap onBack={onBack} />
          </>
        ) : (
          <>
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

          {/* Professional Playback Controls Bar - Below Map and Asset Panel */}
          <div className="mt-4">
            <Card className="p-0 overflow-hidden">
              {/* Main Playback Bar */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    {/* Left Controls Group */}
                    <div className="flex items-center space-x-3">
                      {/* Play/Pause Button - Primary Control */}
                      <Button 
                        size="sm" 
                        onClick={onPlayPause}
                        className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-md"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                      </Button>
                      
                      {/* Skip Controls */}
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <SkipBack className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Time Display */}
                      <div className="flex items-center space-x-2 text-sm font-mono">
                        <span className="text-slate-600">00:00</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-500">24:00</span>
                      </div>
                    </div>

                    {/* Center - Timeline Scrubber */}
                    <div className="flex-1 mx-6">
                      <div className="relative">
                        {/* Timeline Track */}
                        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                          {/* Progress Fill */}
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-200"
                            style={{ width: '25%' }}
                          />
                        </div>
                        {/* Scrubber Handle */}
                        <div 
                          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
                          style={{ left: '25%', marginLeft: '-8px' }}
                        />
                      </div>
                    </div>

                    {/* Right Controls Group */}
                    <div className="flex items-center space-x-3">
                      {/* Speed Control */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600 font-medium">Speed</span>
                        <div className="flex items-center space-x-1">
                          <Button 
                            size="sm" 
                            variant={localPlaybackSpeed === 0.5 ? "default" : "ghost"}
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setLocalPlaybackSpeed(0.5);
                              console.log('Speed changed to: 0.5x');
                            }}
                          >
                            0.5x
                          </Button>
                          <Button 
                            size="sm" 
                            variant={localPlaybackSpeed === 1 ? "default" : "ghost"}
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setLocalPlaybackSpeed(1);
                              console.log('Speed changed to: 1x');
                            }}
                          >
                            1x
                          </Button>
                          <Button 
                            size="sm" 
                            variant={localPlaybackSpeed === 2 ? "default" : "ghost"}
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setLocalPlaybackSpeed(2);
                              console.log('Speed changed to: 2x');
                            }}
                          >
                            2x
                          </Button>
                          <Button 
                            size="sm" 
                            variant={localPlaybackSpeed === 4 ? "default" : "ghost"}
                            className="h-7 px-2 text-xs"
                            onClick={() => {
                              setLocalPlaybackSpeed(4);
                              console.log('Speed changed to: 4x');
                            }}
                          >
                            4x
                          </Button>
                        </div>
                      </div>

                      {/* Date Range Picker */}
                      <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                            <Calendar className="h-4 w-4 mr-2" />
                            {selectedRange.from && selectedRange.to 
                              ? `${format(selectedRange.from, 'MMM dd')} - ${format(selectedRange.to, 'MMM dd')}` 
                              : 'Select Range'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end" side="bottom" sideOffset={5}>
                          <div className="p-4">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">Select Time Range</h4>
                                <p className="text-xs text-muted-foreground">Click to select start and end dates</p>
                              </div>
                              
                              {/* Quick Preset Buttons */}
                              <div className="flex items-center justify-between">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs"
                                  onClick={() => {
                                    const today = new Date();
                                    const yesterday = new Date(today);
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    setSelectedRange({ from: yesterday, to: today });
                                    setTempStartDate(yesterday);
                                    setTempEndDate(today);
                                  }}
                                >
                                  Last 24h
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs"
                                  onClick={() => {
                                    const today = new Date();
                                    const weekAgo = new Date(today);
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    setSelectedRange({ from: weekAgo, to: today });
                                    setTempStartDate(weekAgo);
                                    setTempEndDate(today);
                                  }}
                                >
                                  Last 7 days
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs"
                                  onClick={() => {
                                    const today = new Date();
                                    const monthAgo = new Date(today);
                                    monthAgo.setDate(monthAgo.getDate() - 30);
                                    setSelectedRange({ from: monthAgo, to: today });
                                    setTempStartDate(monthAgo);
                                    setTempEndDate(today);
                                  }}
                                >
                                  Last 30 days
                                </Button>
                              </div>
                              
                              {/* Calendar for Date Range Selection */}
                              <div className="border rounded-lg p-3 bg-white">
                                <Calendar
                                  mode="range"
                                  selected={selectedRange}
                                  onSelect={(range) => {
                                    if (range?.from && range?.to) {
                                      setSelectedRange({ from: range.from, to: range.to });
                                      setTempStartDate(range.from);
                                      setTempEndDate(range.to);
                                    } else if (range?.from) {
                                      setSelectedRange({ from: range.from, to: undefined });
                                      setTempStartDate(range.from);
                                    }
                                  }}
                                  numberOfMonths={1}
                                  className="rounded-md"
                                  disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                />
                              </div>
                              
                              {/* Selected Range Display */}
                              {selectedRange.from && selectedRange.to && (
                                <div className="bg-slate-50 rounded-lg p-3">
                                  <div className="text-xs text-slate-600 mb-1">Selected Range:</div>
                                  <div className="text-sm font-medium">
                                    {format(selectedRange.from, 'MMM dd, yyyy')} - {format(selectedRange.to, 'MMM dd, yyyy')}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    {Math.ceil((selectedRange.to.getTime() - selectedRange.from.getTime()) / (1000 * 60 * 60 * 24))} days
                                  </div>
                                </div>
                              )}
                              
                              {/* Action Buttons */}
                              <div className="flex justify-end space-x-2 pt-2 border-t">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-xs"
                                  onClick={() => {
                                    setSelectedRange({ from: timeRange?.start, to: timeRange?.end });
                                    setTempStartDate(timeRange?.start);
                                    setTempEndDate(timeRange?.end);
                                    setIsDateRangeOpen(false);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="text-xs"
                                  onClick={() => {
                                    if (selectedRange.from && selectedRange.to) {
                                      console.log('Applying date range:', { 
                                        start: selectedRange.from, 
                                        end: selectedRange.to 
                                      });
                                      // Here you would update the actual timeRange prop
                                      setIsDateRangeOpen(false);
                                    }
                                  }}
                                  disabled={!selectedRange.from || !selectedRange.to}
                                >
                                  Apply Range
                                </Button>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Fullscreen */}
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Controls Row */}
              <div className="px-6 py-3 bg-white border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Asset Selection */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600 font-medium">Show:</span>
                      <div className="flex items-center space-x-1">
                        <Button 
                          size="sm" 
                          variant={showAllAssets ? "default" : "ghost"} 
                          className="h-7 px-3 text-xs"
                          onClick={() => {
                            setShowAllAssets(true);
                            setShowSelectedOnly(false);
                          }}
                        >
                          All Assets
                        </Button>
                        <Button 
                          size="sm" 
                          variant={showSelectedOnly ? "default" : "ghost"} 
                          className="h-7 px-3 text-xs"
                          onClick={() => {
                            setShowAllAssets(false);
                            setShowSelectedOnly(true);
                          }}
                        >
                          Selected ({selectedAssets.length})
                        </Button>
                      </div>
                    </div>

                    {/* Layer Controls */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-600 font-medium">Layers:</span>
                      <div className="flex items-center space-x-1">
                        <Button 
                          size="sm" 
                          variant={showAssetMarkers ? "default" : "ghost"} 
                          className="h-7 px-2 text-xs"
                          onClick={() => setShowAssetMarkers(!showAssetMarkers)}
                        >
                          {showAssetMarkers ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          Assets
                        </Button>
                        <Button 
                          size="sm" 
                          variant={localShowGeofences ? "default" : "ghost"} 
                          className="h-7 px-2 text-xs"
                          onClick={() => setLocalShowGeofences(!localShowGeofences)}
                        >
                          {localShowGeofences ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          Geofences
                        </Button>
                        <Button 
                          size="sm" 
                          variant={localShowPaths ? "default" : "ghost"} 
                          className="h-7 px-2 text-xs"
                          onClick={() => setLocalShowPaths(!localShowPaths)}
                        >
                          {localShowPaths ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                          Paths
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Indicator */}
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-600">Live</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}

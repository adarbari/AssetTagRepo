import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { StatusBadge } from '../common/StatusBadge';
import { Asset } from '../../types/asset';
import { AssetLocationHistory } from '../../data/mockData';
import { 
  ChevronLeft, 
  ChevronRight, 
  Truck, 
  Wrench, 
  PackageIcon, 
  Container, 
  Battery, 
  Clock, 
  Eye, 
  Route,
  MapPin,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface CollapsibleAssetListProps {
  // Assets data
  assets: Asset[];
  selectedAssets: string[];
  onAssetSelect: (assetId: string) => void;
  onAssetClick: (asset: Asset) => void;
  onTrackHistory: (asset: Asset) => void;
  
  // Playback data
  viewMode: 'live' | 'playback';
  playbackHistories: AssetLocationHistory[];
  currentPlaybackTime: number;
  
  // Collapse state
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function CollapsibleAssetList({
  assets,
  selectedAssets,
  onAssetSelect,
  onAssetClick,
  onTrackHistory,
  viewMode,
  playbackHistories,
  currentPlaybackTime,
  isCollapsed,
  onToggleCollapse
}: CollapsibleAssetListProps) {
  
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

  // Calculate playback stats for an asset
  const getPlaybackStats = (assetId: string) => {
    const history = playbackHistories.find(h => h.assetId === assetId);
    if (!history) return null;

    const pointsUpToCurrentTime = history.trackingPoints.filter(
      point => new Date(point.timestamp).getTime() <= currentPlaybackTime
    );

    if (pointsUpToCurrentTime.length < 2) return null;

    // Calculate total distance
    let totalDistance = 0;
    for (let i = 1; i < pointsUpToCurrentTime.length; i++) {
      const prev = pointsUpToCurrentTime[i - 1];
      const curr = pointsUpToCurrentTime[i];
      const distance = calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng);
      totalDistance += distance;
    }

    // Calculate average speed
    const timeSpan = new Date(pointsUpToCurrentTime[pointsUpToCurrentTime.length - 1].timestamp).getTime() - 
                     new Date(pointsUpToCurrentTime[0].timestamp).getTime();
    const averageSpeed = timeSpan > 0 ? (totalDistance / (timeSpan / 1000 / 3600)) : 0; // km/h

    return {
      distance: totalDistance,
      averageSpeed: averageSpeed,
      pointCount: pointsUpToCurrentTime.length,
      color: history.color
    };
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Collapsed view - just show icon strip
  if (isCollapsed) {
    return (
      <div className="w-12 bg-background border-l flex flex-col items-center py-4 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col items-center space-y-2">
          {assets.slice(0, 5).map(asset => {
            const isSelected = selectedAssets.includes(asset.id);
            const playbackStats = viewMode === 'playback' ? getPlaybackStats(asset.id) : null;
            
            return (
              <div
                key={asset.id}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted-foreground/30 hover:border-primary/50'
                }`}
                onClick={() => onAssetSelect(asset.id)}
                title={asset.name}
              >
                {viewMode === 'playback' && playbackStats ? (
                  <div 
                    className="w-6 h-6 rounded-full border border-white"
                    style={{ backgroundColor: playbackStats.color }}
                  />
                ) : (
                  getAssetIcon(asset.type)
                )}
              </div>
            );
          })}
          
          {assets.length > 5 && (
            <Badge variant="secondary" className="text-xs">
              +{assets.length - 5}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Expanded view - full asset list
  return (
    <div className="w-80 bg-background border-l flex flex-col h-full">
      <Card className="h-full flex flex-col rounded-none border-0">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Assets ({assets.length})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full overflow-y-auto">
            {assets.map(asset => {
              const isSelected = selectedAssets.includes(asset.id);
              const playbackStats = viewMode === 'playback' ? getPlaybackStats(asset.id) : null;
              
              return (
                <div
                  key={asset.id}
                  className={`w-full p-3 border-b cursor-pointer transition-all hover:bg-accent/50 ${
                    isSelected ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                  onClick={() => onAssetClick(asset)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Selection Checkbox */}
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onAssetSelect(asset.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5"
                      />
                      
                      {/* Asset Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {viewMode === 'playback' && playbackStats ? (
                            <div 
                              className="w-4 h-4 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: playbackStats.color }}
                            />
                          ) : (
                            getAssetIcon(asset.type)
                          )}
                          <div className="text-sm font-medium truncate">{asset.name}</div>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-2">
                          {asset.id}
                        </div>
                        
                        {/* Live Mode Info */}
                        {viewMode === 'live' && (
                          <div className="flex items-center gap-2">
                            <StatusBadge status={asset.status} className='text-xs' />
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Battery className='h-3 w-3' />
                              {asset.battery}%
                            </span>
                          </div>
                        )}
                        
                        {/* Playback Mode Info */}
                        {viewMode === 'playback' && playbackStats && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {playbackStats.pointCount} points
                              </Badge>
                              <StatusBadge status={asset.status} className='text-xs' />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Route className="h-3 w-3" />
                                <span>{playbackStats.distance.toFixed(1)} km</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Activity className="h-3 w-3" />
                                <span>{playbackStats.averageSpeed.toFixed(1)} km/h</span>
                              </div>
                            </div>
                            
                            {asset.lastSeen && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(asset.lastSeen), 'MMM dd, HH:mm')}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* No playback data message */}
                        {viewMode === 'playback' && !playbackStats && (
                          <div className="text-xs text-muted-foreground italic">
                            No historical data available
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssetClick(asset);
                        }}
                        className="h-7 w-7 p-0"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTrackHistory(asset);
                        }}
                        className="h-7 w-7 p-0"
                        title="Track History"
                      >
                        <Clock className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

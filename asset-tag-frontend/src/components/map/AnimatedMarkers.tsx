import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { AssetLocationHistory } from '../../data/mockData';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AnimatedMarkersProps {
  histories: AssetLocationHistory[];
  currentTime: number;
  selectedAssets: string[];
}

export function AnimatedMarkers({ 
  histories, 
  currentTime, 
  selectedAssets 
}: AnimatedMarkersProps) {
  const visibleHistories = histories.filter(h => selectedAssets.includes(h.assetId));
  
  return (
    <>
      {visibleHistories.map(history => {
        // Find the most recent point up to current time
        const pointsUpToCurrentTime = history.trackingPoints.filter(
          point => new Date(point.timestamp).getTime() <= currentTime
        );
        
        if (pointsUpToCurrentTime.length === 0) return null;
        
        const currentPoint = pointsUpToCurrentTime[pointsUpToCurrentTime.length - 1];
        
        // Create custom icon with asset color
        const customIcon = L.divIcon({
          className: 'custom-asset-marker',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background-color: ${history.color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: white;
              font-weight: bold;
            ">
              ${history.assetName.charAt(0)}
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        return (
          <Marker
            key={`${history.assetId}-current`}
            position={[currentPoint.lat, currentPoint.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm">{history.assetName}</h3>
                <p className="text-xs text-muted-foreground">{history.assetType}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Time:</span>
                    <span>{format(new Date(currentPoint.timestamp), 'MMM dd, HH:mm')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Event:</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {currentPoint.event}
                    </Badge>
                  </div>
                  {currentPoint.speed && (
                    <div className="flex justify-between text-xs">
                      <span>Speed:</span>
                      <span>{currentPoint.speed} km/h</span>
                    </div>
                  )}
                  {currentPoint.battery && (
                    <div className="flex justify-between text-xs">
                      <span>Battery:</span>
                      <span>{currentPoint.battery}%</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

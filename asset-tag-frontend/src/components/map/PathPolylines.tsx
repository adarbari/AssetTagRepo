import React from 'react';
import { Polyline } from 'react-leaflet';
import { AssetLocationHistory } from '../../data/mockData';

interface PathPolylinesProps {
  histories: AssetLocationHistory[];
  currentTime: number;
  selectedAssets: string[];
}

export function PathPolylines({ 
  histories, 
  currentTime, 
  selectedAssets 
}: PathPolylinesProps) {
  const visibleHistories = histories.filter(h => selectedAssets.includes(h.assetId));
  
  return (
    <>
      {visibleHistories.map(history => {
        // Get points up to current time
        const pointsUpToCurrentTime = history.trackingPoints.filter(
          point => new Date(point.timestamp).getTime() <= currentTime
        );
        
        if (pointsUpToCurrentTime.length < 2) return null;
        
        // Convert to lat/lng pairs for polyline
        const pathCoordinates = pointsUpToCurrentTime.map(point => [point.lat, point.lng] as [number, number]);
        
        return (
          <Polyline
            key={`${history.assetId}-path`}
            positions={pathCoordinates}
            pathOptions={{
              color: history.color,
              weight: 4,
              opacity: 0.8,
              dashArray: history.assetType === 'Vehicle' ? '10, 5' : undefined
            }}
          />
        );
      })}
    </>
  );
}

import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { AssetLocationHistory } from '../../data/mockData';

interface PlaybackMapUpdaterProps {
  histories: AssetLocationHistory[];
  currentTime: number;
  selectedAssets: string[];
  showPaths: boolean;
  showMarkers: boolean;
}

export function PlaybackMapUpdater({ 
  histories, 
  currentTime, 
  selectedAssets, 
  showPaths, 
  showMarkers 
}: PlaybackMapUpdaterProps) {
  const map = useMap();
  
  useEffect(() => {
    if (histories.length === 0) return;
    
    const visibleHistories = histories.filter(h => selectedAssets.includes(h.assetId));
    if (visibleHistories.length === 0) return;
    
    // Calculate bounds for all visible assets at current time
    const bounds = L.latLngBounds([]);
    let hasValidBounds = false;
    
    visibleHistories.forEach(history => {
      const pointsUpToCurrentTime = history.trackingPoints.filter(
        point => new Date(point.timestamp).getTime() <= currentTime
      );
      
      if (pointsUpToCurrentTime.length > 0) {
        pointsUpToCurrentTime.forEach(point => {
          bounds.extend([point.lat, point.lng]);
          hasValidBounds = true;
        });
      }
    });
    
    if (hasValidBounds && !bounds.isValid()) {
      // If bounds are invalid, use a default view
      map.setView([37.7749, -122.4194], 13);
    } else if (hasValidBounds) {
      // Add padding to bounds
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [histories, currentTime, selectedAssets, showPaths, showMarkers, map]);
  
  return null;
}

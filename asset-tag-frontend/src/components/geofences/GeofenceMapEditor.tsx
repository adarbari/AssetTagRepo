import { useState, useRef, useEffect } from &apos;react&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Label } from &apos;../ui/label&apos;;
import type { Geofence } from &apos;../../types&apos;;

interface GeofenceMapEditorProps {
  coordinates: {
    lat: number;
    lng: number;
    radius: number;
  };
  tolerance: number;
  name: string;
  isEditing: boolean;
  siteGeofence?: Geofence | null;
  onCoordinatesChange: (coordinates: {
    lat: number;
    lng: number;
    radius: number;
  }) => void;
  onToleranceChange: (tolerance: number) => void;
}

export function GeofenceMapEditor({
  coordinates,
  tolerance,
  name,
  isEditing,
  siteGeofence,
  onCoordinatesChange,
  onToleranceChange,
}: GeofenceMapEditorProps) {
  const [mapLoading, setMapLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const boundaryCircleRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const geofenceCircleRef = useRef<any>(null);

  // Load Leaflet CSS
  useEffect(() => {
    const link = document.createElement(&apos;link&apos;);
    link.rel = &apos;stylesheet&apos;;
    link.href = &apos;https://unpkg.com/leaflet/dist/leaflet.css&apos;;
    if (!document.querySelector(`link[href=&quot;${link.href}&quot;]`)) {
      document.head.appendChild(link);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    // Validate coordinates before initializing map
    const hasValidCoordinates = coordinates.lat !== 0 && coordinates.lng !== 0;

    setMapLoading(true);
    setMapLoaded(false);

    const timer = setTimeout(() => {
      if (!mapRef.current) {
        setMapLoading(false);
        return;
      }

      import(&apos;leaflet&apos;)
        .then(L => {
          if (!mapRef.current) {
            setMapLoading(false);
            return;
          }

          // Remove existing map if any
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }

          // Use default coordinates if invalid
          const lat = hasValidCoordinates ? coordinates.lat : 30.2672;
          const lng = hasValidCoordinates ? coordinates.lng : -97.7431;

          // Create new map
          const map = L.map(mapRef.current).setView([lat, lng], 14);
          mapInstanceRef.current = map;

          L.tileLayer(&apos;https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png&apos;, {
            attribution: &apos;© OpenStreetMap contributors&apos;,
            maxZoom: 19,
          }).addTo(map);

          // Add site boundary circle
          boundaryCircleRef.current = L.circle([lat, lng], {
            color: &apos;#3b82f6&apos;,
            fillColor: &apos;#3b82f6&apos;,
            fillOpacity: 0.2,
            radius: coordinates.radius * 0.3048, // Convert feet to meters
          }).addTo(map);

          boundaryCircleRef.current.bindPopup(`
          <div style=&quot;min-width: 200px;&quot;>
            <div style=&quot;font-weight: 600; margin-bottom: 4px;&quot;>${name}</div>
            <div style=&quot;font-size: 11px; color: #666;&quot;>Radius: ${coordinates.radius} ft</div>
            <div style=&quot;font-size: 11px; color: #666;&quot;>Tolerance: ±${tolerance} ft</div>
          </div>
        `);

          // Add geofence circle if exists
          if (siteGeofence && siteGeofence.radius) {
            geofenceCircleRef.current = L.circle(
              siteGeofence.center || [lat, lng],
              {
                color: &apos;#10b981&apos;,
                fillColor: &apos;#10b981&apos;,
                fillOpacity: 0.15,
                radius: siteGeofence.radius * 0.3048, // Convert feet to meters
                dashArray: &apos;5, 5&apos;,
                weight: 2,
              }
            ).addTo(map);

            geofenceCircleRef.current.bindPopup(`
            <div style=&quot;min-width: 200px;&quot;>
              <div style=&quot;font-weight: 600; margin-bottom: 4px;&quot;>🛡️ ${siteGeofence.name}</div>
              <div style=&quot;font-size: 11px; color: #666;&quot;>Radius: ${siteGeofence.radius} ft</div>
              <div style=&quot;font-size: 11px; color: #666;&quot;>Tolerance: ±${siteGeofence.tolerance} ft</div>
              <div style=&quot;font-size: 11px; color: #666; margin-top: 4px;&quot;>
                ${siteGeofence.alertOnEntry ? &apos;✓ Entry alerts&apos; : &apos;✗ Entry alerts&apos;}<br/>
                ${siteGeofence.alertOnExit ? &apos;✓ Exit alerts&apos; : &apos;✗ Exit alerts&apos;}
              </div>
            </div>
          `);
          }

          // Add center marker
          const markerHtml = `
          <div style=&quot;
            background-color: #3b82f6;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            cursor: ${isEditing ? &apos;move&apos; : &apos;default&apos;};
          &quot;></div>
        `;

          centerMarkerRef.current = L.marker([lat, lng], {
            icon: L.divIcon({
              html: markerHtml,
              className: &apos;custom-marker&apos;,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
            draggable: isEditing,
          }).addTo(map);

          // Handle marker drag when in edit mode
          if (isEditing) {
            centerMarkerRef.current.on(&apos;dragend&apos;, (e: any) => {
              const position = e.target.getLatLng();
              onCoordinatesChange({
                lat: Number(position.lat.toFixed(6)),
                lng: Number(position.lng.toFixed(6)),
                radius: coordinates.radius,
              });
            });

            // Allow clicking on map to set new center
            map.on(&apos;click&apos;, (e: any) => {
              onCoordinatesChange({
                lat: Number(e.latlng.lat.toFixed(6)),
                lng: Number(e.latlng.lng.toFixed(6)),
                radius: coordinates.radius,
              });
            });
          }

          setMapLoaded(true);
          setMapLoading(false);

          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 100);
        })
        .catch(() => {
          setMapLoading(false);
        });
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [isEditing]);

  // Update map markers and circles when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    import(&apos;leaflet&apos;).then(_L => {
      const lat = coordinates.lat;
      const lng = coordinates.lng;

      // Update center marker position
      if (centerMarkerRef.current) {
        centerMarkerRef.current.setLatLng([lat, lng]);
      }

      // Update boundary circle
      if (boundaryCircleRef.current) {
        boundaryCircleRef.current.setLatLng([lat, lng]);
        boundaryCircleRef.current.setRadius(coordinates.radius * 0.3048);
        boundaryCircleRef.current.setPopupContent(`
          <div style=&quot;min-width: 200px;&quot;>
            <div style=&quot;font-weight: 600; margin-bottom: 4px;&quot;>${name}</div>
            <div style=&quot;font-size: 11px; color: #666;&quot;>Radius: ${coordinates.radius} ft</div>
            <div style=&quot;font-size: 11px; color: #666;&quot;>Tolerance: ±${tolerance} ft</div>
          </div>
        `);
      }

      // Re-center map view
      mapInstanceRef.current.setView(
        [lat, lng],
        mapInstanceRef.current.getZoom()
      );
    });
  }, [
    coordinates.lat,
    coordinates.lng,
    coordinates.radius,
    tolerance,
    name,
    mapLoaded,
  ]);

  // Update or add geofence circle when siteGeofence changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    import(&apos;leaflet&apos;).then(_L => {
      // Remove existing geofence circle
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.remove();
        geofenceCircleRef.current = null;
      }

      // Add new geofence circle if exists
      if (siteGeofence && siteGeofence.radius) {
        const lat = coordinates.lat || 30.2672;
        const lng = coordinates.lng || -97.7431;

        geofenceCircleRef.current = L.circle(
          siteGeofence.center || [lat, lng],
          {
            color: &apos;#10b981&apos;,
            fillColor: &apos;#10b981&apos;,
            fillOpacity: 0.15,
            radius: siteGeofence.radius * 0.3048, // Convert feet to meters
            dashArray: &apos;5, 5&apos;,
            weight: 2,
          }
        ).addTo(mapInstanceRef.current);

        geofenceCircleRef.current.bindPopup(`
          <div style=&quot;min-width: 200px;&quot;>
            <div style=&quot;font-weight: 600; margin-bottom: 4px;&quot;>🛡️ ${siteGeofence.name}</div>
            <div style=&quot;font-size: 11px; color: #666;&quot;>Radius: ${siteGeofence.radius} ft</div>
            <div style=&quot;font-size: 11px; color: #666;&quot;>Tolerance: ±${siteGeofence.tolerance} ft</div>
            <div style=&quot;font-size: 11px; color: #666; margin-top: 4px;&quot;>
              ${siteGeofence.alertOnEntry ? &apos;✓ Entry alerts&apos; : &apos;✗ Entry alerts&apos;}<br/>
              ${siteGeofence.alertOnExit ? &apos;✓ Exit alerts&apos; : &apos;✗ Exit alerts&apos;}
            </div>
          </div>
        `);
      }
    });
  }, [siteGeofence, coordinates.lat, coordinates.lng, mapLoaded]);

  return (
    <>
      {isEditing && (
        <div className=&apos;p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg&apos;>
          <p className=&apos;text-sm&apos;>
            <strong>Edit Mode:</strong> Click anywhere on the map to set a new
            center point, or drag the center marker. Adjust the radius and
            tolerance using the controls below.
          </p>
        </div>
      )}

      <div className=&apos;grid gap-4 md:grid-cols-3&apos;>
        <div>
          <p className=&apos;text-sm text-muted-foreground&apos;>Coordinates</p>
          {isEditing ? (
            <div className=&apos;space-y-2 mt-1&apos;>
              <div>
                <Label htmlFor=&apos;lat&apos; className=&apos;text-xs&apos;>
                  Latitude
                </Label>
                <Input
                  id=&apos;lat&apos;
                  type=&apos;number&apos;
                  step=&apos;0.000001&apos;
                  value={coordinates.lat}
                  onChange={e =>
                    onCoordinatesChange({
                      lat: parseFloat(e.target.value) || 0,
                      lng: coordinates.lng,
                      radius: coordinates.radius,
                    })
                  }
                  className=&apos;h-8 text-sm&apos;
                />
              </div>
              <div>
                <Label htmlFor=&apos;lng&apos; className=&apos;text-xs&apos;>
                  Longitude
                </Label>
                <Input
                  id=&apos;lng&apos;
                  type=&apos;number&apos;
                  step=&apos;0.000001&apos;
                  value={coordinates.lng}
                  onChange={e =>
                    onCoordinatesChange({
                      lat: coordinates.lat,
                      lng: parseFloat(e.target.value) || 0,
                      radius: coordinates.radius,
                    })
                  }
                  className=&apos;h-8 text-sm&apos;
                />
              </div>
            </div>
          ) : (
            <p>
              {coordinates.lat}° N, {coordinates.lng}° W
            </p>
          )}
        </div>
        <div>
          <p className=&apos;text-sm text-muted-foreground&apos;>Radius (feet)</p>
          {isEditing ? (
            <div className=&apos;space-y-2 mt-1&apos;>
              <Input
                type=&apos;number&apos;
                value={coordinates.radius}
                onChange={e =>
                  onCoordinatesChange({
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                    radius: parseInt(e.target.value) || 0,
                  })
                }
                className=&apos;h-8&apos;
              />
              <input
                type=&apos;range&apos;
                min=&apos;50&apos;
                max=&apos;2000&apos;
                step=&apos;10&apos;
                value={coordinates.radius}
                onChange={e =>
                  onCoordinatesChange({
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                    radius: parseInt(e.target.value),
                  })
                }
                className=&apos;w-full&apos;
              />
            </div>
          ) : (
            <p>{coordinates.radius} feet</p>
          )}
        </div>
        <div>
          <p className=&apos;text-sm text-muted-foreground&apos;>Tolerance (feet)</p>
          {isEditing ? (
            <div className=&apos;space-y-2 mt-1&apos;>
              <Input
                type=&apos;number&apos;
                value={tolerance}
                onChange={e => onToleranceChange(parseInt(e.target.value) || 0)}
                className=&apos;h-8&apos;
              />
              <input
                type=&apos;range&apos;
                min=&apos;10&apos;
                max=&apos;200&apos;
                step=&apos;5&apos;
                value={tolerance}
                onChange={e => onToleranceChange(parseInt(e.target.value))}
                className=&apos;w-full&apos;
              />
            </div>
          ) : (
            <p>±{tolerance} feet</p>
          )}
        </div>
      </div>

      <div className=&apos;space-y-2&apos;>
        <div
          ref={mapRef}
          className=&apos;w-full h-96 rounded-lg overflow-hidden bg-muted relative&apos;
        >
          {mapLoading && (
            <div className=&apos;absolute inset-0 flex items-center justify-center bg-muted z-10&apos;>
              <div className=&apos;text-muted-foreground&apos;>Loading map...</div>
            </div>
          )}
        </div>

        {/* Map Legend */}
        <div className=&apos;flex items-center gap-6 text-xs text-muted-foreground bg-muted/50 p-2 rounded&apos;>
          <div className=&apos;flex items-center gap-2&apos;>
            <div className=&apos;w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-500&apos;></div>
            <span>Site Boundary</span>
          </div>
          {siteGeofence && (
            <div className=&apos;flex items-center gap-2&apos;>
              <div className=&apos;w-4 h-4 rounded-full bg-green-500/15 border-2 border-green-500 border-dashed&apos;></div>
              <span>Geofence</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useIssues } from '../context/IssueContext';
import { CITY_COORDINATES, getLocationCoordinates } from '../data/mockData';
import { Plus, Minus, Crosshair } from 'lucide-react';

const createCustomPinIcon = (color, label = '') => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${color};
        color: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 2px solid white;
        cursor: pointer;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
};

export const LiveMapWidget = ({ onExpandMap }) => {
  const { issues, domain, setSelectedIssue, setCurrentView } = useIssues();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Markers colors based on status and assignment
  // Open: Red (#ef4444)
  // In progress: Orange (#f97316)
  // Unassigned: Purple (#8b5cf6)
  // Resolved: Green (#10b981)
  const pinOpen = createCustomPinIcon('#ef4444');
  const pinProgress = createCustomPinIcon('#f97316');
  const pinUnassigned = createCustomPinIcon('#8b5cf6');
  const pinResolved = createCustomPinIcon('#10b981');

  // Compute points from issues and default demo coordinates
  const relevantIssues = issues.filter(i => !domain || i.domain === domain || domain === 'off-campus');

  // Default points matching the screenshot map
  const demoPoints = [
    { id: 'm1', title: 'Pothole on 4th & Main', status: 'reported', assigned: true, coords: [38.7652, -9.1120] },
    { id: 'm2', title: 'Broken streetlight — Elm St', status: 'reported', assigned: false, coords: [38.7573, -9.1145] },
    { id: 'm3', title: 'Graffiti on wall — Park Ave', status: 'in_progress', assigned: true, coords: [38.7565, -9.1090] },
    { id: 'm4', title: 'Overflowing bin — Market St', status: 'resolved', assigned: true, coords: [38.7619, -9.1081] },
    { id: 'm5', title: 'Downtown Traffic Light', status: 'resolved', assigned: true, coords: [38.7615, -9.1110] },
    { id: 'm6', title: 'Riverview Water Pipe', status: 'reported', assigned: false, coords: [38.7670, -9.1170] },
    { id: 'm7', title: 'Oakwood Park Bench', status: 'in_progress', assigned: true, coords: [38.7595, -9.1020] }
  ];

  // Merge database issues with coordinates
  const mapPoints = relevantIssues.length > 0
    ? relevantIssues.map(issue => ({
        ...issue,
        coords: issue.coords || getLocationCoordinates(issue.location)
      }))
    : demoPoints;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerCoords = mapPoints.length > 0 && mapPoints[0].coords 
        ? mapPoints[0].coords 
        : CITY_COORDINATES.center;

      const map = L.map(mapContainerRef.current, {
        center: centerCoords,
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Positron clean map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    const markerLayer = L.layerGroup().addTo(map);

    mapPoints.forEach(point => {
      if (!point.coords || !Array.isArray(point.coords)) return;

      let icon = pinOpen;
      if (point.status === 'resolved') {
        icon = pinResolved;
      } else if (point.status === 'in_progress') {
        icon = pinProgress;
      } else if (!point.assignedToUser && !point.assigned) {
        icon = pinUnassigned;
      } else {
        icon = pinOpen;
      }

      const marker = L.marker(point.coords, { icon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 150px; padding: 4px;">
          <strong style="color: #0f172a; display: block; font-size: 13px; margin-bottom: 2px;">
            ${point.title}
          </strong>
          <span style="color: #64748b; font-size: 11px;">
            ${point.location || 'Reported Location'}
          </span>
          <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span style="
              text-transform: uppercase; 
              font-weight: 700; 
              font-size: 9px; 
              padding: 2px 5px; 
              border-radius: 4px;
              background: ${point.status === 'resolved' ? '#ecfdf5' : point.status === 'in_progress' ? '#fffbeb' : '#fef2f2'};
              color: ${point.status === 'resolved' ? '#059669' : point.status === 'in_progress' ? '#d97706' : '#dc2626'};
            ">
              ${(point.status || 'OPEN').replace('_', ' ')}
            </span>
            <button id="view-detail-${point.id}" style="
              background: #2563eb; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              padding: 2px 8px; 
              font-size: 10px; 
              font-weight: 600; 
              cursor: pointer;
            ">
              View
            </button>
          </div>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-detail-${point.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedIssue(point);
          };
        }
      });

      markerLayer.addLayer(marker);
    });

    return () => {
      map.removeLayer(markerLayer);
    };
  }, [issues, domain]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      const centerCoords = mapPoints.length > 0 && mapPoints[0].coords 
        ? mapPoints[0].coords 
        : CITY_COORDINATES.center;
      mapInstanceRef.current.setView(centerCoords, 13);
    }
  };

  return (
    <div className="dashboard-panel-card">
      {/* Header */}
      <div className="panel-header-row">
        <h2 className="panel-title-text">Live map</h2>
        <button 
          className="view-all-link"
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={() => onExpandMap ? onExpandMap() : setCurrentView('map')}
        >
          View full map
        </button>
      </div>

      {/* Map Canvas */}
      <div className="map-canvas-container">
        <div 
          ref={mapContainerRef} 
          style={{ width: '100%', height: '100%' }} 
        />

        {/* Custom Zoom & Location Controls */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <button
            onClick={handleZoomIn}
            className="icon-action-btn"
            style={{ width: '28px', height: '28px', borderRadius: '4px' }}
            title="Zoom In"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleZoomOut}
            className="icon-action-btn"
            style={{ width: '28px', height: '28px', borderRadius: '4px' }}
            title="Zoom Out"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={handleRecenter}
            className="icon-action-btn"
            style={{ width: '28px', height: '28px', borderRadius: '4px' }}
            title="Recenter Map"
          >
            <Crosshair size={14} />
          </button>
        </div>
      </div>

      {/* Map Legend matching Fixly screenshot */}
      <div className="map-legend-row">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ef4444' }} />
          <span>5 Open</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#f97316' }} />
          <span>3 In progress</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#8b5cf6' }} />
          <span>2 Unassigned</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#10b981' }} />
          <span>14 Resolved</span>
        </div>
      </div>
    </div>
  );
};

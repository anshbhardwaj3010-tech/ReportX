import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useIssues } from '../context/IssueContext';
import { Plus, Minus, Crosshair } from 'lucide-react';

const createCustomPinIcon = (color) => {
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
  const { dashboardIssues: issues, domain, setSelectedIssue, setCurrentView } = useIssues();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Markers colors based on status and assignment
  const pinOpen = createCustomPinIcon('#ef4444');
  const pinProgress = createCustomPinIcon('#f97316');
  const pinUnassigned = createCustomPinIcon('#8b5cf6');
  const pinResolved = createCustomPinIcon('#10b981');

  // Filter issues for current domain
  const relevantIssues = issues.filter(i => !domain || i.domain === domain);

  const mapPoints = relevantIssues;

  // Calculate dynamic counts
  const openCount = mapPoints.filter(p => p.status === 'reported' || p.status === 'open').length;
  const inProgressCount = mapPoints.filter(p => p.status === 'in_progress').length;
  const unassignedCount = mapPoints.filter(p => p.status !== 'resolved' && !p.assignedToUser && !p.assigned).length;
  const resolvedCount = mapPoints.filter(p => p.status === 'resolved').length;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        attributionControl: false
      });

      // Reliable OpenStreetMap standard tile layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    // Clear previous markers
    markersLayer.clearLayers();

    const createdMarkers = [];

    mapPoints.forEach(point => {
      if (!point.coords || !Array.isArray(point.coords) || typeof point.coords[0] !== 'number') return;

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
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; min-width: 170px; padding: 4px;">
          <strong style="color: #0f172a; display: block; font-size: 13px; margin-bottom: 2px;">
            ${point.title}
          </strong>
          <span style="color: #64748b; font-size: 11px; display: block; margin-bottom: 6px;">
            📍 ${point.location || 'Reported Location'}
          </span>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="
              text-transform: uppercase; 
              font-weight: 700; 
              font-size: 9px; 
              padding: 2px 6px; 
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
              padding: 3px 10px; 
              font-size: 10px; 
              font-weight: 700; 
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

      markersLayer.addLayer(marker);
      createdMarkers.push(marker);
    });

    // Auto-fit bounds so markers are always visible and centered!
    if (createdMarkers.length > 0) {
      try {
        const group = L.featureGroup(createdMarkers);
        map.fitBounds(group.getBounds().pad(0.18), { maxZoom: 15 });
      } catch {
        map.setView([20, 0], 2);
      }
    } else {
      map.setView([20, 0], 2);
    }

    // Fix map container rendering size
    const resizeTimer1 = setTimeout(() => map.invalidateSize(), 150);
    const resizeTimer2 = setTimeout(() => map.invalidateSize(), 450);

    return () => {
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
    };
  }, [issues, domain]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (markersLayerRef.current) {
      const layers = markersLayerRef.current.getLayers();
      if (layers.length > 0) {
        const group = L.featureGroup(layers);
        map.fitBounds(group.getBounds().pad(0.18), { maxZoom: 15 });
        return;
      }
    }
    map.setView([20, 0], 2);
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
          style={{ width: '100%', height: '100%', minHeight: '260px' }} 
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
            aria-label="Zoom in"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={handleZoomOut}
            className="icon-action-btn"
            style={{ width: '28px', height: '28px', borderRadius: '4px' }}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={handleRecenter}
            className="icon-action-btn"
            style={{ width: '28px', height: '28px', borderRadius: '4px' }}
            title="Recenter Map"
            aria-label="Recenter map"
          >
            <Crosshair size={14} />
          </button>
        </div>
      </div>

      {/* Map Legend matching Fixly screenshot with dynamic counts */}
      <div className="map-legend-row">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ef4444' }} />
          <span>{openCount} Open</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#f97316' }} />
          <span>{inProgressCount} In progress</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#8b5cf6' }} />
          <span>{unassignedCount} Unassigned</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#10b981' }} />
          <span>{resolvedCount} Resolved</span>
        </div>
      </div>
    </div>
  );
};

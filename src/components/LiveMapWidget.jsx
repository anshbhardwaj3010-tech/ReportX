import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { useIssues } from '../context/IssueContext';
import { CITY_COORDINATES, ON_CAMPUS_LOCATIONS, getLocationCoordinates } from '../data/mockData';
import { getDirectionsUrl, getIssueCoordinates } from '../utils/mapLocation';
import { Plus, Minus, LocateFixed } from 'lucide-react';

const mapIcons = {
  open: L.divIcon({
    className: 'custom-map-pin',
    html: '<span class="map-pin-dot map-pin-open"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  }),
  progress: L.divIcon({
    className: 'custom-map-pin',
    html: '<span class="map-pin-dot map-pin-progress"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  }),
  unassigned: L.divIcon({
    className: 'custom-map-pin',
    html: '<span class="map-pin-dot map-pin-unassigned"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  }),
  resolved: L.divIcon({
    className: 'custom-map-pin',
    html: '<span class="map-pin-dot map-pin-resolved"></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  })
};

const isIssueUnassigned = (issue) => !issue.assignedToUser
  && !issue.assigned
  && (!issue.assignedTo || issue.assignedTo === 'Unassigned');

const createPopupContent = (issue, coordinates, onView) => {
  const content = document.createElement('div');
  content.className = 'report-map-popup';

  const title = document.createElement('strong');
  title.textContent = issue.title || 'Reported issue';
  content.append(title);

  const location = document.createElement('p');
  location.textContent = issue.location || 'Reported location';
  content.append(location);

  const actions = document.createElement('div');
  actions.className = 'report-map-popup-actions';

  const viewButton = document.createElement('button');
  viewButton.type = 'button';
  viewButton.textContent = 'View report';
  viewButton.addEventListener('click', () => onView(issue));
  actions.append(viewButton);

  const directionsUrl = getDirectionsUrl(coordinates);
  if (directionsUrl) {
    const directionsLink = document.createElement('a');
    directionsLink.href = directionsUrl;
    directionsLink.target = '_blank';
    directionsLink.rel = 'noopener noreferrer';
    directionsLink.textContent = 'Directions';
    actions.append(directionsLink);
  }
  content.append(actions);
  return content;
};

export const LiveMapWidget = ({ onExpandMap }) => {
  const { dashboardIssues: issues, domain, setSelectedIssue, setCurrentView } = useIssues();
  const [locationMessage, setLocationMessage] = useState('');
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userLocationMarkerRef = useRef(null);

  const mapPoints = useMemo(
    () => issues.filter((issue) => !domain || issue.domain === domain),
    [issues, domain]
  );
  const mappedPoints = useMemo(
    () => mapPoints.map((issue) => ({ issue, coordinates: getIssueCoordinates(issue) }))
      .filter((point) => point.coordinates),
    [mapPoints]
  );
  const openCount = mapPoints.filter((point) => point.status === 'reported' || point.status === 'open').length;
  const inProgressCount = mapPoints.filter((point) => point.status === 'in_progress').length;
  const unassignedCount = mapPoints.filter((point) => point.status !== 'resolved' && isIssueUnassigned(point)).length;
  const resolvedCount = mapPoints.filter((point) => point.status === 'resolved').length;
  const defaultCenter = domain === 'on-campus'
    ? getLocationCoordinates(ON_CAMPUS_LOCATIONS[0])
    : CITY_COORDINATES.center;

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return undefined;

    const map = L.map(mapContainerRef.current, {
      center: CITY_COORDINATES.center,
      zoom: CITY_COORDINATES.zoom,
      zoomControl: false
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);
    const resizeTimers = [150, 450].map((delay) => window.setTimeout(() => map.invalidateSize(), delay));

    return () => {
      resizeTimers.forEach(window.clearTimeout);
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      userLocationMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    const createdMarkers = mappedPoints.map(({ issue, coordinates }) => {
      const icon = issue.status === 'resolved'
        ? mapIcons.resolved
        : issue.status === 'in_progress'
          ? mapIcons.progress
          : isIssueUnassigned(issue)
            ? mapIcons.unassigned
            : mapIcons.open;
      const marker = L.marker(coordinates, { icon });
      marker.bindPopup(createPopupContent(issue, coordinates, setSelectedIssue));
      markersLayer.addLayer(marker);
      return marker;
    });

    if (createdMarkers.length) {
      map.fitBounds(L.featureGroup(createdMarkers).getBounds().pad(0.18), { maxZoom: 17 });
    } else {
      map.setView(defaultCenter, domain === 'on-campus' ? 17 : CITY_COORDINATES.zoom);
    }
    window.setTimeout(() => map.invalidateSize(), 0);
  }, [mappedPoints, defaultCenter, domain, setSelectedIssue]);

  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('This browser does not support location access.');
      return;
    }
    setLocationMessage('Finding your current location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const userCoordinates = [coords.latitude, coords.longitude];
        const map = mapInstanceRef.current;
        if (!map) return;
        userLocationMarkerRef.current?.remove();
        userLocationMarkerRef.current = L.circleMarker(userCoordinates, {
          radius: 9,
          color: '#fff',
          weight: 3,
          fillColor: '#2563eb',
          fillOpacity: 1
        }).addTo(map).bindPopup('Your current location');
        map.setView(userCoordinates, 16);
        setLocationMessage('');
      },
      (error) => {
        setLocationMessage(error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. Allow location access in your browser settings and try again.'
          : 'Could not get your location. Check GPS and try again.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="dashboard-panel-card">
      <div className="panel-header-row">
        <h2 className="panel-title-text">{domain === 'off-campus' ? 'City' : 'Campus'} live map</h2>
        <button
          className="view-all-link"
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={() => onExpandMap ? onExpandMap() : setCurrentView('map')}
        >
          View full map
        </button>
      </div>

      <div className="map-canvas-container">
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '260px' }} />
        <div className="map-controls">
          <button onClick={() => mapInstanceRef.current?.zoomIn()} className="icon-action-btn" title="Zoom in" aria-label="Zoom in">
            <Plus size={14} />
          </button>
          <button onClick={() => mapInstanceRef.current?.zoomOut()} className="icon-action-btn" title="Zoom out" aria-label="Zoom out">
            <Minus size={14} />
          </button>
          <button onClick={handleFindMyLocation} className="icon-action-btn" title="Show my current location" aria-label="Show my current location">
            <LocateFixed size={14} />
          </button>
        </div>
      </div>
      {locationMessage && <p className="map-location-message" role="status">{locationMessage}</p>}
      {mapPoints.length > mappedPoints.length && (
        <p className="map-location-message">
          {mapPoints.length - mappedPoints.length} report{mapPoints.length - mappedPoints.length === 1 ? ' has' : 's have'} no exact coordinates. Use GPS when reporting to add a map pin and directions.
        </p>
      )}

      <div className="map-legend-row">
        <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /><span>{openCount} Open</span></div>
        <div className="legend-item"><span className="legend-dot" style={{ background: '#f97316' }} /><span>{inProgressCount} In progress</span></div>
        <div className="legend-item"><span className="legend-dot" style={{ background: '#8b5cf6' }} /><span>{unassignedCount} Unassigned</span></div>
        <div className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }} /><span>{resolvedCount} Resolved</span></div>
      </div>
    </div>
  );
};

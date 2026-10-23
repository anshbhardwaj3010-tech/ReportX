export const CATEGORIES = [
  { id: 'roads', name: 'Roads & Potholes', icon: 'Car', color: '#ef4444', slaHours: 8, badgeClass: 'badge-roads' },
  { id: 'electrical', name: 'Streetlights & Electrical', icon: 'Lightbulb', color: '#f59e0b', slaHours: 12, badgeClass: 'badge-electrical' },
  { id: 'cleanliness', name: 'Cleanliness & Graffiti', icon: 'Sparkles', color: '#8b5cf6', slaHours: 4, badgeClass: 'badge-cleanliness' },
  { id: 'sanitation', name: 'Sanitation & Bins', icon: 'Trash2', color: '#10b981', slaHours: 6, badgeClass: 'badge-sanitation' },
  { id: 'safety', name: 'Signs & Safety', icon: 'ShieldAlert', color: '#dc2626', slaHours: 2, badgeClass: 'badge-safety' },
  { id: 'plumbing', name: 'Plumbing & Water', icon: 'Droplets', color: '#3b82f6', slaHours: 8, badgeClass: 'badge-plumbing' },
  { id: 'infrastructure', name: 'Public Infrastructure', icon: 'Building2', color: '#64748b', slaHours: 24, badgeClass: 'badge-infra' },
  { id: 'it-wifi', name: 'IT & Wi-Fi Network', icon: 'Wifi', color: '#6366f1', slaHours: 6, badgeClass: 'badge-it' },
  { id: 'appliance', name: 'Appliances & HVAC', icon: 'Flame', color: '#ea580c', slaHours: 16, badgeClass: 'badge-appliance' },
  { id: 'ro-water', name: 'RO Water Purifier', icon: 'GlassWater', color: '#06b6d4', slaHours: 12, badgeClass: 'badge-water' },
  { id: 'furniture', name: 'Furniture & Locks', icon: 'Armchair', color: '#d97706', slaHours: 48, badgeClass: 'badge-furniture' }
];

export const CITY_COORDINATES = {
  center: [28.6692, 77.4538],
  zoom: 12
};

export const LOCATION_COORDINATES_MAP = {
  // Campus locations
  'ABESIT Block A - Room 101': [28.6335, 77.4470],
  'ABESIT Block A - Room 302': [28.6338, 77.4473],
  'ABESIT CS & IT Lab - 2nd Floor': [28.6336, 77.4475],
  'ABESIT Central Library': [28.6340, 77.4468],
  'Boys Hostel 1 - ABESIT': [28.6345, 77.4485],
  'Girls Hostel - ABESIT': [28.6328, 77.4480],
  'Main Campus Mess & Canteen': [28.6342, 77.4478],
  'ABESIT Sports Complex': [28.6350, 77.4465],
  'Science Block - Physics Lab': [28.6332, 77.4462]
};

export const ON_CAMPUS_LOCATIONS = [
  'ABESIT Block A - Room 101',
  'ABESIT Block A - Room 302',
  'ABESIT CS & IT Lab - 2nd Floor',
  'ABESIT Central Library',
  'Boys Hostel 1 - ABESIT',
  'Girls Hostel - ABESIT',
  'Main Campus Mess & Canteen',
  'ABESIT Sports Complex',
  'Science Block - Physics Lab',
];

export const OFF_CAMPUS_LOCATIONS = [
  '4th & Main St',
  'Elm St & 3rd Ave',
  'Park Ave & 2nd St',
  'Market St & Center',
  'Hwy 12 Northbound',
  'Green Park PG - Room 204',
  'Sunshine Apartments - Flat 4B',
  'University Residency - Flat 102',
  'Student Villa PG - Room 12',
  'Om Heights - Flat 301',
  'Royal Palms PG - Block A',
];

/**
 * Returns coordinates only for locations with a known point. Unknown addresses need GPS.
 */
export const getLocationCoordinates = (locationName = '') => {
  if (LOCATION_COORDINATES_MAP[locationName]) {
    return LOCATION_COORDINATES_MAP[locationName];
  }
  
  // Find substring match
  const matchedKey = Object.keys(LOCATION_COORDINATES_MAP).find(k => 
    locationName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(locationName.toLowerCase())
  );
  if (matchedKey) {
    return LOCATION_COORDINATES_MAP[matchedKey];
  }

  return null;
};

/**
 * Formats coordinates for display (e.g. "28.6335, 77.4470").
 */
export const formatCoords = (coords) => {
  if (!Array.isArray(coords) || coords.length < 2) return 'Coordinates unavailable';
  return `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
};

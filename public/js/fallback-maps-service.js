// Fallback Maps Service using OpenStreetMap and Leaflet
class FallbackMapsService {
  constructor() {
    this.map = null;
    this.busMarkers = {};
    this.routePolylines = {};
    this.isInitialized = false;
    this.markerCluster = null;
  }

  // Initialize Leaflet Map
  async initMap(containerId, options = {}) {
    const defaultOptions = {
      zoom: 6,
      center: [20.5937, 78.9629], // India center
      zoomControl: true,
      scrollWheelZoom: true
    };

    this.map = L.map(containerId, { ...defaultOptions, ...options });
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.isInitialized = true;
    console.log('Fallback Maps (OpenStreetMap) initialized successfully');
  }

  // Plot route between two points using real routing service
  async plotRoute(startLocation, endLocation, journeyId, options = {}) {
    if (!this.isInitialized) {
      console.error('Maps service not initialized');
      return;
    }

    const startCoords = this.getLatLngFromLocation(startLocation);
    const endCoords = this.getLatLngFromLocation(endLocation);

    try {
      // Try to get real route from routing service
      const routeCoordinates = await this.getRouteCoordinates(startCoords, endCoords);
      
      // Create polyline with real route coordinates
      const routeLine = L.polyline(routeCoordinates, {
        color: options.routeColor || '#1976D2',
        weight: 6,
        opacity: 0.8,
        smoothFactor: 1.0
      }).addTo(this.map);

      // Store the route
      this.routePolylines[journeyId] = {
        polyline: routeLine,
        startLocation,
        endLocation,
        coordinates: routeCoordinates
      };

      // Add start and end markers
      this.addLocationMarkers(startLocation, endLocation, journeyId);

      // Fit map to show the route
      const group = new L.featureGroup([routeLine]);
      this.map.fitBounds(group.getBounds().pad(0.05));

      console.log(`Real route plotted for journey ${journeyId}: ${startLocation} → ${endLocation}`);
      
    } catch (error) {
      console.warn('Failed to get real route, falling back to straight line:', error);
      
      // Fallback to straight line if routing fails
      const routeLine = L.polyline([
        [startCoords.lat, startCoords.lng],
        [endCoords.lat, endCoords.lng]
      ], {
        color: options.routeColor || '#1976D2',
        weight: 5,
        opacity: 0.6,
        dashArray: '10, 5'
      }).addTo(this.map);

      this.routePolylines[journeyId] = {
        polyline: routeLine,
        startLocation,
        endLocation
      };

      this.addLocationMarkers(startLocation, endLocation, journeyId);
      const group = new L.featureGroup([routeLine]);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  // Get route coordinates from routing service
  async getRouteCoordinates(startCoords, endCoords) {
    // Using OpenRouteService API (free tier)
    const apiKey = '5b3ce3597851110001cf6248d82b5e6a1c8c4d0ea06c4f7981b7c4d9'; // Demo key
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords.lng},${startCoords.lat}&end=${endCoords.lng},${endCoords.lat}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Routing API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features[0] && data.features[0].geometry) {
        // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
        return data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
      } else {
        throw new Error('No route found in response');
      }
    } catch (error) {
      console.error('OpenRouteService API error:', error);
      
      // Try alternative routing service - GraphHopper
      try {
        return await this.getGraphHopperRoute(startCoords, endCoords);
      } catch (altError) {
        console.error('GraphHopper API also failed:', altError);
        
        // Try offline highway route as final fallback
        const offlineRoute = this.getOfflineHighwayRoute(startCoords, endCoords);
        if (offlineRoute) {
          console.log('Using offline highway route');
          return offlineRoute;
        }
        
        throw new Error('All routing services failed');
      }
    }
  }

  // Alternative routing using GraphHopper (backup)
  async getGraphHopperRoute(startCoords, endCoords) {
    const apiKey = 'a4ad48c5-84a8-4ce8-8f1d-fa1be5b53ead'; // Demo key
    const url = `https://graphhopper.com/api/1/route?point=${startCoords.lat},${startCoords.lng}&point=${endCoords.lat},${endCoords.lng}&vehicle=car&key=${apiKey}&points_encoded=false`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GraphHopper API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.paths && data.paths[0] && data.paths[0].points) {
      // Convert coordinates - GraphHopper returns [lat, lng]
      return data.paths[0].points.coordinates.map(coord => [coord[1], coord[0]]);
    } else {
      throw new Error('No route found in GraphHopper response');
    }
  }

  // Get offline highway route for common Indian routes
  getOfflineHighwayRoute(startCoords, endCoords) {
    // Common highway routes with intermediate waypoints
    const highwayRoutes = {
      // Delhi to Bareilly via NH9/NH24
      'delhi-bareilly': [
        [28.6139, 77.2090], // Delhi
        [28.6692, 77.4538], // Ghaziabad
        [28.8386, 78.7733], // Moradabad
        [28.3670, 79.4304]  // Bareilly
      ],
      'bareilly-delhi': [
        [28.3670, 79.4304], // Bareilly
        [28.8386, 78.7733], // Moradabad
        [28.6692, 77.4538], // Ghaziabad
        [28.6139, 77.2090]  // Delhi
      ],
      
      // Delhi to Lucknow via NH24
      'delhi-lucknow': [
        [28.6139, 77.2090], // Delhi
        [28.6692, 77.4538], // Ghaziabad
        [27.8974, 78.0880], // Aligarh
        [26.4499, 80.3319], // Kanpur
        [26.8467, 80.9462]  // Lucknow
      ],
      'lucknow-delhi': [
        [26.8467, 80.9462], // Lucknow
        [26.4499, 80.3319], // Kanpur
        [27.8974, 78.0880], // Aligarh
        [28.6692, 77.4538], // Ghaziabad
        [28.6139, 77.2090]  // Delhi
      ],
      
      // Delhi to Mumbai via NH8
      'delhi-mumbai': [
        [28.6139, 77.2090], // Delhi
        [28.4595, 77.0266], // Gurgaon
        [26.9124, 75.7873], // Jaipur
        [23.0225, 72.5714], // Ahmedabad
        [19.0760, 72.8777]  // Mumbai
      ],
      'mumbai-delhi': [
        [19.0760, 72.8777], // Mumbai
        [23.0225, 72.5714], // Ahmedabad
        [26.9124, 75.7873], // Jaipur
        [28.4595, 77.0266], // Gurgaon
        [28.6139, 77.2090]  // Delhi
      ],
      
      // Delhi to Bangalore via NH44
      'delhi-bangalore': [
        [28.6139, 77.2090], // Delhi
        [27.1767, 78.0081], // Agra
        [21.1458, 79.0882], // Nagpur
        [17.3850, 78.4867], // Hyderabad
        [12.9716, 77.5946]  // Bangalore
      ],
      'bangalore-delhi': [
        [12.9716, 77.5946], // Bangalore
        [17.3850, 78.4867], // Hyderabad
        [21.1458, 79.0882], // Nagpur
        [27.1767, 78.0081], // Agra
        [28.6139, 77.2090]  // Delhi
      ]
    };

    // Find the closest matching route
    const tolerance = 0.5; // degrees
    
    for (const [routeKey, waypoints] of Object.entries(highwayRoutes)) {
      const firstPoint = waypoints[0];
      const lastPoint = waypoints[waypoints.length - 1];
      
      // Check if start and end points match this route (within tolerance)
      const startMatch = Math.abs(startCoords.lat - firstPoint[0]) < tolerance && 
                        Math.abs(startCoords.lng - firstPoint[1]) < tolerance;
      const endMatch = Math.abs(endCoords.lat - lastPoint[0]) < tolerance && 
                      Math.abs(endCoords.lng - lastPoint[1]) < tolerance;
      
      if (startMatch && endMatch) {
        console.log(`Found offline highway route: ${routeKey}`);
        return waypoints;
      }
    }
    
    return null; // No matching route found
  }

  // Add start and end location markers
  addLocationMarkers(startLocation, endLocation, journeyId) {
    const startCoords = this.getLatLngFromLocation(startLocation);
    const endCoords = this.getLatLngFromLocation(endLocation);

    // Start marker (Green)
    const startIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background: #4CAF50; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid white; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">S</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const startMarker = L.marker([startCoords.lat, startCoords.lng], { icon: startIcon })
      .addTo(this.map)
      .bindPopup(`<strong>Start:</strong> ${startLocation}`);

    // End marker (Red)
    const endIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background: #F44336; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 3px solid white; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">E</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const endMarker = L.marker([endCoords.lat, endCoords.lng], { icon: endIcon })
      .addTo(this.map)
      .bindPopup(`<strong>End:</strong> ${endLocation}`);

    // Store markers
    if (!this.busMarkers[journeyId]) {
      this.busMarkers[journeyId] = {};
    }
    this.busMarkers[journeyId].start = startMarker;
    this.busMarkers[journeyId].end = endMarker;
  }

  // Add or update bus marker with real-time location
  updateBusLocation(journeyId, lat, lng, busInfo = {}) {
    if (!this.isInitialized) return;

    // Remove existing bus marker if it exists
    if (this.busMarkers[journeyId]?.bus) {
      this.map.removeLayer(this.busMarkers[journeyId].bus);
    }

    // Create bus icon
    const busIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background: #FF9800; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border: 3px solid white; font-size: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">🚌</div>`,
      iconSize: [35, 35],
      iconAnchor: [17, 17]
    });

    // Create bus marker
    const busMarker = L.marker([parseFloat(lat), parseFloat(lng)], { icon: busIcon })
      .addTo(this.map);

    // Create popup content
    const popupContent = `
      <div style="font-family: Arial, sans-serif; min-width: 200px;">
        <h4 style="margin: 0 0 8px 0; color: #1976D2;">🚌 ${busInfo.busNumber || 'Bus'}</h4>
        <p style="margin: 4px 0;"><strong>Route:</strong> ${busInfo.route || 'Unknown'}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">${busInfo.status || 'Running'}</span></p>
        <p style="margin: 4px 0;"><strong>Driver:</strong> ${busInfo.driverName || 'Unknown'}</p>
        <p style="margin: 4px 0;"><strong>Conductor:</strong> ${busInfo.conductorName || 'Unknown'}</p>
        <hr style="margin: 8px 0;">
        <small style="color: #666;">Last updated: ${new Date().toLocaleTimeString()}</small>
      </div>
    `;

    busMarker.bindPopup(popupContent);

    // Store bus marker
    if (!this.busMarkers[journeyId]) {
      this.busMarkers[journeyId] = {};
    }
    this.busMarkers[journeyId].bus = busMarker;

    console.log(`Updated bus location for journey ${journeyId}: ${lat}, ${lng}`);
  }

  // Remove route and markers for a journey
  removeJourney(journeyId) {
    // Remove route polyline
    if (this.routePolylines[journeyId]) {
      this.map.removeLayer(this.routePolylines[journeyId].polyline);
      delete this.routePolylines[journeyId];
    }

    // Remove markers
    if (this.busMarkers[journeyId]) {
      Object.values(this.busMarkers[journeyId]).forEach(marker => {
        if (marker && this.map.hasLayer(marker)) {
          this.map.removeLayer(marker);
        }
      });
      delete this.busMarkers[journeyId];
    }

    console.log(`Removed journey ${journeyId} from map`);
  }

  // Get LatLng from location string
  getLatLngFromLocation(location) {
    const locationCoordinates = {
      // Major Northern Cities
      'delhi': { lat: 28.6139, lng: 77.2090 },
      'new delhi': { lat: 28.6139, lng: 77.2090 },
      'bareilly': { lat: 28.3670, lng: 79.4304 },
      'lucknow': { lat: 26.8467, lng: 80.9462 },
      'ghaziabad': { lat: 28.6692, lng: 77.4538 },
      'moradabad': { lat: 28.8386, lng: 78.7733 },
      'rampur': { lat: 28.8155, lng: 79.0256 },
      'noida': { lat: 28.5355, lng: 77.3910 },
      'faridabad': { lat: 28.4089, lng: 77.3178 },
      'gurugram': { lat: 28.4595, lng: 77.0266 },
      'gurgaon': { lat: 28.4595, lng: 77.0266 },
      
      // Uttar Pradesh Cities
      'agra': { lat: 27.1767, lng: 78.0081 },
      'kanpur': { lat: 26.4499, lng: 80.3319 },
      'varanasi': { lat: 25.3176, lng: 82.9739 },
      'allahabad': { lat: 25.4358, lng: 81.8463 },
      'prayagraj': { lat: 25.4358, lng: 81.8463 },
      'meerut': { lat: 28.9845, lng: 77.7064 },
      'aligarh': { lat: 27.8974, lng: 78.0880 },
      
      // Western Cities
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'surat': { lat: 21.1702, lng: 72.8311 },
      'rajkot': { lat: 22.3039, lng: 70.8022 },
      'vadodara': { lat: 22.3072, lng: 73.1812 },
      'indore': { lat: 22.7196, lng: 75.8577 },
      'bhopal': { lat: 23.2599, lng: 77.4126 },
      
      // Southern Cities
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'bengaluru': { lat: 12.9716, lng: 77.5946 },
      'mysore': { lat: 12.2958, lng: 76.6394 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'cochin': { lat: 9.9312, lng: 76.2673 },
      'kochi': { lat: 9.9312, lng: 76.2673 },
      'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
      'coimbatore': { lat: 11.0168, lng: 76.9558 },
      'madurai': { lat: 9.9252, lng: 78.1198 },
      
      // Eastern Cities
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'bhubaneswar': { lat: 20.2961, lng: 85.8245 },
      'cuttack': { lat: 20.4625, lng: 85.8828 },
      'guwahati': { lat: 26.1445, lng: 91.7362 },
      
      // Highway Junction Cities
      'chandigarh': { lat: 30.7333, lng: 76.7794 },
      'jaipur': { lat: 26.9124, lng: 75.7873 },
      'jodhpur': { lat: 26.2389, lng: 73.0243 },
      'udaipur': { lat: 24.5854, lng: 73.7125 },
      'nagpur': { lat: 21.1458, lng: 79.0882 },
      'raipur': { lat: 21.2514, lng: 81.6296 },
      'patna': { lat: 25.5941, lng: 85.1376 },
      'ranchi': { lat: 23.3441, lng: 85.3096 }
    };

    const key = location.toLowerCase().trim();
    const coords = locationCoordinates[key];
    
    if (!coords) {
      console.warn(`Location '${location}' not found in coordinates database, using Delhi as default`);
      return { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
    }
    
    return coords;
  }

  // Set map bounds to show all active journeys
  fitAllJourneys() {
    if (Object.keys(this.busMarkers).length === 0) return;

    const allMarkers = [];
    
    Object.values(this.busMarkers).forEach(markers => {
      if (markers.start) allMarkers.push(markers.start);
      if (markers.end) allMarkers.push(markers.end);
      if (markers.bus) allMarkers.push(markers.bus);
    });

    if (allMarkers.length > 0) {
      const group = new L.featureGroup(allMarkers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }
}

// Make it globally available
window.FallbackMapsService = FallbackMapsService;
// OpenStreetMap Service using Leaflet.js for Bus Route Visualization with Real Geocoding
class LeafletMapsService {
  constructor() {
    this.map = null;
    this.busMarkers = {};
    this.routePolylines = {};
    this.isInitialized = false;
    this.routingControl = null;
    this.geocodingService = new GeocodingService();
  }

  // Initialize Leaflet Map with OpenStreetMap
  async initMap(containerId, options = {}) {
    const defaultOptions = {
      center: [20.5937, 78.9629], // India center
      zoom: 6,
      zoomControl: true,
      attributionControl: true
    };

    const mapOptions = { ...defaultOptions, ...options };

    // Create the map
    this.map = L.map(containerId, mapOptions);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.isInitialized = true;
    console.log('OpenStreetMap initialized successfully with Leaflet');
  }

  // Plot route between two points using OSRM routing with real geocoding
  async plotRoute(startLocation, endLocation, journeyId, options = {}) {
    if (!this.isInitialized) {
      console.error('Maps service not initialized');
      return;
    }

    console.log(`Plotting route: ${startLocation} → ${endLocation}`);
    
    // Get real coordinates using geocoding
    const startCoords = await this.geocodingService.getCoordinates(startLocation);
    const endCoords = await this.geocodingService.getCoordinates(endLocation);
    
    if (!startCoords) {
      console.error(`Could not find coordinates for start location: ${startLocation}`);
      this.showLocationError(startLocation);
      return;
    }
    
    if (!endCoords) {
      console.error(`Could not find coordinates for end location: ${endLocation}`);
      this.showLocationError(endLocation);
      return;
    }
    
    console.log(`Start coordinates (${startLocation}):`, startCoords);
    console.log(`End coordinates (${endLocation}):`, endCoords);

    try {
      // Use OSRM (Open Source Routing Machine) for routing
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
      
      const response = await fetch(routeUrl);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Flip lng,lat to lat,lng

        // Create route polyline
        const routePolyline = L.polyline(coordinates, {
          color: options.routeColor || '#1976D2',
          weight: 6,
          opacity: 0.8
        }).addTo(this.map);

        // Add route info popup
        const distance = (route.distance / 1000).toFixed(1); // Convert to km
        const duration = Math.round(route.duration / 60); // Convert to minutes
        
        routePolyline.bindPopup(`
          <div style="font-family: Arial; padding: 8px;">
            <h4 style="margin: 0 0 5px 0; color: #1976D2;">🛣️ Route Information</h4>
            <p style="margin: 2px 0;"><strong>Distance:</strong> ${distance} km</p>
            <p style="margin: 2px 0;"><strong>Duration:</strong> ${duration} minutes</p>
            <p style="margin: 2px 0;"><strong>Route:</strong> ${startLocation} → ${endLocation}</p>
          </div>
        `);

        // Store the route
        this.routePolylines[journeyId] = {
          polyline: routePolyline,
          startLocation,
          endLocation,
          distance,
          duration
        };

        console.log(`OpenStreetMap route plotted: ${startLocation} → ${endLocation} (${distance}km, ${duration}min)`);
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.warn('OSRM routing failed, using straight line:', error);
      // Fallback to straight line
      await this.plotStraightLineRoute(startLocation, endLocation, journeyId, options);
    }

    // Add start and end markers
    await this.addLocationMarkers(startLocation, endLocation, journeyId);
  }

  // Fallback straight line route with real coordinates
  async plotStraightLineRoute(startLocation, endLocation, journeyId, options) {
    const startCoords = await this.geocodingService.getCoordinates(startLocation);
    const endCoords = await this.geocodingService.getCoordinates(endLocation);
    
    if (!startCoords || !endCoords) {
      console.error('Cannot plot straight line: missing coordinates');
      return;
    }
    
    const routeLine = L.polyline([
      [startCoords.lat, startCoords.lng], 
      [endCoords.lat, endCoords.lng]
    ], {
      color: options.routeColor || '#FF5722',
      weight: 4,
      opacity: 0.6,
      dashArray: '10, 10'
    }).addTo(this.map);

    routeLine.bindPopup(`
      <div style="font-family: Arial; padding: 8px;">
        <h4 style="margin: 0 0 5px 0; color: #FF5722;">📏 Direct Route</h4>
        <p style="margin: 2px 0;"><strong>From:</strong> ${startLocation}</p>
        <p style="margin: 2px 0;"><strong>To:</strong> ${endLocation}</p>
        <p style="margin: 2px 0;"><em>Approximate straight-line route</em></p>
      </div>
    `);

    this.routePolylines[journeyId] = {
      polyline: routeLine,
      startLocation,
      endLocation
    };

    console.warn(`Used fallback straight line for ${startLocation} → ${endLocation}`);
  }

  // Add start and end location markers with real coordinates
  async addLocationMarkers(startLocation, endLocation, journeyId) {
    const startCoords = await this.geocodingService.getCoordinates(startLocation);
    const endCoords = await this.geocodingService.getCoordinates(endLocation);
    
    if (!startCoords || !endCoords) {
      console.error('Cannot add location markers: missing coordinates');
      return;
    }

    // Custom start marker icon (Green)
    const startIcon = L.divIcon({
      html: `
        <div style="
          background-color: #4CAF50;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">S</div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Custom end marker icon (Red)
    const endIcon = L.divIcon({
      html: `
        <div style="
          background-color: #F44336;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">E</div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Add start marker
    const startMarker = L.marker([startCoords.lat, startCoords.lng], { icon: startIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="font-family: Arial; text-align: center; padding: 5px;">
          <h4 style="margin: 0; color: #4CAF50;">🚏 Starting Point</h4>
          <p style="margin: 5px 0 0 0; font-weight: bold;">${startLocation}</p>
        </div>
      `);

    // Add end marker
    const endMarker = L.marker([endCoords.lat, endCoords.lng], { icon: endIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="font-family: Arial; text-align: center; padding: 5px;">
          <h4 style="margin: 0; color: #F44336;">🏁 Destination</h4>
          <p style="margin: 5px 0 0 0; font-weight: bold;">${endLocation}</p>
        </div>
      `);

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

    const position = [parseFloat(lat), parseFloat(lng)];

    // Remove existing bus marker if it exists
    if (this.busMarkers[journeyId]?.bus) {
      this.map.removeLayer(this.busMarkers[journeyId].bus);
    }

    // Custom bus marker icon
    const busIcon = L.divIcon({
      html: `
        <div style="
          background-color: #FF9800;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 20px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          🚌
        </div>
      `,
      className: 'bus-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Create bus marker
    const busMarker = L.marker(position, { icon: busIcon }).addTo(this.map);

    // Enhanced popup content
    const popupContent = `
      <div style="padding: 12px; font-family: Arial; min-width: 250px;">
        <h3 style="margin: 0 0 8px 0; color: #FF9800; display: flex; align-items: center;">
          <span style="font-size: 20px; margin-right: 8px;">🚌</span>
          ${busInfo.busNumber || 'Bus'}
        </h3>
        <div style="border-left: 4px solid #FF9800; padding-left: 8px; margin: 8px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Route:</strong> ${busInfo.route || 'Unknown'}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> 
            <span style="color: ${busInfo.status === 'running' ? '#4CAF50' : '#FF5722'}; font-weight: bold;">
              ${busInfo.status === 'running' ? '🟢 Running' : '🟡 ' + (busInfo.status || 'Unknown')}
            </span>
          </p>
        </div>
        <div style="background: #f5f5f5; padding: 6px; border-radius: 4px; margin: 8px 0;">
          <p style="margin: 2px 0; font-size: 13px;"><strong>👨‍✈️ Driver:</strong> ${busInfo.driverName || 'Unknown'}</p>
          <p style="margin: 2px 0; font-size: 13px;"><strong>🎫 Conductor:</strong> ${busInfo.conductorName || 'Unknown'}</p>
        </div>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #666; text-align: center;">
          📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}<br>
          🕐 Last updated: ${new Date().toLocaleTimeString()}
        </p>
      </div>
    `;

    busMarker.bindPopup(popupContent);

    // Store bus marker
    if (!this.busMarkers[journeyId]) {
      this.busMarkers[journeyId] = {};
    }
    this.busMarkers[journeyId].bus = busMarker;

    console.log(`Updated bus location for journey ${journeyId}: ${lat}, ${lng}`);

    // Auto-center map on bus if this is the only active journey
    if (Object.keys(this.busMarkers).length === 1) {
      this.map.panTo(position);
    }
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
        if (marker) this.map.removeLayer(marker);
      });
      delete this.busMarkers[journeyId];
    }

    console.log(`Removed journey ${journeyId} from map`);
  }

  // Show error when location cannot be found
  showLocationError(location) {
    // Create error marker on map
    if (this.map) {
      const errorPopup = L.popup({
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: 'error-popup'
      })
      .setLatLng([20.5937, 78.9629]) // Center of India
      .setContent(`
        <div style="padding: 10px; background: #f8d7da; color: #721c24; border-radius: 5px;">
          <strong>Location Not Found</strong><br>
          Could not find coordinates for: <em>${location}</em><br>
          <small>Please check the spelling or try a nearby major city</small>
        </div>
      `)
      .openOn(this.map);
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        if (this.map.hasLayer(errorPopup)) {
          this.map.closePopup(errorPopup);
        }
      }, 5000);
    }
  }
  
  // Validate coordinates
  isValidCoordinates(coords) {
    return coords && 
           typeof coords.lat === 'number' && 
           typeof coords.lng === 'number' &&
           coords.lat >= -90 && coords.lat <= 90 &&
           coords.lng >= -180 && coords.lng <= 180;
  }

  // Set map bounds to show all active journeys
  fitAllJourneys() {
    if (Object.keys(this.busMarkers).length === 0) return;

    const group = new L.featureGroup();
    
    Object.values(this.busMarkers).forEach(markers => {
      if (markers.start) group.addLayer(markers.start);
      if (markers.end) group.addLayer(markers.end);
      if (markers.bus) group.addLayer(markers.bus);
    });

    if (group.getLayers().length > 0) {
      this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Export for use in other scripts
window.LeafletMapsService = LeafletMapsService;
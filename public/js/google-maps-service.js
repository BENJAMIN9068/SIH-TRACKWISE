// DEPRECATED: This file has been replaced with leaflet-maps-service.js
// The bus tracking system now uses OpenStreetMap with Leaflet instead of Google Maps
// This provides the same functionality without API keys or costs
//
// New service file: leaflet-maps-service.js
// Migration completed: All map pages now use OpenStreetMap
//
// If you see this message, please update your code to use LeafletMapsService instead of GoogleMapsService

// Legacy Google Maps Service (DEPRECATED)
class GoogleMapsService {
  constructor() {
    this.map = null;
    this.directionsService = null;
    this.directionsRenderer = null;
    this.busMarkers = {};
    this.routePolylines = {};
    this.isInitialized = false;
  }

  // Initialize Google Maps
  async initMap(containerId, options = {}) {
    const defaultOptions = {
      zoom: 6,
      center: { lat: 20.5937, lng: 78.9629 }, // India center
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'transit',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true
    };

    this.map = new google.maps.Map(
      document.getElementById(containerId),
      { ...defaultOptions, ...options }
    );

    this.directionsService = new google.maps.DirectionsService();
    this.isInitialized = true;
    
    console.log('Google Maps initialized successfully');
  }

  // Plot route between two points using Google Directions API
  async plotRoute(startLocation, endLocation, journeyId, options = {}) {
    if (!this.isInitialized) {
      console.error('Maps service not initialized');
      return;
    }

    const request = {
      origin: startLocation,
      destination: endLocation,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false, // We want highways for bus routes
      avoidTolls: false,
      optimizeWaypoints: true
    };

    try {
      const result = await new Promise((resolve, reject) => {
        this.directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });

      // Create custom polyline for this route with highway styling
      const routePath = result.routes[0].overview_path;
      const routePolyline = new google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: options.routeColor || '#1976D2',
        strokeOpacity: 0.8,
        strokeWeight: 8,
        map: this.map,
        zIndex: 1
      });

      // Add route information popup on click
      const route = result.routes[0];
      const leg = route.legs[0];
      
      routePolyline.addListener('click', (e) => {
        const infoWindow = new google.maps.InfoWindow({
          position: e.latLng,
          content: `
            <div style="font-family: Arial; padding: 8px;">
              <h4 style="margin: 0 0 5px 0; color: #1976D2;">🛣️ Route Information</h4>
              <p style="margin: 2px 0;"><strong>Distance:</strong> ${leg.distance.text}</p>
              <p style="margin: 2px 0;"><strong>Duration:</strong> ${leg.duration.text}</p>
              <p style="margin: 2px 0;"><strong>Via:</strong> ${route.summary || 'Main highways'}</p>
            </div>
          `
        });
        infoWindow.open(this.map);
        
        // Close after 5 seconds
        setTimeout(() => infoWindow.close(), 5000);
      });

      // Store the route
      this.routePolylines[journeyId] = {
        polyline: routePolyline,
        route: result.routes[0],
        startLocation,
        endLocation
      };

      // Add start and end markers
      this.addLocationMarkers(startLocation, endLocation, journeyId);

      console.log(`Google Maps route plotted for journey ${journeyId}: ${startLocation} → ${endLocation}`);
      console.log(`Route summary: ${route.summary}, Distance: ${leg.distance.text}, Duration: ${leg.duration.text}`);
      
      return result;

    } catch (error) {
      console.error('Error plotting Google Maps route:', error);
      
      // Fallback to straight line if directions fail
      this.plotStraightLineRoute(startLocation, endLocation, journeyId, options);
    }
  }

  // Fallback straight line route
  plotStraightLineRoute(startLocation, endLocation, journeyId, options) {
    const startCoords = this.getLatLngFromLocation(startLocation);
    const endCoords = this.getLatLngFromLocation(endLocation);
    
    const routeLine = new google.maps.Polyline({
      path: [startCoords, endCoords],
      geodesic: true,
      strokeColor: options.routeColor || '#FF5722',
      strokeOpacity: 0.6,
      strokeWeight: 6,
      strokePattern: [{
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
        offset: '0',
        repeat: '20px'
      }],
      map: this.map
    });

    this.routePolylines[journeyId] = {
      polyline: routeLine,
      startLocation,
      endLocation
    };

    this.addLocationMarkers(startLocation, endLocation, journeyId);
    console.warn(`Used fallback straight line for ${startLocation} → ${endLocation}`);
  }

  // Add start and end location markers
  addLocationMarkers(startLocation, endLocation, journeyId) {
    const startCoords = this.getLatLngFromLocation(startLocation);
    const endCoords = this.getLatLngFromLocation(endLocation);

    // Start marker (Green with enhanced styling)
    const startMarker = new google.maps.Marker({
      position: startCoords,
      map: this.map,
      title: `Start: ${startLocation}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#4CAF50',
        fillOpacity: 1,
        strokeColor: '#2E7D32',
        strokeWeight: 3,
        scale: 12
      },
      zIndex: 3
    });

    // Start marker info window
    const startInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-family: Arial; text-align: center; padding: 5px;">
          <h4 style="margin: 0; color: #4CAF50;">🚏 Starting Point</h4>
          <p style="margin: 5px 0 0 0; font-weight: bold;">${startLocation}</p>
        </div>
      `
    });

    startMarker.addListener('click', () => {
      startInfoWindow.open(this.map, startMarker);
    });

    // End marker (Red with enhanced styling)
    const endMarker = new google.maps.Marker({
      position: endCoords,
      map: this.map,
      title: `Destination: ${endLocation}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#F44336',
        fillOpacity: 1,
        strokeColor: '#C62828',
        strokeWeight: 3,
        scale: 12
      },
      zIndex: 3
    });

    // End marker info window
    const endInfoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-family: Arial; text-align: center; padding: 5px;">
          <h4 style="margin: 0; color: #F44336;">🏁 Destination</h4>
          <p style="margin: 5px 0 0 0; font-weight: bold;">${endLocation}</p>
        </div>
      `
    });

    endMarker.addListener('click', () => {
      endInfoWindow.open(this.map, endMarker);
    });

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

    const position = { lat: parseFloat(lat), lng: parseFloat(lng) };

    // Remove existing bus marker if it exists
    if (this.busMarkers[journeyId]?.bus) {
      this.busMarkers[journeyId].bus.setMap(null);
    }

    // Create enhanced bus marker
    const busMarker = new google.maps.Marker({
      position: position,
      map: this.map,
      title: `Bus: ${busInfo.busNumber || 'Unknown'}\nRoute: ${busInfo.route || 'Unknown'}`,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="22" fill="#FF9800" stroke="#E65100" stroke-width="3"/>
            <rect x="10" y="15" width="30" height="20" rx="3" fill="white"/>
            <rect x="12" y="17" width="8" height="6" fill="#2196F3"/>
            <rect x="21" y="17" width="8" height="6" fill="#2196F3"/>
            <rect x="30" y="17" width="6" height="6" fill="#2196F3"/>
            <rect x="12" y="25" width="24" height="8" rx="2" fill="#616161"/>
            <circle cx="17" cy="37" r="3" fill="#424242"/>
            <circle cx="33" cy="37" r="3" fill="#424242"/>
            <text x="25" y="45" text-anchor="middle" fill="#E65100" font-family="Arial" font-size="8" font-weight="bold">BUS</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(50, 50),
        anchor: new google.maps.Point(25, 25)
      },
      animation: google.maps.Animation.DROP,
      zIndex: 5
    });

    // Enhanced info window with more details
    const infoWindow = new google.maps.InfoWindow({
      content: `
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
      `,
      maxWidth: 300
    });

    busMarker.addListener('click', () => {
      // Close other info windows
      Object.values(this.busMarkers).forEach(markers => {
        if (markers.bus?.infoWindow) {
          markers.bus.infoWindow.close();
        }
      });
      
      infoWindow.open(this.map, busMarker);
      busMarker.infoWindow = infoWindow;
    });

    // Store bus marker
    if (!this.busMarkers[journeyId]) {
      this.busMarkers[journeyId] = {};
    }
    this.busMarkers[journeyId].bus = busMarker;
    busMarker.infoWindow = infoWindow;

    console.log(`Updated bus location for journey ${journeyId}: ${lat}, ${lng}`);
  }

  // Remove route and markers for a journey
  removeJourney(journeyId) {
    // Remove route polyline
    if (this.routePolylines[journeyId]) {
      this.routePolylines[journeyId].polyline.setMap(null);
      delete this.routePolylines[journeyId];
    }

    // Remove markers
    if (this.busMarkers[journeyId]) {
      Object.values(this.busMarkers[journeyId]).forEach(marker => {
        if (marker && marker.setMap) marker.setMap(null);
      });
      delete this.busMarkers[journeyId];
    }

    console.log(`Removed journey ${journeyId} from map`);
  }

  // Get LatLng from location string (enhanced with more cities)
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
      
      // More cities...
      'agra': { lat: 27.1767, lng: 78.0081 },
      'kanpur': { lat: 26.4499, lng: 80.3319 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'bengaluru': { lat: 12.9716, lng: 77.5946 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'jaipur': { lat: 26.9124, lng: 75.7873 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 }
    };

    const key = location.toLowerCase().trim();
    const coords = locationCoordinates[key];
    
    if (!coords) {
      console.warn(`Location '${location}' not found, using Delhi as default`);
      return { lat: 28.6139, lng: 77.2090 };
    }
    
    return coords;
  }

  // Set map bounds to show all active journeys
  fitAllJourneys() {
    if (Object.keys(this.busMarkers).length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    
    Object.values(this.busMarkers).forEach(markers => {
      if (markers.start) bounds.extend(markers.start.getPosition());
      if (markers.end) bounds.extend(markers.end.getPosition());
      if (markers.bus) bounds.extend(markers.bus.getPosition());
    });

    this.map.fitBounds(bounds);
    
    // Ensure minimum zoom level for better visibility
    google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
      if (this.map.getZoom() > 15) {
        this.map.setZoom(15);
      }
    });
  }
}

// Export for use in other scripts
window.GoogleMapsService = GoogleMapsService;
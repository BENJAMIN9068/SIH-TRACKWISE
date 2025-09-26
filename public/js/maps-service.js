// Google Maps Route Visualization Service
class MapsService {
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
      zoom: 7,
      center: { lat: 28.6139, lng: 77.2090 }, // Delhi center
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'transit',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    this.map = new google.maps.Map(
      document.getElementById(containerId),
      { ...defaultOptions, ...options }
    );

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // We'll add custom markers
      polylineOptions: {
        strokeColor: '#1976D2',
        strokeWeight: 6,
        strokeOpacity: 0.8
      }
    });
    
    this.directionsRenderer.setMap(this.map);
    this.isInitialized = true;
    
    console.log('Google Maps initialized successfully');
  }

  // Plot route between two points
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
      avoidHighways: false,
      avoidTolls: false
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

      // Create custom polyline for this route
      const routePath = result.routes[0].overview_path;
      const routePolyline = new google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: options.routeColor || '#1976D2',
        strokeOpacity: 0.8,
        strokeWeight: 6,
        map: this.map
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

      // Fit map to route bounds
      const bounds = new google.maps.LatLngBounds();
      routePath.forEach(point => bounds.extend(point));
      this.map.fitBounds(bounds);

      console.log(`Route plotted for journey ${journeyId}: ${startLocation} → ${endLocation}`);
      return result;

    } catch (error) {
      console.error('Error plotting route:', error);
      throw error;
    }
  }

  // Add start and end location markers
  addLocationMarkers(startLocation, endLocation, journeyId) {
    // Start marker (Green)
    const startMarker = new google.maps.Marker({
      position: this.getLatLngFromLocation(startLocation),
      map: this.map,
      title: `Start: ${startLocation}`,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#4CAF50" stroke="white" stroke-width="3"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">S</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32)
      }
    });

    // End marker (Red)
    const endMarker = new google.maps.Marker({
      position: this.getLatLngFromLocation(endLocation),
      map: this.map,
      title: `End: ${endLocation}`,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#F44336" stroke="white" stroke-width="3"/>
            <text x="16" y="21" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">E</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32)
      }
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

    // Create bus marker
    const busMarker = new google.maps.Marker({
      position: position,
      map: this.map,
      title: `Bus: ${busInfo.busNumber || 'Unknown'}\nRoute: ${busInfo.route || 'Unknown'}`,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#FF9800" stroke="white" stroke-width="3"/>
            <rect x="8" y="12" width="24" height="16" rx="2" fill="white"/>
            <rect x="10" y="14" width="6" height="4" fill="#2196F3"/>
            <rect x="18" y="14" width="6" height="4" fill="#2196F3"/>
            <rect x="26" y="14" width="4" height="4" fill="#2196F3"/>
            <rect x="10" y="20" width="20" height="6" rx="1" fill="#616161"/>
            <circle cx="14" cy="30" r="2" fill="#424242"/>
            <circle cx="26" cy="30" r="2" fill="#424242"/>
            <text x="20" y="37" text-anchor="middle" fill="#424242" font-family="Arial" font-size="8" font-weight="bold">BUS</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      },
      animation: google.maps.Animation.DROP
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; font-family: Arial;">
          <h4 style="margin: 0 0 5px 0; color: #1976D2;">🚌 ${busInfo.busNumber || 'Bus'}</h4>
          <p style="margin: 2px 0;"><strong>Route:</strong> ${busInfo.route || 'Unknown'}</p>
          <p style="margin: 2px 0;"><strong>Status:</strong> <span style="color: #4CAF50;">${busInfo.status || 'Running'}</span></p>
          <p style="margin: 2px 0;"><strong>Driver:</strong> ${busInfo.driverName || 'Unknown'}</p>
          <p style="margin: 2px 0;"><strong>Conductor:</strong> ${busInfo.conductorName || 'Unknown'}</p>
          <small style="color: #666;">Last updated: ${new Date().toLocaleTimeString()}</small>
        </div>
      `
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

    // Auto-center map on bus if this is the only active journey
    if (Object.keys(this.busMarkers).length === 1) {
      this.map.panTo(position);
    }
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

  // Get LatLng from location string
  getLatLngFromLocation(location) {
    // Common locations mapping (you can expand this)
    const locationCoordinates = {
      'delhi': { lat: 28.6139, lng: 77.2090 },
      'new delhi': { lat: 28.6139, lng: 77.2090 },
      'bareilly': { lat: 28.3670, lng: 79.4304 },
      'lucknow': { lat: 26.8467, lng: 80.9462 },
      'ghaziabad': { lat: 28.6692, lng: 77.4538 },
      'moradabad': { lat: 28.8386, lng: 78.7733 },
      'rampur': { lat: 28.8155, lng: 79.0256 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'mysore': { lat: 12.2958, lng: 76.6394 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'kolkata': { lat: 22.5726, lng: 88.3639 }
    };

    const key = location.toLowerCase().trim();
    return locationCoordinates[key] || { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
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
  }

  // Get distance between two points
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
window.MapsService = MapsService;
// Real-time Socket.IO client for bus tracking
class BusTracker {
    constructor() {
        this.socket = io();
        this.maps = new Map(); // Store map instances
        this.markers = new Map(); // Store markers for each journey
        this.init();
    }

    init() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        // Location update events
        this.socket.on('locationUpdate', (data) => {
            this.handleLocationUpdate(data);
        });

        this.socket.on('busLocationUpdate', (data) => {
            this.handleBusLocationUpdate(data);
        });

        this.socket.on('adminLocationUpdate', (data) => {
            this.handleAdminLocationUpdate(data);
        });
    }

    // Join a room for specific updates
    joinRoom(room) {
        this.socket.emit('joinRoom', room);
    }

    // Leave a room
    leaveRoom(room) {
        this.socket.emit('leaveRoom', room);
    }

    // Handle general location updates
    handleLocationUpdate(data) {
        console.log('Location update received:', data);
        
        // Update any existing map markers
        if (this.markers.has(data.journeyId)) {
            const marker = this.markers.get(data.journeyId);
            marker.setLatLng([data.location.lat, data.location.lng]);
            
            // Update popup content
            marker.bindPopup(`
                <strong>Bus: ${data.busNumber}</strong><br>
                Last Updated: ${new Date(data.timestamp).toLocaleTimeString()}
            `);
        }

        // Update any journey cards on the page
        this.updateJourneyCard(data.journeyId, data);
    }

    // Handle bus-specific location updates
    handleBusLocationUpdate(data) {
        console.log('Bus location update:', data);
        // This can be used for journey-specific tracking pages
    }

    // Handle admin location updates
    handleAdminLocationUpdate(data) {
        console.log('Admin location update:', data);
        
        // Update admin dashboard elements
        this.updateAdminDashboard(data);
    }

    // Initialize map for a journey
    initMap(containerId, journeyId, initialLocation = null) {
        const map = L.map(containerId).setView([20.5937, 78.9629], 5); // India center
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        this.maps.set(journeyId, map);

        // Add initial marker if location provided
        if (initialLocation && initialLocation.coordinates) {
            const [lng, lat] = initialLocation.coordinates;
            this.addMarker(journeyId, lat, lng, map);
        }

        return map;
    }

    // Add or update marker for a journey
    addMarker(journeyId, lat, lng, map = null) {
        if (!map) {
            map = this.maps.get(journeyId);
        }
        
        if (!map) {
            console.error('Map not found for journey:', journeyId);
            return;
        }

        // Remove existing marker if it exists
        if (this.markers.has(journeyId)) {
            map.removeLayer(this.markers.get(journeyId));
        }

        // Create new marker
        const busIcon = L.divIcon({
            html: '<i class="fas fa-bus" style="color: #ff4757; font-size: 24px;"></i>',
            iconSize: [30, 30],
            className: 'bus-marker'
        });

        const marker = L.marker([lat, lng], { icon: busIcon }).addTo(map);
        marker.bindPopup(`
            <strong>Live Bus Location</strong><br>
            Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}<br>
            Updated: ${new Date().toLocaleTimeString()}
        `);

        this.markers.set(journeyId, marker);
        
        // Center map on new location
        map.setView([lat, lng], 12);

        return marker;
    }

    // Update journey card information
    updateJourneyCard(journeyId, data) {
        const card = document.querySelector(`[data-journey-id="${journeyId}"]`);
        if (card) {
            const statusElement = card.querySelector('.journey-status');
            const timestampElement = card.querySelector('.last-updated');
            
            if (statusElement) {
                statusElement.innerHTML = '<i class="fas fa-circle live-indicator"></i> Live';
            }
            
            if (timestampElement) {
                timestampElement.textContent = `Updated: ${new Date(data.timestamp).toLocaleTimeString()}`;
            }
        }
    }

    // Update admin dashboard
    updateAdminDashboard(data) {
        // Update running buses count
        this.updateRunningBusesCount();
        
        // Update live buses table if it exists
        const liveBusesTable = document.getElementById('live-buses-table');
        if (liveBusesTable) {
            this.updateLiveBusesTable(data);
        }

        // Update admin map if it exists
        const adminMap = document.getElementById('admin-map');
        if (adminMap && this.maps.has('admin')) {
            this.updateAdminMap(data);
        }
    }

    // Update running buses count
    updateRunningBusesCount() {
        const countElement = document.getElementById('running-buses-count');
        if (countElement) {
            // This could fetch latest count or increment/decrement based on status changes
            fetch('/admin/api/live-locations')
                .then(response => response.json())
                .then(data => {
                    countElement.textContent = data.buses.length;
                })
                .catch(error => console.error('Error updating count:', error));
        }
    }

    // Update live buses table
    updateLiveBusesTable(data) {
        const row = document.querySelector(`tr[data-journey-id="${data.journeyId}"]`);
        if (row) {
            const locationCell = row.querySelector('.location-cell');
            const timestampCell = row.querySelector('.timestamp-cell');
            
            if (locationCell) {
                locationCell.textContent = `${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}`;
            }
            
            if (timestampCell) {
                timestampCell.textContent = new Date().toLocaleTimeString();
            }
        }
    }

    // Update admin map with new bus location
    updateAdminMap(data) {
        const adminMap = this.maps.get('admin');
        if (adminMap) {
            this.addMarker(data.journeyId, data.location.lat, data.location.lng, adminMap);
        }
    }

    // Enable GPS tracking for staff
    startGPSTracking(journeyId, updateInterval = 30000) {
        if (!navigator.geolocation) {
            alert('GPS tracking is not supported by your browser');
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Send location update to server
                fetch('/staff/location/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        lat: latitude,
                        lng: longitude,
                        journeyId: journeyId
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log('Location updated successfully');
                    } else {
                        console.error('Location update failed:', data.error);
                    }
                })
                .catch(error => {
                    console.error('Error updating location:', error);
                });
            },
            (error) => {
                console.error('GPS error:', error);
                alert('Error accessing GPS: ' + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        return watchId;
    }

    // Stop GPS tracking
    stopGPSTracking(watchId) {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
    }
}

// Initialize bus tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.busTracker = new BusTracker();
});

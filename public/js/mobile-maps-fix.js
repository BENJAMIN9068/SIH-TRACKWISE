// Mobile Maps Fix - Ensure maps display properly on mobile devices

class MobileMapsFix {
    constructor() {
        this.isInitialized = false;
        this.resizeTimeout = null;
        this.orientationTimeout = null;
    }

    // Initialize mobile fixes
    init() {
        if (this.isInitialized) return;

        console.log('Initializing mobile maps fixes...');
        
        // Add viewport fixes
        this.addViewportFixes();
        
        // Add resize handlers
        this.addResizeHandlers();
        
        // Add orientation change handlers
        this.addOrientationHandlers();
        
        // Fix existing maps
        this.fixExistingMaps();
        
        this.isInitialized = true;
        console.log('Mobile maps fixes initialized successfully');
    }

    // Add CSS and meta viewport fixes
    addViewportFixes() {
        // Ensure proper viewport is set
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
        }

        // Add critical CSS if not already loaded
        if (!document.querySelector('link[href*="responsive-maps.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/responsive-maps.css';
            document.head.appendChild(link);
        }
    }

    // Add window resize handlers
    addResizeHandlers() {
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    // Add orientation change handlers
    addOrientationHandlers() {
        window.addEventListener('orientationchange', () => {
            clearTimeout(this.orientationTimeout);
            this.orientationTimeout = setTimeout(() => {
                this.handleOrientationChange();
            }, 500);
        });

        // Also listen for screen orientation API if available
        if (screen && screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                clearTimeout(this.orientationTimeout);
                this.orientationTimeout = setTimeout(() => {
                    this.handleOrientationChange();
                }, 500);
            });
        }
    }

    // Handle window resize
    handleResize() {
        console.log('Window resized, invalidating maps...');
        this.invalidateAllMaps();
    }

    // Handle orientation change
    handleOrientationChange() {
        console.log('Orientation changed, invalidating maps...');
        // Longer delay for orientation change as it takes time to complete
        setTimeout(() => {
            this.invalidateAllMaps();
            this.fixMapDimensions();
        }, 100);
    }

    // Fix existing maps on page
    fixExistingMaps() {
        const maps = this.findAllMaps();
        maps.forEach(mapElement => {
            this.fixSingleMap(mapElement);
        });
    }

    // Find all map containers
    findAllMaps() {
        const selectors = [
            '#map',
            '.leaflet-container',
            '[id*="map"]',
            '[class*="map"]'
        ];
        
        const maps = [];
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el.offsetWidth > 0 || el.offsetHeight > 0) {
                    maps.push(el);
                }
            });
        });
        
        return [...new Set(maps)]; // Remove duplicates
    }

    // Fix a single map element
    fixSingleMap(mapElement) {
        if (!mapElement) return;

        // Force dimensions
        this.setMapDimensions(mapElement);
        
        // If it's a Leaflet map, invalidate size
        if (window.L && mapElement._leaflet_map) {
            setTimeout(() => {
                mapElement._leaflet_map.invalidateSize(true);
            }, 100);
        }
    }

    // Set proper dimensions for map
    setMapDimensions(mapElement) {
        if (!mapElement) return;

        const parent = mapElement.parentElement;
        if (!parent) return;

        // Get viewport dimensions
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        
        // Set responsive dimensions based on screen size
        if (vw <= 768) {
            // Mobile
            mapElement.style.width = '100%';
            mapElement.style.minHeight = '350px';
            mapElement.style.height = Math.min(vh * 0.6, 500) + 'px';
        } else if (vw <= 1024) {
            // Tablet
            mapElement.style.width = '100%';
            mapElement.style.minHeight = '450px';
            mapElement.style.height = Math.min(vh * 0.5, 500) + 'px';
        } else {
            // Desktop
            mapElement.style.width = '100%';
            mapElement.style.height = '500px';
            mapElement.style.minHeight = '500px';
        }

        // Force reflow
        mapElement.offsetHeight;
    }

    // Invalidate all maps
    invalidateAllMaps() {
        const maps = this.findAllMaps();
        
        maps.forEach(mapElement => {
            // Fix dimensions first
            this.setMapDimensions(mapElement);
            
            // Then invalidate Leaflet maps
            if (window.L && mapElement._leaflet_map) {
                try {
                    mapElement._leaflet_map.invalidateSize({
                        animate: false,
                        pan: false
                    });
                } catch (error) {
                    console.warn('Error invalidating map size:', error);
                }
            }
        });
    }

    // Fix map dimensions specifically
    fixMapDimensions() {
        const maps = this.findAllMaps();
        maps.forEach(mapElement => {
            this.setMapDimensions(mapElement);
        });
    }

    // Check if device is mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Check if device is touch-enabled
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Get screen dimensions
    getScreenInfo() {
        return {
            width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
            orientation: window.orientation || (screen.orientation ? screen.orientation.angle : 0),
            isMobile: this.isMobile(),
            isTouch: this.isTouchDevice()
        };
    }

    // Force map refresh - use this when maps appear blank
    forceMapRefresh(mapId = null) {
        console.log('Forcing map refresh...');
        
        const maps = mapId ? [document.getElementById(mapId)] : this.findAllMaps();
        
        maps.forEach(mapElement => {
            if (!mapElement) return;
            
            // Multiple strategies to force refresh
            
            // Strategy 1: Change dimensions slightly
            const originalHeight = mapElement.style.height;
            mapElement.style.height = (parseInt(originalHeight) + 1) + 'px';
            
            setTimeout(() => {
                mapElement.style.height = originalHeight;
                
                // Strategy 2: Force reflow
                mapElement.offsetHeight;
                
                // Strategy 3: Invalidate Leaflet map
                if (window.L && mapElement._leaflet_map) {
                    mapElement._leaflet_map.invalidateSize(true);
                    
                    // Strategy 4: Pan slightly and back
                    const center = mapElement._leaflet_map.getCenter();
                    const lat = center.lat + 0.000001;
                    const lng = center.lng + 0.000001;
                    
                    mapElement._leaflet_map.panTo([lat, lng], {animate: false});
                    setTimeout(() => {
                        mapElement._leaflet_map.panTo([center.lat, center.lng], {animate: false});
                    }, 50);
                }
            }, 100);
        });
    }

    // Debug function to log map status
    debugMaps() {
        const maps = this.findAllMaps();
        const screenInfo = this.getScreenInfo();
        
        console.log('=== Mobile Maps Debug Info ===');
        console.log('Screen Info:', screenInfo);
        console.log('Maps Found:', maps.length);
        
        maps.forEach((mapElement, index) => {
            const rect = mapElement.getBoundingClientRect();
            console.log(`Map ${index + 1}:`, {
                id: mapElement.id,
                dimensions: `${rect.width}x${rect.height}`,
                visible: rect.width > 0 && rect.height > 0,
                hasLeaflet: !!(window.L && mapElement._leaflet_map),
                styles: {
                    width: mapElement.style.width,
                    height: mapElement.style.height,
                    display: mapElement.style.display
                }
            });
        });
    }
}

// Create global instance
window.MobileMapsFix = new MobileMapsFix();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.MobileMapsFix.init();
    });
} else {
    // DOM is already ready
    window.MobileMapsFix.init();
}

// Also initialize after a short delay to catch dynamically loaded maps
setTimeout(() => {
    window.MobileMapsFix.fixExistingMaps();
}, 1000);

// Export useful functions globally for debugging
window.refreshMaps = () => window.MobileMapsFix.forceMapRefresh();
window.debugMaps = () => window.MobileMapsFix.debugMaps();
// Real Geocoding Service using Nominatim (OpenStreetMap's geocoding service)
class GeocodingService {
  constructor() {
    this.baseUrl = 'https://nominatim.openstreetmap.org/search';
    this.cache = new Map(); // Cache results to avoid repeated API calls
  }

  // Get coordinates for a city name
  async getCoordinates(cityName) {
    // Check cache first
    const cacheKey = cityName.toLowerCase().trim();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Clean the city name
      const cleanCityName = this.cleanCityName(cityName);
      
      // Try multiple search strategies for better results
      const searchStrategies = [
        `${cleanCityName}, India`,
        `${cleanCityName}, Uttar Pradesh, India`,
        `${cleanCityName}, Uttarakhand, India`,
        `${cleanCityName}, Delhi, India`,
        `${cleanCityName}, Maharashtra, India`,
        cleanCityName
      ];

      for (const searchTerm of searchStrategies) {
        const coordinates = await this.searchLocation(searchTerm);
        if (coordinates) {
          // Cache the result
          this.cache.set(cacheKey, coordinates);
          console.log(`Found coordinates for ${cityName}:`, coordinates);
          return coordinates;
        }
      }

      // If no results found, return null
      console.warn(`No coordinates found for: ${cityName}`);
      return null;

    } catch (error) {
      console.error('Geocoding error for', cityName, ':', error);
      return null;
    }
  }

  // Search for a location using Nominatim API
  async searchLocation(searchTerm) {
    try {
      const url = `${this.baseUrl}?` + new URLSearchParams({
        q: searchTerm,
        format: 'json',
        limit: '1',
        countrycodes: 'in', // Restrict to India
        addressdetails: '1',
        extratags: '1'
      });

      console.log(`Searching for: ${searchTerm}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          display_name: result.display_name,
          type: result.type,
          importance: result.importance
        };
      }

      return null;
    } catch (error) {
      console.error('Search location error:', error);
      return null;
    }
  }

  // Clean city name for better search results
  cleanCityName(cityName) {
    return cityName
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s]/g, '') // Remove special characters except spaces
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' ');
  }

  // Get multiple city coordinates at once
  async getMultipleCoordinates(cityNames) {
    const results = {};
    const promises = cityNames.map(async (cityName) => {
      const coords = await this.getCoordinates(cityName);
      results[cityName] = coords;
    });
    
    await Promise.all(promises);
    return results;
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Export for use in other scripts
window.GeocodingService = GeocodingService;
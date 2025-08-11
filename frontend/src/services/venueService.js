import axiosInstance from '../lib/axios';

/**
 * Venue API service for handling all venue-related API calls
 */
export class VenueService {
  /**
   * Search venues with filters
   * @param {Object} params - Search parameters
   * @param {string} params.search - Search query
   * @param {string} params.sport - Sport filter
   * @param {number} params.page - Page number
   * @param {number} params.limit - Results per page
   * @param {number} params.priceMin - Minimum price filter
   * @param {number} params.priceMax - Maximum price filter
   * @param {string} params.location - Location filter
   * @param {string[]} params.amenities - Amenities filter
   * @returns {Promise<Object>} API response
   */
  static async searchVenues(params = {}) {
    const searchParams = new URLSearchParams();
    
    // Add parameters to search params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item));
        } else {
          searchParams.append(key, value);
        }
      }
    });

    try {
      const response = await axiosInstance.get(`/venues?${searchParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching venues:', error);
      throw new Error(error.response?.data?.message || 'Failed to search venues');
    }
  }

  /**
   * Get venue by ID
   * @param {string} id - Venue ID
   * @returns {Promise<Object>} Venue data
   */
  static async getVenueById(id) {
    try {
      const response = await axiosInstance.get(`/venues/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching venue:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch venue');
    }
  }

  /**
   * Create new venue
   * @param {Object} venueData - Venue data
   * @returns {Promise<Object>} Created venue
   */
  static async createVenue(venueData) {
    try {
      const response = await axiosInstance.post('/venues', venueData);
      return response.data;
    } catch (error) {
      console.error('Error creating venue:', error);
      throw new Error(error.response?.data?.message || 'Failed to create venue');
    }
  }

  /**
   * Update venue
   * @param {string} id - Venue ID
   * @param {Object} venueData - Updated venue data
   * @returns {Promise<Object>} Updated venue
   */
  static async updateVenue(id, venueData) {
    try {
      const response = await axiosInstance.put(`/venues/${id}`, venueData);
      return response.data;
    } catch (error) {
      console.error('Error updating venue:', error);
      throw new Error(error.response?.data?.message || 'Failed to update venue');
    }
  }

  /**
   * Get available sports for filtering
   * @returns {string[]} List of available sports
   */
  static getAvailableSports() {
    return [
      'All Sports',
      'Badminton', 
      'Football', 
      'Cricket', 
      'Swimming', 
      'Tennis', 
      'Table Tennis',
      'Basketball',
      'Volleyball'
    ];
  }

  /**
   * Get available amenities for filtering
   * @returns {string[]} List of available amenities
   */
  static getAvailableAmenities() {
    return [
      'Parking', 
      'Changing Rooms', 
      'Shower', 
      'WiFi', 
      'Cafeteria', 
      'Air Conditioning', 
      'Equipment Rental', 
      'First Aid', 
      'Security',
      'CCTV',
      'Floodlights',
      'Scoreboard'
    ];
  }

  /**
   * Validate price range
   * @param {number} min - Minimum price
   * @param {number} max - Maximum price
   * @returns {Object} Validation result
   */
  static validatePriceRange(min, max) {
    const errors = [];
    
    if (min && min < 0) {
      errors.push('Minimum price cannot be negative');
    }
    
    if (max && max < 0) {
      errors.push('Maximum price cannot be negative');
    }
    
    if (min && max && parseInt(min) > parseInt(max)) {
      errors.push('Minimum price cannot be greater than maximum price');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

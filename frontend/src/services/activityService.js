import axiosInstance from '../lib/axios';

/**
 * Activity API service for handling user activity and statistics
 */
export class ActivityService {
  /**
   * Get user activity statistics
   * @returns {Promise<Object>} Activity data including bookings and venue stats
   */
  static async getUserActivity() {
    try {
      const response = await axiosInstance.get('/auth/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch activity data');
    }
  }

  /**
   * Format activity data for display
   * @param {Object} activityData - Raw activity data from API
   * @returns {Object} Formatted activity data
   */
  static formatActivityData(activityData) {
    if (!activityData) return null;

    const { summary, recentActivity, monthlyStats, venues } = activityData;

    return {
      summary: {
        venuesOwned: summary.venuesOwned || 0,
        venuesBookedIn: summary.venuesBookedIn || 0,
        totalBookingsReceived: summary.totalBookingsReceived || 0,
        totalBookingsMade: summary.totalBookingsMade || 0,
        uniqueCustomers: summary.uniqueCustomers || 0,
        totalRevenue: summary.totalRevenue || 0
      },
      recentBookings: {
        userBookings: (recentActivity?.userBookings || []).map(booking => ({
          id: booking._id,
          venueName: booking.venueId?.name,
          venueAddress: booking.venueId?.address,
          date: booking.date,
          timeRange: `${booking.startTime} - ${booking.endTime}`,
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt
        })),
        venueBookings: (recentActivity?.venueBookings || []).map(booking => ({
          id: booking._id,
          customerName: booking.userId?.fullName,
          customerEmail: booking.userId?.email,
          venueName: booking.venueId?.name,
          date: booking.date,
          timeRange: `${booking.startTime} - ${booking.endTime}`,
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt
        }))
      },
      monthlyTrends: (monthlyStats || []).map(stat => ({
        month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
        bookings: stat.count,
        revenue: stat.revenue
      })),
      venues: (venues || []).map(venue => ({
        id: venue._id,
        name: venue.name,
        address: venue.address,
        bookingsCount: venue.bookingsCount
      }))
    };
  }

  /**
   * Get formatted month name
   * @param {string} monthString - Month in YYYY-MM format
   * @returns {string} Formatted month name
   */
  static getMonthName(monthString) {
    if (!monthString) return '';
    
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  }

  /**
   * Calculate percentage change between two values
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {Object} Change percentage and direction
   */
  static calculatePercentageChange(current, previous) {
    if (previous === 0) {
      return { percentage: current > 0 ? 100 : 0, direction: 'up' };
    }
    
    const percentage = Math.round(((current - previous) / previous) * 100);
    return {
      percentage: Math.abs(percentage),
      direction: percentage >= 0 ? 'up' : 'down'
    };
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format date for display
   * @param {string} dateString - Date string to format
   * @returns {string} Formatted date string
   */
  static formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get relative time string
   * @param {string} dateString - Date string to process
   * @returns {string} Relative time string (e.g., "2 days ago")
   */
  static getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  }

  /**
   * Get status color for booking status
   * @param {string} status - Booking status
   * @returns {string} Tailwind color class
   */
  static getStatusColor(status) {
    const colorMap = {
      'confirmed': 'text-green-600 bg-green-100',
      'pending': 'text-yellow-600 bg-yellow-100',
      'cancelled': 'text-red-600 bg-red-100',
      'completed': 'text-blue-600 bg-blue-100'
    };
    
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  }
}

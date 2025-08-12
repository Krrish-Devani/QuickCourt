/**
 * Booking Store
 * Manages booking-related state and API calls using Zustand
 */

import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';

export const useBookingStore = create((set, get) => ({
  // State
  currentVenue: null,
  selectedDate: new Date(),
  selectedSport: null,
  timeSlots: [],
  selectedSlots: [],
  totalPrice: 0,
  hourlyRate: 0,
  isLoading: false,
  isBooking: false,
  userBookings: [],
  currentBookingPage: 1,
  totalBookingPages: 0,

  // Actions

  /**
   * Get venue availability for a specific date and sport
   */
  getVenueAvailability: async (venueId, date, sport = null) => {
    set({ isLoading: true });
    try {
      const dateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
      console.log('🔍 Fetching venue availability for:', venueId, dateString, sport ? `sport: ${sport}` : 'all sports');
      console.log('🗓️ Date conversion debug:', {
        originalDate: date,
        localeDateString: dateString,
        isoString: date.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      let url = `/bookings/venue/${venueId}/availability?date=${dateString}`;
      if (sport) {
        url += `&sport=${encodeURIComponent(sport)}`;
      }
      
      const response = await axiosInstance.get(url);
      
      const { venue, timeSlots } = response.data;
      
      // Calculate hourly rate from venue price range
      const rate = venue.priceRange ? 
        (venue.priceRange.min + venue.priceRange.max) / 2 : 
        venue.priceRange?.min || 500;

      console.log('✅ Venue availability loaded:', timeSlots?.length, 'slots');
      console.log('📊 Slot breakdown:', {
        total: timeSlots?.length,
        available: timeSlots?.filter(s => s.available).length,
        booked: timeSlots?.filter(s => !s.available).length,
        sport: sport || 'all sports'
      });

      set({
        currentVenue: venue,
        timeSlots,
        hourlyRate: rate,
        selectedSlots: [],
        totalPrice: 0,
        isLoading: false
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching venue availability:', error);
      toast.error(error.response?.data?.message || 'Failed to load venue availability');
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Select/deselect time slots
   */
  toggleTimeSlot: (slot) => {
    const { selectedSlots, hourlyRate } = get();
    
    const isSelected = selectedSlots.some(s => s.start === slot.start);
    
    let newSelectedSlots;
    if (isSelected) {
      // Remove slot
      newSelectedSlots = selectedSlots.filter(s => s.start !== slot.start);
    } else {
      // Add slot if available
      if (!slot.available) {
        toast.error('This time slot is not available');
        return;
      }
      
      // Sort slots to maintain order
      newSelectedSlots = [...selectedSlots, slot].sort((a, b) => 
        a.start.localeCompare(b.start)
      );
      
      // Check for consecutive slots only
      if (!areConsecutiveSlots(newSelectedSlots)) {
        toast.error('Please select consecutive time slots only');
        return;
      }
    }

    const totalPrice = newSelectedSlots.length * hourlyRate;

    set({
      selectedSlots: newSelectedSlots,
      totalPrice
    });
  },

  /**
   * Clear selected slots
   */
  clearSelection: () => {
    set({
      selectedSlots: [],
      totalPrice: 0
    });
  },

  /**
   * Create a new booking
   */
  createBooking: async (bookingData) => {
    set({ isBooking: true });
    try {
      const { selectedSlots, currentVenue, selectedDate, selectedSport } = get();
      
      if (selectedSlots.length === 0) {
        throw new Error('Please select at least one time slot');
      }

      if (!selectedSport) {
        throw new Error('Please select a sport');
      }

      if (!bookingData.contactPhone) {
        throw new Error('Contact phone is required');
      }

      // Calculate start and end times
      const startTime = selectedSlots[0].start;
      const endTime = selectedSlots[selectedSlots.length - 1].end;

      const booking = {
        venueId: currentVenue._id,
        sport: selectedSport,
        date: selectedDate.toLocaleDateString('en-CA'), // YYYY-MM-DD format in local timezone
        startTime,
        endTime,
        contactPhone: bookingData.contactPhone,
        notes: bookingData.notes || ''
      };

      console.log('📅 Creating booking:', booking);
      console.log('🗓️ Date details:', {
        selectedDate: selectedDate,
        formattedDate: selectedDate.toLocaleDateString('en-CA'),
        isoDate: selectedDate.toISOString(),
        localDateString: selectedDate.toDateString()
      });
      console.log('🎯 Selected sport debug:', {
        selectedSport,
        venueId: currentVenue._id,
        venueSports: currentVenue.sports
      });

      const response = await axiosInstance.post('/bookings/create', booking);
      
      // Don't show success message yet - booking is pending payment
      console.log('📋 Booking created with pending payment status');
      
      // Don't clear selection yet - keep it for payment modal
      set({
        isBooking: false
      });

      // Don't refresh availability yet - booking is pending payment
      // Will refresh after successful payment completion
      console.log('⏳ Booking pending payment - availability will refresh after payment');

      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
      set({ isBooking: false });
      throw error;
    }
  },

  /**
   * Get user's bookings
   */
  getUserBookings: async (page = 1, status = '') => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (status) params.append('status', status);

      const response = await axiosInstance.get(`/bookings/my-bookings?${params}`);
      
      set({
        userBookings: response.data.bookings,
        currentBookingPage: response.data.currentPage,
        totalBookingPages: response.data.totalPages,
        isLoading: false
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      toast.error(error.response?.data?.message || 'Failed to load bookings');
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Cancel a booking
   */
  cancelBooking: async (bookingId) => {
    try {
      const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`);
      
      toast.success('Booking cancelled successfully');
      
      // Refresh user bookings
      await get().getUserBookings(get().currentBookingPage);

      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
      throw error;
    }
  },

  /**
   * Set selected date
   */
  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },

  /**
   * Set selected sport
   */
  setSelectedSport: (sport) => {
    const { currentVenue, selectedDate } = get();
    set({ 
      selectedSport: sport,
      selectedSlots: [],
      totalPrice: 0
    });
    
    // Refresh availability for the selected sport
    if (currentVenue && selectedDate) {
      get().getVenueAvailability(currentVenue._id, selectedDate, sport);
    }
  },

  /**
   * Update time slots (for real-time updates)
   */
  updateTimeSlots: (newTimeSlots) => {
    console.log('🔄 Updating time slots with real-time data:', newTimeSlots?.length);
    set({ timeSlots: newTimeSlots });
    
    // Clear selected slots that are no longer available
    const { selectedSlots } = get();
    const updatedSelectedSlots = selectedSlots.filter(selectedSlot => 
      newTimeSlots.some(slot => 
        slot.start === selectedSlot.start && slot.available
      )
    );
    
    if (updatedSelectedSlots.length !== selectedSlots.length) {
      const { hourlyRate } = get();
      set({
        selectedSlots: updatedSelectedSlots,
        totalPrice: updatedSelectedSlots.length * hourlyRate
      });
      
      if (updatedSelectedSlots.length < selectedSlots.length) {
        toast.info('Some selected slots are no longer available', {
          icon: '⚠️'
        });
      }
    }
  },

  /**
   * Reset booking state
   */
  resetBookingState: () => {
    set({
      currentVenue: null,
      selectedDate: new Date(),
      selectedSport: null,
      timeSlots: [],
      selectedSlots: [],
      totalPrice: 0,
      hourlyRate: 0
    });
  }
}));

/**
 * Helper function to check if slots are consecutive
 */
function areConsecutiveSlots(slots) {
  if (slots.length <= 1) return true;
  
  for (let i = 1; i < slots.length; i++) {
    const prevEndTime = slots[i - 1].end;
    const currentStartTime = slots[i].start;
    
    if (prevEndTime !== currentStartTime) {
      return false;
    }
  }
  
  return true;
}

/**
 * Helper function to format time for display
 */
export const formatTime = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Helper function to format date
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

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
   * Get venue availability for a specific date
   */
  getVenueAvailability: async (venueId, date) => {
    set({ isLoading: true });
    try {
      const dateString = date.toISOString().split('T')[0];
      console.log('🔍 Fetching venue availability for:', venueId, dateString);
      
      const response = await axiosInstance.get(
        `/bookings/venue/${venueId}/availability?date=${dateString}`
      );
      
      const { venue, timeSlots } = response.data;
      
      // Calculate hourly rate from venue price range
      const rate = venue.priceRange ? 
        (venue.priceRange.min + venue.priceRange.max) / 2 : 
        venue.priceRange?.min || 500;

      console.log('✅ Venue availability loaded:', timeSlots?.length, 'slots');
      console.log('📊 Slot breakdown:', {
        total: timeSlots?.length,
        available: timeSlots?.filter(s => s.available).length,
        booked: timeSlots?.filter(s => !s.available).length
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
      const { selectedSlots, currentVenue, selectedDate } = get();
      
      if (selectedSlots.length === 0) {
        throw new Error('Please select at least one time slot');
      }

      if (!bookingData.contactPhone) {
        throw new Error('Contact phone is required');
      }

      // Calculate start and end times
      const startTime = selectedSlots[0].start;
      const endTime = selectedSlots[selectedSlots.length - 1].end;

      const booking = {
        venueId: currentVenue._id,
        date: selectedDate.toISOString().split('T')[0],
        startTime,
        endTime,
        contactPhone: bookingData.contactPhone,
        notes: bookingData.notes || ''
      };

      console.log('📅 Creating booking:', booking);

      const response = await axiosInstance.post('/bookings/create', booking);
      
      toast.success('Booking created successfully!');
      
      // Clear selection after successful booking
      set({
        selectedSlots: [],
        totalPrice: 0,
        isBooking: false
      });

      // Refresh availability immediately to show the new booking
      console.log('🔄 Refreshing availability after booking creation...');
      await get().getVenueAvailability(currentVenue._id, selectedDate);

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

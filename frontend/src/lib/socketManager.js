/**
 * Socket Manager
 * Handles Socket.IO client connection and real-time events
 */

import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';
import toast from 'react-hot-toast';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentVenueId = null;
  }

  /**
   * Initialize socket connection
   */
  connect() {
    const { authUser } = useAuthStore.getState();
    
    if (!authUser || this.isConnected) {
      return;
    }

    // Get JWT token from localStorage or cookies
    const token = localStorage.getItem('jwt-quickcourt');
    
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    // Connect to Socket.IO server
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      upgrade: true
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Booking-related events
    this.setupBookingListeners();

    return this.socket;
  }

  /**
   * Setup booking-related event listeners
   */
  setupBookingListeners() {
    if (!this.socket) return;

    // When a booking is confirmed by any user
    this.socket.on('booking_confirmed', (data) => {
      console.log('📅 Booking confirmed event received:', data);
      
      // Update availability if viewing the same venue
      if (data.venueId === this.currentVenueId) {
        // Force refresh to get the most current data with the booking date
        const bookingDate = data.booking?.date ? new Date(data.booking.date) : new Date();
        setTimeout(() => {
          this.refreshVenueAvailability(data.venueId, bookingDate);
        }, 300); // Small delay to ensure backend is updated
        
        // Show notification
        const userName = data.booking?.userId?.fullName || 'Someone';
        toast.success(`${userName} just booked a slot at this venue!`, {
          duration: 4000,
          icon: '📅'
        });
      }
    });

    // When a booking is cancelled
    this.socket.on('booking_cancelled', (data) => {
      console.log('❌ Booking cancelled event received:', data);
      
      if (data.venueId === this.currentVenueId) {
        const bookingDate = data.booking?.date ? new Date(data.booking.date) : new Date();
        this.refreshVenueAvailability(data.venueId, bookingDate);
        
        toast.info('A slot just became available!', {
          duration: 3000,
          icon: '🎉'
        });
      }
    });

    // When slot availability is updated
    this.socket.on('slot_availability_updated', (data) => {
      console.log('🔄 Slot availability updated event received:', data);
      
      if (data.venueId === this.currentVenueId) {
        // Refresh the entire venue availability to get the most up-to-date data
        const eventDate = data.date ? new Date(data.date) : new Date();
        this.refreshVenueAvailability(data.venueId, eventDate);
      }
    });

    // When someone is selecting slots (real-time UI updates)
    this.socket.on('slot_being_selected', (data) => {
      if (data.venueId === this.currentVenueId) {
        console.log(`👆 ${data.user.name} is selecting slots:`, data.timeSlots);
        
        // Show temporary notification
        toast(`${data.user.name} is selecting time slots...`, {
          duration: 2000,
          icon: '👆',
          style: {
            background: '#f3f4f6',
            color: '#374151'
          }
        });
      }
    });

    // When someone deselects slots
    this.socket.on('slot_being_deselected', (data) => {
      if (data.venueId === this.currentVenueId) {
        console.log(`👋 ${data.user.name} deselected slots`);
      }
    });

    // When someone is in the booking process
    this.socket.on('booking_in_progress', (data) => {
      if (data.venueId === this.currentVenueId) {
        console.log('⏳ Booking in progress:', data);
        
        toast.loading(data.message, {
          duration: 3000,
          icon: '⏳'
        });
      }
    });

    // User notifications
    this.socket.on('user_notification', (notification) => {
      console.log('🔔 User notification:', notification);
      
      toast(notification.message, {
        duration: 5000,
        icon: notification.icon || '🔔',
        style: {
          background: notification.type === 'error' ? '#fee2e2' : '#f0f9ff',
          color: notification.type === 'error' ? '#dc2626' : '#1e40af'
        }
      });
    });

    // System announcements
    this.socket.on('system_announcement', (announcement) => {
      console.log('📢 System announcement:', announcement);
      
      toast(announcement.message, {
        duration: 8000,
        icon: '📢',
        style: {
          background: '#fef3c7',
          color: '#92400e',
          fontWeight: 'bold'
        }
      });
    });

    // Connection test
    this.socket.on('pong', () => {
      console.log('🏓 Pong received');
    });
  }

  /**
   * Join a venue room to receive real-time updates
   */
  joinVenue(venueId) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot join venue');
      return;
    }

    // Leave previous venue if any
    if (this.currentVenueId) {
      this.leaveVenue(this.currentVenueId);
    }

    this.currentVenueId = venueId;
    this.socket.emit('join_venue', venueId);
    console.log(`👥 Joined venue room: ${venueId}`);
  }

  /**
   * Leave venue room
   */
  leaveVenue(venueId = null) {
    if (!this.socket) return;

    const venueToLeave = venueId || this.currentVenueId;
    if (venueToLeave) {
      this.socket.emit('leave_venue', venueToLeave);
      console.log(`👋 Left venue room: ${venueToLeave}`);
      
      if (venueToLeave === this.currentVenueId) {
        this.currentVenueId = null;
      }
    }
  }

  /**
   * Emit slot selection events
   */
  emitSlotSelection(venueId, date, timeSlots, sport = null) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('slot_selecting', {
      venueId,
      date: date.toISOString().split('T')[0],
      timeSlots,
      sport
    });
  }

  /**
   * Emit slot deselection events
   */
  emitSlotDeselection(venueId, date, timeSlots, sport = null) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('slot_deselecting', {
      venueId,
      date: date.toISOString().split('T')[0],
      timeSlots,
      sport
    });
  }

  /**
   * Emit booking initiated event
   */
  emitBookingInitiated(venueId, date, timeSlots, sport = null) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('booking_initiated', {
      venueId,
      date: date.toISOString().split('T')[0],
      timeSlots,
      sport
    });
  }

  /**
   * Emit user typing event
   */
  emitUserTyping(venueId) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('user_typing', { venueId });
  }

  /**
   * Test connection
   */
  ping() {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('ping');
    console.log('🏓 Ping sent');
  }

  /**
   * Refresh venue availability
   */
  async refreshVenueAvailability(venueId = null, date = null) {
    const targetVenueId = venueId || this.currentVenueId;
    if (!targetVenueId) return;

    try {
      const { getVenueAvailability, selectedDate, selectedSport } = useBookingStore.getState();
      const targetDate = date || selectedDate;
      
      if (targetDate) {
        console.log('🔄 Refreshing venue availability for:', targetVenueId, targetDate.toISOString().split('T')[0], selectedSport ? `sport: ${selectedSport}` : 'all sports');
        await getVenueAvailability(targetVenueId, targetDate, selectedSport);
      }
    } catch (error) {
      console.error('Error refreshing venue availability:', error);
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      // Leave current venue room
      this.leaveVenue();
      
      // Disconnect socket
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentVenueId = null;
      
      console.log('🔌 Socket disconnected');
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      currentVenueId: this.currentVenueId,
      socketId: this.socket?.id
    };
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager;

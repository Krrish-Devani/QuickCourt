/**
 * Socket.IO Server Configuration
 * Handles real-time communication for venue booking updates
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/user.model.js';

let io;

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 */
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5174",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to socket
      socket.userId = user._id.toString();
      socket.userEmail = user.email;
      socket.userFullName = user.fullName;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userFullName} (${socket.userEmail})`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    /**
     * Join venue room for real-time updates
     * Users viewing a specific venue will join that venue's room
     */
    socket.on('join_venue', (venueId) => {
      socket.join(`venue_${venueId}`);
      console.log(`👥 User ${socket.userFullName} joined venue room: ${venueId}`);
    });

    /**
     * Leave venue room
     */
    socket.on('leave_venue', (venueId) => {
      socket.leave(`venue_${venueId}`);
      console.log(`👋 User ${socket.userFullName} left venue room: ${venueId}`);
    });

    /**
     * Handle time slot selection (for UI updates)
     * When a user is selecting time slots, show to others in real-time
     */
    socket.on('slot_selecting', (data) => {
      const { venueId, date, timeSlots } = data;
      
      // Broadcast to all users in the venue room except the sender
      socket.to(`venue_${venueId}`).emit('slot_being_selected', {
        venueId,
        date,
        timeSlots,
        user: {
          id: socket.userId,
          name: socket.userFullName,
          email: socket.userEmail
        }
      });
    });

    /**
     * Handle time slot deselection
     */
    socket.on('slot_deselecting', (data) => {
      const { venueId, date, timeSlots } = data;
      
      socket.to(`venue_${venueId}`).emit('slot_being_deselected', {
        venueId,
        date,
        timeSlots,
        user: {
          id: socket.userId,
          name: socket.userFullName
        }
      });
    });

    /**
     * Handle user typing in booking form
     */
    socket.on('user_typing', (data) => {
      const { venueId } = data;
      
      socket.to(`venue_${venueId}`).emit('user_typing_notification', {
        user: {
          id: socket.userId,
          name: socket.userFullName
        },
        venueId
      });
    });

    /**
     * Handle booking initiated event
     * When a user starts the booking process
     */
    socket.on('booking_initiated', (data) => {
      const { venueId, date, timeSlots } = data;
      
      socket.to(`venue_${venueId}`).emit('booking_in_progress', {
        venueId,
        date,
        timeSlots,
        user: {
          id: socket.userId,
          name: socket.userFullName
        },
        message: `${socket.userFullName} is booking these slots...`
      });
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.userFullName} - Reason: ${reason}`);
    });

    /**
     * Handle ping for connection testing
     */
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Object} Socket.IO server instance
 */
export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Emit booking confirmation to all users in venue room
 * @param {string} venueId - Venue ID
 * @param {Object} bookingData - Booking details
 */
export const emitBookingConfirmed = (venueId, bookingData) => {
  if (io) {
    const eventData = {
      venueId,
      booking: {
        _id: bookingData._id,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        userId: bookingData.userId,
        venueId: bookingData.venueId
      },
      date: bookingData.date.toISOString().split('T')[0],
      message: 'New booking confirmed - time slots now unavailable'
    };
    
    io.to(`venue_${venueId}`).emit('booking_confirmed', eventData);
    
    console.log(`📅 Booking confirmed broadcast sent for venue: ${venueId}`, eventData);
  }
};

/**
 * Emit booking cancellation to all users in venue room
 * @param {string} venueId - Venue ID
 * @param {Object} bookingData - Cancelled booking details
 */
export const emitBookingCancelled = (venueId, bookingData) => {
  if (io) {
    io.to(`venue_${venueId}`).emit('booking_cancelled', {
      venueId,
      booking: bookingData,
      message: 'Booking cancelled - time slots now available'
    });
    
    console.log(`❌ Booking cancellation broadcast sent for venue: ${venueId}`);
  }
};

/**
 * Emit slot availability update
 * @param {string} venueId - Venue ID
 * @param {string} date - Date string
 * @param {Array} availableSlots - Array of available time slots
 */
export const emitSlotAvailabilityUpdate = (venueId, date, availableSlots) => {
  if (io) {
    // Ensure date is in YYYY-MM-DD format
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    
    const eventData = {
      venueId,
      date: dateString,
      availableSlots,
      timestamp: new Date().toISOString()
    };
    
    io.to(`venue_${venueId}`).emit('slot_availability_updated', eventData);
    
    console.log(`🔄 Slot availability update sent for venue: ${venueId} on ${dateString}`, {
      availableSlots: availableSlots.length,
      totalSlots: availableSlots.length
    });
  }
};

/**
 * Send notification to specific user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
export const emitUserNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('user_notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    
    console.log(`🔔 Notification sent to user: ${userId}`);
  }
};

/**
 * Broadcast system announcement to all connected users
 * @param {Object} announcement - Announcement data
 */
export const broadcastSystemAnnouncement = (announcement) => {
  if (io) {
    io.emit('system_announcement', {
      ...announcement,
      timestamp: new Date().toISOString()
    });
    
    console.log('📢 System announcement broadcasted to all users');
  }
};

export default {
  initializeSocket,
  getSocketIO,
  emitBookingConfirmed,
  emitBookingCancelled,
  emitSlotAvailabilityUpdate,
  emitUserNotification,
  broadcastSystemAnnouncement
};

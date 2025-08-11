/**
 * Booking Model for storing venue bookings
 * Handles all booking-related data including time slots and user information
 */

import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Reference to the venue being booked
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
    index: true // Index for faster queries
  },
  
  // Reference to the user making the booking
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Selected sport for this booking
  sport: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Sport is required for booking'
    }
  },
  
  // Date of the booking (stored as date only, no time)
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  // Start time of the booking (24-hour format, e.g., "09:00")
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format (24-hour)'
    }
  },
  
  // End time of the booking (24-hour format, e.g., "10:00")
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format (24-hour)'
    }
  },
  
  // Total duration in hours
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 12 // Maximum 12 hours per booking
  },
  
  // Total price for the booking
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  
  // Payment status
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Additional notes from the user
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Contact information for the booking
  contactPhone: {
    type: String,
    required: true
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Compound index for efficient queries by venue, date, sport, and time
bookingSchema.index({ venueId: 1, date: 1, sport: 1, startTime: 1 });
bookingSchema.index({ venueId: 1, date: 1, sport: 1, endTime: 1 });

// Compound index for user's bookings
bookingSchema.index({ userId: 1, date: 1 });

// Static method to check if a time slot is available for a specific sport
bookingSchema.statics.isSlotAvailable = async function(venueId, date, sport, startTime, endTime) {
  const filter = {
    venueId,
    date: new Date(date),
    status: { $ne: 'cancelled' },
    $or: [
      // New booking starts during existing booking
      { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
      // New booking ends during existing booking
      { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      // New booking encompasses existing booking
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ]
  };
  
  // Add case-insensitive sport filter if provided
  if (sport) {
    filter.sport = { $regex: new RegExp(`^${sport}$`, 'i') };
  }
  
  const conflictingBooking = await this.findOne(filter);
  
  return !conflictingBooking;
};

// Static method to get all bookings for a venue on a specific date for a specific sport
bookingSchema.statics.getVenueBookingsForDate = async function(venueId, date, sport = null) {
  const filter = {
    venueId,
    date: new Date(date),
    status: { $ne: 'cancelled' }
  };
  
  if (sport) {
    // Case-insensitive sport matching
    filter.sport = { $regex: new RegExp(`^${sport}$`, 'i') };
  }
  
  return await this.find(filter)
    .populate('userId', 'fullName email')
    .sort({ startTime: 1 });
};

// Instance method to calculate duration
bookingSchema.methods.calculateDuration = function() {
  const start = new Date(`2000-01-01 ${this.startTime}`);
  const end = new Date(`2000-01-01 ${this.endTime}`);
  return (end - start) / (1000 * 60 * 60); // Convert to hours
};

// Virtual for booking time range display
bookingSchema.virtual('timeRange').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

export default mongoose.model('Booking', bookingSchema);
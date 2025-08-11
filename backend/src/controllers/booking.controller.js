/**
 * Booking Controller
 * Handles all booking-related operations including availability checks and booking creation
 */

import Booking from '../models/booking.model.js';
import Venue from '../models/venue.model.js';
import User from '../models/user.model.js';
import { emitBookingConfirmed, emitSlotAvailabilityUpdate } from '../socket.js';

/**
 * Get venue details with availability for a specific date and sport
 * GET /api/bookings/venue/:venueId/availability
 */
export const getVenueAvailability = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { date, sport } = req.query;

    // Validate venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // If sport is specified, validate it's available at this venue (case-insensitive)
    if (sport && !venue.sports.some(s => s.toLowerCase().trim() === sport.toLowerCase().trim())) {
      return res.status(400).json({ 
        message: `Sport '${sport}' is not available at this venue`,
        availableSports: venue.sports 
      });
    }

    // Generate time slots (9 AM to 10 PM in 1-hour intervals)
    const timeSlots = generateTimeSlots();
    
    // Get existing bookings for the date (filter by sport if specified)
    const bookings = await Booking.getVenueBookingsForDate(venueId, date, sport);
    
    // Mark booked slots as unavailable
    const slotsWithAvailability = timeSlots.map(slot => {
      const isBooked = bookings.some(booking => 
        isTimeSlotOverlapping(slot.start, slot.end, booking.startTime, booking.endTime)
      );
      
      return {
        ...slot,
        available: !isBooked,
        bookedBy: isBooked ? bookings.find(b => 
          isTimeSlotOverlapping(slot.start, slot.end, b.startTime, b.endTime)
        )?.userId : null,
        sport: sport || null // Include sport in response
      };
    });

    res.json({
      venue,
      date,
      sport: sport || null,
      availableSports: venue.sports,
      timeSlots: slotsWithAvailability,
      totalSlots: timeSlots.length,
      availableSlots: slotsWithAvailability.filter(slot => slot.available).length,
      bookedSlots: slotsWithAvailability.filter(slot => !slot.available).length
    });

  } catch (error) {
    console.error('Error getting venue availability:', error);
    res.status(500).json({ 
      message: 'Error fetching venue availability',
      error: error.message 
    });
  }
};

/**
 * Create a new booking
 * POST /api/bookings/create
 */
export const createBooking = async (req, res) => {
  try {
    const { venueId, sport, date, startTime, endTime, contactPhone, notes } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!venueId || !sport || !date || !startTime || !endTime || !contactPhone) {
      return res.status(400).json({ 
        message: 'Missing required fields: venueId, sport, date, startTime, endTime, contactPhone' 
      });
    }

    // Validate venue exists
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // Validate sport is available at this venue (case-insensitive)
    console.log('🔍 Sport validation:', {
      requestedSport: sport,
      requestedSportType: typeof sport,
      requestedSportLength: sport?.length,
      venueSports: venue.sports,
      venueSportsTypes: venue.sports.map(s => typeof s),
      includes: venue.sports.includes(sport),
      // Check case-insensitive match
      caseInsensitiveMatch: venue.sports.some(s => s.toLowerCase() === sport.toLowerCase()),
      // Check trimmed match
      trimmedMatch: venue.sports.some(s => s.trim() === sport.trim())
    });
    
    // Check for exact match first, then case-insensitive match
    const sportExists = venue.sports.includes(sport) || 
                       venue.sports.some(s => s.toLowerCase().trim() === sport.toLowerCase().trim());
    
    if (!sportExists) {
      return res.status(400).json({ 
        message: `Sport '${sport}' is not available at this venue`,
        availableSports: venue.sports,
        debug: {
          requestedSport: sport,
          exactMatch: venue.sports.includes(sport),
          caseInsensitiveMatches: venue.sports.filter(s => s.toLowerCase() === sport.toLowerCase())
        }
      });
    }

    // Validate time format and logic
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
      return res.status(400).json({ 
        message: 'Invalid time format. Use HH:MM format (24-hour)' 
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ 
        message: 'End time must be after start time' 
      });
    }

    // Calculate duration and price
    const duration = calculateDuration(startTime, endTime);
    if (duration > 12) {
      return res.status(400).json({ 
        message: 'Maximum booking duration is 12 hours' 
      });
    }

    // Use average price if venue has price range
    const hourlyRate = venue.priceRange ? 
      (venue.priceRange.min + venue.priceRange.max) / 2 : 
      venue.priceRange?.min || 500; // Default rate

    const totalPrice = hourlyRate * duration;

    // Check slot availability for the specific sport
    const isAvailable = await Booking.isSlotAvailable(venueId, date, sport, startTime, endTime);
    if (!isAvailable) {
      return res.status(409).json({ 
        message: `Selected time slot is not available for ${sport}` 
      });
    }

    // Validate booking date (cannot book in the past)
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({ 
        message: 'Cannot book for past dates' 
      });
    }

    // Create booking
    const booking = new Booking({
      venueId,
      userId,
      sport,
      date: bookingDate,
      startTime,
      endTime,
      duration,
      totalPrice,
      contactPhone,
      notes: notes || '',
      status: 'confirmed',
      paymentStatus: 'pending'
    });

    await booking.save();

    // Populate booking with user and venue details
    await booking.populate([
      { path: 'userId', select: 'fullName email' },
      { path: 'venueId', select: 'name address' }
    ]);

    // Emit real-time update to all users viewing this venue
    console.log('📡 Emitting booking confirmation to venue room:', venueId);
    console.log('📡 Booking data being sent:', {
      venueId,
      sport,
      booking: {
        _id: booking._id,
        date: booking.date,
        sport: booking.sport,
        startTime: booking.startTime,
        endTime: booking.endTime,
        userId: booking.userId
      }
    });
    emitBookingConfirmed(venueId, booking);

    // Get updated availability for the date and sport and emit update
    const updatedSlots = await getAvailableSlotsForDate(venueId, date, sport);
    console.log('📡 Emitting slot availability update:', updatedSlots.length, 'available slots for date:', date, 'sport:', sport);
    emitSlotAvailabilityUpdate(venueId, date, updatedSlots, sport);

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      totalPrice,
      duration,
      sport
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      message: 'Error creating booking',
      error: error.message 
    });
  }
};

/**
 * Get user's bookings
 * GET /api/bookings/my-bookings
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('venueId', 'name address photo priceRange')
      .sort({ date: -1, startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });

  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({ 
      message: 'Error fetching bookings',
      error: error.message 
    });
  }
};

/**
 * Cancel a booking
 * PUT /api/bookings/:bookingId/cancel
 */
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ 
      _id: bookingId, 
      userId 
    }).populate('venueId', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Check if booking can be cancelled (e.g., at least 1 hour before start time)
    const bookingDateTime = new Date(`${booking.date.toISOString().split('T')[0]} ${booking.startTime}`);
    const now = new Date();
    const timeDiff = bookingDateTime - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 1) {
      return res.status(400).json({ 
        message: 'Booking can only be cancelled at least 1 hour before start time' 
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Emit real-time update
    emitBookingConfirmed(booking.venueId._id, booking);

    // Get updated availability
    const updatedSlots = await getAvailableSlotsForDate(booking.venueId._id, booking.date);
    emitSlotAvailabilityUpdate(booking.venueId._id, booking.date, updatedSlots);

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ 
      message: 'Error cancelling booking',
      error: error.message 
    });
  }
};

/**
 * Get venue bookings (for venue owners)
 * GET /api/bookings/venue/:venueId/bookings
 */
export const getVenueBookings = async (req, res) => {
  try {
    const { venueId } = req.params;
    const { date, status, page = 1, limit = 10 } = req.query;

    // Verify venue exists and user has access
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const query = { venueId };
    
    if (date) {
      query.date = new Date(date);
    }
    
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'fullName email')
      .sort({ date: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalBookings: total,
      venue: {
        id: venue._id,
        name: venue.name,
        address: venue.address
      }
    });

  } catch (error) {
    console.error('Error getting venue bookings:', error);
    res.status(500).json({ 
      message: 'Error fetching venue bookings',
      error: error.message 
    });
  }
};

// Helper Functions

/**
 * Generate time slots from 9 AM to 10 PM
 */
function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour < 22; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    
    slots.push({
      start: startTime,
      end: endTime,
      label: `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`
    });
  }
  return slots;
}

/**
 * Convert 24-hour format to 12-hour format
 */
function formatTime12Hour(time24) {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Check if two time slots overlap
 */
function isTimeSlotOverlapping(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2;
}

/**
 * Validate time format (HH:MM)
 */
function isValidTimeFormat(time) {
  return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

/**
 * Calculate duration between two times in hours
 */
function calculateDuration(startTime, endTime) {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  return (end - start) / (1000 * 60 * 60);
}

/**
 * Get available slots for a specific date and sport
 */
async function getAvailableSlotsForDate(venueId, date, sport = null) {
  const timeSlots = generateTimeSlots();
  const bookings = await Booking.getVenueBookingsForDate(venueId, date, sport);
  
  return timeSlots.filter(slot => {
    return !bookings.some(booking => 
      isTimeSlotOverlapping(slot.start, slot.end, booking.startTime, booking.endTime)
    );
  });
}

/**
 * Booking Routes
 * Handles all booking-related API endpoints
 */

import express from 'express';
import {
  getVenueAvailability,
  createBooking,
  getUserBookings,
  cancelBooking,
  getVenueBookings
} from '../controllers/booking.controller.js';
import { checkAuthMiddleware } from '../middleware/checkAuthMiddleware.js';
import { validateBooking } from '../middleware/Validate.js';

const router = express.Router();

/**
 * Public Routes
 */

// Get venue availability for a specific date
// GET /api/bookings/venue/:venueId/availability?date=2025-08-11
router.get('/venue/:venueId/availability', getVenueAvailability);

/**
 * Protected Routes (Authentication Required)
 */

// Create a new booking
// POST /api/bookings/create
router.post('/create', checkAuthMiddleware, validateBooking, createBooking);

// Get current user's bookings
// GET /api/bookings/my-bookings?page=1&limit=10&status=confirmed
router.get('/my-bookings', checkAuthMiddleware, getUserBookings);

// Cancel a booking
// PUT /api/bookings/:bookingId/cancel
router.put('/:bookingId/cancel', checkAuthMiddleware, cancelBooking);

// Get bookings for a specific venue (for venue owners/admins)
// GET /api/bookings/venue/:venueId/bookings?date=2025-08-11&status=confirmed
router.get('/venue/:venueId/bookings', checkAuthMiddleware, getVenueBookings);

export default router;

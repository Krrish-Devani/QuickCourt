import Payment from '../models/payment.model.js';
import Booking from '../models/booking.model.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { wrapAsync } from '../lib/wrapAsync.js';
import ExpressError from '../lib/ExpressError.js';

// Initialize Razorpay instance only if credentials are available
let razorpayInstance = null;

const initializeRazorpay = () => {
  if (!razorpayInstance && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
  }
  return razorpayInstance;
};

/**
 * Get all payments
 * @route GET /api/payments
 * @access Private
 */
const getPayments = wrapAsync(async (req, res) => {
  const payments = await Payment.find();
  
  res.status(200).json({
    success: true,
    data: payments,
    message: 'Payments retrieved successfully'
  });
});

/**
 * Create Razorpay order
 * @route POST /api/payments/create-order
 * @access Private
 */
const createOrder = wrapAsync(async (req, res) => {
  const { amount, bookingId } = req.body;
  const userId = req.user._id;

  console.log('💳 Create order request:', { amount, bookingId, userId: userId.toString() });
  console.log('👤 Authenticated user:', {
    id: req.user._id.toString(),
    email: req.user.email,
    fullName: req.user.fullName
  });

  if (!amount || amount <= 0) {
    throw new ExpressError(400, 'Valid amount is required');
  }

  if (!bookingId) {
    throw new ExpressError(400, 'Booking ID is required');
  }

  // Verify booking exists and belongs to user
  const booking = await Booking.findOne({ 
    _id: bookingId, 
    userId, // Use userId instead of customerId
    paymentStatus: 'pending'
  });

  console.log('📋 Booking lookup result:', {
    found: !!booking,
    bookingId,
    userId: userId.toString(),
    booking: booking ? {
      id: booking._id.toString(),
      userId: booking.userId.toString(),
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice
    } : null
  });

  if (!booking) {
    throw new ExpressError(404, 'Booking not found or already paid');
  }

  // Verify amount matches booking total
  if (amount !== booking.totalPrice) {
    console.log('❌ Amount mismatch:', { provided: amount, expected: booking.totalPrice });
    throw new ExpressError(400, 'Amount does not match booking total');
  }

  const options = {
    amount: Number(amount * 100), // Convert to paisa
    currency: "INR",
    receipt: `bk_${bookingId.slice(-8)}_${Date.now().toString().slice(-6)}`, // Keep under 40 chars
    notes: {
      bookingId: bookingId,
      userId: userId.toString(),
      venueId: booking.venueId.toString()
    }
  };

  console.log('📦 Razorpay order options:', {
    amount: options.amount,
    currency: options.currency,
    receipt: options.receipt,
    receiptLength: options.receipt.length
  });

  // Initialize Razorpay
  console.log('🔧 Initializing Razorpay...');
  console.log('📝 Environment check:', {
    hasKeyId: !!process.env.RAZORPAY_KEY_ID,
    hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
    keyIdLength: process.env.RAZORPAY_KEY_ID?.length || 0
  });
  
  const razorpay = initializeRazorpay();
  if (!razorpay) {
    console.log('❌ Razorpay initialization failed - missing API keys');
    throw new ExpressError(500, 'Payment service is not configured');
  }
  
  console.log('✅ Razorpay initialized successfully');

  // Convert callback-based API to Promise
  const order = await new Promise((resolve, reject) => {
    razorpay.orders.create(options, (error, order) => {
      if (error) {
        console.error('Razorpay Order Creation Error:', error);
        reject(new ExpressError(500, 'Failed to create Razorpay order'));
      } else {
        resolve(order);
      }
    });
  });

  // Update booking with razorpay order ID
  booking.razorpay_order_id = order.id;
  await booking.save();

  res.status(200).json({
    success: true,
    data: order,
    message: 'Order created successfully'
  });
});

/**
 * Verify Razorpay payment
 * @route POST /api/payments/verify
 * @access Private
 */
const verifyPayment = wrapAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    throw new ExpressError(400, 'Missing required payment verification fields');
  }

  // Verify booking exists and belongs to user
  const booking = await Booking.findOne({ 
    _id: bookingId, 
    userId,
    paymentStatus: 'pending',
    razorpay_order_id: razorpay_order_id
  });

  if (!booking) {
    throw new ExpressError(404, 'Booking not found or payment already verified');
  }

  // Create signature for verification
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  
  // Get Razorpay key secret (either from initialized instance or env)
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new ExpressError(500, 'Payment verification failed - service not configured');
  }
  
  // Create expected signature
  const expectedSign = crypto
    .createHmac("sha256", keySecret)
    .update(sign.toString())
    .digest("hex");

  // Verify signature authenticity
  const isAuthentic = expectedSign === razorpay_signature;

  if (!isAuthentic) {
    throw new ExpressError(400, 'Invalid payment signature. Payment verification failed.');
  }

  // Check if payment already exists
  const existingPayment = await Payment.findOne({ razorpay_payment_id });
  if (existingPayment) {
    throw new ExpressError(409, 'Payment already verified');
  }

  // Save payment details
  const payment = new Payment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount: booking.totalPrice,
    bookingId: booking._id,
    userId: booking.userId,
    venueId: booking.venueId,
    status: 'completed'
  });

  await payment.save();

  // Update booking payment status
  booking.paymentStatus = 'completed';
  booking.paymentId = payment._id;
  await booking.save();

  // Populate booking with venue and user details for socket events
  await booking.populate([
    { path: 'userId', select: 'fullName email' },
    { path: 'venueId', select: 'name address sports' }
  ]);

  // Import socket functions dynamically to avoid circular imports
  const { emitBookingConfirmed, emitSlotAvailabilityUpdate } = await import('../socket.js');

  // Emit real-time update to all users viewing this venue
  console.log('📡 Emitting booking confirmation to venue room:', booking.venueId._id);
  emitBookingConfirmed(booking.venueId._id, booking);

  // Get updated availability for the date and sport and emit update
  const { getAvailableSlotsForDate } = await import('./booking.controller.js');
  const updatedSlots = await getAvailableSlotsForDate(
    booking.venueId._id, 
    booking.date, 
    booking.sport
  );
  emitSlotAvailabilityUpdate(booking.venueId._id, booking.date, updatedSlots, booking.sport);

  res.status(200).json({
    success: true,
    data: { payment, booking },
    message: 'Payment verified and booking confirmed successfully'
  });
});

export { getPayments, createOrder, verifyPayment };
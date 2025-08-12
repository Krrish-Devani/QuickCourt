import mongoose from 'mongoose';
const { Schema } = mongoose;

const PaymentSchema = new Schema({
  razorpay_order_id: {
    type: String,
    required: true,
  },

  razorpay_payment_id: {
    type: String,
    required: true,
  },

  razorpay_signature: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  
  date: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("payment", PaymentSchema);

export default Payment;

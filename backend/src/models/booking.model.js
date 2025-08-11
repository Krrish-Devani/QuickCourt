import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    courtId: { type: mongoose.Schema.Types.ObjectId, ref: 'Court', required: true },
    date: { type: Date, required: true },
    timeSlot: {
        start: String, // "14:00"
        end: String    // "15:00"
    },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
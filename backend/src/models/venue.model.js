import mongoose from "mongoose";

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
    },

    address: {
        type: String,
        required: true
    },

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    sports: {
        type: [String],
        required: true
    },

    photo: {
        type: String,
        default: null,
    },

    isApproved: {
        type: Boolean,
        default: false
    },

    priceRange: {
        min: {
            type: Number,
            required: true // Minimum price across all courts
        },
        max: {
            type: Number,
            required: true // Maximum price across all courts
        }
    },
}, { timestamps: true });

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
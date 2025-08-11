import mongoose from "mongoose";

const courtSchema = new mongoose.Schema({
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Venue",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    pricePerHour: {
        type: Number,
        required: true
    },

    operatingHours: {
        start: String,
        end: String
    },

    sportType: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Court = mongoose.model("Court", courtSchema);

export default Court;

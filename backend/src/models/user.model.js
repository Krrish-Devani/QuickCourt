import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    profilePic: {
        type: String,
        default: null,
    },
    verificationToken: String, // for email verification
    verificationTokenExpiresAt: Date, // to make secure expire date is required
}, {timestamps: true}); // timestamps will add createdAt and updatedAt fields   

const User = mongoose.model('User', userSchema);

export default User;
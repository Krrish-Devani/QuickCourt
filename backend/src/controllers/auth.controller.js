import User from '../models/user.model.js';
import Booking from '../models/booking.model.js';
import Venue from '../models/venue.model.js';
import bcrypt from 'bcryptjs';

import { wrapAsync } from '../lib/wrapAsync.js';
import { generateToken } from '../lib/generateToken.js';
import ExpressError from '../lib/ExpressError.js';
import { sendVerificationEmail } from '../mailer/emails.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = wrapAsync(async (req, res) => {
    const { fullName, email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
        throw new ExpressError(400, 'User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
        email,
        fullName,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })

    if (newUser) {
        generateToken(newUser._id, res);
        await newUser.save();
        await sendVerificationEmail(newUser.email, verificationToken);
        return res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            fullName: newUser.fullName,
            profilePic: newUser.profilePic,
            verificationToken: newUser.verificationToken
        });
    } else {
        throw new ExpressError(500, 'User creation failed');
    }
});

export const verifyEmail = wrapAsync(async (req, res) => {
    const { code } = req.body;
    
    const user = await User.findOne({
        verificationToken: code, 
        verificationTokenExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
        throw new ExpressError(400, "Invalid or expired verification code");
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Email verified successfully",
        user: {
            ...user._doc,
            password: undefined,
        }
    });
});

export const login = wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ExpressError(400, 'Invalid email or password');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        throw new ExpressError(400, 'Invalid Credentials');
    }
    
    generateToken(user._id, res);

    return res.status(200).json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
    })
});

export const logout = wrapAsync(async (req, res) => {
    res.clearCookie('jwt', '', {
        maxAge: 0,
    });

    return res.status(200).json({ message: 'Logout successful' });
});

export const updateProfile = wrapAsync(async (req, res) => {
    const { profilePic } = req.body;

    if (!profilePic) {
        throw new ExpressError(400, 'Profile picture is required');
    }

    const userId = req.user._id;

    try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            resource_type: 'auto',
            folder: 'quickcourt/profiles'
        });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true, runValidators: true }
        ).select('-password');

        return res.status(200).json(updatedUser);
    } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        throw new ExpressError(500, 'Failed to upload image. Please try again.');
    }
});

export const checkAuth = wrapAsync(async (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        profilePic: req.user.profilePic
    });
});

// Get user activity statistics
export const getUserActivity = wrapAsync(async (req, res) => {
    const userId = req.user._id;

    try {
        // Get venues owned by user
        const ownedVenues = await Venue.find({ ownerId: userId });
        const ownedVenueIds = ownedVenues.map(venue => venue._id);

        // Get bookings made by user (venues where user has booked)
        const userBookings = await Booking.find({ 
            userId: userId,
            status: { $ne: 'cancelled' }
        }).populate('venueId', 'name address');

        // Get bookings in user's venues (people who booked user's venues)
        const venueBookings = await Booking.find({
            venueId: { $in: ownedVenueIds },
            status: { $ne: 'cancelled' }
        }).populate('userId', 'fullName email').populate('venueId', 'name address');

        // Count unique venues where user has booked
        const uniqueVenuesBooked = new Set(userBookings.map(booking => booking.venueId._id.toString())).size;

        // Count total people who booked user's venues
        const uniqueCustomers = new Set(venueBookings.map(booking => booking.userId._id.toString())).size;

        // Recent bookings by user (last 5)
        const recentUserBookings = userBookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        // Recent bookings in user's venues (last 5)
        const recentVenueBookings = venueBookings
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        // Calculate total revenue from user's venues
        const totalRevenue = venueBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

        // Monthly booking trends for user's venues (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Booking.aggregate([
            {
                $match: {
                    venueId: { $in: ownedVenueIds },
                    status: { $ne: 'cancelled' },
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.status(200).json({
            summary: {
                venuesOwned: ownedVenues.length,
                venuesBookedIn: uniqueVenuesBooked,
                totalBookingsReceived: venueBookings.length,
                totalBookingsMade: userBookings.length,
                uniqueCustomers: uniqueCustomers,
                totalRevenue: totalRevenue
            },
            recentActivity: {
                userBookings: recentUserBookings,
                venueBookings: recentVenueBookings
            },
            monthlyStats: monthlyStats,
            venues: ownedVenues.map(venue => ({
                _id: venue._id,
                name: venue.name,
                address: venue.address,
                bookingsCount: venueBookings.filter(booking => 
                    booking.venueId._id.toString() === venue._id.toString()
                ).length
            }))
        });

    } catch (error) {
        console.error('Error fetching user activity:', error);
        throw new ExpressError(500, 'Failed to fetch activity data');
    }
});
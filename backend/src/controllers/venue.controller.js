import Venue from '../models/venue.model.js';
import { wrapAsync } from '../lib/wrapAsync.js';
import ExpressError from '../lib/ExpressError.js';

export const getVenues = wrapAsync(async (req, res) => {
    const { sport, search, page = 1, limit = 6 } = req.query;
    const filter = {}; // Removed isApproved filter
    
    if (sport) filter.sports = { $in: [sport] };
    if (search) filter.name = { $regex: search, $options: 'i' };
    
    const venues = await Venue.find(filter)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    
    const total = await Venue.countDocuments(filter);
    
    res.json({
        venues,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
    });
});

export const getVenueById = wrapAsync(async (req, res) => {
    const venue = await Venue.findById(req.params.id).populate('ownerId', 'fullName');
    if (!venue) throw new ExpressError(404, 'Venue not found');
    res.json(venue);
});

export const createVenue = wrapAsync(async (req, res) => {
    const venue = new Venue({ ...req.body, ownerId: req.user._id });
    await venue.save();
    res.status(201).json(venue);
});
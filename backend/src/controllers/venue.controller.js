import Venue from '../models/venue.model.js';
import { wrapAsync } from '../lib/wrapAsync.js';
import ExpressError from '../lib/ExpressError.js';
import cloudinary from '../lib/cloudinary.js';

export const getVenues = wrapAsync(async (req, res) => {
    const { 
        sport, 
        search, 
        page = 1, 
        limit = 6, 
        priceMin, 
        priceMax, 
        location, 
        amenities 
    } = req.query;
    
    // Build filter object
    const filter = {}; // Removed isApproved filter
    
    // Sport filter
    if (sport) {
        filter.sports = { $in: [sport] };
    }
    
    // Search filter - search in name, description, and address
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } }
        ];
    }
    
    // Location filter - search in address
    if (location) {
        filter.address = { $regex: location, $options: 'i' };
    }
    
    // Price range filter
    if (priceMin || priceMax) {
        filter.$and = filter.$and || [];
        
        if (priceMin) {
            filter.$and.push({
                $or: [
                    { 'priceRange.min': { $gte: parseInt(priceMin) } },
                    { 'priceRange.max': { $gte: parseInt(priceMin) } }
                ]
            });
        }
        
        if (priceMax) {
            filter.$and.push({
                $or: [
                    { 'priceRange.min': { $lte: parseInt(priceMax) } },
                    { 'priceRange.max': { $lte: parseInt(priceMax) } }
                ]
            });
        }
    }
    
    // Amenities filter (for future use when amenities field is added)
    if (amenities) {
        const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
        if (amenitiesArray.length > 0) {
            filter.amenities = { $in: amenitiesArray };
        }
    }
    
    console.log('Filter object:', JSON.stringify(filter, null, 2));
    
    const venues = await Venue.find(filter)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }); // Sort by newest first
    
    const total = await Venue.countDocuments(filter);
    
    res.json({
        venues,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        totalVenues: total
    });
});

export const getVenueById = wrapAsync(async (req, res) => {
    const venue = await Venue.findById(req.params.id).populate('ownerId', 'fullName');
    if (!venue) throw new ExpressError(404, 'Venue not found');
    res.json(venue);
});

export const createVenue = wrapAsync(async (req, res) => {
    const { photo, ...venueData } = req.body;
    
    let photoUrl = null;
    
    // Handle image upload if photo is provided
    if (photo) {
        try {
            const uploadResponse = await cloudinary.uploader.upload(photo, {
                folder: 'venues',
                resource_type: 'auto'
            });
            photoUrl = uploadResponse.secure_url;
        } catch (error) {
            console.log('Error uploading venue image:', error);
            throw new ExpressError(400, 'Failed to upload venue image');
        }
    }
    
    const venue = new Venue({ 
        ...venueData, 
        photo: photoUrl,
        ownerId: req.user._id 
    });
    
    await venue.save();
    res.status(201).json(venue);
});

export const updateVenue = wrapAsync(async (req, res) => {
    const { photo, ...venueData } = req.body;
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) throw new ExpressError(404, 'Venue not found');
    
    // Check if user owns the venue
    if (venue.ownerId.toString() !== req.user._id.toString()) {
        throw new ExpressError(403, 'You can only update your own venues');
    }
    
    let photoUrl = venue.photo; // Keep existing photo by default
    
    // Handle image upload if new photo is provided
    if (photo && photo !== venue.photo) {
        try {
            const uploadResponse = await cloudinary.uploader.upload(photo, {
                folder: 'venues',
                resource_type: 'auto'
            });
            photoUrl = uploadResponse.secure_url;
        } catch (error) {
            console.log('Error uploading venue image:', error);
            throw new ExpressError(400, 'Failed to upload venue image');
        }
    }
    
    const updatedVenue = await Venue.findByIdAndUpdate(
        req.params.id,
        { ...venueData, photo: photoUrl },
        { new: true, runValidators: true }
    );
    
    res.json(updatedVenue);
});
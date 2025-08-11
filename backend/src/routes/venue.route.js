import { Router } from "express";
import { getVenues, getVenueById, createVenue, updateVenue } from "../controllers/venue.controller.js";
import { checkAuthMiddleware } from "../middleware/checkAuthMiddleware.js";

const router = Router();

// Get all venues (public - no auth needed)
router.get("/", getVenues);

// Get single venue (public - no auth needed)  
router.get("/:id", getVenueById);

// Create venue (only for logged-in users)
router.post("/", checkAuthMiddleware, createVenue);

// Update venue (only for venue owner)
router.put("/:id", checkAuthMiddleware, updateVenue);

export default router;
import { Router } from "express";
import { getVenues, getVenueById, createVenue } from "../controllers/venue.controller.js";
import { checkAuthMiddleware } from "../middleware/checkAuthMiddleware.js";

const router = Router();

// Get all venues (public - no auth needed)
router.get("/", getVenues);

// Get single venue (public - no auth needed)  
router.get("/:id", getVenueById);

// Create venue (only for logged-in users)
router.post("/", checkAuthMiddleware, createVenue);

export default router;
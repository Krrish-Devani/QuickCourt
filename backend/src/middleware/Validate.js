import { joiUserSchema, joiLoginSchema, joiBookingSchema } from '../lib/joiSchema.js';
import ExpressError from '../lib/ExpressError.js';

export const userValidate = (req, res, next) => {
    const { error } = joiUserSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details.map((el) => el.message.replace(/"/g, '')).join(', '));
    } else {
        next();
    }
};

export const loginValidate = (req, res, next) => {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details.map((el) => el.message.replace(/"/g, '')).join(', '));
    } else {
        next();
    }
};

export const validateBooking = (req, res, next) => {
    console.log('🔍 Validating booking request:', req.body);
    const { error } = joiBookingSchema.validate(req.body);
    if (error) {
        console.log('❌ Booking validation failed:', error.details);
        throw new ExpressError(400, error.details.map((el) => el.message.replace(/"/g, '')).join(', '));
    } else {
        console.log('✅ Booking validation passed');
        next();
    }
};
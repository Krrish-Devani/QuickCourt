import joi from 'joi';

export const joiUserSchema = joi.object({
    email: joi.string().required(),
    fullName: joi.string().required(),
    password: joi.string().required().min(6),
    profilePic: joi.string().default("")
});

export const joiLoginSchema = joi.object({
    email: joi.string().required(),
    password: joi.string().required().min(6)
});

export const joiBookingSchema = joi.object({
    venueId: joi.string().required(),
    date: joi.date().required(),
    startTime: joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).required(),
    contactPhone: joi.string().required(),
    notes: joi.string().optional()
});
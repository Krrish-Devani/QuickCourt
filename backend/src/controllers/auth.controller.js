import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

import { wrapAsync } from '../lib/wrapAsync.js';
import { generateToken } from '../lib/generateToken.js';
import ExpressError from '../lib/ExpressError.js';
import { sendVerificationEmail } from '../mailer/emails.js';

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

export const checkAuth = wrapAsync(async (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        profilePic: req.user.profilePic
    });
});
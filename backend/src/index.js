import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import connectDB from './lib/mongoDB.js';

import authRoutes from './routes/auth.route.js';
import venueRoutes from './routes/venue.route.js';

dotenv.config();

const app = express(); 

const PORT = process.env.PORT || 5001;

// CORS configuration
app.use(cors({
    origin: "http://localhost:5173", // Vite default port
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);

app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).json({message});
})

app.listen(PORT, () => {
    console.log(`Server is running on the port http://localhost:${PORT}`);
    connectDB();
})
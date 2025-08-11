import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';

import connectDB from './lib/mongoDB.js';
import { initializeSocket } from './socket.js';

import authRoutes from './routes/auth.route.js';
import venueRoutes from './routes/venue.route.js';
import bookingRoutes from './routes/booking.route.js';

dotenv.config();

const app = express(); 
const server = createServer(app);

const PORT = process.env.PORT || 5001;

// Initialize Socket.IO
initializeSocket(server);

// CORS configuration
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"], // Support multiple Vite ports
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).json({message});
})

server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO server initialized`);
    connectDB();
})
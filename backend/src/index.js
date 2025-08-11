import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import connectDB from './lib/mongoDB.js';

import authRoutes from './routes/auth.route.js';

dotenv.config();

const app = express(); 

const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).json({message});
})

app.listen(PORT, () => {
    console.log(`Server is running on the port http://localhost:${PORT}`);
    connectDB();
})
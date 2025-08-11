import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    }
});

export const sender = {
    email: process.env.EMAIL_USER,
    name: "QuickCourt",
};

// Test connection
transporter.verify((error, success) => {
    if (error) {
        console.log('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});
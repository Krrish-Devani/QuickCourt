import { transporter, sender } from './mailer.config.js';

export const sendVerificationEmail = async (email, verificationToken) => {
    const mailOptions = {
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: 'Verify your QuickCourt account',
        html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h2>Welcome to QuickCourt!</h2>
                <p>Thank you for signing up. Please verify your email address using the code below:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #333; font-size: 32px; margin: 0;">${verificationToken}</h1>
                </div>
                <p>This verification code will expire in 24 hours.</p>
                <p>If you didn't create an account with QuickCourt, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};
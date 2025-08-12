/**
 * Payment Service
 * Handles all payment-related API calls
 */

import axiosInstance from '../lib/axios';

export const PaymentService = {
  // Create Razorpay order
  createOrder: async (amount, bookingId) => {
    const response = await axiosInstance.post('/payments/create-order', { 
      amount, 
      bookingId 
    });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments/verify', paymentData);
    return response.data;
  },

  // Get payment history
  getPayments: async () => {
    const response = await axiosInstance.get('/payments');
    return response.data;
  }
};

/**
 * Payment Store
 * Manages payment-related state and API calls using Zustand
 */

import { create } from 'zustand';
import { PaymentService } from '../services/paymentService';
import toast from 'react-hot-toast';

export const usePaymentStore = create((set, get) => ({
  // State
  isProcessing: false,
  currentOrder: null,
  paymentHistory: [],
  
  // Actions
  createOrder: async (amount, bookingId) => {
    set({ isProcessing: true });
    try {
      console.log('🏦 Creating payment order:', { amount, bookingId });
      const response = await PaymentService.createOrder(amount, bookingId);
      set({ currentOrder: response.data });
      console.log('✅ Payment order created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create order error:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
      throw error;
    } finally {
      set({ isProcessing: false });
    }
  },

  verifyPayment: async (paymentData) => {
    set({ isProcessing: true });
    try {
      console.log('🔍 Verifying payment:', paymentData);
      const response = await PaymentService.verifyPayment(paymentData);
      toast.success('Payment verified successfully!');
      console.log('✅ Payment verified:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      toast.error(error.response?.data?.message || 'Payment verification failed');
      throw error;
    } finally {
      set({ isProcessing: false });
    }
  },

  getPaymentHistory: async () => {
    try {
      const response = await PaymentService.getPayments();
      set({ paymentHistory: response.data });
      return response.data;
    } catch (error) {
      console.error('❌ Get payment history error:', error);
      toast.error('Failed to fetch payment history');
      throw error;
    }
  },

  // Reset state
  resetPaymentState: () => {
    set({
      isProcessing: false,
      currentOrder: null,
    });
  }
}));

/**
 * Payment Modal Component
 * Handles Razorpay payment integration for booking confirmations
 */

import React, { useState } from 'react';
import { usePaymentStore } from '../store/usePaymentStore';
import { useAuthStore } from '../store/useAuthStore';
import { checkRazorpayAvailability } from '../utils/testRazorpay';
import { X, CreditCard, Loader, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, booking, onPaymentSuccess }) => {
  const { createOrder, verifyPayment, isProcessing } = usePaymentStore();
  const { authUser } = useAuthStore();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const handlePayment = async () => {
    if (!booking || !authUser) return;

    setIsPaymentLoading(true);
    try {
      // Create Razorpay order
      console.log('💳 Initiating payment for booking:', booking._id);
      console.log('💰 Payment details:', {
        bookingId: booking._id,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus
      });
      
      const orderData = await createOrder(booking.totalPrice, booking._id);
      
      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add this to your .env file
        amount: orderData.amount,
        currency: orderData.currency,
        name: "QuickCourt",
        description: `Booking for ${booking.venueId?.name || 'Venue'}`,
        order_id: orderData.id,
        prefill: {
          name: authUser.fullName,
          email: authUser.email,
          contact: authUser.phone || "9999999999"
        },
        theme: {
          color: "#16a34a" // Green color matching your app
        },
        handler: async function (response) {
          try {
            console.log('✅ Payment completed, verifying...', response);
            
            // Verify payment
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id
            };

            const verifiedPayment = await verifyPayment(verificationData);
            console.log('🎉 Payment verified successfully:', verifiedPayment);
            
            onPaymentSuccess(response, verifiedPayment);
            onClose();
          } catch (error) {
            console.error('❌ Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            setIsPaymentLoading(false);
            toast.error('Payment cancelled');
          }
        }
      };

      // Check if Razorpay is loaded
      console.log('🔍 Checking Razorpay availability before payment...');
      const isRazorpayAvailable = checkRazorpayAvailability();
      
      if (!isRazorpayAvailable) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('💥 Payment initiation failed:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  // Debug booking object structure
  console.log('🔍 PaymentModal booking object:', booking);
  console.log('🏟️ Venue details:', booking.venueId);
  console.log('📅 Date value:', booking.date, typeof booking.date);

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // Helper function to safely get venue name
  const getVenueName = () => {
    if (booking.venueId?.name) return booking.venueId.name;
    if (booking.venue?.name) return booking.venue.name;
    if (typeof booking.venueId === 'string') return 'Venue';
    return 'Loading...';
  };

  // Helper function to safely get sport name
  const getSportName = () => {
    return booking.sport || 'Not specified';
  };

  // Helper function to safely get duration
  const getDuration = () => {
    return booking.duration || 0;
  };

  // Helper function to safely get total price
  const getTotalPrice = () => {
    return booking.totalPrice || 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Booking Details</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="font-medium">Venue:</span> 
                <span>{getVenueName()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span> 
                <span>{formatDate(booking.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span> 
                <span>{booking.startTime || 'N/A'} - {booking.endTime || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sport:</span> 
                <span className="capitalize">{getSportName()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Duration:</span> 
                <span>{getDuration()} hours</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-green-600 flex items-center">
                <IndianRupee className="w-5 h-5" />
                {getTotalPrice()}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Secure payment powered by Razorpay
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing || isPaymentLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing || isPaymentLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay ₹{getTotalPrice()}
              </>
            )}
          </button>

          <div className="text-xs text-gray-400 text-center">
            By proceeding, you agree to our terms and conditions
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

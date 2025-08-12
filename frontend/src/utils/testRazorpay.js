/**
 * Utility to test Razorpay SDK availability
 */

export const checkRazorpayAvailability = () => {
  console.log('🔍 Checking Razorpay availability...');
  
  if (typeof window === 'undefined') {
    console.log('❌ Window object not available (SSR)');
    return false;
  }
  
  if (typeof window.Razorpay === 'undefined') {
    console.log('❌ Razorpay SDK not loaded');
    console.log('💡 Make sure the Razorpay script is included in index.html');
    return false;
  }
  
  console.log('✅ Razorpay SDK is available');
  console.log('📦 Razorpay object:', window.Razorpay);
  
  return true;
};

export const getRazorpayVersion = () => {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return window.Razorpay.version || 'Version not available';
  }
  return 'Razorpay not loaded';
};

// Test function that can be called from browser console
window.testRazorpay = () => {
  console.log('🧪 Testing Razorpay Integration...');
  console.log('✅ Availability:', checkRazorpayAvailability());
  console.log('📈 Version:', getRazorpayVersion());
  
  if (window.Razorpay) {
    console.log('🎯 Available methods:', Object.getOwnPropertyNames(window.Razorpay.prototype || {}));
  }
};

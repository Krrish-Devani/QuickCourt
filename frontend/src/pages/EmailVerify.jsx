import React, { useState, useRef, useEffect } from 'react';
import sportPhoto from '../assets/sports-tools.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const EmailVerification = () => {
 const [otp, setOtp] = useState(['', '', '', '', '', '']);
 const [isSwapped, setIsSwapped] = useState(false);
 const [showLoader, setShowLoader] = useState(false);
 const inputRefs = useRef([]);
 const navigate = useNavigate();
 const { verifyEmail, isLoading, tempEmail } = useAuthStore();

 // Initialize refs
 useEffect(() => {
   inputRefs.current = inputRefs.current.slice(0, 6);
 }, []);

 // Handle OTP input
 const handleOtpChange = (index, value) => {
   if (value.length <= 1) {
     const newOtp = [...otp];
     newOtp[index] = value;
     setOtp(newOtp);

     // Auto-focus next input
     if (value && index < 5) {
       inputRefs.current[index + 1]?.focus();
     }
   }
 };

 // Handle backspace
 const handleKeyDown = (index, e) => {
   if (e.key === 'Backspace' && !otp[index] && index > 0) {
     inputRefs.current[index - 1]?.focus();
   }
 };

 // Handle verification
 const handleVerify = async (e) => {
   e.preventDefault();
   
   // Check if all OTP fields are filled
   const otpString = otp.join('');
   if (otpString.length !== 6) {
     toast.error('Please enter the complete 6-digit code');
     return;
   }

   setIsSwapped(true);

   // Show loader after animation starts
   setTimeout(() => {
     setShowLoader(true);
   }, 300);

   try {
     // Call the verification API
     await verifyEmail(otpString);
     
     // Redirect to homepage after animation completes
     setTimeout(() => {
       navigate('/');
     }, 1000);
     
   } catch (error) {
     // Reset animation state on error
     setIsSwapped(false);
     setShowLoader(false);
     console.error('Email verification error:', error);
   }
 };

 // Resend OTP
 const handleResendOtp = () => {
   setOtp(['', '', '', '', '', '']);
   inputRefs.current[0]?.focus();
   // Add resend logic here
 };

 return (
   <div className="h-full bg-white flex items-center justify-center px-2 py-2">
     
     {/* Main card */}
     <div
       className={`relative flex flex-col lg:flex-row w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200
         transition-transform duration-700`}
       style={{ height: 'calc(100vh - 120px)' }}
     >
       {/* Mobile background image */}
       <div
         className="lg:hidden absolute inset-0 bg-no-repeat bg-center bg-cover opacity-30"
         style={{
           backgroundImage: `url(${sportPhoto})`,
         }}
       />

       {/* Apply reversed flex-row when isSwapped is true */}
       <div
         className={`flex w-full h-full transition-all duration-700 ease-in-out 
           ${isSwapped ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
       >
         {/* Left side: Verification Form */}
         <div
           className={`relative z-10 w-full lg:w-3/5 flex flex-col items-center justify-center h-full
             transition-transform duration-700 ease-in-out
             ${isSwapped ? 'translate-x-full' : 'translate-x-0'}`}
         >
           <div className="w-full max-w-xs my-auto bg-white/90 lg:bg-white rounded-3xl lg:rounded-none p-6 sm:p-8">
             <div className="text-center mb-8">
               <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                 <span className="text-green-600">QUICK</span>
                 <span className="text-black">COURT</span>
               </h1>
               
               {/* Lock icon */}
               <div className="flex justify-center my-4">
                 <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                   <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                   </svg>
                 </div>
               </div>
               
               <p className="text-lg font-semibold text-gray-800 mb-2">
                 VERIFY YOUR EMAIL
               </p>
             </div>

             {/* Email message */}
             <div className="text-center mb-6">
               <p className="text-sm text-green-600 mb-4">
                 We've sent a code to your email: <strong>{tempEmail || 'your registered email'}</strong>
               </p>
             </div>

             <form className="space-y-6" onSubmit={handleVerify}>
               
               {/* OTP Input */}
               <div className="flex justify-center space-x-2 sm:space-x-3">
                 {otp.map((digit, index) => (
                   <input
                     key={index}
                     ref={(el) => (inputRefs.current[index] = el)}
                     type="text"
                     inputMode="numeric"
                     pattern="[0-9]*"
                     maxLength="1"
                     value={digit}
                     onChange={(e) => handleOtpChange(index, e.target.value)}
                     onKeyDown={(e) => handleKeyDown(index, e)}
                     className="w-10 h-10 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-semibold border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                     placeholder=""
                   />
                 ))}
               </div>

               <div>
                 <button
                   type="submit"
                   disabled={isLoading}
                   className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isLoading ? 'Verifying...' : 'Verify & Continue'}
                 </button>
               </div>
             </form>

             {/* Resend and Edit Email Links */}
             <div className="text-center mt-6 space-y-2">
               <p className="text-xs text-gray-600">
                 Didn't receive the code?{' '}
                 <button 
                   onClick={handleResendOtp}
                   className="text-blue-500 hover:underline cursor-pointer bg-transparent"
                 >
                   Resend OTP
                 </button>
               </p>
               <p className="text-xs text-gray-600">
                 Wrong email?{' '}
                 <Link to="/signup" className="text-blue-500 hover:underline">
                   Edit Email
                 </Link>
               </p>
             </div>
           </div>
         </div>

         {/* Right side: Image */}
         <div
           className={`hidden lg:block transition-transform duration-700 ease-in-out
              ${isSwapped ? '-translate-x-full' : 'translate-x-0'}`}
           style={{
             width: '750px',
             height: '100%',
             borderRadius: '0 1.5rem 1.5rem 0',
             overflow: 'hidden',
           }}
         >
           <img
             src={sportPhoto}
             alt="Sport"
             style={{
               width: '100%',
               height: '100%',
               objectFit: 'cover',
               borderRadius: '0 1.5rem 1.5rem 0',
               display: 'block',
             }}
           />
         </div>
       </div>

       {/* Loader Overlay */}
       {showLoader && (
         <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="text-center">
             <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
             <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Your Email</h3>
             <p className="text-gray-600">Please wait while we verify your account...</p>
           </div>
         </div>
       )}
     </div>
   </div>
 );
};

export default EmailVerification;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import sportPhoto from '../assets/sports-tools.jpg';

const SignUp = () => {
  const [isSwapped, setIsSwapped] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Validate full name
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (formData.fullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters long");
      return;
    }

    // Validate email
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!formData.password) {
      toast.error("Password is required");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      toast.error("Please confirm your password");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    // Trigger swap animation
    setIsSwapped(true);

    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
    //   toast.success('Account created successfully! Please verify your email.');
      navigate('/verify-email');
    } catch (error) {
      setIsSwapped(false); // Reset animation on error
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="h-full bg-white flex items-center justify-center overflow-hidden px-2 py-2">
      
      {/* Main card */}
      <div
        className={`relative flex flex-col lg:flex-row w-full max-w-4xl h-full max-h-[calc(100vh-100px)] bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200
          transition-transform duration-700`}
      >
        {/* Apply reversed flex-row when isSwapped is true */}
        <div
          className={`flex w-full h-full transition-all duration-700 ease-in-out 
            ${isSwapped ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
        >
          {/* Mobile background image */}
          <div
            className="lg:hidden absolute inset-0 bg-no-repeat bg-center bg-cover opacity-30"
            style={{
              backgroundImage: `url(${sportPhoto})`,
            }}
          />

          {/* Left side: Form */}
          <div
            className={`relative z-10 w-full lg:w-3/5 flex flex-col items-center justify-center h-full 
              transition-transform duration-700 ease-in-out
              ${isSwapped ? 'translate-x-full' : 'translate-x-0'}`}
          >
            <div className="w-full max-w-xs my-auto bg-white/90 lg:bg-white rounded-3xl lg:rounded-none p-6 sm:p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-green-600 tracking-tight">
                  QUICKCOURT
                </h1>
                <p className="text-base sm:text-lg font-medium text-gray-500 mt-1">
                  Create your account
                </p>
              </div>
              <form className="space-y-5" onSubmit={handleSignUp}>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Retype your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSigningUp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigningUp ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </div>
              </form>

              <div className="text-center mt-6">
                <p className="text-xs text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-green-600 hover:underline">
                    Log In
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
              maxHeight: 'calc(100vh - 100px)',
              borderRadius: '0 1.5rem 1.5rem 0',
              overflow: 'hidden',
            }}
          >
            <img
              src={sportPhoto}
              alt="Athlete getting ready for a match"
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
      </div>
    </div>
  );
};

export default SignUp;

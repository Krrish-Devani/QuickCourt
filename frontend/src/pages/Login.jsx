import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import sportPhoto from '../assets/sports-tools.jpg';

const Login = () => {
  const [showLoader, setShowLoader] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

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

    // Show loader
    setShowLoader(true);

    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      
    //   toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      setShowLoader(false); // Hide loader on error
      console.error('Login error:', error);
    }
  };

  return (
    <div className="h-full bg-white flex items-center justify-center px-2 py-2">
      
      {/* Main card */}
      <div className="relative flex flex-col lg:flex-row w-full max-w-4xl h-full max-h-[calc(100vh-100px)] bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        
        {/* Mobile background image */}
        <div
          className="lg:hidden absolute inset-0 bg-no-repeat bg-center bg-cover opacity-30"
          style={{
            backgroundImage: `url(${sportPhoto})`,
          }}
        />

        {/* Left side: Form content */}
        <div className="relative z-10 w-full lg:w-3/5 flex flex-col items-center justify-center h-full">
          <div className="w-full max-w-xs my-auto bg-white/90 lg:bg-white rounded-3xl lg:rounded-none p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                <span className="text-green-600">QUICK</span>
                <span className="text-black">COURT</span>
              </h1>
              <p className="text-base sm:text-lg font-medium text-gray-500 mt-1">
                Welcome back! Log in to continue.
              </p>
            </div>
            <form className="space-y-5" onSubmit={handleLogin}>
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
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                />
              </div>
              <div className="flex justify-end">
                <a href="#" className="text-xs text-green-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingIn ? 'Logging in...' : 'Log In'}
                </button>
              </div>
            </form>
            <div className="text-center mt-6">
              <p className="text-xs text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-green-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Image container with adjusted height to match main */}
        <div
          className="hidden lg:block"
          style={{
            width: '750px',
            height: '100%',
            borderRadius: '0 1.5rem 1.5rem 0',
            overflow: 'hidden',
            maxHeight: 'calc(100vh - 100px)',
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
              background: 'transparent',
            }}
          />
        </div>
      </div>

      {/* Loader Overlay */}
      {showLoader && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Signing You In</h3>
            <p className="text-gray-600">Please wait while we authenticate your account...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
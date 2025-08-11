import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Menu, X, User, LogOut, Plus } from 'lucide-react';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { authUser, logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo */}
          <Link to="/" className="text-2xl font-extrabold text-green-600 tracking-tight">
            QUICKCOURT
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition duration-200 hover:text-green-600 ${
                isActive('/') ? 'text-green-600' : 'text-gray-700'
              }`}
            >
              Home
            </Link>
            
            {authUser ? (
              <>
                <Link 
                  to="/profile" 
                  className={`font-medium transition duration-200 hover:text-green-600 ${
                    isActive('/profile') ? 'text-green-600' : 'text-gray-700'
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="font-medium text-gray-700 hover:text-green-600 transition duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition duration-200 hover:text-green-600 ${
                  isActive('/') ? 'text-green-600' : 'text-gray-700'
                }`}
              >
                Home
              </Link>
              
              {authUser ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMenuOpen(false)}
                    className={`font-medium transition duration-200 hover:text-green-600 ${
                      isActive('/profile') ? 'text-green-600' : 'text-gray-700'
                    }`}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 w-fit"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="font-medium text-gray-700 hover:text-green-600 transition duration-200"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200 w-fit"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Menu, X, LogOut, Home, Search, User, LogIn, UserPlus, Plus } from 'lucide-react';

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
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-extrabold text-green-600">
              QUICK<span className="text-gray-800">COURT</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 font-semibold transition-colors ${
                isActive('/') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/venues"
              className={`flex items-center space-x-1 font-semibold transition-colors ${
                isActive('/venues') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Browse Venues</span>
            </Link>

            {authUser && (
              <Link
                to="/add-venue"
                className={`flex items-center space-x-1 font-semibold transition-colors ${
                  isActive('/add-venue') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Venue</span>
              </Link>
            )}

            {authUser ? (
              <>
                <Link
                  to="/profile"
                  className={`flex items-center space-x-1 font-semibold transition-colors ${
                    isActive('/profile') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-gray-700 hover:text-green-600 font-semibold transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 font-semibold transition-colors ${
                  isActive('/') ? 'text-green-600' : 'text-gray-700'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              
              <Link
                to="/venues"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 font-semibold transition-colors ${
                  isActive('/venues') ? 'text-green-600' : 'text-gray-700'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Browse Venues</span>
              </Link>

              {authUser && (
                <Link
                  to="/add-venue"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 font-semibold transition-colors ${
                    isActive('/add-venue') ? 'text-green-600' : 'text-gray-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Venue</span>
                </Link>
              )}

              {authUser ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 font-semibold transition-colors ${
                      isActive('/profile') ? 'text-green-600' : 'text-gray-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 font-semibold transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-700 font-semibold transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center justify-center"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
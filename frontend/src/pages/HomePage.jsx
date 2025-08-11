// frontend/src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';

const HomePage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthStore();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await axiosInstance.get('/venues');
        setVenues(res.data.venues || []);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to QuickCourt</h1>
          <p className="text-xl mb-8">Book your favorite sports venues instantly</p>
          {authUser ? (
            <div className="space-x-4">
              <Link to="/venues" className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
                Browse Venues
              </Link>
              <Link to="/my-bookings" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600">
                My Bookings
              </Link>
            </div>
          ) : (
            <Link to="/signup" className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Get Started
            </Link>
          )}
        </div>
      </div>

      {/* Featured Venues */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Venues</h2>
        
        {loading ? (
          <div className="text-center">Loading venues...</div>
        ) : venues.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">No venues available yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.slice(0, 6).map((venue) => (
              <VenueCard key={venue._id} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const VenueCard = ({ venue }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
    <div className="h-48 bg-gray-200 flex items-center justify-center">
      <span className="text-gray-500">Venue Image</span>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-2">{venue.name}</h3>
      <p className="text-gray-600 mb-2">{venue.address}</p>
      <p className="text-green-600 mb-2">{venue.sports?.join(', ')}</p>
      <p className="text-blue-600 font-semibold">₹{venue.priceRange?.min}-{venue.priceRange?.max}/hour</p>
    </div>
  </div>
);

export default HomePage;
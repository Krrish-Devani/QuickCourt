import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../lib/axios';

const HomePage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-center py-20">Loading venues...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">QuickCourt</h1>
          <p className="text-xl mb-8">Book your favorite sports venue instantly</p>
          <Link 
            to="/add-venue" 
            className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Add Your Venue
          </Link>
        </div>
      </div>

      {/* Venues List */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Available Venues</h2>
        
        {venues.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">No venues available yet</p>
            <Link 
              to="/add-venue" 
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Be the first to add a venue!
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
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
      <span className="text-gray-500">Venue Photo</span>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-2">{venue.name}</h3>
      <p className="text-gray-600 mb-2">{venue.address}</p>
      <p className="text-green-600 mb-2">{venue.sports.join(', ')}</p>
      <p className="text-blue-600 font-semibold mb-4">
        ₹{venue.priceRange.min}-{venue.priceRange.max}/hour
      </p>
      <Link 
        to={`/venue/${venue._id}`} 
        className="block bg-green-600 text-white text-center py-2 rounded hover:bg-green-700"
      >
        View Details
      </Link>
    </div>
  </div>
);

export default HomePage;

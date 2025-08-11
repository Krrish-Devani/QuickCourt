import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVenueStore } from '../store/useVenueStore';
import { useAuthStore } from '../store/useAuthStore';
import { useDebounce } from '../hooks/useDebounce';
import { VenueService } from '../services/venueService';
import SportCard from '../components/SportCard';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Users, 
  Clock, 
  IndianRupee,
  Plus,
  ArrowLeft,
  ArrowRight,
  Loader,
  Calendar,
  Phone,
  Mail,
  X,
  ChevronDown,
  ChevronUp,
  Sliders,
  DollarSign,
  AlertCircle
} from 'lucide-react';

// Import sport images
import badmintonImg from '../assets/badminton.jpg';
import cricketImg from '../assets/cricket.jpg';
import footballImg from '../assets/football.jpg';
import sportsToolsImg from '../assets/sports-tools.jpg';
import swimmingImg from '../assets/swimming.jpg';
import tableTennisImg from '../assets/table_tennis.jpg';
import tennisImg from '../assets/tennis.jpg';

const Venues = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { 
    venues, 
    isLoading, 
    isSearching,
    currentPage, 
    totalPages, 
    searchQuery, 
    selectedSport,
    filters,
    getVenues, 
    searchVenues,
    setFilters,
    updateFilters,
    clearFilters 
  } = useVenueStore();

  // Sports images mapping
  const sportsImages = {
    'All Sports': sportsToolsImg,
    'Badminton': badmintonImg,
    'Football': footballImg,
    'Cricket': cricketImg,
    'Swimming': swimmingImg,
    'Tennis': tennisImg,
    'Table Tennis': tableTennisImg,
    'Basketball': sportsToolsImg, // fallback image
    'Volleyball': sportsToolsImg  // fallback image
  };

  // Local state for search and filters
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    priceMin: filters.priceRange.min || '',
    priceMax: filters.priceRange.max || '',
    location: filters.location || '',
    amenities: filters.amenities || []
  });
  const [priceValidation, setPriceValidation] = useState({ isValid: true, errors: [] });

  // Debounce search query
  const debouncedSearch = useDebounce(localSearch, 500);

  // Available amenities for filtering - using service
  const availableAmenities = VenueService.getAvailableAmenities();
  const sportsOptions = VenueService.getAvailableSports();

  // Initial load
  useEffect(() => {
    getVenues(1);
  }, [getVenues]);

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      searchVenues(debouncedSearch, localFilters);
    }
  }, [debouncedSearch, searchVenues]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  // Handle manual search (Enter key or button click)
  const handleManualSearch = () => {
    searchVenues(localSearch, localFilters);
  };

  // Handle sport filter change
  const handleSportFilter = (sport) => {
    const sportFilter = sport === 'All Sports' ? '' : sport;
    setFilters(sportFilter, searchQuery, localFilters);
  };

  // Handle price filter change with validation
  const handlePriceFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    
    // Validate price range
    const validation = VenueService.validatePriceRange(newFilters.priceMin, newFilters.priceMax);
    setPriceValidation(validation);
    
    if (validation.isValid) {
      updateFilters({
        priceMin: newFilters.priceMin,
        priceMax: newFilters.priceMax,
        location: newFilters.location,
        amenities: newFilters.amenities
      });
    }
  };

  // Handle location filter change
  const handleLocationFilterChange = (value) => {
    const newFilters = { ...localFilters, location: value };
    setLocalFilters(newFilters);
    updateFilters({
      priceMin: newFilters.priceMin,
      priceMax: newFilters.priceMax,
      location: newFilters.location,
      amenities: newFilters.amenities
    });
  };

  // Handle amenity filter toggle
  const handleAmenityToggle = (amenity) => {
    const newAmenities = localFilters.amenities.includes(amenity)
      ? localFilters.amenities.filter(a => a !== amenity)
      : [...localFilters.amenities, amenity];
    
    const newFilters = { ...localFilters, amenities: newAmenities };
    setLocalFilters(newFilters);
    updateFilters({
      priceMin: newFilters.priceMin,
      priceMax: newFilters.priceMax,
      location: newFilters.location,
      amenities: newAmenities
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setLocalFilters({
      priceMin: '',
      priceMax: '',
      location: '',
      amenities: []
    });
    setPriceValidation({ isValid: true, errors: [] });
    clearFilters();
  };

  // Handle pagination
  const handlePageChange = (page) => {
    getVenues(page, selectedSport === 'All Sports' ? '' : selectedSport, searchQuery, localFilters);
  };

  const formatPrice = (priceRange) => {
    if (priceRange?.min === priceRange?.max) {
      return `₹${priceRange.min}/hour`;
    }
    return `₹${priceRange?.min}-${priceRange?.max}/hour`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Header Section */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                Discover Sports Venues
              </h1>
              <p className="text-gray-600">Find and book the perfect venue for your game</p>
            </div>

            {authUser && (
              <button
                onClick={() => navigate('/add-venue')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add Venue
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search venues by name or location..."
                value={localSearch}
                onChange={handleSearchChange}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {/* Search loading indicator */}
              {isSearching && (
                <Loader className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5 animate-spin" />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleManualSearch}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sliders className="w-5 h-5" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-6 space-y-6 animate-in slide-in-from-top-5 duration-300">
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Price Range (per hour)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Min price (₹)"
                      value={localFilters.priceMin}
                      onChange={(e) => handlePriceFilterChange('priceMin', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        !priceValidation.isValid ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max price (₹)"
                      value={localFilters.priceMax}
                      onChange={(e) => handlePriceFilterChange('priceMax', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        !priceValidation.isValid ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                {/* Price validation errors */}
                {!priceValidation.isValid && (
                  <div className="mt-2 flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{priceValidation.errors[0]}</span>
                  </div>
                )}
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Search by city or area..."
                  value={localFilters.location}
                  onChange={(e) => handleLocationFilterChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Amenities Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Star className="inline w-4 h-4 mr-1" />
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {availableAmenities.map((amenity) => (
                    <label 
                      key={amenity} 
                      className="flex items-center space-x-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="form-checkbox h-4 w-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">
                        {amenity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
                <div className="text-sm text-gray-500 flex items-center">
                  <span>Showing {venues.length} venues</span>
                </div>
              </div>
            </div>
          )}

          {/* Sport Category Cards */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
              Browse by Sport Category
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {sportsOptions.map((sport, index) => (
                <div
                  key={sport}
                  className="animate-in fade-in duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SportCard
                    sport={sport}
                    image={sportsImages[sport]}
                    isSelected={(selectedSport === sport) || (sport === 'All Sports' && !selectedSport)}
                    onClick={() => handleSportFilter(sport)}
                  />
                </div>
              ))}
            </div>
            
            {/* Active filter indicator */}
            {selectedSport && selectedSport !== 'All Sports' && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 animate-in slide-in-from-left duration-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Showing venues for: <strong className="text-green-600">{selectedSport}</strong></span>
                <button
                  onClick={() => handleSportFilter('All Sports')}
                  className="ml-2 text-red-500 hover:text-red-700 transition-colors hover:scale-110 transform"
                  title="Clear filter"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {(isLoading || isSearching) && (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">
              {isSearching ? 'Searching venues...' : 'Loading venues...'}
            </span>
          </div>
        )}

        {/* Venues Grid */}
        {!isLoading && !isSearching && (
          <>
            {venues.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏟️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No venues found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedSport 
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to add a venue!'
                  }
                </p>
                {authUser && (
                  <button
                    onClick={() => navigate('/add-venue')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  >
                    Add First Venue
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {venues.map((venue) => (
                    <VenueCard key={venue._id} venue={venue} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-green-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Venue Card Component
const VenueCard = ({ venue }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/venue/${venue._id}`);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleBookNow}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {venue.photo ? (
          <img 
            src={venue.photo} 
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
            <div className="text-white text-6xl">🏟️</div>
          </div>
        )}
        
        {/* Sports Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {venue.sports?.slice(0, 2).map((sport, index) => (
            <span 
              key={index}
              className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm"
            >
              {sport}
            </span>
          ))}
          {venue.sports?.length > 2 && (
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              +{venue.sports.length - 2}
            </span>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
          {venue.priceRange ? `₹${venue.priceRange.min}-${venue.priceRange.max}/hr` : 'Price on request'}
        </div>

        {/* Rating Badge (if available) */}
        {venue.rating && venue.rating > 0 && (
          <div className="absolute bottom-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            {venue.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors">
          {venue.name}
        </h3>
        
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <MapPin className="w-4 h-4 text-green-500" />
          <span className="text-sm line-clamp-1">{venue.address}</span>
        </div>

        {venue.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {venue.description}
          </p>
        )}

        {/* Amenities (if available) */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {venue.amenities.slice(0, 3).map((amenity, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                >
                  {amenity}
                </span>
              ))}
              {venue.amenities.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  +{venue.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={handleBookNow}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <Calendar className="w-4 h-4" />
            Book Now
          </button>
        </div>

        {/* Hover effect overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-green-500/5 pointer-events-none rounded-2xl" />
        )}
      </div>
    </div>
  );
};

export default Venues;

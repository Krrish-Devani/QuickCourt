/**
 * Venue Detail Page with Real-Time Booking System
 * Shows venue details, time slots, and handles bookings with Socket.IO integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore, formatTime, formatDate } from '../store/useBookingStore';
import socketManager from '../lib/socketManager';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  IndianRupee,
  Phone,
  Loader,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  User,
  MessageSquare
} from 'lucide-react';

// Import CSS for react-datepicker
import 'react-datepicker/dist/react-datepicker.css';

const VenueDetail = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  
  const {
    currentVenue,
    selectedDate,
    timeSlots,
    selectedSlots,
    totalPrice,
    hourlyRate,
    isLoading,
    isBooking,
    getVenueAvailability,
    toggleTimeSlot,
    clearSelection,
    createBooking,
    setSelectedDate,
    resetBookingState
  } = useBookingStore();

  // Local state for booking form
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  
  // Refs for real-time updates
  const typingTimeoutRef = useRef();

  // Initialize component
  useEffect(() => {
    if (!venueId) {
      navigate('/venues');
      return;
    }

    // Load venue data
    loadVenueData();

    // Setup socket connection if user is authenticated
    if (authUser) {
      setupSocketConnection();
    }

    // Cleanup on unmount
    return () => {
      socketManager.leaveVenue(venueId);
      resetBookingState();
    };
  }, [venueId, authUser]);

  // Load venue data when date changes
  useEffect(() => {
    if (venueId && selectedDate) {
      loadVenueData();
    }
  }, [selectedDate]);

  // Setup real-time slot selection updates
  useEffect(() => {
    if (isSocketConnected && selectedSlots.length > 0) {
      // Emit slot selection with debounce
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketManager.emitSlotSelection(venueId, selectedDate, selectedSlots);
      }, 500);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedSlots, isSocketConnected]);

  /**
   * Load venue availability data
   */
  const loadVenueData = async () => {
    try {
      await getVenueAvailability(venueId, selectedDate);
    } catch (error) {
      console.error('Failed to load venue data:', error);
      toast.error('Failed to load venue information');
    }
  };

  /**
   * Setup Socket.IO connection
   */
  const setupSocketConnection = () => {
    try {
      socketManager.connect();
      socketManager.joinVenue(venueId);
      setIsSocketConnected(true);
      console.log('Socket connected for venue:', venueId);
    } catch (error) {
      console.error('Socket connection failed:', error);
      setIsSocketConnected(false);
    }
  };

  /**
   * Handle date change
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);
    clearSelection();
    setShowBookingForm(false);
  };

  /**
   * Handle slot selection
   */
  const handleSlotClick = (slot) => {
    if (!authUser) {
      toast.error('Please login to book a venue');
      navigate('/login');
      return;
    }

    toggleTimeSlot(slot);
  };

  /**
   * Handle booking form submission
   */
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!authUser) {
      toast.error('Please login to make a booking');
      return;
    }

    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    if (!contactPhone.trim()) {
      toast.error('Please provide your contact phone number');
      return;
    }

    try {
      // Emit booking initiated event
      socketManager.emitBookingInitiated(venueId, selectedDate, selectedSlots);

      // Create booking
      await createBooking({
        contactPhone: contactPhone.trim(),
        notes: notes.trim()
      });

      // Reset form
      setContactPhone('');
      setNotes('');
      setShowBookingForm(false);
      
      toast.success('Booking confirmed! You will receive a confirmation shortly.');
      
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  /**
   * Handle typing in booking form
   */
  const handleFormTyping = () => {
    if (isSocketConnected) {
      socketManager.emitUserTyping(venueId);
    }
  };

  // Show loading state
  if (isLoading && !currentVenue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading venue details...</h3>
          <p className="text-gray-600">Please wait while we fetch the latest information</p>
        </div>
      </div>
    );
  }

  // Show error if venue not found
  if (!isLoading && !currentVenue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Venue not found</h3>
          <p className="text-gray-600 mb-6">The venue you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/venues')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Browse Other Venues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/venues')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Venues
            </button>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {isSocketConnected ? 'Live updates active' : 'Offline mode'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 w-full max-w-none">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 w-full">
          
          {/* Left Column - Venue Details */}
          <div className="xl:col-span-2 space-y-6 w-full min-w-0">
            
            {/* Venue Info Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Venue Image */}
              <div className="relative h-48 sm:h-64 lg:h-80">
                {currentVenue?.photo ? (
                  <img 
                    src={currentVenue.photo} 
                    alt={currentVenue.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                    <div className="text-white text-6xl sm:text-8xl">🏟️</div>
                  </div>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-full font-semibold text-sm sm:text-base">
                  ₹{hourlyRate}/hour
                </div>
              </div>

              {/* Venue Details */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{currentVenue?.name}</h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{currentVenue?.address}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm sm:text-base">4.8</span>
                    <span className="text-gray-600 text-sm sm:text-base">(124 reviews)</span>
                  </div>
                </div>

                {/* Sports */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Available Sports</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentVenue?.sports?.map((sport, index) => (
                      <span 
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                {currentVenue?.description && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{currentVenue.description}</p>
                  </div>
                )}

                {/* Amenities */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Amenities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">Changing Rooms</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">Flexible Hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">Online Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slots Grid */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 w-full">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Available Time Slots</h2>
                  <p className="text-sm text-gray-600">Select consecutive time slots for your booking</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full shadow-sm"></div>
                    <span className="text-gray-700">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full shadow-sm"></div>
                    <span className="text-gray-700">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full shadow-sm"></div>
                    <span className="text-gray-700">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full shadow-sm"></div>
                    <span className="text-gray-700">Being Selected</span>
                  </div>
                </div>
              </div>

              {/* Date Display & Quick Stats */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6 border border-gray-100 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {formatDate(selectedDate)}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {timeSlots.filter(slot => slot.available).length} of {timeSlots.length} slots available
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {isLoading && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Updating...</span>
                      </div>
                    )}
                    {isSocketConnected && (
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">Live updates</span>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Rate: <span className="font-semibold text-green-600">₹{hourlyRate}/hour</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Period Filters */}
              <div className="flex flex-wrap gap-2 mb-6 w-full justify-start">
                <button 
                  onClick={() => {
                    const morningSlots = timeSlots.filter(slot => {
                      const hour = parseInt(slot.start.split(':')[0]);
                      return hour >= 6 && hour < 12;
                    });
                    // Scroll to first morning slot
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                >
                  🌅 Morning (6 AM - 12 PM)
                </button>
                <button 
                  onClick={() => {
                    const afternoonSlots = timeSlots.filter(slot => {
                      const hour = parseInt(slot.start.split(':')[0]);
                      return hour >= 12 && hour < 17;
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
                >
                  ☀️ Afternoon (12 PM - 5 PM)
                </button>
                <button 
                  onClick={() => {
                    const eveningSlots = timeSlots.filter(slot => {
                      const hour = parseInt(slot.start.split(':')[0]);
                      return hour >= 17 && hour < 22;
                    });
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                >
                  🌙 Evening (5 PM - 10 PM)
                </button>
              </div>

              {/* Time Slots Grid */}
              <div className="time-slots-container w-full">
                {timeSlots.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No time slots available</h3>
                    <p className="text-gray-600 mb-4">Please select a different date to see available slots.</p>
                    <button
                      onClick={() => handleDateChange(new Date(Date.now() + 24 * 60 * 60 * 1000))}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Try Tomorrow
                    </button>
                  </div>
                ) : timeSlots.filter(slot => slot.available).length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All slots are booked</h3>
                    <p className="text-gray-600 mb-4">This venue is fully booked for {formatDate(selectedDate)}.</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={() => handleDateChange(new Date(Date.now() + 24 * 60 * 60 * 1000))}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Check Tomorrow
                      </button>
                      <button
                        onClick={() => navigate('/venues')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Browse Other Venues
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="time-slots-grid w-full">
                    {timeSlots.map((slot, index) => {
                    const isSelected = selectedSlots.some(s => s.start === slot.start);
                    const isAvailable = slot.available;
                    const hour = parseInt(slot.start.split(':')[0]);
                    const isPopularTime = hour >= 17 && hour <= 20; // Peak hours
                    const isPrimeTime = hour >= 9 && hour <= 11; // Morning prime
                    
                    // Determine slot category for styling
                    let slotCategory = '';
                    if (hour >= 6 && hour < 12) slotCategory = 'morning';
                    else if (hour >= 12 && hour < 17) slotCategory = 'afternoon';
                    else if (hour >= 17 && hour < 22) slotCategory = 'evening';
                    
                    return (
                      <div key={`${slot.start}-${slot.end}`} className="relative group">
                        <button
                          onClick={() => handleSlotClick(slot)}
                          disabled={!isAvailable}
                          className={`
                            time-slot-button p-3 rounded-xl border-2 text-sm font-medium transition-all duration-300 transform hover:scale-105 w-full relative overflow-hidden
                            ${isSelected 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg ring-2 ring-blue-200' 
                              : isAvailable 
                                ? `bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-800 hover:from-green-100 hover:to-green-200 hover:border-green-300 shadow-sm hover:shadow-md ${isPopularTime ? 'ring-1 ring-orange-200' : ''} ${isPrimeTime ? 'ring-1 ring-blue-200' : ''}` 
                                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-600 cursor-not-allowed opacity-70'
                            }
                          `}
                        >
                          {/* Background pattern for unavailable slots */}
                          {!isAvailable && (
                            <div className="absolute inset-0 opacity-20">
                              <div className="w-full h-full bg-red-200 transform rotate-12 scale-150"></div>
                            </div>
                          )}
                          
                          {/* Popular time indicator */}
                          {isAvailable && isPopularTime && (
                            <div className="absolute top-1 right-1">
                              <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">🔥</span>
                            </div>
                          )}
                          
                          {/* Prime time indicator */}
                          {isAvailable && isPrimeTime && (
                            <div className="absolute top-1 right-1">
                              <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">⭐</span>
                            </div>
                          )}
                          
                          <div className="flex flex-col items-center justify-center h-full relative z-10">
                            <Clock className={`w-4 h-4 mb-1 flex-shrink-0 ${isSelected ? 'text-white' : isAvailable ? 'text-green-600' : 'text-red-400'}`} />
                            <span className="text-center leading-tight font-semibold">{slot.label}</span>
                            <div className="text-xs mt-1 opacity-75">
                              ₹{hourlyRate}
                            </div>
                          </div>
                          
                          {/* Selection animation */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-400 opacity-20 animate-pulse rounded-xl"></div>
                          )}
                        </button>
                        
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                          {isAvailable ? (
                            <>
                              {slot.label} • ₹{hourlyRate}
                              {isPopularTime && ' • Peak Hours'}
                              {isPrimeTime && ' • Prime Time'}
                            </>
                          ) : (
                            'Slot already booked'
                          )}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
                
                {/* Quick Actions */}
                {timeSlots.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2 justify-center w-full">
                    <button
                      onClick={() => {
                        // Select 2-hour morning slot (9-11 AM)
                        const morningSlots = timeSlots.filter(slot => {
                          const hour = parseInt(slot.start.split(':')[0]);
                          return hour >= 9 && hour < 11 && slot.available;
                        });
                        morningSlots.forEach(slot => !selectedSlots.some(s => s.start === slot.start) && handleSlotClick(slot));
                      }}
                      className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex-1 sm:flex-none min-w-[140px]"
                    >
                      Quick: 2h Morning (9-11 AM)
                    </button>
                    <button
                      onClick={() => {
                        // Select 2-hour evening slot (6-8 PM)
                        const eveningSlots = timeSlots.filter(slot => {
                          const hour = parseInt(slot.start.split(':')[0]);
                          return hour >= 18 && hour < 20 && slot.available;
                        });
                        eveningSlots.forEach(slot => !selectedSlots.some(s => s.start === slot.start) && handleSlotClick(slot));
                      }}
                      className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium flex-1 sm:flex-none min-w-[140px]"
                    >
                      Quick: 2h Evening (6-8 PM)
                    </button>
                    <button
                      onClick={clearSelection}
                      disabled={selectedSlots.length === 0}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none min-w-[100px]"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Selected Slots Summary */}
              {selectedSlots.length > 0 && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-blue-900 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Selected Time Slots
                    </h4>
                    <button
                      onClick={clearSelection}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Time slots display */}
                    <div>
                      <p className="text-sm text-blue-700 font-medium mb-2">Time Range:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSlots.map((slot, index) => (
                          <span 
                            key={`selected-${slot.start}`}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            {slot.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Booking details */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 text-sm">Duration:</span>
                        <span className="font-semibold text-blue-900">
                          {selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 text-sm">Rate:</span>
                        <span className="font-semibold text-blue-900">₹{hourlyRate}/hour</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                        <span className="text-blue-700 font-medium">Total Amount:</span>
                        <span className="text-xl font-bold text-green-600">₹{totalPrice}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking timeline visualization */}
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium mb-2">Booking Timeline:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                        {selectedSlots.map((slot, index) => {
                          const startHour = parseInt(slot.start.split(':')[0]);
                          const position = ((startHour - 9) / 13) * 100; // 9 AM to 10 PM range
                          const width = (1 / 13) * 100; // 1 hour width
                          
                          return (
                            <div
                              key={index}
                              className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                              style={{ left: `${position}%`, width: `${width}%` }}
                            />
                          );
                        })}
                      </div>
                      <span className="text-xs text-blue-600 font-medium whitespace-nowrap">
                        {formatTime(selectedSlots[0]?.start)} - {formatTime(selectedSlots[selectedSlots.length - 1]?.end)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>9 AM</span>
                      <span>2 PM</span>
                      <span>6 PM</span>
                      <span>10 PM</span>
                    </div>
                  </div>
                  
                  {/* Savings indicator */}
                  {selectedSlots.length >= 3 && (
                    <div className="mt-3 bg-green-100 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <Star className="w-4 h-4 fill-green-600" />
                        <span className="text-sm font-medium">
                          Great choice! Booking {selectedSlots.length} hours for better value.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Panel */}
          <div className="space-y-6 w-full min-w-0">
            
            {/* Date Picker */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Date</h3>
              <div className="w-full">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                  inline
                  className="w-full"
                  calendarClassName="!border-0 !shadow-none w-full"
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            {/* Booking Summary */}
            {selectedSlots.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Venue:</span>
                    <span className="font-semibold">{currentVenue?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-semibold">{selectedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-semibold">
                      {formatTime(selectedSlots[0]?.start)} - {formatTime(selectedSlots[selectedSlots.length - 1]?.end)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-semibold">{selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>₹{hourlyRate}/hour</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold text-green-600">
                    <span>Total:</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>

                {!showBookingForm ? (
                  <button
                    onClick={() => setShowBookingForm(true)}
                    disabled={!authUser}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {authUser ? 'Proceed to Book' : 'Login to Book'}
                  </button>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => {
                          setContactPhone(e.target.value);
                          handleFormTyping();
                        }}
                        placeholder="Enter your phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => {
                          setNotes(e.target.value);
                          handleFormTyping();
                        }}
                        placeholder="Any special requirements or notes..."
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isBooking}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isBooking ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Confirm Booking
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Clear Selection */}
                <button
                  onClick={clearSelection}
                  className="w-full mt-3 text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}

            {/* Help & Support */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Call Support</p>
                    <p className="text-sm">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MessageSquare className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Live Chat</p>
                    <p className="text-sm">Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;

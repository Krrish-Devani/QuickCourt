import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVenueStore } from '../store/useVenueStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { 
  Upload, 
  Loader, 
  ArrowLeft, 
  MapPin, 
  User, 
  FileText, 
  IndianRupee,
  Camera,
  X
} from 'lucide-react';

const AddVenue = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { createVenue, isCreating } = useVenueStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    sports: [],
    priceRange: { min: '', max: '' },
    photo: null
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const sports = [
    'Badminton', 'Football', 'Cricket', 'Swimming', 
    'Tennis', 'Table Tennis', 'Basketball', 'Volleyball',
    'Hockey', 'Squash', 'Boxing', 'Gym'
  ];

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authUser) {
      navigate('/login');
    }
  }, [authUser, navigate]);

  // Show loading or redirect message while checking auth
  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const base64Image = e.target.result;
      setImagePreview(base64Image);
      setFormData(prev => ({ ...prev, photo: base64Image }));
    };
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, photo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleSport = (sport) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only submit if we're on the final step
    if (step !== totalSteps) {
      return;
    }
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Venue name is required');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return;
    }
    if (formData.sports.length === 0) {
      toast.error('Please select at least one sport');
      return;
    }
    if (!formData.priceRange.min || !formData.priceRange.max) {
      toast.error('Please provide price range');
      return;
    }
    if (parseInt(formData.priceRange.min) > parseInt(formData.priceRange.max)) {
      toast.error('Minimum price cannot be greater than maximum price');
      return;
    }

    try {
      await createVenue({
        ...formData,
        priceRange: {
          min: parseInt(formData.priceRange.min),
          max: parseInt(formData.priceRange.max)
        }
      });
    //   toast.success('Venue created successfully!');
      navigate('/venues');
    } catch (error) {
      // Error is handled in the store
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    nextStep();
  };

  const handlePrevStep = (e) => {
    e.preventDefault();
    e.stopPropagation();
    prevStep();
  };

  const handleKeyPress = (e) => {
    // Prevent form submission on Enter if not on final step
    if (e.key === 'Enter' && step !== totalSteps) {
      e.preventDefault();
      if (canProceed()) {
        nextStep();
      }
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim() && formData.address.trim();
      case 2:
        return formData.sports.length > 0;
      case 3:
        return formData.priceRange.min && 
               formData.priceRange.max && 
               parseInt(formData.priceRange.min) > 0 && 
               parseInt(formData.priceRange.max) > 0 &&
               parseInt(formData.priceRange.min) <= parseInt(formData.priceRange.max);
      case 4:
        return true; // Photo is optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/venues')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Venues
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Add New Venue</h1>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i + 1}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    i + 1 <= step
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                Step {step} of {totalSteps}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} onKeyPress={handleKeyPress} className="bg-white rounded-2xl shadow-xl p-8">
            
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <User className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                  <p className="text-gray-600">Let's start with the basics about your venue</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter venue name (e.g., Elite Sports Arena)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter complete address with city and pincode"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Describe your venue, facilities, and what makes it special..."
                      rows="4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Sports Selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">🏆</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Sports Available</h2>
                  <p className="text-gray-600">Select all sports that can be played at your venue</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Available Sports * (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sports.map((sport) => (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => toggleSport(sport)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                          formData.sports.includes(sport)
                            ? 'bg-green-600 text-white border-green-600 shadow-lg transform scale-105'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:bg-green-50'
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                  {formData.sports.length > 0 && (
                    <p className="mt-3 text-sm text-green-600">
                      Selected {formData.sports.length} sport{formData.sports.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <IndianRupee className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing Information</h2>
                  <p className="text-gray-600">Set your hourly rates for booking</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Minimum Price per Hour *
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.priceRange.min}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          priceRange: { ...prev.priceRange, min: e.target.value }
                        }))}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maximum Price per Hour *
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.priceRange.max}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          priceRange: { ...prev.priceRange, max: e.target.value }
                        }))}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., 500"
                      />
                    </div>
                  </div>
                </div>

                {formData.priceRange.min && formData.priceRange.max && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      Price Range: ₹{formData.priceRange.min} - ₹{formData.priceRange.max} per hour
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Photo Upload */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Camera className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Photos</h2>
                  <p className="text-gray-600">Showcase your venue with great photos (Optional)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Venue Photo
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Venue preview" 
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-200"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <span className="text-gray-600 font-medium text-lg mb-2">Click to upload venue photo</span>
                      <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={step === 1}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating Venue...
                    </>
                  ) : (
                    <>
                      Create Venue
                      <Upload className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVenue;

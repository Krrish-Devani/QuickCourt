import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ActivityService } from '../services/activityService';
import { 
  Camera, 
  Mail, 
  User, 
  Calendar, 
  Upload, 
  Loader,
  Edit3,
  MapPin,
  Phone,
  Trophy,
  Activity,
  TrendingUp,
  Users,
  Building,
  IndianRupee,
  BarChart3,
  Clock,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activityData, setActivityData] = useState(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const fileInputRef = useRef(null);

  // Load activity data when component mounts or tab changes to activity
  useEffect(() => {
    if (activeTab === 'activity' && !activityData) {
      loadActivityData();
    }
  }, [activeTab]);

  const loadActivityData = async () => {
    setIsLoadingActivity(true);
    try {
      const data = await ActivityService.getUserActivity();
      const formattedData = ActivityService.formatActivityData(data);
      setActivityData(formattedData);
    } catch (error) {
      console.error('Error loading activity data:', error);
      toast.error('Failed to load activity data');
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleImageUpload = async (e) => {
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
    reader.onload = async (e) => {
      try {
        const base64Image = e.target.result;
        setSelectedImage(base64Image);
        await updateProfile({ profilePic: base64Image });
      } catch (error) {
        setSelectedImage(null);
        toast.error('Failed to upload image. Please try again.');
      }
    };
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10" />
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-10 text-white/10 text-6xl animate-pulse">🏸</div>
        <div className="absolute bottom-10 left-10 text-white/10 text-4xl animate-bounce">🎾</div>
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            
            {/* Profile Picture Section */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                {authUser?.profilePic ? (
                  <img 
                    src={authUser.profilePic} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-5xl font-bold">
                    {authUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                
                {/* Upload Overlay */}
                <button
                  onClick={triggerFileInput}
                  disabled={isUpdatingProfile}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:cursor-not-allowed"
                >
                  {isUpdatingProfile ? (
                    <Loader className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <div className="text-center text-white">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm font-semibold">Change Photo</span>
                    </div>
                  )}
                </button>
              </div>
              
              {/* Upload Badge */}
              <button
                onClick={triggerFileInput}
                disabled={isUpdatingProfile}
                className="absolute -bottom-2 -right-2 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
              </button>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="text-center lg:text-left text-white flex-1">
              <h1 className="text-4xl lg:text-5xl font-black mb-3">
                {authUser?.fullName || 'User Name'}
              </h1>
              
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 mb-6">
                <div className="flex items-center gap-2 text-white/90">
                  <Mail className="w-5 h-5" />
                  <span className="text-lg">{authUser?.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-white/90">
                  <Calendar className="w-5 h-5" />
                  <span>Member since {
                    (() => {
                      try {
                        const date = new Date(authUser?.createdAt);
                        return !isNaN(date.getTime()) 
                          ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                          : 'Recently';
                      } catch {
                        return 'Recently';
                      }
                    })()
                  }</span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-100 border border-blue-400/30 text-sm font-semibold">
                  <Trophy className="w-4 h-4" />
                  Pro Player
                </div>
              </div>
              {/* Upload Instruction */}
              <p className="mt-4 text-white/70 text-sm">
                {isUpdatingProfile ? (
                  <span className="animate-pulse text-yellow-300">Updating profile picture...</span>
                ) : (
                  <span>Click on the image or upload button to change your profile picture</span>
                )}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 text-center text-white">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-black mb-1">
                  {activityData?.summary?.totalBookingsMade || 0}
                </div>
                <div className="text-sm opacity-90">My Bookings</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-black mb-1">
                  {activityData?.summary?.venuesOwned || 0}
                </div>
                <div className="text-sm opacity-90">My Venues</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-black mb-1">
                  {activityData?.summary?.totalBookingsReceived || 0}
                </div>
                <div className="text-sm opacity-90">Received</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600 bg-green-50/50'
                      : 'border-transparent text-gray-600 hover:text-green-600 hover:bg-gray-50/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-12">
        {activeTab === 'overview' && <OverviewTab authUser={authUser} />}
        {activeTab === 'activity' && (
          <ActivityTab 
            authUser={authUser} 
            activityData={activityData} 
            isLoading={isLoadingActivity}
            onRefresh={loadActivityData}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ authUser }) => (
  <div className="grid lg:grid-cols-3 gap-8">
    {/* Account Information */}
    <div className="lg:col-span-2 space-y-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900 font-medium">{authUser?.fullName || 'Not provided'}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
              <Mail className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900 font-medium">{authUser?.email}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
              <Phone className="w-5 h-5 text-gray-500" />
              <span className="text-gray-500">Not provided</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-gray-500">Not provided</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Contact support to update your personal information
        </p>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Booking Confirmed</p>
                <p className="text-sm text-gray-600">Badminton Court - Sports Complex</p>
              </div>
              <div className="text-sm text-gray-500">2 days ago</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Sidebar */}
    <div className="space-y-8">
      {/* Account Status */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Account Status</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Profile Completion</span>
            <span className="text-blue-600 font-semibold">
              {authUser?.profilePic ? '80%' : '60%'}
            </span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Achievements</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-gray-700">New Member</span>
          </div>
          {authUser?.profilePic && (
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-blue-500" />
              <span className="text-gray-700">Profile Complete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Activity Tab Component
const ActivityTab = ({ authUser, activityData, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600">Loading activity data...</span>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load activity data</h3>
        <button 
          onClick={onRefresh}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, recentBookings, venues } = activityData;

  return (
    <div className="space-y-8">
      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Venues Owned */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Venues Owned</p>
              <p className="text-3xl font-black text-gray-900">{summary.venuesOwned}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* People Booked My Venues */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">People Booked My Venues</p>
              <p className="text-3xl font-black text-gray-900">{summary.totalBookingsReceived}</p>
              <p className="text-xs text-gray-500">{summary.uniqueCustomers} unique customers</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Venues I Booked */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Venues I Booked</p>
              <p className="text-3xl font-black text-gray-900">{summary.venuesBookedIn}</p>
              <p className="text-xs text-gray-500">{summary.totalBookingsMade} total bookings</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-black text-gray-900">
                {ActivityService.formatCurrency(summary.totalRevenue)}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <IndianRupee className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Recent Bookings</h2>
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          
          {recentBookings.userBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600">Start booking venues to see your activity here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.userBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{booking.venueName}</p>
                    <p className="text-sm text-gray-600">{booking.venueAddress}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {ActivityService.formatDate(booking.date)} • {booking.timeRange}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${ActivityService.getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {ActivityService.formatCurrency(booking.totalPrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ActivityService.getRelativeTime(booking.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Bookings in My Venues */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Bookings in My Venues</h2>
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          
          {recentBookings.venueBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏟️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings received</h3>
              <p className="text-gray-600">Add venues to start receiving bookings!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.venueBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{booking.customerName}</p>
                    <p className="text-sm text-gray-600">{booking.venueName}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {ActivityService.formatDate(booking.date)} • {booking.timeRange}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${ActivityService.getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {ActivityService.formatCurrency(booking.totalPrice)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ActivityService.getRelativeTime(booking.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Venues Section */}
      {venues.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Venues Performance</h2>
            <Building className="w-6 h-6 text-gray-400" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div key={venue.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{venue.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{venue.address}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{venue.bookingsCount}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          <Activity className="w-5 h-5" />
          Refresh Activity Data
        </button>
      </div>
    </div>
  );
};

export default Profile;
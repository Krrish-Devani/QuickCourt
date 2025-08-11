# QuickCourt - Real-Time Venue Booking System

A complete MERN stack application for booking sports venues with real-time updates using Socket.IO.

## 🚀 Features

### ✅ **Real-Time Booking System**
- **Live Slot Updates**: When someone books a slot, it becomes instantly unavailable for all users
- **Real-Time Notifications**: Get notified when slots become available/unavailable
- **Live User Activity**: See when others are selecting slots or booking
- **Connection Status**: Real-time connection indicator

### ✅ **Venue Management**
- **Detailed Venue Pages**: Complete venue information with images and amenities
- **Time Slot Grid**: Visual 1-hour slots from 9 AM to 10 PM
- **Dynamic Pricing**: Price calculation based on duration and hourly rates
- **Date Selection**: Book up to 30 days in advance

### ✅ **Booking Features**
- **Consecutive Slot Selection**: Select multiple consecutive hours
- **Availability Validation**: Real-time slot availability checking
- **Booking Confirmation**: Instant booking with contact details
- **Booking History**: View and manage your bookings

### ✅ **Authentication & Security**
- **JWT Authentication**: Secure login/signup system
- **Email Verification**: OTP-based email verification
- **Protected Routes**: Login required for booking
- **Real-Time Auth**: Socket authentication for secure real-time features

### ✅ **User Experience**
- **Responsive Design**: Works on all devices
- **Loading States**: Smooth loading animations
- **Error Handling**: Comprehensive error management
- **Toast Notifications**: Real-time feedback for all actions

## 🛠️ Technology Stack

### **Backend**
- **Node.js + Express**: RESTful API server
- **MongoDB + Mongoose**: Database with optimized schemas
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: Authentication and authorization
- **Joi**: Input validation
- **Cloudinary**: Image storage and management
- **Nodemailer**: Email services

### **Frontend**
- **React 18**: Modern UI with hooks
- **Zustand**: Lightweight state management
- **Socket.IO Client**: Real-time client connection
- **React Router**: Client-side routing
- **React DatePicker**: Date selection component
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons
- **React Hot Toast**: Notification system

## 📦 Installation & Setup

### **Prerequisites**
- Node.js (v18+ recommended)
- MongoDB (local or Atlas)
- npm or yarn

### **1. Clone Repository**
```bash
git clone <repository-url>
cd QuickCourt
```

### **2. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment variables
cp .env.example .env

# Edit .env file with your configurations:
# MONGO_URI=mongodb://localhost:27017/quickcourt
# JWT_SECRET=your-jwt-secret
# CLOUDINARY_CLOUD_NAME=your-cloudinary-name
# CLOUDINARY_API_KEY=your-cloudinary-key
# CLOUDINARY_API_SECRET=your-cloudinary-secret
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# Start the server
node src/index.js
```

### **3. Frontend Setup**

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment variables
echo "VITE_API_URL=http://localhost:5001" > .env
echo "VITE_SOCKET_URL=http://localhost:5001" >> .env

# Start the development server
npm run dev
```

### **4. Access the Application**

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5001
- **Socket.IO**: ws://localhost:5001

## 🎯 Usage Guide

### **For Users:**

1. **Browse Venues**: Visit `/venues` to see all available venues
2. **Select Venue**: Click "Book Now" on any venue card
3. **Choose Date**: Use the date picker to select booking date
4. **Select Time Slots**: Click on available (green) time slots
5. **Book Venue**: Fill in contact details and confirm booking
6. **Real-Time Updates**: See live availability changes from other users

### **For Venue Owners:**

1. **Add Venue**: Click "Add Venue" in navigation (requires login)
2. **Fill Details**: Complete the 4-step venue creation form
3. **Upload Images**: Add venue photos using Cloudinary integration
4. **Manage Bookings**: View bookings through the API endpoints

## 🔌 API Endpoints

### **Authentication Routes**
```
POST /api/auth/signup          # User registration
POST /api/auth/login           # User login
POST /api/auth/logout          # User logout
POST /api/auth/verify-email    # Email verification
GET  /api/auth/check-auth      # Check authentication status
```

### **Venue Routes**
```
GET    /api/venues             # Get all venues (with pagination)
POST   /api/venues             # Create new venue (authenticated)
GET    /api/venues/:id         # Get venue by ID
PUT    /api/venues/:id         # Update venue (authenticated)
DELETE /api/venues/:id         # Delete venue (authenticated)
```

### **Booking Routes**
```
GET  /api/bookings/venue/:venueId/availability  # Get venue availability
POST /api/bookings/create                       # Create booking (authenticated)
GET  /api/bookings/my-bookings                  # Get user bookings (authenticated)
PUT  /api/bookings/:id/cancel                   # Cancel booking (authenticated)
GET  /api/bookings/venue/:venueId/bookings      # Get venue bookings (authenticated)
```

## 🔄 Real-Time Events

### **Socket.IO Events**

#### **Client → Server**
```javascript
'join_venue'          // Join venue room for updates
'leave_venue'         // Leave venue room
'slot_selecting'      // User selecting time slots
'slot_deselecting'    // User deselecting time slots
'booking_initiated'   // User starting booking process
'user_typing'         // User typing in booking form
```

#### **Server → Client**
```javascript
'booking_confirmed'         // New booking created
'booking_cancelled'         // Booking cancelled
'slot_availability_updated' // Slot availability changed
'slot_being_selected'       // Someone selecting slots
'slot_being_deselected'     // Someone deselecting slots
'booking_in_progress'       // Someone booking
'user_notification'         // Personal notifications
'system_announcement'       // System-wide announcements
```

## 📊 Database Schema

### **User Model**
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  isVerified: Boolean,
  verificationToken: String,
  profilePic: String
}
```

### **Venue Model**
```javascript
{
  name: String,
  description: String,
  address: String,
  sports: [String],
  priceRange: { min: Number, max: Number },
  photo: String,
  ownerId: ObjectId
}
```

### **Booking Model**
```javascript
{
  venueId: ObjectId,
  userId: ObjectId,
  date: Date,
  startTime: String,      // "09:00"
  endTime: String,        // "11:00"
  duration: Number,       // 2 (hours)
  totalPrice: Number,     // 1000
  status: String,         // "confirmed", "cancelled", "completed"
  paymentStatus: String,  // "pending", "paid", "failed"
  contactPhone: String,
  notes: String
}
```

## 🚦 Environment Variables

### **Backend (.env)**
```env
# Database
MONGO_URI=mongodb://localhost:27017/quickcourt

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Service (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=5001
CLIENT_URL=http://localhost:5174
```

### **Frontend (.env)**
```env
# API Configuration
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

## 🧪 Testing the Real-Time Features

1. **Open Multiple Browser Windows**: Open the same venue page in 2+ windows
2. **Login with Different Users**: Use different accounts in each window
3. **Select Time Slots**: Watch real-time updates across windows
4. **Make a Booking**: See instant availability changes
5. **Check Notifications**: Observe toast notifications for real-time events

## 🔧 Troubleshooting

### **Common Issues:**

1. **Socket Connection Failed**
   - Check if backend server is running
   - Verify CORS settings
   - Ensure authentication token is valid

2. **Booking Creation Failed**
   - Verify all required fields are filled
   - Check slot availability
   - Ensure user is authenticated

3. **Real-Time Updates Not Working**
   - Check browser console for errors
   - Verify Socket.IO connection status
   - Ensure multiple users are in the same venue room

### **Debug Mode:**
```javascript
// Enable Socket.IO debugging in browser console
localStorage.debug = 'socket.io-client:socket';
```

## 🚀 Deployment

### **Backend Deployment (Heroku/Railway/DigitalOcean)**
1. Set all environment variables
2. Ensure MongoDB Atlas connection
3. Configure Cloudinary for production
4. Update CORS origins for production domain

### **Frontend Deployment (Vercel/Netlify)**
1. Update `VITE_API_URL` to production backend URL
2. Update `VITE_SOCKET_URL` to production socket server
3. Build the project: `npm run build`
4. Deploy the `dist` folder

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review the code comments
- Test with multiple browser windows
- Verify environment variables

## 🎉 Features Demo

The system includes:
- ✅ Real-time slot blocking when users select time slots
- ✅ Live booking confirmations across all connected users
- ✅ Socket-based authentication for secure real-time features
- ✅ Optimistic UI updates with rollback on errors
- ✅ Connection status indicators
- ✅ Comprehensive error handling and user feedback

---

**Built with ❤️ using the MERN stack + Socket.IO**

# QuickCourt 🏟️

A modern venue booking platform that allows users to discover, book, and manage sports venues with real-time availability and secure payment processing.

## 🚀 Features

- **Real-time Venue Discovery** - Browse and search venues with advanced filtering
- **Sport-specific Booking** - Book slots for specific sports with availability tracking
- **Secure Payment Gateway** - Integrated Razorpay payment processing
- **Real-time Updates** - Live slot availability using Socket.IO
- **User Authentication** - Secure JWT-based authentication system
- **Responsive Design** - Mobile-first responsive interface
- **Admin Dashboard** - Venue management and booking analytics

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 18.x with Vite
- **Language:** JavaScript (ES6+)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router DOM
- **Date Handling:** React DatePicker
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **Payment:** Razorpay SDK

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript (ES6+ with modules)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **File Upload:** Multer
- **Validation:** Joi
- **Payment Processing:** Razorpay
- **Real-time Communication:** Socket.IO
- **Environment Variables:** dotenv
- **CORS:** cors middleware

### **Database**
- **Primary Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Schema Design:** 
  - Users, Venues, Bookings, Payments collections
  - Referential integrity with ObjectId references
  - Compound indexes for optimized queries

### **Development Tools**
- **Package Manager:** npm
- **Version Control:** Git
- **Development Server:** Vite (Frontend), Nodemon (Backend)
- **API Testing:** Built-in debugging and logging

### **Deployment & DevOps**
- **Cloud Database:** MongoDB Atlas
- **Payment Gateway:** Razorpay (Test/Live modes)
- **Real-time:** Socket.IO with scaling capabilities

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **Git**
- **MongoDB Atlas account** (or local MongoDB)
- **Razorpay account** (for payment processing)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/QuickCourt.git
cd QuickCourt
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Backend Environment Variables

Edit the `.env` file with your configurations:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quickcourt

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:5173
```

#### Start Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The backend server will start on `http://localhost:5001`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Frontend Environment Variables

Edit the `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:5001/api

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Socket.IO Configuration
VITE_SOCKET_URL=http://localhost:5001
```

#### Start Frontend Development Server

```bash
# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📁 Project Structure

```
QuickCourt/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   ├── lib/            # External libraries config
│   │   ├── socket.js       # Socket.IO configuration
│   │   └── index.js        # Server entry point
│   ├── .env.example        # Environment template
│   ├── package.json
│   └── README.md
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state management
│   │   ├── services/       # API services
│   │   ├── lib/            # Utility libraries
│   │   ├── hooks/          # Custom React hooks
│   │   ├── assets/         # Static assets
│   │   └── App.jsx         # Main app component
│   ├── public/             # Public assets
│   ├── .env.example        # Environment template
│   ├── package.json
│   ├── vite.config.js      # Vite configuration
│   └── tailwind.config.js  # Tailwind CSS configuration
│
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

## 🎯 Key Features Implementation

### Real-time Slot Updates
- Socket.IO integration for live availability updates
- Real-time booking confirmations across all connected clients
- Live slot selection indicators

### Payment Processing
- Razorpay integration for secure payments
- Order creation and verification workflow
- Payment status tracking and booking confirmation

### Sport-specific Booking
- Filter availability by specific sports
- Prevent double bookings for same sport and time slot
- Sport validation against venue offerings

### Responsive Design
- Mobile-first Tailwind CSS implementation
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

## 🧪 Testing the Application

### 1. Start Both Servers
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 2. Test User Flow
1. **Registration/Login** - Create account or login
2. **Browse Venues** - Explore available venues
3. **Select Sport** - Choose your preferred sport
4. **Pick Time Slots** - Select available time slots
5. **Complete Booking** - Fill details and proceed to payment
6. **Payment Processing** - Complete payment via Razorpay
7. **Booking Confirmation** - Verify booking in profile

### 3. Test Real-time Features
- Open multiple browser windows
- Book a slot in one window
- Verify it becomes unavailable in other windows immediately

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - Joi schema validation for all inputs
- **CORS Protection** - Configured CORS for API security
- **Payment Security** - Razorpay signature verification

**Happy Coding! 🚀**

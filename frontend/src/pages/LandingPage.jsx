import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Play, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  Shield,
  Zap,
  Trophy,
  ChevronRight,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const { authUser } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      sport: "Badminton",
      image: "🏸",
      color: "from-blue-600 to-purple-600"
    },
    {
      sport: "Tennis", 
      image: "🎾",
      color: "from-green-600 to-blue-600"
    },
    {
      sport: "Football",
      image: "⚽",
      color: "from-orange-600 to-red-600"
    }
  ];

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Instant Booking",
      description: "Book courts in seconds with our streamlined booking system"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Find Nearby",
      description: "Discover the best sports venues in your neighborhood"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Payments",
      description: "Safe and secure payment processing for all bookings"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Join Community",
      description: "Connect with other sports enthusiasts in your area"
    }
  ];

  const stats = [
    { number: "50+", label: "Sports Venues" },
    { number: "1000+", label: "Happy Players" },
    { number: "10+", label: "Sports Types" },
    { number: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      rating: 5,
      comment: "Amazing platform! Found a badminton court near my office in minutes.",
      sport: "Badminton Player"
    },
    {
      name: "Priya Patel",
      rating: 5,
      comment: "Love how easy it is to book tennis courts. Great user experience!",
      sport: "Tennis Enthusiast"
    },
    {
      name: "Amit Kumar",
      rating: 5,
      comment: "Finally, a reliable platform for booking sports venues. Highly recommended!",
      sport: "Football Player"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].color} transition-all duration-1000`}>
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center text-white">
            {/* Animated Sport Icon */}
            <div className="text-8xl mb-6 animate-bounce">
              {heroSlides[currentSlide].image}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
              QUICK<span className="text-yellow-400">COURT</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 font-light max-w-3xl mx-auto leading-relaxed">
              Your Gateway to Premium Sports Venues
            </p>
            
            <p className="text-lg mb-12 max-w-2xl mx-auto opacity-90">
              Book badminton courts, tennis courts, football turfs, and more with just a few clicks. 
              Join thousands of sports enthusiasts who trust QuickCourt.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {authUser ? (
                <Link
                  to="/venues"
                  className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Browse Venues
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-12 space-x-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 text-white/20 text-6xl animate-pulse">🏸</div>
        <div className="absolute bottom-20 right-10 text-white/20 text-6xl animate-pulse delay-1000">🎾</div>
        <div className="absolute top-1/2 left-5 text-white/20 text-4xl animate-bounce delay-500">⚽</div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-black text-green-600 mb-2 group-hover:text-blue-600 transition-colors">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-semibold text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Why Choose <span className="text-green-600">QuickCourt</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of sports venue booking with our cutting-edge platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-green-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How It <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-xl text-gray-600">Book your favorite court in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Search & Browse",
                description: "Find sports venues near you with filters for sport type, price, and availability",
                icon: <MapPin className="w-12 h-12" />
              },
              {
                step: "02", 
                title: "Select & Book",
                description: "Choose your preferred time slot and court, then confirm your booking instantly",
                icon: <Calendar className="w-12 h-12" />
              },
              {
                step: "03",
                title: "Play & Enjoy",
                description: "Show up at your venue and enjoy your game with friends or fellow players",
                icon: <Trophy className="w-12 h-12" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-black text-gray-900">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              What Players <span className="text-green-600">Say</span>
            </h2>
            <p className="text-xl text-gray-600">Don't just take our word for it</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 border border-green-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.sport}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Start Playing?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of sports enthusiasts who have already discovered the easiest way to book sports venues
          </p>
          
          {!authUser && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300"
              >
                I Have an Account
              </Link>
            </div>
          )}
        </div>
        
        {/* Floating Sports Icons */}
        <div className="absolute top-10 left-10 text-white/10 text-6xl animate-spin-slow">🏸</div>
        <div className="absolute bottom-10 right-10 text-white/10 text-6xl animate-spin-slow">🎾</div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-3xl font-black mb-4">
              QUICK<span className="text-green-400">COURT</span>
            </h3>
            <p className="text-gray-400 mb-6">
              Making sports accessible to everyone, everywhere.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              © 2024 QuickCourt. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
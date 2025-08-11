import React from 'react';

const SportCard = ({ sport, image, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`sport-card group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
        isSelected
          ? 'ring-4 ring-green-500 shadow-lg selected'
          : 'shadow-md hover:shadow-lg'
      }`}
    >
      {/* Background Image */}
      <div className="relative h-24 sm:h-28 md:h-32 overflow-hidden">
        <img
          src={image}
          alt={sport}
          className="sport-card-image w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className={`sport-card-overlay absolute inset-0 transition-all duration-300`} />
        
        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-in zoom-in-75 duration-300 shadow-lg">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}

        {/* Hover effect icon */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>

        {/* Floating particles effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-150"></div>
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
      
      {/* Sport Name */}
      <div className={`absolute bottom-0 left-0 right-0 p-2 sm:p-3 text-center transition-all duration-300 ${
        isSelected
          ? 'bg-green-600/90'
          : 'bg-black/60 group-hover:bg-black/50'
      }`}>
        <span className="text-white text-xs sm:text-sm font-semibold leading-tight drop-shadow-sm">
          {sport === 'All Sports' ? '🏆 All Sports' : sport}
        </span>
        
        {/* Subtle animation bar */}
        <div className={`absolute bottom-0 left-0 h-0.5 bg-white/50 transition-all duration-300 ${
          isSelected ? 'w-full' : 'w-0 group-hover:w-full'
        }`} />
        
        {/* Gradient accent line */}
        <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-500 ${
          isSelected ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100'
        }`} />
      </div>
    </div>
  );
};

export default SportCard;

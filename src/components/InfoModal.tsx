'use client';

import { useEffect, useState } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  partNumber: number;
  totalParts: number;
}

export default function InfoModal({ isOpen, onClose, onContinue, partNumber, totalParts }: InfoModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(onContinue, 200);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className={`relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 max-w-sm w-full border border-green-500/30 shadow-2xl transform transition-transform duration-200 ${isVisible ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="text-5xl text-center mb-4">🗺️</div>
        
        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-3">
          Opening Part {partNumber} of {totalParts}
        </h2>
        
        {/* Message */}
        <p className="text-gray-300 text-center mb-2">
          Google Maps will open with the first {partNumber === 1 ? 'set of' : 'next'} stops.
        </p>
        {partNumber < totalParts && (
          <p className="text-green-400 text-center text-sm mb-6">
            When you finish, come back here and tap <strong>Part {partNumber + 1}</strong> for the next section!
          </p>
        )}
        {partNumber === totalParts && (
          <p className="text-green-400 text-center text-sm mb-6">
            This is the final part of your tour!
          </p>
        )}
        
        {/* Progress indicator */}
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: totalParts }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i < partNumber ? 'bg-green-500' : 'bg-gray-600'}`}
            />
          ))}
        </div>
        
        {/* Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
        >
          Got it, open Google Maps
        </button>
        
        {/* Don't show again hint */}
        <p className="text-gray-500 text-xs text-center mt-3">
          This message won&apos;t appear again
        </p>
      </div>
    </div>
  );
}


import React from 'react';
import { ParkingLot } from '../types';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  lots: ParkingLot[];
  onSelect: (lot: ParkingLot) => void;
  selectedLot: ParkingLot | null;
}

const ParkingMap: React.FC<Props> = ({ lots, onSelect, selectedLot }) => {
  return (
    <div className="relative w-full h-[300px] bg-slate-200 rounded-xl overflow-hidden shadow-inner border border-slate-300">
      {/* Mock Map Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }}>
      </div>
      
      {/* City Elements (Decor) */}
      <div className="absolute top-10 left-10 w-20 h-40 bg-gray-300/50 rounded transform rotate-12"></div>
      <div className="absolute bottom-10 right-20 w-32 h-32 bg-gray-300/50 rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 w-full h-4 bg-gray-300/30 -translate-y-1/2 -translate-x-1/2 rotate-45"></div>

      {/* Markers */}
      {lots.map((lot) => (
        <button
          key={lot.id}
          onClick={() => onSelect(lot)}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group
            ${selectedLot?.id === lot.id ? 'scale-110 z-10' : 'scale-100 z-0'}
          `}
          style={{ top: `${lot.lat}%`, left: `${lot.lng}%` }}
        >
          <div className={`relative flex flex-col items-center`}>
            <div className={`
              p-2 rounded-full shadow-lg border-2 
              ${lot.currentAvailable > 20 ? 'bg-green-500 border-white' : 'bg-red-500 border-white'}
              ${selectedLot?.id === lot.id ? 'ring-4 ring-blue-400/50' : ''}
            `}>
              <MapPin className="text-white w-6 h-6" fill="currentColor" />
            </div>
            
            <div className="mt-1 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-700 shadow whitespace-nowrap">
              {lot.name}
              <span className={`ml-1 ${lot.currentAvailable > 10 ? 'text-green-600' : 'text-red-600'}`}>
                {lot.currentAvailable} spots
              </span>
            </div>
          </div>
        </button>
      ))}

      {/* User Location Pulse */}
      <div className="absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full shadow-lg">
        <Navigation className="text-white w-5 h-5" />
      </div>
    </div>
  );
};

export default ParkingMap;
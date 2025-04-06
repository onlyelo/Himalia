import React from 'react';

function ShipSeparator() {
  return (
    <div className="relative h-32 my-16 overflow-hidden">
      {/* Conteneur du vaisseau avec animation */}
      <div className="absolute top-1/2 -translate-y-1/2 animate-ship-flight">
        {/* Trainée du vaisseau */}
        <div className="absolute right-0 top-1/2 w-96 h-1 bg-gradient-to-l from-transparent via-blue-500 to-blue-500 opacity-30 blur-md"></div>
        
        {/* Effet de glow autour du vaisseau */}
        <div className="absolute inset-0 bg-blue-500 opacity-10 blur-xl"></div>
        
        {/* Vaisseau */}
        <img 
          src="/ship-separator.png" 
          alt="Vaisseau"
          className="h-16 w-24 object-contain transform -scale-x-100"
        />
      </div>
    </div>
  );
}

export default ShipSeparator;
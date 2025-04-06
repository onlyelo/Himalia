import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { shipDatabaseService, type ShipTemplate } from '../../services/shipDatabase';

interface ShipSearchBarProps {
  onShipSelect: (ship: ShipTemplate) => void;
}

export default function ShipSearchBar({ onShipSelect }: ShipSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ShipTemplate[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchShips = async () => {
      if (searchTerm.length >= 2) {
        const ships = await shipDatabaseService.searchShips(searchTerm);
        setResults(ships);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    };

    searchShips();
  }, [searchTerm]);

  return (
    <div className="relative flex-grow">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un vaisseau..."
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-300 focus:border-himalia focus:ring-1 focus:ring-himalia"
        />
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
          {results.map((ship) => (
            <button
            type="button"
              key={ship.name}
              onClick={() => {
                onShipSelect(ship);
                setSearchTerm('');
                setShowResults(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-700 text-gray-300 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="font-medium">{ship.name}</div>
              <div className="text-sm text-gray-400">
                {ship.manufacturer} • {ship.type}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
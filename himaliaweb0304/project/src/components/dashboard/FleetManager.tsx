import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, Loader } from 'lucide-react';
import { fleetService, type Ship } from '../../services/fleetService';

function FleetManager() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Ship>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    loadFleet();
  }, []);

  const loadFleet = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fleetService.getFleet();
      setShips(data);
    } catch (error) {
      console.error('Error loading fleet:', error);
      setError('Erreur lors du chargement de la flotte');
    } finally {
      setLoading(false);
    }
  };

  const filteredShips = ships.filter(ship => {
    const searchLower = searchTerm.toLowerCase();
    const manufacturerMatch = ship.manufacturerName?.toLowerCase().includes(searchLower) || false;
    const nameMatch = ship.name?.toLowerCase().includes(searchLower) || false;
    const usernameMatch = ship.username?.toLowerCase().includes(searchLower) || false;
    return manufacturerMatch || nameMatch || usernameMatch;
  });

  const sortedShips = [...filteredShips].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Gestion de la Flotte</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un vaisseau..."
                className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-300"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Trier
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
                  {['name', 'manufacturerName', 'username', 'status'].map((field) => (
                    <button
                      key={field}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700"
                      onClick={() => {
                        if (field === sortField) {
                          setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField(field as keyof Ship);
                          setSortDirection('asc');
                        }
                        setShowSortMenu(false);
                      }}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-3">Vaisseau</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Propriétaire</th>
              </tr>
            </thead>
            <tbody>
              {sortedShips.map((ship) => (
                <tr key={ship.id} className="border-b border-gray-700 last:border-0">
                  <td className="py-4">
                    <div>
                      <span className="font-medium text-gray-200">{ship.name}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {ship.manufacturerName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <select
                      value={ship.status}
                      onChange={(e) => fleetService.updateShip(ship.id, { status: e.target.value as Ship['status'] })}
                      className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-gray-300"
                    >
                      <option value="Opérationnel">Opérationnel</option>
                      <option value="En maintenance">En maintenance</option>
                      <option value="En mission">En mission</option>
                      <option value="Détruit">Détruit</option>
                    </select>
                  </td>
                  <td className="py-4 text-gray-300">
                    {ship.username}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FleetManager;
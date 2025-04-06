import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, Check, X as XIcon, AlertCircle } from 'lucide-react';
import { fleetStorage, type Reservation } from '../../services/fleetStorage';

function ShipReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = () => {
    const allReservations = fleetStorage.getReservations();
    setReservations(allReservations);
  };

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    try {
      fleetStorage.updateReservation(id, { status });
      loadReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const getRemainingTime = (endDate: string): string => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Terminé';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}j ${hours}h ${minutes}m`;
  };

  const filteredReservations = reservations
    .filter(reservation => {
      const searchLower = searchTerm.toLowerCase();
      return (
        reservation.requesterName.toLowerCase().includes(searchLower) ||
        reservation.purpose.toLowerCase().includes(searchLower)
      );
    })
    .filter(reservation => {
      if (filter === 'all') return true;
      return reservation.status === filter;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par demandeur ou utilisation..."
            className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-300"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
        >
          <option value="all">Toutes les réservations</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Refusées</option>
        </select>
      </div>

      <div className="grid gap-6">
        {filteredReservations.map((reservation) => (
          <div
            key={reservation.id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-200">
                  {reservation.requesterName}
                </h3>
                <p className="text-sm text-gray-400">{reservation.purpose}</p>
              </div>
              <div className="flex items-center space-x-2">
                {reservation.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleStatusChange(reservation.id, 'approved')}
                      className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(reservation.id, 'rejected')}
                      className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      reservation.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : reservation.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {reservation.status === 'approved' ? 'Approuvée' :
                     reservation.status === 'rejected' ? 'Refusée' : 'En attente'}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Début</p>
                  <p className="text-gray-300">
                    {new Date(reservation.startDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Fin</p>
                  <p className="text-gray-300">
                    {new Date(reservation.endDate).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {reservation.status === 'approved' && (
              <div className="mt-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-yellow-500">
                  Temps restant: {getRemainingTime(reservation.endDate)}
                </span>
              </div>
            )}
          </div>
        ))}

        {filteredReservations.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Aucune réservation trouvée
          </div>
        )}
      </div>
    </div>
  );
}

export default ShipReservations;
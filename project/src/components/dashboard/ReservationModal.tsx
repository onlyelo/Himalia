import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Ship, Reservation } from '../../services/fleetStorage';

interface ReservationModalProps {
  ship: Ship;
  onClose: () => void;
  onSubmit: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ ship, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    requesterId: '',
    requesterName: '',
    purpose: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    onSubmit({
      shipId: ship.id,
      requesterId: formData.requesterId,
      requesterName: formData.requesterName,
      purpose: formData.purpose,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      status: 'pending'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">
              Réserver {ship.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom du demandeur
              </label>
              <input
                type="text"
                value={formData.requesterName}
                onChange={e => setFormData(prev => ({ ...prev, requesterName: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Handle du demandeur
              </label>
              <input
                type="text"
                value={formData.requesterId}
                onChange={e => setFormData(prev => ({ ...prev, requesterId: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Utilisation prévue
              </label>
              <textarea
                value={formData.purpose}
                onChange={e => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Calendar className="inline-block h-4 w-4 mr-1" />
                  Date de début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Clock className="inline-block h-4 w-4 mr-1" />
                  Heure de début
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Calendar className="inline-block h-4 w-4 mr-1" />
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Clock className="inline-block h-4 w-4 mr-1" />
                  Heure de fin
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Demander la réservation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
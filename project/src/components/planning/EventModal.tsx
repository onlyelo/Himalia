import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, MapPin, Tag, Repeat } from 'lucide-react';
import { planningService, type Event } from '../../services/planningService';
import { authService } from '../../services/authService';
import { COLORS } from '../../pages/Planning';

interface EventModalProps {
  date: Date;
  onClose: () => void;
  onEventCreated: (event: Event) => void;
}

export default function EventModal({ date, onClose, onEventCreated }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '12:00',
    location: '',
    type: '',
    color: 'blue' as Event['color'],
    recurring: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Create event with all required fields
      const event = await planningService.createEvent({
        title: formData.title,
        description: formData.description,
        date: date.toISOString(),
        time: formData.time,
        location: formData.location,
        type: formData.type,
        color: formData.color,
        recurring: formData.recurring,
        createdBy: user.uid
      });

      onEventCreated(event);
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Erreur lors de la création de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-800 rounded-lg w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">
              Nouvel Événement
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <Clock className="inline-block h-4 w-4 mr-1" />
                  Heure
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <MapPin className="inline-block h-4 w-4 mr-1" />
                  Lieu
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                <Tag className="inline-block h-4 w-4 mr-1" />
                Type de mission
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Couleur
              </label>
              <div className="flex space-x-2">
                {Object.entries(COLORS).map(([color]) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color as Event['color'] }))}
                    className={`w-8 h-8 rounded-full ${COLORS[color as Event['color']]} ${
                      formData.color === color ? 'ring-2 ring-white' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={e => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                className="h-4 w-4 text-himalia bg-gray-700 border-gray-600 rounded focus:ring-himalia"
              />
              <label htmlFor="recurring" className="ml-2 text-sm text-gray-300">
                <Repeat className="inline-block h-4 w-4 mr-1" />
                Récurrent (hebdomadaire)
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-himalia text-white rounded-lg hover:bg-himalia/90 disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
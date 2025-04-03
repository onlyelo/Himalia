import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Tag, Repeat, Trash2 } from 'lucide-react';
import { planningService, type Event } from '../../services/planningService';
import { COLORS } from '../../pages/Planning';

interface EventDetailsModalProps {
  eventId: string;
  events: Event[];
  isAdmin: boolean;
  onClose: () => void;
  onEventDeleted: (eventId: string) => void;
}

export default function EventDetailsModal({ 
  eventId, 
  events, 
  isAdmin,
  onClose, 
  onEventDeleted 
}: EventDetailsModalProps) {
  const event = events.find(e => e.id === eventId);
  if (!event) return null;

  const handleDelete = async () => {
    try {
      await planningService.deleteEvent(eventId);
      onEventDeleted(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
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
              {event.title}
            </h2>
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-300">{event.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-300">
                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                {event.time}
              </div>
            </div>

            <div className="flex items-center text-gray-300">
              <MapPin className="h-5 w-5 mr-2 text-gray-400" />
              {event.location}
            </div>

            <div className="flex items-center text-gray-300">
              <Tag className="h-5 w-5 mr-2 text-gray-400" />
              {event.type}
            </div>

            {event.recurring && (
              <div className="flex items-center text-gray-300">
                <Repeat className="h-5 w-5 mr-2 text-gray-400" />
                Événement récurrent
              </div>
            )}

            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${COLORS[event.color]}`} />
              <span className="text-gray-300 capitalize">{event.color}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { planningService, type Event } from '../services/planningService';
import { authService } from '../services/authService';
import EventModal from '../components/planning/EventModal';
import EventDetailsModal from '../components/planning/EventDetailsModal';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const COLORS = {
  green: 'bg-green-500/20 border border-green-500',
  red: 'bg-red-500/20 border border-red-500',
  blue: 'bg-blue-500/20 border border-blue-500',
  yellow: 'bg-yellow-500/20 border border-yellow-500',
  orange: 'bg-orange-500/20 border border-orange-500',
  purple: 'bg-purple-500/20 border border-purple-500'
};

export default function Planning() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [copiedEvent, setCopiedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = await authService.getCurrentUser();
      setIsAdmin(user?.role === 'admin');
    };

    const loadEvents = async () => {
      try {
        const data = await planningService.getEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
    loadEvents();
  }, []);

  const getDaysInMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const days: (Date | null)[] = [];

    // Add null for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days in month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleDateClick = (date: Date) => {
    if (isAdmin) {
      setSelectedDate(date);
    }
  };

  const handleEventCreated = (newEvent: Event) => {
    setEvents(prev => [...prev, newEvent]);
    setSelectedDate(null);
  };

  const handleEventDeleted = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setSelectedEvent(null);
  };

  const handleDragStart = (e: React.DragEvent, event: Event) => {
    e.stopPropagation();
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (!draggedEvent || !isAdmin) return;

    try {
      const updatedEvent = {
        ...draggedEvent,
        date: date.toISOString()
      };

      await planningService.updateEvent(draggedEvent.id, updatedEvent);
      setEvents(prev => prev.map(e => 
        e.id === draggedEvent.id ? { ...e, date: date.toISOString() } : e
      ));
    } catch (error) {
      console.error('Error moving event:', error);
    } finally {
      setDraggedEvent(null);
    }
  };

  const handleCopyEvent = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    setCopiedEvent(event);
  };

  const handlePasteEvent = async (date: Date) => {
    if (!copiedEvent || !isAdmin) return;

    try {
      const newEvent = await planningService.createEvent({
        ...copiedEvent,
        date: date.toISOString(),
        createdBy: copiedEvent.createdBy
      });
      setEvents(prev => [...prev, newEvent]);
    } catch (error) {
      console.error('Error copying event:', error);
    }
  };

  return (
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Planning</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-300">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="text-center text-gray-400 font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {getDaysInMonth(currentDate).map((date, index) => (
            <div
              key={index}
              className={`aspect-square bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-2 ${
                date ? 'cursor-pointer hover:border-himalia' : 'opacity-50'
              }`}
              onClick={() => date && handleDateClick(date)}
              onDragOver={(e) => date && handleDragOver(e, date)}
              onDrop={(e) => date && handleDrop(e, date)}
              onContextMenu={(e) => {
                e.preventDefault();
                date && copiedEvent && handlePasteEvent(date);
              }}
            >
              {date && (
                <>
                  <div className="text-gray-400 mb-1">{date.getDate()}</div>
                  <div className="space-y-1">
                    {getEventsForDate(date).map(event => (
                      <div
                        key={event.id}
                        draggable={isAdmin}
                        onDragStart={(e) => handleDragStart(e, event)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event.id);
                        }}
                        className={`${COLORS[event.color]} p-1 rounded text-xs text-white truncate cursor-pointer group relative`}
                      >
                        {event.title}
                        {isAdmin && (
                          <button
                            onClick={(e) => handleCopyEvent(e, event)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {selectedDate && (
            <EventModal
              date={selectedDate}
              onClose={() => setSelectedDate(null)}
              onEventCreated={handleEventCreated}
            />
          )}

          {selectedEvent && (
            <EventDetailsModal
              eventId={selectedEvent}
              events={events}
              isAdmin={isAdmin}
              onClose={() => setSelectedEvent(null)}
              onEventDeleted={handleEventDeleted}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
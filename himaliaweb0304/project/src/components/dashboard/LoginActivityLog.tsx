import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { type LoginActivity } from '../../services/authService';

interface LoginActivityLogProps {
  recentActivity: LoginActivity[];
  allActivity: LoginActivity[];
}

function formatTimestamp(timestamp: any): string {
  const date = timestamp.toDate();
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Il y a quelques secondes';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }
}

export default function LoginActivityLog({ recentActivity, allActivity }: LoginActivityLogProps) {
  const [showAllActivity, setShowAllActivity] = useState(false);

  const displayedActivity = showAllActivity ? allActivity : recentActivity;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-100">Activité Récente</h2>
        <button
          onClick={() => setShowAllActivity(!showAllActivity)}
          className="flex items-center text-gray-400 hover:text-himalia transition-colors"
        >
          {showAllActivity ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Réduire
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Voir tout
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {displayedActivity.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              className="flex items-center py-3 border-b border-gray-700 last:border-0"
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-4 flex-grow">
                <p className="text-sm text-gray-300">
                  <span className="font-medium">{activity.userName}</span> s'est connecté
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
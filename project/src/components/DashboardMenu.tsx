import React from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Globe,
  Bell,
  Shield,
  RefreshCw,
} from 'lucide-react';

interface DashboardMenuProps {
  onClose: () => void;
  isMobile?: boolean;
}

function DashboardMenu({ onClose, isMobile = false }: DashboardMenuProps) {
  const [theme, setTheme] = React.useState('dark');
  const [sound, setSound] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);
  const [language, setLanguage] = React.useState('fr');

  const menuPosition = isMobile
    ? 'fixed inset-x-0 top-16 mx-4'
    : 'absolute right-0 top-12 w-80';

  return (
    <>
      {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${menuPosition} bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50`}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Paramètres du Dashboard</h3>
          
          <div className="space-y-4">
            {/* Thème */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-gray-400" /> : <Sun className="h-5 w-5 text-yellow-400" />}
                <span className="text-gray-300">Thème</span>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-gray-700 text-gray-300 rounded-md px-2 py-1 border border-gray-600"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
                <option value="system">Système</option>
              </select>
            </div>

            {/* Son */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {sound ? <Volume2 className="h-5 w-5 text-gray-400" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
                <span className="text-gray-300">Son</span>
              </div>
              <button
                onClick={() => setSound(!sound)}
                className={`px-3 py-1 rounded-md ${
                  sound ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {sound ? 'Activé' : 'Désactivé'}
              </button>
            </div>

            {/* Langue */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">Langue</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 text-gray-300 rounded-md px-2 py-1 border border-gray-600"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">Notifications</span>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`px-3 py-1 rounded-md ${
                  notifications ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {notifications ? 'Activées' : 'Désactivées'}
              </button>
            </div>

            {/* Actions rapides */}
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Actions Rapides</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Sécurité</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default DashboardMenu;
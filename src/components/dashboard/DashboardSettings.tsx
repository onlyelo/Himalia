import React from 'react';
import { Bell, Globe, Shield, Database } from 'lucide-react';

function DashboardSettings() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Paramètres du Dashboard</h1>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-100">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Notifications par email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Notifications push</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Langue */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-100">Langue</h2>
          </div>
          <select className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300">
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        {/* Sécurité */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-100">Sécurité</h2>
          </div>
          <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition-colors">
            Activer l'authentification à deux facteurs
          </button>
        </div>

        {/* Base de données */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-100">Base de données</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-md transition-colors">
              Exporter les données
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-md transition-colors">
              Synchroniser avec Airtable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSettings;
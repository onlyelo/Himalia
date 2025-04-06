import React from 'react';
import { BarChart2, TrendingUp, Users, Ship } from 'lucide-react';

function Analytics() {
  const stats = [
    {
      name: 'Croissance Membres',
      value: '+23%',
      description: 'vs mois dernier',
      trend: 'up',
    },
    {
      name: 'Missions Réussies',
      value: '92%',
      description: 'taux de succès',
      trend: 'up',
    },
    {
      name: 'Revenus',
      value: '+15%',
      description: 'vs mois dernier',
      trend: 'up',
    },
    {
      name: 'Utilisation Flotte',
      value: '78%',
      description: 'taux d\'activité',
      trend: 'down',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Analytiques</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart2 className="h-6 w-6 text-red-500" />
              <span className={`text-sm ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.value}
              </span>
            </div>
            <div className="text-lg font-semibold text-gray-100 mb-1">{stat.name}</div>
            <div className="text-sm text-gray-400">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Activité des Membres</h2>
          <div className="h-64 flex items-center justify-center">
            <Users className="h-16 w-16 text-gray-600" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Performance de la Flotte</h2>
          <div className="h-64 flex items-center justify-center">
            <Ship className="h-16 w-16 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
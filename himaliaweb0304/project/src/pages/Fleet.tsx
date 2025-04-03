import React from 'react';
import { motion } from 'framer-motion';

function Fleet() {
  const ships = [
    {
      name: 'Hammerhead',
      role: 'Combat',
      image: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b',
      description: 'Vaisseau de combat lourd spécialisé dans la guerre anti-chasseurs',
    },
    {
      name: 'Carrack',
      role: 'Exploration',
      image: 'https://images.unsplash.com/photo-1457364559154-aa2644600ebb',
      description: 'Vaisseau d\'exploration longue portée avec capacités de scan avancées',
    },
    {
      name: 'Perseus',
      role: 'Combat',
      image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa',
      description: 'Canonnière lourde conçue pour le combat contre les vaisseaux capitaux',
    },
  ];

  return (
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-500 to-gray-300 bg-clip-text text-transparent">
            Flotte Corporative
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Découvrez notre flotte diversifiée de vaisseaux spécialisés
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ships.map((ship, index) => (
            <motion.div
              key={ship.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={ship.image}
                  alt={ship.name}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-100 mb-2">{ship.name}</h3>
                <span className="inline-block bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm mb-4">
                  {ship.role}
                </span>
                <p className="text-gray-400">{ship.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Fleet;
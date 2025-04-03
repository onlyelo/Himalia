import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Loader } from 'lucide-react';
import { toolService, type Tool } from '../services/toolService';

function Tools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      const data = await toolService.getTools();
      // Filtrer uniquement les outils en ligne
      setTools(data.filter(tool => tool.status === 'En ligne'));
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des outils');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

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
            Centre d'Outils
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Outils essentiels pour les opérations Star Citizen
          </p>
        </motion.div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {tools.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Aucun outil disponible pour le moment
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <motion.a
                key={tool.id}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 hover:border-red-500 transition-colors"
              >
                <div className="relative h-48">
                  <img
                    src={tool.image}
                    alt={tool.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">{tool.name}</h3>
                      <ExternalLink className="h-5 w-5 text-gray-300 group-hover:text-red-500 transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-400 mb-2">{tool.description}</p>
                  <span className="inline-block bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm">
                    En ligne
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tools;
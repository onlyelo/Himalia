import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Upload, FileText } from 'lucide-react';

function ResourcesManager() {
  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'Guide du Débutant',
      category: 'Guides',
      description: 'Guide complet pour les nouveaux membres de la corporation',
      image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679',
      status: 'Publié',
    },
    {
      id: 2,
      title: 'Tactiques de Combat Avancées',
      category: 'Formation',
      description: 'Techniques et stratégies de combat pour pilotes expérimentés',
      image: 'https://images.unsplash.com/photo-1581822261290-991b38693d1b',
      status: 'Brouillon',
    },
  ]);

  const categories = ['Guides', 'Formation', 'Documentation', 'Tutoriels'];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Gestion des Ressources</h1>
        <button className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle Ressource
        </button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-start space-x-4 p-4 border border-gray-700 rounded-lg"
              >
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-100">{resource.title}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
                          {resource.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          resource.status === 'Publié'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {resource.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Upload className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 mt-2">{resource.description}</p>
                  <div className="mt-4">
                    <select className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300 mr-2">
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors">
                      {resource.status === 'Publié' ? 'Dépublier' : 'Publier'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourcesManager;
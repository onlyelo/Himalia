import React from 'react';
import { motion } from 'framer-motion';
import { Book, Video, FileText, GraduationCap } from 'lucide-react';

function Knowledge() {
  const categories = [
    {
      icon: Book,
      title: 'Guides',
      items: [
        'Orientation des Nouveaux Membres',
        'Tactiques de Combat',
        'Routes Commerciales',
        'Opérations Minières',
      ],
    },
    {
      icon: Video,
      title: 'Tutoriels Vidéo',
      items: [
        'Systèmes des Vaisseaux',
        'Entraînement au Combat',
        'Bases de Navigation',
        'Manœuvres Avancées',
      ],
    },
    {
      icon: FileText,
      title: 'Documentation',
      items: [
        'Procédures Opérationnelles Standard',
        'Protocoles d\'Urgence',
        'Directives de Communication',
        'Modèles de Mission',
      ],
    },
    {
      icon: GraduationCap,
      title: 'Formation',
      items: [
        'Certification de Combat',
        'Formation au Leadership',
        'Compétences Techniques',
        'Planification Stratégique',
      ],
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
            Base de Connaissances
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Ressources complètes pour tous les membres de la corporation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700"
            >
              <category.icon className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-100 mb-4">{category.title}</h2>
              <ul className="space-y-2">
                {category.items.map((item) => (
                  <li key={item} className="text-gray-400 hover:text-red-500 cursor-pointer">
                    • {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Knowledge;
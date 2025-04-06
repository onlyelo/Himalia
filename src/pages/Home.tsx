import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Target, Rocket } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

function Home() {
  const features = [
    {
      icon: Shield,
      title: 'Missions et Opérations',
      description: 'Des professionnels à votre service partout dans le verse',
    },
    {
      icon: Users,
      title: 'Communauté soudée',
      description: 'Tout nos membres sont solidaires',
    },
    {
      icon: Target,
      title: 'Missions',
      description: 'Participez à des opérations de flotte coordonnées',
    },
    {
      icon: Rocket,
      title: 'Gestion de Flotte Avancée',
      description: 'Accès aux vaisseaux et ressources de la corporation',
    },
  ];

  return (
    <div>
      {/* Section Héro */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers in order */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0">
          <ParticleBackground className="absolute inset-0" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <div className="relative inline-block">
            <h1 className="himalia-logo text-7xl md:text-9xl mb-6 font-orbitron">
              HIMALIA
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white font-medium mb-8 max-w-3xl mx-auto drop-shadow-lg">
            Une corporation francophone, à votre service au cœur du verse.
          </p>
          <motion.a
            href="https://discord.gg/himalia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-himalia text-white px-8 py-4 rounded-md text-lg font-semibold shadow-lg hover:shadow-himalia/50"
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            Rejoignez Nos Forces
          </motion.a>
        </motion.div>
      </section>

      {/* Section Caractéristiques */}
      <section className="py-20 bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-100 mb-4">Pourquoi Choisir Himalia</h2>
            <p className="text-xl text-gray-400">L'excellence dans chaque opération</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(31, 41, 55, 0.9)",
                  transition: { duration: 0.2 }
                }}
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 transform-gpu shadow-xl hover:shadow-himalia/20"
              >
                <motion.div
                  className="w-12 h-12 mb-4 text-himalia"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="h-full w-full" />
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold text-gray-100 mb-2"
                  whileHover={{ color: "#db0202" }}
                  transition={{ duration: 0.2 }}
                >
                  {feature.title}
                </motion.h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
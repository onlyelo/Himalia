import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Target, Star, MessageSquare } from 'lucide-react';
import { memberService, type Member } from '../services/memberService';

interface Officer {
  id: string;
  display: string;
  image: string;
  rank: string;
  stars: number;
  description?: string;
}

// LaserBeam Component
const LaserBeam: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div 
    className={`absolute w-px bg-gradient-to-b from-red-500 to-transparent ${className}`}
    style={{
      animation: 'laser 2s ease-in-out infinite',
      boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
    }}
  />
);

// ProfileCard Component
const ProfileCard: React.FC<{ 
  officer: Officer, 
  size?: 'large' | 'medium' | 'small', 
  delay?: number 
}> = ({ officer, size = 'medium', delay = 0 }) => {
  const [dominantColor, setDominantColor] = useState('rgb(239, 68, 68)');

  const sizeClasses = {
    large: 'w-32 h-32 border-4',
    medium: 'w-24 h-24 border-3',
    small: 'w-20 h-20 border-2'
  };

  const textSizes = {
    large: 'text-2xl',
    medium: 'text-xl',
    small: 'text-lg'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center cursor-pointer group"
    >
      <div className="relative">
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r from-red-500 to-gray-600 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300 ${
            size === 'large' ? 'group-hover:blur-xl' : 'group-hover:blur-lg'
          }`}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <div className="relative">
          <img
            src={officer.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'}
            alt={officer.display}
            className={`rounded-full object-cover border-2 border-red-500 transform transition-transform duration-300 group-hover:scale-105 ${
              sizeClasses[size]
            }`}
          />
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className={`font-bold text-gray-100 ${textSizes[size]}`}>
          {officer.display}
        </h3>
        <p className={`${size === 'large' ? 'text-red-500' : 'text-gray-400'}`}>
          {officer.rank}
        </p>
        <div className="mt-2 flex justify-center">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < officer.stars 
                  ? 'text-yellow-500 fill-yellow-500' 
                  : 'text-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

function Organization() {
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState<{
    founder: Officer | null;
    commanders: Officer[];
    captains: Officer[];
  }>({
    founder: null,
    commanders: [],
    captains: []
  });

  useEffect(() => {
    loadOfficers();
  }, []);

  const loadOfficers = async () => {
    try {
      const allMembers = await memberService.getMembers();
      
      const founder = allMembers.find(m => m.display.toLowerCase().includes('mauro'));
      if (founder) {
        founder.description = "Il est l'amiral de la flotte, fondateur et principal membre.";
      }

      const commanders = allMembers.filter(m => {
        const name = m.display.toLowerCase();
        if (name.includes('davesadiel')) {
          m.description = "Il est le commandant de la section de minage et du recyclage, il est en lien avec le capitaine Psytank son second";
          return true;
        }
        if (name.includes('imrial')) {
          m.description = "Il est le garant de la défense de la corporation, sous ses ailes les capitaines Yellow et Loustique";
          return true;
        }
        if (name.includes('127')) {
          m.description = "Il est le commandant de la section de transport et de cargo. Son second est DarkGinn";
          return true;
        }
        return false;
      });

      const captains = allMembers.filter(m => {
        const name = m.display.toLowerCase();
        return name.includes('psytank') ||
               name.includes('darkginn') ||
               name.includes('yellow') ||
               name.includes('loustique');
      });

      setOfficers({
        founder: founder || null,
        commanders,
        captains
      });
    } catch (error) {
      console.error('Error loading officers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
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
            Notre Organisation
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Une structure hiérarchique claire pour des opérations efficaces
          </p>
        </motion.div>

        {/* Organigramme */}
        <div className="mb-16 relative">
          {/* Amiral */}
          {officers.founder && (
            <div className="flex flex-col items-center mb-12">
              <ProfileCard officer={officers.founder} size="large" />
            </div>
          )}

          {/* Laser vertical central */}
          <LaserBeam className="h-16 left-1/2 -translate-x-1/2" />

          {/* Commandants et leurs capitaines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Groupe DavEsadiel */}
            <div className="flex flex-col items-center">
              {officers.commanders.find(c => c.display.toLowerCase().includes('davesadiel')) && (
                <>
                  <ProfileCard 
                    officer={officers.commanders.find(c => c.display.toLowerCase().includes('davesadiel'))!} 
                    size="medium"
                  />
                  <LaserBeam className="h-16" />
                  <div className="mt-8">
                    {officers.captains.filter(c => c.display.toLowerCase().includes('psytank')).map(captain => (
                      <ProfileCard 
                        key={captain.id} 
                        officer={captain} 
                        size="small"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Groupe Imrial */}
            <div className="flex flex-col items-center">
              {officers.commanders.find(c => c.display.toLowerCase().includes('imrial')) && (
                <>
                  <ProfileCard 
                    officer={officers.commanders.find(c => c.display.toLowerCase().includes('imrial'))!} 
                    size="medium"
                  />
                  <LaserBeam className="h-16" />
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    {officers.captains
                      .filter(c => 
                        c.display.toLowerCase().includes('yellow') || 
                        c.display.toLowerCase().includes('loustique')
                      )
                      .map(captain => (
                        <ProfileCard 
                          key={captain.id} 
                          officer={captain} 
                          size="small"
                        />
                      ))}
                  </div>
                </>
              )}
            </div>

            {/* Groupe 127 */}
            <div className="flex flex-col items-center">
              {officers.commanders.find(c => c.display.toLowerCase().includes('127')) && (
                <>
                  <ProfileCard 
                    officer={officers.commanders.find(c => c.display.toLowerCase().includes('127'))!} 
                    size="medium"
                  />
                  <LaserBeam className="h-16" />
                  <div className="mt-8">
                    {officers.captains.filter(c => c.display.toLowerCase().includes('darkginn')).map(captain => (
                      <ProfileCard 
                        key={captain.id} 
                        officer={captain} 
                        size="small"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Boutons Recrutement et Discord */}
        <div className="flex justify-center space-x-6 mb-16">
          <motion.a
            href="https://robertsspaceindustries.com/orgs/HIMALIA"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-8 py-3 bg-himalia text-white rounded-lg hover:bg-himalia/90 transition-all transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="h-5 w-5 mr-2" />
            Rejoindre la Corporation
          </motion.a>

          <motion.a
            href="https://discord.gg/himalia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-8 py-3 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-all transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Rejoindre le Discord
          </motion.a>
        </div>

        {/* Valeurs et Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700"
          >
            <Shield className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Nos Valeurs</h2>
            <ul className="space-y-2 text-gray-400">
              <li>• Excellence Professionnelle</li>
              <li>• Précision Tactique</li>
              <li>• Coordination d'Équipe</li>
              <li>• Développement des Membres</li>
              <li>• Innovation Stratégique</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700"
          >
            <Target className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Notre Mission</h2>
            <p className="text-gray-400">
              Fournir des services de sécurité et stratégiques inégalés dans l'univers de Star Citizen,
              tout en développant une communauté de professionnels qualifiés dédiés à l'excellence dans chaque opération.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Organization;
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { getAverageColor } from '../utils/imageColor';

interface ProfileModalProps {
  member: {
    display: string;
    image: string;
    rank: string;
    stars: number;
    description?: string;
  };
  onClose: () => void;
}

function ProfileModal({ member, onClose }: ProfileModalProps) {
  const [dominantColor, setDominantColor] = useState('rgb(239, 68, 68)'); // Default red

  useEffect(() => {
    const loadDominantColor = async () => {
      try {
        const color = await getAverageColor(member.image);
        setDominantColor(color);
      } catch (error) {
        console.error('Error getting dominant color:', error);
      }
    };

    loadDominantColor();
  }, [member.image]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-lg w-full"
          onClick={e => e.stopPropagation()}
        >
          {/* Glowing background effect */}
          <div
            className="absolute inset-0 rounded-2xl opacity-30"
            style={{
              background: `radial-gradient(circle at center, ${dominantColor}, transparent 70%)`,
              filter: 'blur(20px)',
              animation: 'glow 3s ease-in-out infinite alternate'
            }}
          />

          <div className="relative bg-gray-800/90 rounded-2xl overflow-hidden backdrop-blur-sm border border-gray-700">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative h-48 overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${member.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(8px)',
                  transform: 'scale(1.1)'
                }}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end">
                <img
                  src={member.image}
                  alt={member.display}
                  className="w-24 h-24 rounded-full border-4"
                  style={{ borderColor: dominantColor }}
                />
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-white">{member.display}</h2>
                  <p className="text-gray-300">{member.rank}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < member.stars
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-gray-300 leading-relaxed">
                {member.description}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProfileModal;
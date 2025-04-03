import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';
import ParticleBackground from '../components/ParticleBackground';

export default function Auth() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen relative">
      {/* Background avec particules */}
      <div className="absolute inset-0">
        <ParticleBackground className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/90" />
      </div>

      {/* Contenu */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <AuthModal isOpen={true} onClose={handleClose} />
        </motion.div>
      </div>
    </div>
  );
}
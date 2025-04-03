import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Loader } from 'lucide-react';
import { authService } from '../services/authService';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordChangeModal({ isOpen, onClose }: PasswordChangeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        await authService.forcePasswordReset(user.email);
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'email de réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-gray-800 rounded-lg w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-100">
                  Changer le mot de passe
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-500">
                  {error}
                </div>
              )}

              {success ? (
                <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded text-green-500">
                  Email de réinitialisation envoyé ! Vérifiez votre boîte mail.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-gray-300">
                    Un email de réinitialisation de mot de passe vous sera envoyé.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      'Envoyer l\'email de réinitialisation'
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, AlertCircle, Loader } from 'lucide-react';
import { authService, type PasswordResetRequest } from '../../services/authService';

export default function PasswordResetRequests() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await authService.getPasswordResetRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId: string, action: 'process' | 'reject') => {
    try {
      setProcessingId(requestId);
      await authService.processPasswordReset(requestId, action);
      setSuccess(action === 'process' ? 
        'Email de réinitialisation envoyé' : 
        'Demande rejetée'
      );
      await loadRequests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erreur lors du traitement de la demande');
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">
        Demandes de réinitialisation
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-500">
          {success}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Aucune demande en attente
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">
                    {request.email}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Demande effectuée le {new Date(request.requestDate.toDate()).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {processingId === request.id ? (
                    <Loader className="h-5 w-5 animate-spin text-red-500" />
                  ) : (
                    <>
                      <button
                        onClick={() => handleProcessRequest(request.id, 'process')}
                        className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors"
                        title="Approuver et envoyer l'email"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleProcessRequest(request.id, 'reject')}
                        className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                        title="Rejeter la demande"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
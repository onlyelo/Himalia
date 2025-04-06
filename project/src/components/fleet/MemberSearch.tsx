import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, Loader, Trash2 } from 'lucide-react';
import { memberService, type Member } from '../../services/memberService';

interface MemberSearchProps {
  onMemberSelect: (member: Member) => void;
  availableMembers: Member[];
  setAvailableMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  onCleanup: () => void;
}

export default function MemberSearch({ 
  onMemberSelect, 
  availableMembers,
  setAvailableMembers,
  onCleanup
}: MemberSearchProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmCleanup, setShowConfirmCleanup] = useState(false);

  useEffect(() => {
    const loadMembers = async () => {
      if (isSearchOpen && searchTerm.length >= 2 && availableMembers.length === 0) {
        try {
          setLoading(true);
          setError(null);
          const members = await memberService.getMembers();
          setAvailableMembers(members);
        } catch (err) {
          console.error('Error loading members:', err);
          setError('Erreur lors du chargement des membres');
        } finally {
          setLoading(false);
        }
      }
    };

    loadMembers();
  }, [isSearchOpen, searchTerm, setAvailableMembers, availableMembers.length]);

  const filteredMembers = searchTerm.length >= 2 
    ? availableMembers.filter(member =>
        member.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.roles?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleDragStart = (e: React.DragEvent, member: Member) => {
    e.dataTransfer.setData('application/json', JSON.stringify(member));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent, member: Member) => {
    if (e.dataTransfer.dropEffect === 'move') {
      setAvailableMembers(prev => prev.filter(m => m.id !== member.id));
    }
  };

  const handleCleanup = () => {
    setShowConfirmCleanup(false);
    onCleanup();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-himalia text-white rounded-lg hover:bg-himalia/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Gérer les membres</span>
          </button>

          <button
            onClick={() => setShowConfirmCleanup(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            <span>Nettoyer</span>
          </button>
        </div>
        
        {isSearchOpen && (
          <div className="relative flex-1 ml-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un membre (min. 2 caractères)..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-300"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmCleanup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowConfirmCleanup(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-100 mb-4">
                Confirmer le nettoyage
              </h3>
              <p className="text-gray-300 mb-6">
                Cette action supprimera toutes les tuiles de vaisseaux et les profils de membres. Êtes-vous sûr de vouloir continuer ?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmCleanup(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCleanup}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && searchTerm.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-himalia" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                {error}
              </div>
            ) : (
              <>
                {/* Available Members */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      layoutId={member.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, member)}
                      onDragEnd={(e) => handleDragEnd(e, member)}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 cursor-move hover:border-himalia transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'}
                          alt={member.display}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-gray-200 font-medium">{member.display}</h3>
                          <p className="text-sm text-gray-400">
                            {member.rank}
                            {member.roles && ` • ${member.roles}`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredMembers.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                    <Users className="h-12 w-12 mb-2 opacity-50" />
                    <p>Aucun membre trouvé</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
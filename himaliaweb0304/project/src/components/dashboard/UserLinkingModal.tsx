import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Link as LinkIcon, Search } from 'lucide-react';
import { authService, type UserProfile } from '../../services/authService';
import { memberService, type Member } from '../../services/memberService';

interface UserLinkingModalProps {
  onClose: () => void;
  selectedUser: UserProfile;
  onSuccess: () => void;
}

export default function UserLinkingModal({ onClose, selectedUser, onSuccess }: UserLinkingModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersList = await memberService.getMembers();
      
      // Filter out members that are already linked to users
      const users = await authService.getAllUsers();
      const linkedMemberIds = users
        .filter(user => user.linkedMemberId)
        .map(user => user.linkedMemberId);

      const availableMembers = membersList.filter(
        member => !linkedMemberIds.includes(member.id) || member.id === selectedUser.linkedMemberId
      );

      setMembers(availableMembers);
    } catch (error) {
      setError('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (memberId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (selectedUser.linkedMemberId === memberId) {
        await authService.unlinkUserFromMember(selectedUser.uid);
      } else {
        await authService.linkUserToMember(selectedUser.uid, memberId);
      }

      setSuccess('Liaison mise à jour avec succès');
      onSuccess();
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la liaison');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => 
    member.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.roles?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">
            Lier {selectedUser.displayName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded text-green-500">
            {success}
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un membre..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-300"
            />
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-himalia"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              Aucun membre disponible
            </div>
          ) : (
            filteredMembers.map(member => (
              <div
                key={member.id}
                className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={member.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'}
                    alt={member.display}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">{member.display}</h3>
                    <p className="text-sm text-gray-400">
                      {member.rank}
                      {member.roles && ` • ${member.roles}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleLink(member.id)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedUser.linkedMemberId === member.id
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-himalia hover:bg-himalia/90 text-white'
                  }`}
                >
                  {selectedUser.linkedMemberId === member.id ? 'Délier' : 'Lier'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
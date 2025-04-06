import React, { useState, useEffect } from 'react';
import { Trash2, Link as LinkIcon, UserCog, Search, Shield } from 'lucide-react';
import { authService, type UserProfile } from '../../services/authService';
import { memberService, type Member } from '../../services/memberService';
import UserLinkingModal from './UserLinkingModal';

const PROTECTED_USER_EMAIL = 'yelo@himalia.com';

export default function UserManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showLinkingModal, setShowLinkingModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, membersData] = await Promise.all([
        authService.getAllUsers(),
        memberService.getMembers()
      ]);
      setUsers(usersData);
      setMembers(membersData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    try {
      if (email === PROTECTED_USER_EMAIL) {
        setError('Ce compte ne peut pas être supprimé');
        setTimeout(() => setError(null), 3000);
        return;
      }

      await authService.deleteUser(uid);
      setSuccess('Utilisateur supprimé avec succès');
      await loadData();
      setUserToDelete(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleLinkUser = (user: UserProfile) => {
    setSelectedUser(user);
    setShowLinkingModal(true);
  };

  const handleToggleAdmin = async (user: UserProfile) => {
    try {
      if (user.email === PROTECTED_USER_EMAIL) {
        setError('Les permissions de ce compte ne peuvent pas être modifiées');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const newRole = user.role === 'admin' ? 'member' : 'admin';
      await authService.updateUserRole(user.uid, newRole);
      setSuccess(`Rôle mis à jour avec succès: ${newRole}`);
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erreur lors de la modification du rôle');
      setTimeout(() => setError(null), 3000);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const linkedMember = members.find(m => m.id === user.linkedMemberId);
    return (
      user.displayName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (linkedMember && linkedMember.display.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-himalia"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Gestion des Utilisateurs</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-300"
          />
        </div>
      </div>

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

      <div className="grid grid-cols-1 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.uid} className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-200">{user.displayName}</h3>
                <p className="text-gray-400">{user.email}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                    user.role === 'admin' ? 'bg-himalia/20 text-himalia' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.role === 'admin' ? 'Administrateur' : 'Membre'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLinkUser(user)}
                  className="text-gray-400 hover:text-himalia transition-colors"
                  title={user.linkedMemberId ? 'Modifier le lien' : 'Lier à un membre'}
                >
                  <LinkIcon className={`h-5 w-5 ${user.linkedMemberId ? 'text-green-500' : ''}`} />
                </button>
                <button
                  onClick={() => handleToggleAdmin(user)}
                  className={`text-gray-400 hover:text-himalia transition-colors ${
                    user.email === PROTECTED_USER_EMAIL ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={user.role === 'admin' ? 'Rétrograder en membre' : 'Promouvoir administrateur'}
                  disabled={user.email === PROTECTED_USER_EMAIL}
                >
                  <Shield className={`h-5 w-5 ${user.role === 'admin' ? 'text-himalia' : ''}`} />
                </button>
                {userToDelete === user.uid ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteUser(user.uid, user.email)}
                      className="px-3 py-1 bg-himalia text-white rounded-md hover:bg-himalia/90"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setUserToDelete(null)}
                      className="px-3 py-1 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setUserToDelete(user.uid)}
                    className={`text-gray-400 hover:text-himalia transition-colors ${
                      user.email === PROTECTED_USER_EMAIL ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={user.email === PROTECTED_USER_EMAIL ? 'Ce compte ne peut pas être supprimé' : 'Supprimer l\'utilisateur'}
                    disabled={user.email === PROTECTED_USER_EMAIL}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            {user.linkedMemberId && (
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Membre lié</h4>
                <div className="flex items-center space-x-3">
                  {members.find(m => m.id === user.linkedMemberId)?.image && (
                    <img
                      src={members.find(m => m.id === user.linkedMemberId)?.image}
                      alt="Member"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-gray-300">
                    {members.find(m => m.id === user.linkedMemberId)?.display || 'Membre non trouvé'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showLinkingModal && selectedUser && (
        <UserLinkingModal
          onClose={() => {
            setShowLinkingModal(false);
            setSelectedUser(null);
          }}
          selectedUser={selectedUser}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
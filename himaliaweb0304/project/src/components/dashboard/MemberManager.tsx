import React, { useState, useEffect } from 'react';
import { Trash2, Search, ArrowUpDown } from 'lucide-react';
import { memberService, type Member } from '../../services/memberService';
import AddMemberModal from './AddMemberModal';

const PROTECTED_MEMBER_NAME = 'Yelo';
const PAGE_SIZE_OPTIONS = [25, 50, 100, 'ALL'];

type SortField = 'display' | 'rank' | 'stars';
type SortOrder = 'asc' | 'desc';

function MemberManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('display');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [pageSize, setPageSize] = useState<number | 'ALL'>(25);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getMembers();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id: string, display: string) => {
    try {
      if (display === PROTECTED_MEMBER_NAME) {
        setError('Ce profil ne peut pas être supprimé');
        setTimeout(() => setError(null), 3000);
        return;
      }

      await memberService.deleteMember(id);
      await loadMembers();
      setShowDeleteConfirm(null);
      setSuccess('Membre supprimé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la suppression du membre');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setShowSortMenu(false);
  };

  const filteredAndSortedMembers = members
    .filter(member => 
      member.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.rank.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const order = sortOrder === 'asc' ? 1 : -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * order;
      }

      return String(aValue).localeCompare(String(bValue)) * order;
    });

  const displayedMembers = pageSize === 'ALL' 
    ? filteredAndSortedMembers 
    : filteredAndSortedMembers.slice(0, pageSize);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-100">Gestion des Membres</h1>
          <span className="text-gray-400">
            {filteredAndSortedMembers.length} membres au total
          </span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors"
        >
          Ajouter un membre
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-grow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou grade..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-300"
            />
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Trier par {sortField}
          </button>
          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10">
              <button
                onClick={() => handleSort('display')}
                className="w-full px-4 py-2 text-left hover:bg-gray-700"
              >
                Nom
              </button>
              <button
                onClick={() => handleSort('rank')}
                className="w-full px-4 py-2 text-left hover:bg-gray-700"
              >
                Grade
              </button>
              <button
                onClick={() => handleSort('stars')}
                className="w-full px-4 py-2 text-left hover:bg-gray-700"
              >
                Étoiles
              </button>
            </div>
          )}
        </div>

        <select
          value={String(pageSize)}
          onChange={(e) => setPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
        >
          {PAGE_SIZE_OPTIONS.map(size => (
            <option key={size} value={size}>
              {size === 'ALL' ? 'Tout afficher' : `${size} par page`}
            </option>
          ))}
        </select>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedMembers.map((member) => (
          <div
            key={member.id}
            className="bg-gray-700/50 rounded-lg p-6 border border-gray-600"
          >
            <div className="flex flex-col items-center text-center">
              <img
                src={member.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'}
                alt={member.display}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">{member.display}</h3>
              <p className="text-gray-400 mb-4">{member.rank}</p>
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`h-5 w-5 ${
                      index < member.stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              {showDeleteConfirm === member.id ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDeleteMember(member.id, member.display)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-3 py-1 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(member.id)}
                  className={`text-gray-400 hover:text-red-500 transition-colors ${
                    member.display === PROTECTED_MEMBER_NAME ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={member.display === PROTECTED_MEMBER_NAME ? 'Ce profil ne peut pas être supprimé' : 'Supprimer le membre'}
                  disabled={member.display === PROTECTED_MEMBER_NAME}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onMemberAdded={loadMembers}
        />
      )}
    </div>
  );
}

export default MemberManager;
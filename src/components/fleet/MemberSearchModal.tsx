import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { memberService, type Member } from '../../services/memberService';

interface MemberSearchModalProps {
  onSelect: (member: Member) => void;
  onClose: () => void;
  excludeIds: string[];
  anchorEl: HTMLElement;
}

export default function MemberSearchModal({ onSelect, onClose, excludeIds, anchorEl }: MemberSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const allMembers = await memberService.getMembers();
        setMembers(allMembers.filter(m => !excludeIds.includes(m.id)));
      } catch (error) {
        console.error('Error loading members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();

    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.member-search-modal')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [excludeIds, onClose]);

  const filteredMembers = members.filter(member =>
    member.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.rank?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.roles?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate position relative to anchor element
  const rect = anchorEl.getBoundingClientRect();
  const modalStyle = {
    position: 'fixed' as const,
    top: `${rect.bottom + window.scrollY + 8}px`,
    left: `${rect.left + window.scrollX}px`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      style={modalStyle}
      className="member-search-modal bg-gray-800 rounded-lg border border-gray-700 shadow-xl w-80 z-50"
    >
      <div className="p-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un membre..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300"
            autoFocus
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-himalia"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <p className="text-center text-gray-400 py-3 text-sm">
              {searchTerm ? 'Aucun membre trouvé' : 'Commencez à taper pour rechercher'}
            </p>
          ) : (
            <div className="space-y-1">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onSelect(member)}
                  className="w-full flex items-center p-2 hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  <img
                    src={member.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'}
                    alt={member.display}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="ml-3 text-left">
                    <div className="text-sm text-gray-200 group-hover:text-himalia transition-colors">
                      {member.display}
                    </div>
                    <div className="text-xs text-gray-400">
                      {member.rank}
                      {member.roles && ` • ${member.roles}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
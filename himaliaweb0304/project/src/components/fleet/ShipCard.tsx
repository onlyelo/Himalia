import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ship, Users, Trash2, Anchor } from 'lucide-react';
import { type ShipTemplate } from '../../services/shipDatabase';
import { type Member } from '../../services/memberService';

interface ShipCardProps {
  ship: ShipTemplate;
  onDelete: () => void;
  onMemberAssigned: (member: Member) => void;
  onMemberUnassigned: (member: Member) => void;
}

type StatusColor = 'red' | 'green' | 'blue' | 'yellow' | 'orange';

const STATUS_COLORS = {
  red: 'border-red-500',
  green: 'border-green-500',
  blue: 'border-blue-500',
  yellow: 'border-yellow-500',
  orange: 'border-orange-500'
};

const COLOR_CLASSES = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500'
};

export default function ShipCard({ ship, onDelete, onMemberAssigned, onMemberUnassigned }: ShipCardProps) {
  const [assignedMembers, setAssignedMembers] = useState<Member[]>([]);
  const [captain, setCaptain] = useState<Member | null>(null);
  const [notes, setNotes] = useState('');
  const [statusColor, setStatusColor] = useState<StatusColor>('blue');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragOverCaptain, setIsDragOverCaptain] = useState(false);

  const totalCrewCount = assignedMembers.length + (captain ? 1 : 0);

  const handleDragOver = (e: React.DragEvent, isCaptainZone = false) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (isCaptainZone) {
      setIsDragOverCaptain(true);
    } else {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent, isCaptainZone = false) => {
    e.preventDefault();
    if (isCaptainZone) {
      setIsDragOverCaptain(false);
    } else {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent, isCaptainZone = false) => {
    e.preventDefault();
    setIsDragOver(false);
    setIsDragOverCaptain(false);

    try {
      const member = JSON.parse(e.dataTransfer.getData('application/json')) as Member;
      
      if (isCaptainZone && ship.haveCaptain && !captain) {
        setCaptain(member);
        onMemberAssigned(member);
      } else if (!isCaptainZone && totalCrewCount < ship.crew) {
        setAssignedMembers(prev => [...prev, member]);
        onMemberAssigned(member);
      }
    } catch (error) {
      console.error('Error parsing dropped member:', error);
    }
  };

  const handleMemberDragStart = (e: React.DragEvent, member: Member, isCaptain = false) => {
    e.dataTransfer.setData('application/json', JSON.stringify(member));
    e.dataTransfer.effectAllowed = 'move';

    if (isCaptain) {
      setCaptain(null);
    } else {
      setAssignedMembers(prev => prev.filter(m => m.id !== member.id));
    }
    onMemberUnassigned(member);
  };

  const handleColorChange = (color: StatusColor) => {
    setStatusColor(color);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`w-full bg-gray-800/50 backdrop-blur-sm rounded-lg border-2 ${STATUS_COLORS[statusColor]} overflow-hidden`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            {ship.imageUrl && ship.shipId !== '0000' && (
              <img 
                src={ship.imageUrl} 
                alt={ship.name}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h3 className="text-2xl font-semibold text-gray-200">{ship.name}</h3>
              <p className="text-gray-400">{ship.manufacturer}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {(['red', 'green', 'blue', 'yellow', 'orange'] as StatusColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-6 h-6 rounded-full ${COLOR_CLASSES[color]} ${
                    statusColor === color ? 'ring-2 ring-white' : ''
                  } hover:opacity-80 transition-opacity`}
                />
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes..."
              className="bg-gray-700/50 border border-gray-600 rounded-md p-2 text-gray-300 text-sm resize-none"
              rows={2}
            />
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-himalia transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {ship.haveCaptain && (
          <div 
            className={`mb-4 p-4 rounded-lg ${
              isDragOverCaptain ? 'ring-2 ring-himalia bg-gray-700/30' : 'bg-gray-800/30'
            }`}
            onDragOver={(e) => handleDragOver(e, true)}
            onDragLeave={(e) => handleDragLeave(e, true)}
            onDrop={(e) => handleDrop(e, true)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 flex items-center">
                <Anchor className="h-5 w-5 mr-2 text-himalia" />
                Capitaine
              </span>
            </div>
            {captain ? (
              <div 
                draggable
                onDragStart={(e) => handleMemberDragStart(e, captain, true)}
                className="flex items-center bg-gray-700/50 rounded-lg p-2 cursor-move hover:bg-gray-600/50 transition-colors"
              >
                <img
                  src={captain.image}
                  alt={captain.display}
                  className="w-10 h-10 rounded-full object-cover border-2 border-himalia"
                />
                <div className="ml-3">
                  <span className="text-gray-200">{captain.display}</span>
                  <p className="text-sm text-gray-400">{captain.rank}</p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm text-center">
                Glissez un membre ici pour assigner le capitaine
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Ship className="h-5 w-5 text-gray-400" />
            <span className="text-gray-300">{ship.type || 'Combat'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-400" />
            <span className={`text-gray-300 ${totalCrewCount > ship.crew ? 'text-red-500' : ''}`}>
              {totalCrewCount}/{ship.crew}
            </span>
          </div>
        </div>

        <div 
          className={`p-4 rounded-lg ${
            isDragOver ? 'ring-2 ring-himalia bg-gray-700/30' : 'bg-gray-800/30'
          }`}
          onDragOver={(e) => handleDragOver(e)}
          onDragLeave={(e) => handleDragLeave(e)}
          onDrop={(e) => handleDrop(e)}
        >
          <div className="flex flex-wrap gap-2">
            {assignedMembers.map((member) => (
              <div
                key={member.id}
                draggable
                onDragStart={(e) => handleMemberDragStart(e, member)}
                className="flex items-center space-x-2 bg-gray-700/50 rounded-lg p-2 cursor-move hover:bg-gray-600/50 transition-colors"
              >
                <img
                  src={member.image}
                  alt={member.display}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-gray-300">{member.display}</span>
              </div>
            ))}
            {assignedMembers.length === 0 && (
              <div className="text-gray-500 text-sm text-center w-full">
                Glissez les membres ici pour former l'équipage
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
import React from 'react';
import MemberSearch from './MemberSearch';
import ShipSearchBar from './ShipSearchBar';
import { type Member } from '../../services/memberService';
import { type ShipTemplate } from '../../services/shipDatabase';

interface SidebarProps {
  operationName: string;
  setOperationName: (name: string) => void;
  savedOperations: string[];
  handleSave: () => void;
  handleUpdate: () => void;
  handleLoad: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAddShip: (ship: ShipTemplate) => void;
  onMemberSelect: (member: Member) => void;
  availableMembers: Member[];
  setAvailableMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  onCleanup: () => void;
}

export default function Sidebar({
  operationName,
  setOperationName,
  savedOperations,
  handleSave,
  handleUpdate,
  handleLoad,
  onAddShip,
  onMemberSelect,
  availableMembers,
  setAvailableMembers,
  onCleanup
}: SidebarProps) {
  return (
    <div className="w-80 bg-gray-900 text-white h-full border-r border-gray-800 flex flex-col overflow-y-auto">
      {/* Titre */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-gray-300 bg-clip-text text-transparent">
          Fleet Manager
        </h1>
      </div>

      {/* Gestion d’opérations */}
      <div className="px-6 py-4 space-y-4 border-b border-gray-800">
        <input
          type="text"
          placeholder="Nom de l'opération"
          value={operationName}
          onChange={(e) => setOperationName(e.target.value)}
          className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">💾</button>
          <button onClick={handleUpdate} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">🔄</button>
        </div>
        <select
          value={operationName}
          onChange={handleLoad}
          className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700"
        >
          <option value="">📂 Charger une opération</option>
          {savedOperations.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Recherche vaisseaux */}
      <div className="px-6 py-4 border-b border-gray-800">
        <ShipSearchBar onShipSelect={onAddShip} />
      </div>

      {/* Gestion des membres */}
      <div className="px-6 py-4">
        <MemberSearch
          onMemberSelect={onMemberSelect}
          availableMembers={availableMembers}
          setAvailableMembers={setAvailableMembers}
          onCleanup={onCleanup}
        />
      </div>
    </div>
  );
}

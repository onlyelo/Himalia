import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shipDatabaseService, type ShipTemplate } from '../services/shipDatabase';
import { type Member } from '../services/memberService';
import ShipSearchBar from '../components/fleet/ShipSearchBar';
import ShipCard from '../components/fleet/ShipCard';
import MemberSearch from '../components/fleet/MemberSearch';

export default function FleetManager() {
  const [selectedShips, setSelectedShips] = useState<ShipTemplate[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);

  useEffect(() => {
    shipDatabaseService.initializeDatabase();
  }, []);

  const handleAddShip = (ship: ShipTemplate) => {
    setSelectedShips([...selectedShips, ship]);
  };

  const handleRemoveShip = (index: number) => {
    setSelectedShips(selectedShips.filter((_, i) => i !== index));
  };

  const handleMemberSelect = (member: Member) => {
    setAvailableMembers(prev => [...prev, member]);
  };

  const handleMemberAssigned = (memberId: string) => {
    setAvailableMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleMemberUnassigned = (member: Member) => {
    setAvailableMembers(prev => [...prev, member]);
  };

  const handleCleanup = () => {
    setSelectedShips([]);
    setAvailableMembers([]);
  };

  return (
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-500 to-gray-300 bg-clip-text text-transparent">
            Fleet Manager
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Gérez et organisez votre flotte de vaisseaux
          </p>
        </motion.div>

        {/* Member Search */}
        <MemberSearch 
          onMemberSelect={handleMemberSelect}
          availableMembers={availableMembers}
          setAvailableMembers={setAvailableMembers}
          onCleanup={handleCleanup}
        />

        {/* Ship Search */}
        <div className="flex flex-wrap gap-4 mb-8">
          <ShipSearchBar onShipSelect={handleAddShip} />
        </div>

        {/* Ship Cards */}
        <AnimatePresence>
          <div className="space-y-6">
            {selectedShips.map((ship, index) => (
              <ShipCard
                key={`${ship.name}-${index}`}
                ship={ship}
                onDelete={() => handleRemoveShip(index)}
                onMemberAssigned={handleMemberAssigned}
                onMemberUnassigned={handleMemberUnassigned}
              />
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
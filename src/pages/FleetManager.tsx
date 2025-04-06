import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { shipDatabaseService, type ShipTemplate } from '../services/shipDatabase';
import { type Member } from '../services/memberService';
import ShipCard from '../components/fleet/ShipCard';
import Sidebar from '../components/fleet/Sidebar';
import { db } from "../utils/firebase";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

export default function FleetManager() {
  const [selectedShips, setSelectedShips] = useState<ShipTemplate[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [operationName, setOperationName] = useState("");
  const [savedOperations, setSavedOperations] = useState<string[]>([]);

  useEffect(() => {
    shipDatabaseService.initializeDatabase();
    fetchOperationNames();
  }, []);

  const fetchOperationNames = async () => {
    const querySnapshot = await getDocs(collection(db, "operations"));
    const names = querySnapshot.docs.map((doc) => doc.id);
    setSavedOperations(names);
  };

  const handleSave = async () => {
    if (!operationName.trim()) return alert("Donne un nom à l'opération");

    try {
      const shipsToSave = selectedShips.map(ship => ({
        ...ship,
        savedAt: new Date().toISOString()
      }));

      const batch = shipsToSave.map(async (ship) => {
        await setDoc(doc(db, `operations/${operationName}/ships`, ship.shipId), ship);
      });

      await Promise.all(batch);
      alert("Sauvegarde réussie !");
      fetchOperationNames();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  const handleUpdate = async () => {
    if (!operationName.trim()) return alert("Choisis une opération existante à mettre à jour");

    try {
      const shipsToUpdate = selectedShips.map(ship => ({
        ...ship,
        updatedAt: new Date().toISOString()
      }));

      const batch = shipsToUpdate.map(async (ship) => {
        await setDoc(doc(db, `operations/${operationName}/ships`, ship.shipId), ship);
      });

      await Promise.all(batch);
      alert("Mise à jour effectuée !");
    } catch (error) {
      console.error("Erreur lors de l'update :", error);
    }
  };

  const handleLoad = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setOperationName(selected);
    if (!selected) return;

    try {
      const querySnapshot = await getDocs(collection(db, `operations/${selected}/ships`));
      const loadedShips: ShipTemplate[] = querySnapshot.docs.map((doc) => doc.data() as ShipTemplate);
      setSelectedShips(loadedShips);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  };

  const handleAddShip = (ship: ShipTemplate) => {
    const defaultPosition = { x: 300, y: 200 };
    setSelectedShips([...selectedShips, { ...ship, position: defaultPosition }]);
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

  const handleShipUpdate = (shipId: string, updatedData: Partial<ShipTemplate>) => {
    setSelectedShips((prev) =>
      prev.map((ship) =>
        ship.shipId === shipId ? { ...ship, ...updatedData } : ship
      )
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        operationName={operationName}
        setOperationName={setOperationName}
        savedOperations={savedOperations}
        handleSave={handleSave}
        handleUpdate={handleUpdate}
        handleLoad={handleLoad}
        onAddShip={handleAddShip}
        onMemberSelect={handleMemberSelect}
        availableMembers={availableMembers}
        setAvailableMembers={setAvailableMembers}
        onCleanup={handleCleanup}
      />

      {/* Zone centrale */}
      <div className="flex-1 overflow-hidden">
        <div className="relative w-full h-full overflow-hidden">
          <AnimatePresence>
            {selectedShips.map((ship, index) => (
              <ShipCard
                key={`${ship.name}-${index}`}
                ship={ship}
                onDelete={() => handleRemoveShip(index)}
                onMemberAssigned={(memberId) => handleMemberAssigned(memberId)}
                onMemberUnassigned={(member) => handleMemberUnassigned(member)}
                onUpdate={(updatedData) => handleShipUpdate(ship.shipId, updatedData)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

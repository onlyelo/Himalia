import { db } from '../config/firebase';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';

export interface Ship {
  id: string;
  manufacturerName: string;
  name: string;
  username: string;
  status: 'Opérationnel' | 'En maintenance' | 'En mission' | 'Détruit';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const SHIPS_COLLECTION = 'ships';

export const fleetService = {
  async getFleet(): Promise<Ship[]> {
    try {
      const q = query(
        collection(db, SHIPS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ship));
    } catch (error) {
      console.error('Error fetching fleet:', error);
      throw new Error('Failed to fetch fleet');
    }
  },

  async addShip(shipData: Omit<Ship, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ship> {
    try {
      const timestamp = Timestamp.now();
      const docRef = await addDoc(collection(db, SHIPS_COLLECTION), {
        ...shipData,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      return {
        id: docRef.id,
        ...shipData,
        createdAt: timestamp,
        updatedAt: timestamp
      };
    } catch (error) {
      console.error('Error adding ship:', error);
      throw new Error('Failed to add ship');
    }
  },

  async updateShip(id: string, updates: Partial<Ship>): Promise<void> {
    try {
      const shipRef = doc(db, SHIPS_COLLECTION, id);
      await updateDoc(shipRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating ship:', error);
      throw new Error('Failed to update ship');
    }
  },

  async deleteShip(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, SHIPS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting ship:', error);
      throw new Error('Failed to delete ship');
    }
  },

  async getShipsByUser(username: string): Promise<Ship[]> {
    try {
      const q = query(
        collection(db, SHIPS_COLLECTION),
        where('username', '==', username),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ship));
    } catch (error) {
      console.error('Error fetching ships by user:', error);
      throw new Error('Failed to fetch ships by user');
    }
  },

  async importShips(ships: Omit<Ship, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Ship[]> {
    try {
      const timestamp = Timestamp.now();
      const importedShips: Ship[] = [];

      for (const shipData of ships) {
        const docRef = await addDoc(collection(db, SHIPS_COLLECTION), {
          ...shipData,
          createdAt: timestamp,
          updatedAt: timestamp
        });

        importedShips.push({
          id: docRef.id,
          ...shipData,
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }

      return importedShips;
    } catch (error) {
      console.error('Error importing ships:', error);
      throw new Error('Failed to import ships');
    }
  }
};
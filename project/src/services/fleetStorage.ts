import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export interface Reservation {
  id: string;
  shipId: string;
  requesterId: string;
  requesterName: string;
  purpose: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

export interface Ship {
  id: string;
  manufacturerName: string;
  name: string;
  username: string;
  userHandle?: string;
  status: 'Opérationnel' | 'En maintenance' | 'En mission' | 'Détruit';
  tags?: string[];
  isGroup?: boolean;
  count?: number;
  groupedShips?: Ship[];
  currentReservation?: Reservation;
  reservations?: Reservation[];
}

const STORAGE_KEY_PREFIX = 'himalia-fleet';
const RESERVATIONS_KEY = 'himalia-reservations';
const CHUNK_SIZE = 10; // Réduit pour éviter les problèmes de quota

export const fleetStorage = {
  getChunkKey(index: number): string {
    return `${STORAGE_KEY_PREFIX}-${index}`;
  },

  getFleet(): Ship[] {
    try {
      let ships: Ship[] = [];
      let index = 0;
      
      while (true) {
        const chunk = localStorage.getItem(this.getChunkKey(index));
        if (!chunk) break;
        
        const decompressed = decompressFromUTF16(chunk);
        if (!decompressed) break;
        
        const parsedChunk = JSON.parse(decompressed);
        if (!Array.isArray(parsedChunk)) throw new Error('Invalid chunk format');
        
        ships = [...ships, ...parsedChunk];
        index++;
      }

      // Load and attach reservations
      const reservations = this.getReservations();
      ships = ships.map(ship => ({
        ...ship,
        reservations: reservations.filter(r => r.shipId === ship.id),
        currentReservation: reservations.find(
          r => r.shipId === ship.id && 
          r.status === 'approved' && 
          new Date(r.endDate) > new Date()
        ),
      }));
      
      return ships;
    } catch (error) {
      console.error('Error loading fleet:', error);
      return [];
    }
  },

  getReservations(): Reservation[] {
    try {
      const data = localStorage.getItem(RESERVATIONS_KEY);
      if (!data) return [];
      
      const decompressed = decompressFromUTF16(data);
      if (!decompressed) return [];
      
      const parsed = JSON.parse(decompressed);
      if (!Array.isArray(parsed)) return [];
      
      return parsed;
    } catch (error) {
      console.error('Error loading reservations:', error);
      return [];
    }
  },

  saveReservations(reservations: Reservation[]): void {
    try {
      const compressed = compressToUTF16(JSON.stringify(reservations));
      localStorage.setItem(RESERVATIONS_KEY, compressed);
    } catch (error) {
      console.error('Error saving reservations:', error);
      throw new Error(`Failed to save reservations: ${error.message}`);
    }
  },

  addReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Reservation {
    const reservations = this.getReservations();
    const newReservation = {
      ...reservation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    this.saveReservations([...reservations, newReservation]);
    return newReservation;
  },

  updateReservation(id: string, updates: Partial<Reservation>): void {
    const reservations = this.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Reservation not found');
    
    reservations[index] = { ...reservations[index], ...updates };
    this.saveReservations(reservations);
  },

  saveFleet(fleet: Ship[]): void {
    try {
      // Clear existing chunks
      let index = 0;
      while (localStorage.getItem(this.getChunkKey(index)) !== null) {
        localStorage.removeItem(this.getChunkKey(index));
        index++;
      }

      // Remove reservations from ships before saving
      const shipsToSave = fleet.map(ship => {
        const { reservations, currentReservation, ...shipData } = ship;
        return shipData;
      });

      // Split fleet into smaller chunks
      for (let i = 0; i < shipsToSave.length; i += CHUNK_SIZE) {
        const chunk = shipsToSave.slice(i, i + CHUNK_SIZE);
        const compressed = compressToUTF16(JSON.stringify(chunk));
        const chunkIndex = Math.floor(i / CHUNK_SIZE);
        
        try {
          localStorage.setItem(this.getChunkKey(chunkIndex), compressed);
        } catch (e) {
          if (e.name === 'QuotaExceededError') {
            throw new Error('Storage space exceeded. Try reducing the fleet size or clearing some data.');
          }
          throw e;
        }
      }
    } catch (error) {
      console.error('Error saving fleet:', error);
      throw new Error(`Failed to save fleet data: ${error.message}`);
    }
  },

  importFromJSON(jsonData: any[]): Ship[] {
    try {
      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid JSON format: expected an array');
      }

      // Validate and transform the data
      const ships: Ship[] = jsonData.map((ship, index) => {
        if (typeof ship !== 'object' || ship === null) {
          throw new Error(`Invalid ship data at index ${index}: expected an object`);
        }

        if (!ship.name || typeof ship.name !== 'string') {
          throw new Error(`Invalid ship data at index ${index}: name is required and must be a string`);
        }

        if (!ship.manufacturerName || typeof ship.manufacturerName !== 'string') {
          throw new Error(`Invalid ship data at index ${index}: manufacturerName is required and must be a string`);
        }

        return {
          id: crypto.randomUUID(),
          manufacturerName: ship.manufacturerName,
          name: ship.name,
          username: ship.username || 'Non assigné',
          userHandle: ship.userHandle || '',
          status: ship.status || 'Opérationnel',
          tags: Array.isArray(ship.tags) ? ship.tags : []
        };
      });

      this.saveFleet(ships);
      return ships;
    } catch (error) {
      console.error('Error importing fleet:', error);
      throw new Error(`Failed to import fleet data: ${error.message}`);
    }
  },

  getShipsByMember(memberHandle: string): Ship[] {
    const fleet = this.getFleet();
    return fleet.filter(ship => 
      ship.username.toLowerCase() === memberHandle.toLowerCase() ||
      ship.userHandle?.toLowerCase() === memberHandle.toLowerCase()
    );
  },

  clearFleet(): void {
    try {
      let index = 0;
      while (localStorage.getItem(this.getChunkKey(index)) !== null) {
        localStorage.removeItem(this.getChunkKey(index));
        index++;
      }
      localStorage.removeItem(RESERVATIONS_KEY);
    } catch (error) {
      console.error('Error clearing fleet:', error);
      throw new Error('Failed to clear fleet data');
    }
  }
};
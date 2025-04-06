import Airtable from 'airtable';

// Configure Airtable with Personal Access Token
const airtable = new Airtable({
  apiKey: import.meta.env.VITE_AIRTABLE_PAT,
  endpointUrl: 'https://api.airtable.com'
});

console.log('Airtable configuration:', {
  pat: import.meta.env.VITE_AIRTABLE_PAT?.slice(0, 10) + '...',
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID
});

const base = airtable.base(import.meta.env.VITE_AIRTABLE_BASE_ID);

export interface Ship {
  id: string;
  manufacturerName: string;
  name: string;
  username: string;
  status: 'Opérationnel' | 'En maintenance' | 'En mission' | 'Détruit';
}

export const shipsService = {
  async getShips(): Promise<Ship[]> {
    try {
      console.log('Fetching ships from Airtable...');
      
      const records = await base('Ships').select({
        view: 'Grid view',
        maxRecords: 100
      }).all();
      
      console.log('Fetched records:', records.length);
      console.log('First record sample:', records[0]?.fields);
      
      return records.map(record => {
        const ship = {
          id: record.id,
          manufacturerName: record.get('manufacturerName') as string || '',
          name: record.get('name') as string || '',
          username: record.get('username') as string || '',
          status: record.get('status') as Ship['status'] || 'Opérationnel',
        };
        console.log('Mapped ship:', ship);
        return ship;
      });
    } catch (error) {
      console.error('Error fetching ships:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.statusCode,
        error: error.error
      });
      throw new Error('Impossible de récupérer la liste des vaisseaux');
    }
  },

  async createShip(ship: Omit<Ship, 'id'>): Promise<Ship> {
    try {
      console.log('Creating ship:', ship);
      
      const record = await base('Ships').create({
        fields: {
          manufacturerName: ship.manufacturerName,
          name: ship.name,
          username: ship.username,
          status: ship.status,
        }
      });

      console.log('Created record:', record);

      return {
        id: record.id,
        manufacturerName: record.get('manufacturerName') as string || '',
        name: record.get('name') as string || '',
        username: record.get('username') as string || '',
        status: record.get('status') as Ship['status'] || 'Opérationnel',
      };
    } catch (error) {
      console.error('Error creating ship:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.statusCode,
        error: error.error
      });
      throw new Error('Impossible de créer le vaisseau');
    }
  },

  async updateShip(id: string, updates: Partial<Ship>): Promise<Ship> {
    try {
      console.log('Updating ship:', { id, updates });
      
      const record = await base('Ships').update(id, {
        fields: {
          ...(updates.manufacturerName && { manufacturerName: updates.manufacturerName }),
          ...(updates.name && { name: updates.name }),
          ...(updates.username && { username: updates.username }),
          ...(updates.status && { status: updates.status }),
        }
      });

      console.log('Updated record:', record);

      return {
        id: record.id,
        manufacturerName: record.get('manufacturerName') as string || '',
        name: record.get('name') as string || '',
        username: record.get('username') as string || '',
        status: record.get('status') as Ship['status'] || 'Opérationnel',
      };
    } catch (error) {
      console.error('Error updating ship:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.statusCode,
        error: error.error
      });
      throw new Error('Impossible de mettre à jour le vaisseau');
    }
  },

  async deleteShip(id: string): Promise<void> {
    try {
      console.log('Deleting ship:', id);
      await base('Ships').destroy(id);
      console.log('Ship deleted successfully');
    } catch (error) {
      console.error('Error deleting ship:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.statusCode,
        error: error.error
      });
      throw new Error('Impossible de supprimer le vaisseau');
    }
  },

  async importFromJSON(jsonData: any[]): Promise<Ship[]> {
    try {
      console.log('Importing ships from JSON:', jsonData);
      
      const ships = await Promise.all(
        jsonData.map(async (shipData) => {
          console.log('Processing ship data:', shipData);
          
          const ship = await this.createShip({
            manufacturerName: shipData.manufacturerName,
            name: shipData.name,
            username: shipData.username || 'Non assigné',
            status: shipData.status || 'Opérationnel',
          });
          
          console.log('Imported ship:', ship);
          return ship;
        })
      );
      
      console.log('Import completed. Total ships:', ships.length);
      return ships;
    } catch (error) {
      console.error('Error importing ships:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.statusCode,
        error: error.error
      });
      throw new Error('Impossible d\'importer les vaisseaux');
    }
  }
};
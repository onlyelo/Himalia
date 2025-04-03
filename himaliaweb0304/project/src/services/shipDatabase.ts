import { db, storage } from '../config/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { parseCSVShips, type CSVShipData } from '../utils/csvParser';

export interface ShipTemplate {
  name: string;
  manufacturer: string;
  crew: number;
  type?: string;
  shipId: string;
  haveCaptain: boolean;
  imageUrl?: string;
}

const SHIPS_COLLECTION = 'shipTemplates';

// CSV data as a string
const csvData = `name,manufacturername,maxcrew,shipId,HaveCaptainTrueOrFalse
ARES ION,CRUSADER,1,4420,false
ARES INFERNO,CRUSADER,1,4420,false
GLADIUS,AEGIS,1,3902,false
POLARIS,RSI,14,3133,true
HAMMERHEAD,AEGIS,8,9382,true
CORSAIR,DRAKE,4,5293,true
ARROW,ANVIL,1,8740,false
C1,CRUSADER,1,3471,false
C2,CRUSADER,5,4101,true
M2,CRUSADER,5,4101,true
A2,CRUSADER,5,4101,true
RETALIATOR,AEGIS,7,6720,true
SABRE FIREBIRD,AEGIS,1,7842,false
PERSEUS,RSI,6,8868,true
REDEEMER,AEGIS,5,5663,true
SABRE,AEGIS,1,2101,false
SABRE COMET,AEGIS,1,2101,false
TALON,ESPERIA,1,6651,false
TALON SHRIKE,ESPERIA,1,6651,false
VALKYRIE,ANVIL,5,2290,true
VANGUARD HARBINGER,AEGIS,2,7878,false
VANGUARD WARDEN,AEGIS,2,7878,false
VANGUARD HOPLITE,AEGIS,2,7878,false
VANGUARD SENTINEL,AEGIS,2,7878,false
GLADIUS PIRATE,AEGIS,1,3902,false
PROSPECTOR,MISC,1,1045,false
RECLAIMER,AEGIS,5,4476,false
SCORPIUS,RSI,2,4221,false
SCORPIUS ANTARES,RSI,2,4221,false
VULTURE,DRAKE,1,9021,false
JAVELIN,AEGIS,72,9009,true
F8C,ANVIL,1,7874,false
C8 PISCES,ANVIL,1,7721,false
C8R RESCUE,ANVIL,1,7721,false
F7A MKII,ANVIL,1,8998,false
F7C MKII,ANVIL,1,8998,false
CONSTELLATION ANDROMEDA,RSI,4,4747,true
CONSTELLATION AQUILA,RSI,4,4747,true
CONSTELLATION TAURUS,RSI,4,4747,true
ZEUS,RSI,3,2134,true
ECLIPSE,AEGIS,1,6701,false
MANTIS,RSI,1,3927,false
IDRIS,AEGIS,28,6663,true
STARLANCER MAX,MISC,3,8782,true
F7C LEGACY,ANVIL,1,7873,false
DEFENDER,BANU,2,8202,false
MOLE,ARGO,4,7744,true
CUTLASS BLUE,DRAKE,2,0903,false
CUTLASS BLACK,DRAKE,2,0903,false
CUTLASS RED,DRAKE,2,0903,false
HURICANE,ANVIL,2,2014,false
HULL A,MISC,1,0000,false
HULL B,MISC,1,0000,false
HULL C,MISC,4,0092,true
HULL D,MISC,5,0092,true
HULL E,MISC,5,0092,true
FURY,MISC,1,9006,false
TERRAPIN,ANVIL,1,8843,false
TERRAPIN MEDICAL,ANVIL,2,8843,false
MERCURY STAR RUNNER,CRUSADER,3,5732,true
CARRACK,ANVIL,6,7782,true
890,Origin,5,9494,true
P-52,KRIG,1,0201,false
P-72,KRIG,1,0201,false
CATTERPILLAR,DRAKE,4,6492,true
100i,Origin,1,0000,false
125a,Origin,1,0000,false
135C,Origin,1,0000,false
300i,Origin,1,0000,false
315P,Origin,1,0000,false
325A,Origin,1,0000,false
350R,Origin,1,0000,false
400I,Origin,3,0000,true
600I,Origin,5,0000,true
85X,Origin,2,0000,false
APPOLO,RSI,2,0000,true
AURORA,RSI,1,0000,false
AVENGER,AEGIS,1,0000,false
BLADE,ESPERIA,1,0000,false
FREELANCER,MISC,4,0000,true
HAWK,ANVIL,1,0000,false
HERALD,DRAKE,1,0000,false
KRAKEN,DRAKE,10,0000,true
LEGIONAIRE,ANVIL,2,0000,false
LIBERATOR,ANVIL,2,0000,false
MPUV,ARGO,1,0000,false
MERCHANTMAN,BANU,8,0000,true
NAUTILUS,RSI,8,0000,true
MUSTANG,CNOU,1,0000,false
ODYSSEY,MISC,6,0000,true
ORION,RSI,7,0000,true
PIONEER,CNOU,8,0000,true
ARASTRA,RSI,6,0000,true
RAILEN,GATAC,4,0000,true
STARFARER,MISC,4,0000,true
RAZOR,MISC,1,0000,false
RELIANT,MISC,1,0000,false
SRV,ARGO,1,0000,false
SCYTE,VANDUUL,1,0000,false
STARFARER,MISC,8,0000,true
CUTTER,DRAKE,1,0000,false
LIBERATOR,ANVIL,5,0000,true
VULCAN,AEGIS,1,0000,false`;

// Parse CSV data into ship templates
const parsedShips = parseCSVShips(csvData);

// Convert CSV data to ShipTemplate format
const shipTemplates: ShipTemplate[] = parsedShips.map(ship => ({
  name: ship.name,
  manufacturer: ship.manufacturername,
  crew: ship.maxcrew,
  shipId: ship.shipId,
  haveCaptain: ship.HaveCaptainTrueOrFalse,
  type: 'Combat' // Default type, can be updated later
}));

export const shipDatabaseService = {
  async getShipImage(shipId: string): Promise<string | null> {
    if (shipId === '0000') return null;
    
    try {
      const imageRef = ref(storage, `ships/${shipId}.png`);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error fetching ship image:', error);
      return null;
    }
  },

  async initializeDatabase(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, SHIPS_COLLECTION));
      if (snapshot.empty) {
        // Add all ships with images
        const shipsWithImages = await Promise.all(
          shipTemplates.map(async (ship) => {
            const imageUrl = await this.getShipImage(ship.shipId);
            return {
              ...ship,
              imageUrl: imageUrl || undefined
            };
          })
        );

        const batch = shipsWithImages.map(ship => 
          addDoc(collection(db, SHIPS_COLLECTION), ship)
        );
        await Promise.all(batch);
      }
    } catch (error) {
      console.error('Error initializing ship database:', error);
      throw new Error('Failed to initialize ship database');
    }
  },

  async searchShips(searchTerm: string): Promise<ShipTemplate[]> {
    try {
      if (!searchTerm) return [];
      
      const searchTermLower = searchTerm.toLowerCase();
      const filteredShips = shipTemplates.filter(ship => 
        ship.name.toLowerCase().includes(searchTermLower) ||
        ship.manufacturer.toLowerCase().includes(searchTermLower)
      );

      // Fetch images for filtered ships
      return await Promise.all(
        filteredShips.map(async (ship) => ({
          ...ship,
          imageUrl: await this.getShipImage(ship.shipId)
        }))
      );
    } catch (error) {
      console.error('Error searching ships:', error);
      return [];
    }
  },

  async getAllShips(): Promise<ShipTemplate[]> {
    return await Promise.all(
      shipTemplates.map(async (ship) => ({
        ...ship,
        imageUrl: await this.getShipImage(ship.shipId)
      }))
    );
  }
};
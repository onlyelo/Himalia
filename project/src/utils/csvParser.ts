export interface CSVShipData {
  name: string;
  manufacturername: string;
  maxcrew: number;
  shipId: string;
  HaveCaptainTrueOrFalse: boolean;
}

export function parseCSVShips(csvContent: string): CSVShipData[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const ships: CSVShipData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= 5) {
      const ship: CSVShipData = {
        name: values[0],
        manufacturername: values[1],
        maxcrew: parseInt(values[2]) || 1,
        shipId: values[3] || '0000',
        HaveCaptainTrueOrFalse: values[4]?.toLowerCase() === 'true'
      };
      ships.push(ship);
    }
  }

  return ships;
}
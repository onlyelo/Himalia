import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

interface Member {
  id: string;
  display?: string;
  handle?: string;
  image?: string;
  rank?: string;
  stars?: number;
  roles?: string;
}

const STORAGE_KEY_PREFIX = 'himalia-members';
const CHUNK_SIZE = 100;

export const memberStorage = {
  getChunkKey(index: number): string {
    return `${STORAGE_KEY_PREFIX}-${index}`;
  },

  getMembers(): Member[] {
    try {
      let members: Member[] = [];
      let index = 0;
      
      while (true) {
        const chunk = localStorage.getItem(this.getChunkKey(index));
        if (!chunk) break;
        
        const decompressed = decompressFromUTF16(chunk);
        if (!decompressed) break;
        
        members = [...members, ...JSON.parse(decompressed)];
        index++;
      }
      
      return members;
    } catch (error) {
      console.warn('Error loading members:', error);
      return [];
    }
  },

  saveMembers(members: Member[]): void {
    try {
      // Clear existing chunks
      let index = 0;
      while (localStorage.getItem(this.getChunkKey(index)) !== null) {
        localStorage.removeItem(this.getChunkKey(index));
        index++;
      }

      // Split members into chunks and save
      for (let i = 0; i < members.length; i += CHUNK_SIZE) {
        const chunk = members.slice(i, i + CHUNK_SIZE);
        const compressed = compressToUTF16(JSON.stringify(chunk));
        const chunkIndex = Math.floor(i / CHUNK_SIZE);
        
        try {
          localStorage.setItem(this.getChunkKey(chunkIndex), compressed);
        } catch (e) {
          if (e.name === 'QuotaExceededError') {
            throw new Error('Espace de stockage insuffisant. Essayez de réduire le nombre de membres ou de supprimer des données inutilisées.');
          }
          throw e;
        }
      }
    } catch (error) {
      console.error('Error saving members:', error);
      throw new Error(`Échec de la sauvegarde des membres: ${error.message}`);
    }
  },

  addMember(member: Omit<Member, 'id'>): Member {
    try {
      const members = this.getMembers();
      const newMember = {
        id: crypto.randomUUID(),
        display: member.display || 'Anonyme',
        handle: member.handle || '',
        image: member.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167',
        rank: member.rank || 'Recrue',
        stars: member.stars || 0,
        roles: member.roles || ''
      };
      
      members.push(newMember);
      this.saveMembers(members);
      return newMember;
    } catch (error) {
      throw new Error(`Impossible d'ajouter le membre: ${error.message}`);
    }
  },

  updateMember(id: string, updates: Partial<Member>): Member {
    try {
      const members = this.getMembers();
      const index = members.findIndex(m => m.id === id);
      if (index === -1) throw new Error('Membre non trouvé');
      
      members[index] = { ...members[index], ...updates };
      this.saveMembers(members);
      return members[index];
    } catch (error) {
      throw new Error(`Impossible de mettre à jour le membre: ${error.message}`);
    }
  },

  deleteMember(id: string): void {
    try {
      const members = this.getMembers();
      const filtered = members.filter(m => m.id !== id);
      this.saveMembers(filtered);
    } catch (error) {
      throw new Error(`Impossible de supprimer le membre: ${error.message}`);
    }
  },

  importFromCSV(csvContent: string): Member[] {
    const lines = csvContent.split('\n');
    if (lines.length < 2) {
      throw new Error('Le fichier CSV est vide ou invalide');
    }

    // Get headers from first line and normalize them
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const validHeaders = ['display', 'handle', 'image', 'rank', 'stars', 'roles'];
    
    // Map CSV headers to valid fields, allowing for partial matches
    const headerMap = headers.map(h => {
      const match = validHeaders.find(vh => h.includes(vh));
      return match || null;
    });

    // Parse members
    const members = this.getMembers();
    const newMembers: Member[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = line.split(',').map(v => v.trim());
        const memberData: any = {};

        headerMap.forEach((header, index) => {
          if (header && values[index]) {
            memberData[header] = values[index];
          }
        });

        // Handle stars conversion with fallback
        if ('stars' in memberData) {
          const stars = parseInt(memberData.stars, 10);
          memberData.stars = isNaN(stars) ? 0 : Math.min(Math.max(stars, 0), 5);
        }

        // Create member with defaults for missing fields
        const newMember: Member = {
          id: crypto.randomUUID(),
          display: memberData.display || 'Anonyme',
          handle: memberData.handle || '',
          image: memberData.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167',
          rank: memberData.rank || 'Recrue',
          stars: memberData.stars || 0,
          roles: memberData.roles || ''
        };

        // Check for duplicates
        const existingIndex = members.findIndex(m => 
          (m.handle && m.handle === newMember.handle) || 
          (m.display && m.display === newMember.display)
        );

        if (existingIndex >= 0) {
          members[existingIndex] = { ...members[existingIndex], ...newMember };
          warnings.push(`Ligne ${i + 1}: Membre existant mis à jour - ${newMember.display}`);
        } else {
          newMembers.push(newMember);
        }
      } catch (error) {
        errors.push(`Ligne ${i + 1}: ${error.message}`);
      }
    }

    // Save all members
    try {
      this.saveMembers([...members, ...newMembers]);
    } catch (error) {
      throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
    }

    // Log import results
    console.info(`Import terminé:
      ${newMembers.length} nouveaux membres ajoutés
      ${warnings.length} avertissements
      ${errors.length} erreurs
      Total membres: ${members.length + newMembers.length}
    `);

    return this.getMembers();
  }
};
import { db, storage } from '../config/firebase';
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
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import stringSimilarity from 'string-similarity';

export interface Member {
  id: string;
  display: string;
  handle?: string;
  image: string;
  rank: string;
  stars: number;
  roles?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const MEMBERS_COLLECTION = 'members';
const PROTECTED_MEMBER_NAME = 'Yelo';

export const memberService = {
  async getMembers(): Promise<Member[]> {
    try {
      const q = query(
        collection(db, MEMBERS_COLLECTION),
        orderBy('display', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Member));
    } catch (error) {
      console.error('Error fetching members:', error);
      throw new Error('Impossible de récupérer les membres');
    }
  },

  async getMemberById(id: string): Promise<Member | null> {
    try {
      const docRef = doc(db, MEMBERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Member;
      }
      return null;
    } catch (error) {
      console.error('Error fetching member by id:', error);
      throw new Error('Impossible de récupérer le membre');
    }
  },

  async addMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
    try {
      // Vérifier les doublons
      const existingMembers = await this.getMembers();
      const similarityThreshold = 0.8;

      const potentialDuplicate = existingMembers.find(existingMember => {
        const displaySimilarity = stringSimilarity.compareTwoStrings(
          existingMember.display.toLowerCase(),
          memberData.display.toLowerCase()
        );
        return displaySimilarity > similarityThreshold;
      });

      if (potentialDuplicate) {
        throw new Error(`Un membre similaire existe déjà: ${potentialDuplicate.display}`);
      }

      const timestamp = Timestamp.now();
      const docRef = await addDoc(collection(db, MEMBERS_COLLECTION), {
        ...memberData,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      return {
        id: docRef.id,
        ...memberData,
        createdAt: timestamp,
        updatedAt: timestamp
      };
    } catch (error) {
      console.error('Error adding member:', error);
      throw error instanceof Error ? error : new Error('Impossible d\'ajouter le membre');
    }
  },

  async updateMember(id: string, updates: Partial<Member>): Promise<void> {
    try {
      const memberRef = doc(db, MEMBERS_COLLECTION, id);
      await updateDoc(memberRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating member:', error);
      throw new Error('Impossible de mettre à jour le membre');
    }
  },

  async deleteMember(id: string): Promise<void> {
    try {
      const member = await this.getMemberById(id);
      if (!member) {
        throw new Error('Membre non trouvé');
      }

      if (member.display === PROTECTED_MEMBER_NAME) {
        throw new Error('Ce profil ne peut pas être supprimé');
      }

      // Supprimer l'image si elle existe
      if (member.image && member.image.includes('firebasestorage')) {
        try {
          const imageRef = ref(storage, member.image);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting member image:', error);
          // Continue with member deletion even if image deletion fails
        }
      }

      await deleteDoc(doc(db, MEMBERS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error instanceof Error ? error : new Error('Impossible de supprimer le membre');
    }
  },

  async importFromCSV(csvContent: string): Promise<void> {
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('Le fichier CSV est vide ou invalide');
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const requiredFields = ['display', 'rank', 'stars'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));

      if (missingFields.length > 0) {
        throw new Error(`Champs requis manquants: ${missingFields.join(', ')}`);
      }

      const existingMembers = await this.getMembers();
      const timestamp = Timestamp.now();

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const memberData: any = {};

        headers.forEach((header, index) => {
          if (values[index]) {
            memberData[header] = header === 'stars' ? parseInt(values[index], 10) : values[index];
          }
        });

        // Vérifier les doublons
        const potentialDuplicate = existingMembers.find(existingMember => {
          const similarity = stringSimilarity.compareTwoStrings(
            existingMember.display.toLowerCase(),
            memberData.display.toLowerCase()
          );
          return similarity > 0.8;
        });

        if (!potentialDuplicate) {
          await addDoc(collection(db, MEMBERS_COLLECTION), {
            ...memberData,
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      }
    } catch (error) {
      console.error('Error importing members from CSV:', error);
      throw error instanceof Error ? error : new Error('Erreur lors de l\'import CSV');
    }
  }
};
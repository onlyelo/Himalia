import { db, storage } from '../config/firebase';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface Tool {
  id: string;
  name: string;
  description: string;
  image: string;
  url: string;
  status: 'En ligne' | 'Hors ligne';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const TOOLS_COLLECTION = 'tools';

export const toolService = {
  async getTools(): Promise<Tool[]> {
    try {
      const q = query(
        collection(db, TOOLS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Tool));
    } catch (error) {
      console.error('Error fetching tools:', error);
      throw new Error('Impossible de récupérer les outils');
    }
  },

  async uploadImage(file: File): Promise<string> {
    try {
      const storageRef = ref(storage, `tools/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Impossible de télécharger l\'image');
    }
  },

  async deleteImage(imageUrl: string) {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Ne pas bloquer la suppression de l'outil si l'image ne peut pas être supprimée
    }
  },

  async addTool(toolData: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tool> {
    try {
      const timestamp = Timestamp.now();
      const docRef = await addDoc(collection(db, TOOLS_COLLECTION), {
        ...toolData,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      return {
        id: docRef.id,
        ...toolData,
        createdAt: timestamp,
        updatedAt: timestamp
      };
    } catch (error) {
      console.error('Error adding tool:', error);
      throw new Error('Impossible d\'ajouter l\'outil');
    }
  },

  async updateTool(id: string, updates: Partial<Tool>): Promise<void> {
    try {
      const toolRef = doc(db, TOOLS_COLLECTION, id);
      await updateDoc(toolRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating tool:', error);
      throw new Error('Impossible de mettre à jour l\'outil');
    }
  },

  async deleteTool(id: string, imageUrl: string): Promise<void> {
    try {
      // Supprimer l'image d'abord
      if (imageUrl) {
        await this.deleteImage(imageUrl);
      }
      // Puis supprimer le document
      await deleteDoc(doc(db, TOOLS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting tool:', error);
      throw new Error('Impossible de supprimer l\'outil');
    }
  }
};
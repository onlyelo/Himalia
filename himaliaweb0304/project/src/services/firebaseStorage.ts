import { db, storage } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  where 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';

export interface FirebaseDocument {
  id: string;
  [key: string]: any;
}

export const firebaseStorage = {
  // Collection générique CRUD
  async getCollection(collectionName: string): Promise<FirebaseDocument[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      throw error;
    }
  },

  async addDocument(collectionName: string, data: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  },

  async updateDocument(collectionName: string, id: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Gestion des fichiers
  async uploadFile(path: string, file: File): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Requêtes spécifiques
  async queryDocuments(
    collectionName: string, 
    field: string, 
    operator: any, 
    value: any
  ): Promise<FirebaseDocument[]> {
    try {
      const q = query(
        collection(db, collectionName),
        where(field, operator, value)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  }
};
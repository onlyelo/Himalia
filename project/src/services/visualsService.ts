import { db, storage } from '../config/firebase';
import { 
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getVisuals, setVisuals as setLocalVisuals, type VisualConfig } from '../config/visuals';

const VISUALS_DOC_ID = 'main';
const VISUALS_COLLECTION = 'visuals';

export const visualsService = {
  async getVisuals(): Promise<VisualConfig> {
    try {
      const docRef = doc(db, VISUALS_COLLECTION, VISUALS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as VisualConfig;
        setLocalVisuals(data);
        return data;
      }
      
      const defaultVisuals = getVisuals();
      await this.setVisuals(defaultVisuals);
      return defaultVisuals;
    } catch (error) {
      console.error('Error getting visuals:', error);
      return getVisuals();
    }
  },

  async setVisuals(visuals: Partial<VisualConfig>): Promise<void> {
    try {
      const docRef = doc(db, VISUALS_COLLECTION, VISUALS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          ...visuals,
          updatedAt: Timestamp.now()
        });
      } else {
        await setDoc(docRef, {
          ...visuals,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }

      setLocalVisuals(visuals);
    } catch (error) {
      console.error('Error setting visuals:', error);
      throw new Error('Failed to update visuals configuration');
    }
  },

  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, `visuals/${path}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  },

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  },

  async resetToDefault(key: keyof VisualConfig): Promise<void> {
    try {
      const defaultVisuals = getVisuals();
      await this.setVisuals({ [key]: defaultVisuals[key] });
    } catch (error) {
      console.error('Error resetting visual:', error);
      throw new Error('Failed to reset visual');
    }
  },

  async syncWithFirestore(): Promise<void> {
    try {
      const localVisuals = getVisuals();
      await this.setVisuals(localVisuals);
    } catch (error) {
      console.error('Error syncing visuals with Firestore:', error);
      throw new Error('Failed to sync visuals with Firestore');
    }
  }
};
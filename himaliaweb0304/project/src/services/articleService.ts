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
  Timestamp,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { compressImage } from '../utils/imageCompression';

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  status: 'draft' | 'published';
  publishedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const ARTICLES_COLLECTION = 'articles';

export const articleService = {
  async getArticles(includeUnpublished = false): Promise<Article[]> {
    try {
      let q = query(collection(db, ARTICLES_COLLECTION));
      
      if (!includeUnpublished) {
        q = query(
          collection(db, ARTICLES_COLLECTION),
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw new Error('Failed to fetch articles');
    }
  },

  async uploadImage(file: File): Promise<string> {
    try {
      const compressedFile = await compressImage(file);
      const storageRef = ref(storage, `articles/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, compressedFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  },

  async createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    try {
      const timestamp = serverTimestamp();
      const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
        ...articleData,
        createdAt: timestamp,
        updatedAt: timestamp,
        publishedAt: articleData.status === 'published' ? timestamp : null
      });

      return {
        id: docRef.id,
        ...articleData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        publishedAt: articleData.status === 'published' ? Timestamp.now() : null
      };
    } catch (error) {
      console.error('Error creating article:', error);
      throw new Error('Failed to create article');
    }
  },

  async updateArticle(id: string, updates: Partial<Article>): Promise<void> {
    try {
      const articleRef = doc(db, ARTICLES_COLLECTION, id);
      const timestamp = serverTimestamp();
      
      await updateDoc(articleRef, {
        ...updates,
        updatedAt: timestamp,
        publishedAt: updates.status === 'published' ? timestamp : null
      });
    } catch (error) {
      console.error('Error updating article:', error);
      throw new Error('Failed to update article');
    }
  },

  async deleteArticle(id: string, imageUrl?: string): Promise<void> {
    try {
      // Delete image if it exists
      if (imageUrl) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      // Delete article document
      await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting article:', error);
      throw new Error('Failed to delete article');
    }
  }
};
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
  where,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import stringSimilarity from 'string-similarity';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  url: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp;
  originalId?: string; // ID original de l'article WP
  slug?: string; // URL slug pour éviter les doublons
}

const ARTICLES_COLLECTION = 'articles';
const ARTICLES_STORAGE = 'articles';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const SIMILARITY_THRESHOLD = 0.8; // Seuil de similarité pour détecter les doublons

// Fonction utilitaire pour nettoyer et normaliser le texte
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // Supprime les balises HTML
    .replace(/[^a-z0-9\s]/g, '') // Garde uniquement les lettres, chiffres et espaces
    .replace(/\s+/g, ' ') // Normalise les espaces
    .trim();
};

// Fonction pour créer un slug unique
const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const blogService = {
  async getArticles(): Promise<Article[]> {
    try {
      const q = query(
        collection(db, ARTICLES_COLLECTION),
        orderBy('publishedAt', 'desc'),
        where('publishedAt', '<=', Timestamp.now())
      );
      
      const querySnapshot = await getDocs(q);
      const articles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));

      if (articles.length === 0) {
        await this.checkAndUpdateArticles();
        const newSnapshot = await getDocs(q);
        return newSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Article));
      }

      return articles;
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  },

  async isDuplicate(title: string, excerpt: string, originalId?: string): Promise<boolean> {
    try {
      const articles = await this.getArticles();
      const normalizedNewTitle = normalizeText(title);
      const normalizedNewExcerpt = normalizeText(excerpt);

      // Si on a un ID original, vérifier s'il existe déjà
      if (originalId) {
        const existingArticle = articles.find(a => a.originalId === originalId);
        if (existingArticle) return true;
      }

      // Vérifier la similarité avec les articles existants
      return articles.some(article => {
        const titleSimilarity = stringSimilarity.compareTwoStrings(
          normalizedNewTitle,
          normalizeText(article.title)
        );
        const excerptSimilarity = stringSimilarity.compareTwoStrings(
          normalizedNewExcerpt,
          normalizeText(article.excerpt)
        );

        return titleSimilarity > SIMILARITY_THRESHOLD || excerptSimilarity > SIMILARITY_THRESHOLD;
      });
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  },

  async uploadImage(file: File): Promise<string> {
    try {
      const storageRef = ref(storage, `${ARTICLES_STORAGE}/${Date.now()}_${file.name}`);
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
    }
  },

  async addArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
    try {
      // Vérifier les doublons
      const isDuplicate = await this.isDuplicate(articleData.title, articleData.excerpt, articleData.originalId);
      if (isDuplicate) {
        throw new Error('Un article similaire existe déjà');
      }

      const timestamp = Timestamp.now();
      const slug = createSlug(articleData.title);
      
      const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
        ...articleData,
        slug,
        createdAt: timestamp,
        updatedAt: timestamp
      });

      return {
        id: docRef.id,
        ...articleData,
        slug,
        createdAt: timestamp,
        updatedAt: timestamp
      };
    } catch (error) {
      console.error('Error adding article:', error);
      throw error instanceof Error ? error : new Error('Impossible d\'ajouter l\'article');
    }
  },

  async updateArticle(id: string, updates: Partial<Article>): Promise<void> {
    try {
      if (updates.title || updates.excerpt) {
        const isDuplicate = await this.isDuplicate(
          updates.title || '',
          updates.excerpt || ''
        );
        if (isDuplicate) {
          throw new Error('Un article similaire existe déjà');
        }
      }

      const articleRef = doc(db, ARTICLES_COLLECTION, id);
      const updates2 = { ...updates };
      
      if (updates.title) {
        updates2.slug = createSlug(updates.title);
      }

      await updateDoc(articleRef, {
        ...updates2,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating article:', error);
      throw error instanceof Error ? error : new Error('Impossible de mettre à jour l\'article');
    }
  },

  async deleteArticle(id: string, imageUrl: string): Promise<void> {
    try {
      if (imageUrl) {
        await this.deleteImage(imageUrl);
      }
      await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting article:', error);
      throw new Error('Impossible de supprimer l\'article');
    }
  },

  async checkAndUpdateArticles(): Promise<void> {
    try {
      const wormholeUrl = encodeURIComponent('https://www.wormholetribune.com/wp-json/wp/v2/posts?_embed&per_page=3');
      const response = await fetch(`${CORS_PROXY}${wormholeUrl}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles from Wormhole Tribune');
      }

      const posts = await response.json();
      const batch = writeBatch(db);

      // Récupérer les articles existants pour vérification des doublons
      const existingArticles = await this.getArticles();

      for (const post of posts) {
        const normalizedTitle = normalizeText(post.title.rendered);
        const normalizedExcerpt = normalizeText(post.excerpt.rendered);
        
        // Vérifier si l'article existe déjà
        const isDuplicate = existingArticles.some(article => {
          const titleSimilarity = stringSimilarity.compareTwoStrings(
            normalizedTitle,
            normalizeText(article.title)
          );
          const excerptSimilarity = stringSimilarity.compareTwoStrings(
            normalizedExcerpt,
            normalizeText(article.excerpt)
          );
          return titleSimilarity > SIMILARITY_THRESHOLD || excerptSimilarity > SIMILARITY_THRESHOLD;
        });

        if (!isDuplicate) {
          const docRef = doc(collection(db, ARTICLES_COLLECTION));
          const article = {
            title: post.title.rendered,
            excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, ''),
            author: 'Wormhole Tribune',
            date: new Date(post.date).toLocaleDateString('fr-FR'),
            readTime: '3 min de lecture',
            image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
                  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa',
            url: post.link,
            originalId: post.id.toString(),
            slug: createSlug(post.title.rendered),
            publishedAt: Timestamp.fromDate(new Date(post.date)),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };
          batch.set(docRef, article);
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating articles:', error);
    }
  }
};
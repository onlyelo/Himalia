import { blogService } from '../services/blogService';

// Vérifie si la dernière mise à jour a été effectuée il y a plus de 24h
const shouldUpdate = () => {
  const lastUpdate = localStorage.getItem('lastArticlesUpdate');
  if (!lastUpdate) return true;

  const lastUpdateDate = new Date(lastUpdate);
  const now = new Date();
  const diffHours = Math.abs(now.getTime() - lastUpdateDate.getTime()) / 36e5;
  
  return diffHours >= 24;
};

// Fonction pour mettre à jour les articles
export const checkAndUpdateArticles = async () => {
  if (shouldUpdate()) {
    try {
      await blogService.checkAndUpdateArticles();
      localStorage.setItem('lastArticlesUpdate', new Date().toISOString());
    } catch (error) {
      console.error('Error in automatic articles update:', error);
    }
  }
};

// Initialise la vérification quotidienne
export const initializeArticleUpdates = () => {
  // Vérifie au chargement
  checkAndUpdateArticles();

  // Configure la vérification quotidienne
  setInterval(checkAndUpdateArticles, 24 * 60 * 60 * 1000);
};
import { useState, useEffect } from 'react';
import { articleService, type Article } from '../services/articleService';

export function useArticles(includeUnpublished = false) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, [includeUnpublished]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await articleService.getArticles(includeUnpublished);
      setArticles(data);
      setError(null);
    } catch (err) {
      setError('Error loading articles');
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshArticles = () => loadArticles();

  return { articles, loading, error, refreshArticles };
}
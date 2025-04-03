import { type Article } from '../services/articleService';

export function sortArticlesByDate(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const dateA = a.publishedAt?.toDate() || new Date(0);
    const dateB = b.publishedAt?.toDate() || new Date(0);
    return dateB.getTime() - dateA.getTime();
  });
}

export function filterPublishedArticles(articles: Article[]): Article[] {
  return articles.filter(article => article.status === 'published');
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}
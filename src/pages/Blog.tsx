import React from 'react';
import { Loader } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import ArticleHeader from '../components/articles/ArticleHeader';
import ArticleList from '../components/articles/ArticleList';
import { filterPublishedArticles, sortArticlesByDate } from '../utils/articleHelpers';

export default function Blog() {
  const { articles, loading, error } = useArticles();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const sortedArticles = sortArticlesByDate(filterPublishedArticles(articles));

  return (
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <ArticleHeader />

        {error ? (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        ) : (
          <ArticleList articles={sortedArticles} />
        )}
      </div>
    </div>
  );
}
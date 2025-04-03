import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ArticleCard from './ArticleCard';
import { type Article } from '../../services/articleService';

interface ArticleListProps {
  articles: Article[];
}

export default function ArticleList({ articles }: ArticleListProps) {
  return (
    <AnimatePresence>
      <div className="grid gap-8">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </AnimatePresence>
  );
}
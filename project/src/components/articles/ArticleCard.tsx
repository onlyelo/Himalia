import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, ExternalLink } from 'lucide-react';
import { type Article } from '../../services/articleService';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 transform hover:scale-[1.02] transition-all duration-300"
    >
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="md:flex">
          <div className="md:w-1/3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-800/20 z-10" />
            <img
              src={article.image}
              alt={article.title}
              className="h-48 w-full object-cover md:h-full transform hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa';
              }}
            />
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-semibold text-gray-100 mb-2 group-hover:text-accent transition-colors">
                {article.title}
              </h2>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-accent transition-colors" />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {article.author}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(article.publishedAt?.toDate() || '').toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {article.readTime || '5 min'}
              </span>
            </div>
            <p className="text-gray-400 mb-4">{article.excerpt}</p>
            <div className="flex items-center text-accent hover:text-accent/80 transition-colors">
              <span className="mr-2">Lire la suite</span>
              <ExternalLink className="h-4 w-4" />
            </div>
          </div>
        </div>
      </a>
    </motion.article>
  );
}
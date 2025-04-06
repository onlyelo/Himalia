import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, Clock } from 'lucide-react';
import { articleService, type Article } from '../../services/articleService';
import ArticleEditor from './ArticleEditor';

export default function ArticleManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await articleService.getArticles(true);
      setArticles(data);
    } catch (error) {
      setError('Error loading articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (article: Article) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await articleService.deleteArticle(article.id, article.image);
      await loadArticles();
    } catch (error) {
      setError('Error deleting article');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const handleSave = async () => {
    await loadArticles();
    setShowEditor(false);
    setEditingArticle(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Verse News</h1>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center px-4 py-2 bg-accent hover:bg-accent/90 rounded-md transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Article
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {articles.map((article) => (
          <motion.div
            key={article.id}
            layout
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden"
          >
            <div className="flex">
              {article.image && (
                <div className="w-48 h-48">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">{article.title}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        article.status === 'published'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {article.status}
                      </span>
                      <span className="text-sm text-gray-400 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {article.updatedAt.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(article)}
                      className="p-2 text-gray-400 hover:text-accent transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(article)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 mt-4">{article.excerpt}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showEditor && (
        <ArticleEditor
          article={editingArticle || undefined}
          onClose={() => {
            setShowEditor(false);
            setEditingArticle(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
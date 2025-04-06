import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Save, Eye, Send } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { articleService, type Article } from '../../services/articleService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleEditorProps {
  article?: Article;
  onClose: () => void;
  onSave: () => void;
}

export default function ArticleEditor({ article, onClose, onSave }: ArticleEditorProps) {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    excerpt: article?.excerpt || '',
    image: article?.image || '',
    author: article?.author || '',
    status: article?.status || 'draft'
  });

  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setLoading(true);
      const imageUrl = await articleService.uploadImage(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    } catch (error) {
      setError('Error uploading image');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  });

  const handleSubmit = async (status: 'draft' | 'published') => {
    try {
      setLoading(true);
      setError(null);

      if (article) {
        await articleService.updateArticle(article.id, {
          ...formData,
          status
        });
      } else {
        await articleService.createArticle({
          ...formData,
          status
        });
      }

      onSave();
    } catch (error) {
      setError('Error saving article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg w-full max-w-4xl h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-100">
              {article ? 'Edit Article' : 'New Article'}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreview(!preview)}
                className="flex items-center px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                <Eye className="h-4 w-4 mr-2" />
                {preview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </button>
              <button
                onClick={() => handleSubmit('published')}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-accent rounded-md hover:bg-accent/90"
              >
                <Send className="h-4 w-4 mr-2" />
                Publish
              </button>
              <button onClick={onClose}>
                <X className="h-6 w-6 text-gray-400 hover:text-gray-200" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 text-red-500">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {preview ? (
              <div className="prose prose-invert max-w-none">
                <h1>{formData.title}</h1>
                {formData.image && (
                  <img
                    src={formData.image}
                    alt={formData.title}
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                )}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formData.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Title"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300"
                />

                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-700 rounded-lg p-4 hover:border-accent transition-colors cursor-pointer"
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full max-h-64 object-cover rounded-lg mb-2"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                    )}
                    <p className="text-sm text-gray-400">
                      Drag & drop an image or click to select
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.author}
                  onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Author"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300"
                />

                <textarea
                  value={formData.excerpt}
                  onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Excerpt"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300"
                  rows={3}
                />

                <textarea
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Content (Markdown supported)"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 font-mono"
                  rows={15}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
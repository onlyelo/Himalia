import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

function BlogManager() {
  const articles = [
    {
      id: 1,
      title: 'Succès de l\'Opération Frappe Profonde',
      status: 'Publié',
      date: '15/03/2024',
      author: 'Sarah Chen',
    },
    {
      id: 2,
      title: 'Nouvelle Acquisition de Flotte',
      status: 'Brouillon',
      date: '12/03/2024',
      author: 'Mike Johnson',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Gestion du Blog</h1>
        <button className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          Nouvel Article
        </button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-3">Titre</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Auteur</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-gray-700 last:border-0">
                  <td className="py-4 text-gray-300">{article.title}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      article.status === 'Publié'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="py-4 text-gray-400">{article.date}</td>
                  <td className="py-4 text-gray-400">{article.author}</td>
                  <td className="py-4">
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BlogManager;
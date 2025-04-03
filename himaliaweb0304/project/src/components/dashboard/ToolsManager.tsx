import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { toolService, type Tool } from '../../services/toolService';
import AddToolModal from './AddToolModal';

function ToolsManager() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      const data = await toolService.getTools();
      setTools(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des outils');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    try {
      await toolService.deleteTool(id, imageUrl);
      await loadTools();
      setShowDeleteConfirm(null);
      setSuccess('Outil supprimé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Erreur lors de la suppression de l\'outil');
    }
  };

  const handleToolAdded = async () => {
    await loadTools();
    setSuccess('Outil ajouté avec succès');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleToolUpdated = async () => {
    await loadTools();
    setSuccess('Outil mis à jour avec succès');
    setTimeout(() => setSuccess(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Gestion des Outils</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvel Outil
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-500">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700"
          >
            <div className="flex items-start space-x-4 p-4">
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">{tool.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                      tool.status === 'En ligne'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {tool.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTool(tool)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {showDeleteConfirm === tool.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDelete(tool.id, tool.image)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(tool.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <p className="text-gray-400 mt-2">{tool.description}</p>
                <div className="mt-4">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:text-red-400"
                  >
                    {tool.url}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(showAddModal || editingTool) && (
        <AddToolModal
          onClose={() => {
            setShowAddModal(false);
            setEditingTool(null);
          }}
          onToolAdded={handleToolAdded}
          onToolUpdated={handleToolUpdated}
          editTool={editingTool}
        />
      )}
    </div>
  );
}

export default ToolsManager;
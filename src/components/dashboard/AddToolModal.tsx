import React, { useState, useCallback } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toolService } from '../../services/toolService';
import imageCompression from 'browser-image-compression';

interface AddToolModalProps {
  onClose: () => void;
  onToolAdded: () => void;
  onToolUpdated: () => void;
  editTool?: any;
}

const compressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
};

const AddToolModal: React.FC<AddToolModalProps> = ({ onClose, onToolAdded, onToolUpdated, editTool }) => {
  const [formData, setFormData] = useState({
    name: editTool?.name || '',
    description: editTool?.description || '',
    image: editTool?.image || '',
    url: editTool?.url || '',
    status: editTool?.status || 'Hors ligne'
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setLoading(true);
      const compressedFile = await imageCompression(file, compressionOptions);
      const imageUrl = await toolService.uploadImage(compressedFile);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    } catch (error) {
      setError('Erreur lors du téléchargement de l\'image');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      await handleImageUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editTool) {
        await toolService.updateTool(editTool.id, formData);
        onToolUpdated();
      } else {
        await toolService.addTool(formData);
        onToolAdded();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">
              {editTool ? 'Modifier l\'outil' : 'Ajouter un outil'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom de l'outil
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Image
              </label>
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-red-500 transition-colors cursor-pointer"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  {loading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                      <p className="text-sm text-gray-400">Traitement de l'image...</p>
                    </div>
                  ) : formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  )}
                  <p className="text-sm text-gray-400">
                    Glissez une image ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max: 5MB (sera compressée automatiquement)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                URL de l'outil
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'En ligne' | 'Hors ligne' }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
              >
                <option value="En ligne">En ligne</option>
                <option value="Hors ligne">Hors ligne</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Chargement...' : editTool ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddToolModal;
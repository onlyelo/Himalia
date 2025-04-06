import React, { useState, useCallback } from 'react';
import { X, Upload, Image as ImageIcon, Star } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { memberService } from '../../services/memberService';
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AddMemberModalProps {
  onClose: () => void;
  onMemberAdded: () => void;
}

type Tab = 'manual' | 'import';

const AddMemberModal: React.FC<AddMemberModalProps> = ({ onClose, onMemberAdded }) => {
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newMember, setNewMember] = useState({
    display: '',
    handle: '',
    image: '',
    rank: 'Recrue',
    stars: 0,
    roles: ''
  });

  const handleImageUpload = async (file: File) => {
    try {
      const storageRef = ref(storage, `members/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const onImageDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        setLoading(true);
        const imageUrl = await handleImageUpload(file);
        setNewMember(prev => ({
          ...prev,
          image: imageUrl
        }));
      } catch (error) {
        setError('Erreur lors du téléchargement de l\'image');
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    onDrop: onImageDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  });

  const onCSVDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        setLoading(true);
        const text = await file.text();
        await memberService.importFromCSV(text);
        setSuccess('Membres importés avec succès');
        onMemberAdded();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
      } finally {
        setLoading(false);
      }
    }
  }, [onMemberAdded]);

  const { getRootProps: getCSVRootProps, getInputProps: getCSVInputProps } = useDropzone({
    onDrop: onCSVDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await memberService.addMember(newMember);
      setSuccess('Membre ajouté avec succès');
      onMemberAdded();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Ajouter un membre</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'manual'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('manual')}
            >
              Ajout Manuel
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'import'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('import')}
            >
              Import CSV
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-500">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-md text-green-500">
              {success}
            </div>
          )}

          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  value={newMember.display}
                  onChange={e => setNewMember(prev => ({ ...prev, display: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Handle
                </label>
                <input
                  type="text"
                  value={newMember.handle}
                  onChange={e => setNewMember(prev => ({ ...prev, handle: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Image de profil
                </label>
                <div
                  {...getImageRootProps()}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-red-500 transition-colors cursor-pointer"
                >
                  <input {...getImageInputProps()} />
                  <div className="flex flex-col items-center">
                    {newMember.image ? (
                      <img
                        src={newMember.image}
                        alt="Preview"
                        className="w-32 h-32 rounded-full object-cover mb-2"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                    )}
                    <p className="text-sm text-gray-400">
                      Glissez une image ou cliquez pour sélectionner
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Grade
                </label>
                <select
                  value={newMember.rank}
                  onChange={e => setNewMember(prev => ({ ...prev, rank: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                >
                  <option value="Recrue">Recrue</option>
                  <option value="Membre">Membre</option>
                  <option value="Vétéran">Vétéran</option>
                  <option value="Officier">Officier</option>
                  <option value="Commandant">Commandant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Étoiles
                </label>
                <div className="flex space-x-2">
                  {[...Array(5)].map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setNewMember(prev => ({ ...prev, stars: index + 1 }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          index < newMember.stars
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Rôles
                </label>
                <input
                  type="text"
                  value={newMember.roles}
                  onChange={e => setNewMember(prev => ({ ...prev, roles: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-gray-300"
                  placeholder="Ex: Combat, Transport, Minage"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Chargement...' : 'Ajouter le membre'}
                </button>
              </div>
            </form>
          ) : (
            <div
              {...getCSVRootProps()}
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 hover:border-red-500 transition-colors cursor-pointer"
            >
              <input {...getCSVInputProps()} />
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-300 mb-2">
                  Glissez votre fichier CSV ici
                </p>
                <p className="text-sm text-gray-400">
                  ou cliquez pour sélectionner le fichier
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Format attendu: display,handle,image,rank,stars,roles
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
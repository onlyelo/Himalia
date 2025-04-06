import React, { useState, useEffect } from 'react';
import { Image, Upload, Check, AlertCircle, Loader } from 'lucide-react';
import { visualsService } from '../../services/visualsService';
import { getVisuals, type VisualConfig } from '../../config/visuals';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function VisualSettings() {
  const [visuals, setVisuals] = useState<VisualConfig>(getVisuals());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVisuals();
  }, []);

  const loadVisuals = async () => {
    try {
      const data = await visualsService.getVisuals();
      setVisuals(data);
    } catch (error) {
      console.error('Error loading visuals:', error);
      setError('Erreur lors du chargement des visuels');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, field: keyof VisualConfig) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('L\'image est trop volumineuse. Taille maximum: 5MB');
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await visualsService.uploadImage(file, field);
      await visualsService.setVisuals({
        ...visuals,
        [field]: imageUrl
      });
      await loadVisuals();
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Erreur lors du traitement de l\'image');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  const visualFields = [
    { key: 'mainLogo' as const, label: 'Logo Principal' },
    { key: 'homeHero' as const, label: 'Bannière Accueil' },
    { key: 'organizationHero' as const, label: 'Bannière Organisation' },
    { key: 'fleetHero' as const, label: 'Bannière Flotte' },
    { key: 'toolsHero' as const, label: 'Bannière Outils' },
    { key: 'knowledgeHero' as const, label: 'Bannière Ressources' },
    { key: 'blogHero' as const, label: 'Bannière Blog' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Configuration des Visuels</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
        <div className="p-6">
          <div className="grid gap-6">
            {visualFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-sm font-medium text-gray-300">{field.label}</label>
                <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-4">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {visuals[field.key] ? (
                      <div className="relative w-full h-32">
                        <img
                          src={visuals[field.key]}
                          alt={`Preview ${field.label}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <Image className="h-8 w-8 text-gray-400" />
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, field.key)}
                      />
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Choisir une image</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisualSettings;
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ShipTagsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const AVAILABLE_TAGS = [
  'Snub Fighter',
  'Chasseur Léger',
  'Chasseur Moyen',
  'Chasseur Lourd',
  'Transport',
  'Minage',
  'Salvage',
  'Medic',
  'Capital',
  'Militaire',
  'Exploration',
  'Corvette',
  'Croiseur',
  'Frégate',
  'Destroyer',
  'Bombardier',
  'Intercepteur',
  'Dreadnought',
  'Carrier',
  'Construction',
  'Bounty',
  'Interdiction'
];

const ShipTags: React.FC<ShipTagsProps> = ({ tags, onTagsChange }) => {
  const [showTagSelector, setShowTagSelector] = useState(false);

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
    setShowTagSelector(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center bg-gray-600 text-gray-200 px-2 py-1 rounded-full text-sm"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 text-gray-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          onClick={() => setShowTagSelector(!showTagSelector)}
          className="inline-flex items-center bg-gray-600 hover:bg-gray-500 text-gray-200 px-2 py-1 rounded-full text-sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Ajouter
        </button>
      </div>

      {showTagSelector && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowTagSelector(false)}
          />
          <div className="absolute z-20 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-h-64 overflow-y-auto">
            <div className="p-2">
              {AVAILABLE_TAGS.filter(tag => !tags.includes(tag)).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShipTags;
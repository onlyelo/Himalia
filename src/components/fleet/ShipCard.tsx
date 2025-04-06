import React, { useEffect, useState } from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { motion } from 'framer-motion';
import { storage } from '../../utils/firebase';
import { type ShipTemplate } from '../../services/shipDatabase';

interface ShipCardProps {
  ship: ShipTemplate;
  onDelete: () => void;
  onMemberAssigned: (memberId: string) => void;
  onMemberUnassigned: (member: any) => void;
  onUpdate: (data: Partial<ShipTemplate>) => void;
}

export default function ShipCard({ ship }: ShipCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const statusColor = ship.statusColor || 'blue';

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await getDownloadURL(ref(storage, `ships/${ship.shipId}.png`));
        setImageUrl(url);
      } catch (err) {
        setImageUrl(null);
      }
    };
    fetchImage();
  }, [ship.shipId]);

  return (
    <motion.div
      className={`absolute rounded-full border-4 border-${statusColor}-500 bg-gray-900 shadow-lg flex items-center justify-center`}
      style={{
        left: ship.position?.x ?? 200,
        top: ship.position?.y ?? 200,
        width: 128,
        height: 128,
        userSelect: 'none',
        zIndex: 1000,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={ship.name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="text-white text-4xl font-bold">
          {ship.name.charAt(0).toUpperCase()}
        </span>
      )}
    </motion.div>
  );
}

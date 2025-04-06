import React from 'react';
import { motion } from 'framer-motion';

export default function ArticleHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-16"
    >
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-accent to-gray-300 bg-clip-text text-transparent">
        Verse News
      </h1>
      <p className="text-xl text-gray-400 max-w-3xl mx-auto">
        Les dernières actualités de l'univers Star Citizen
      </p>
    </motion.div>
  );
}
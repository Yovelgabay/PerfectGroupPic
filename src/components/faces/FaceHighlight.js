import React from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2 } from 'lucide-react';

export default function FaceHighlight({ face, onClick, isReplaced }) {
  const { coordinates } = face;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="absolute group cursor-pointer"
      style={{
        left: `${coordinates.x}%`,
        top: `${coordinates.y}%`,
        width: `${coordinates.width}%`,
        height: `${coordinates.height}%`,
      }}
      onClick={onClick}
    >
      <div
        className={`w-full h-full rounded-lg transition-all duration-300 border-4 ${
          isReplaced
            ? 'border-green-400 bg-green-400/20'
            : 'border-red-400/50 group-hover:border-red-400 group-hover:bg-red-400/20'
        }`}
      />
      <div
        className={`absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg ${
          isReplaced ? 'bg-green-500' : 'bg-red-500 group-hover:bg-red-600'
        }`}
      >
        {isReplaced ? <Check className="w-4 h-4" /> : <Edit2 className="w-3 h-3" />}
      </div>
    </motion.div>
  );
}

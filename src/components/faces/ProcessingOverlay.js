import React from "react";
import { motion } from "framer-motion";

export default function ProcessingOverlay({ title, description, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-400 to-teal-400 rounded-full flex items-center justify-center"
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <div className="flex justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-gradient-to-r from-red-400 to-teal-400 rounded-full"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

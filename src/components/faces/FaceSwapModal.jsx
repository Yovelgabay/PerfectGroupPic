import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Images, Scissors, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LassoTool from './LassoTool';

const FaceCrop = ({ face, baseFaceCoords, onClick }) => {
  // Use the base face coordinates to crop the face from other photos
  const cropStyle = {
    backgroundImage: `url(${face.photo_url})`,
    backgroundSize: `${100 / baseFaceCoords.width * 100}% ${100 / baseFaceCoords.height * 100}%`,
    backgroundPosition: `${-baseFaceCoords.x / baseFaceCoords.width * 100}% ${-baseFaceCoords.y / baseFaceCoords.height * 100}%`,
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer group relative"
      onClick={onClick}
    >
      <div
        className="w-full aspect-square rounded-lg bg-cover bg-center overflow-hidden border-2 border-transparent group-hover:border-red-400 transition-all duration-300"
        style={cropStyle}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

export default function FaceSwapModal({ onClose, onFaceSelect, baseFaceId, baseFace, otherFaces }) {
  const [showLasso, setShowLasso] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleLassoSelection = (selection) => {
    const customFace = {
      face_id: `custom-${Date.now()}`,
      photo_url: selectedPhoto,
      coordinates: selection.boundingBox,
      selection: selection.points,
      isCustom: true
    };
    
    onFaceSelect(baseFaceId, customFace);
    setShowLasso(false);
  };

  const openLassoTool = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setShowLasso(true);
  };

  // Filter faces from other photos and crop them using base face coordinates
  const relevantFaces = otherFaces.filter(face => face.photo_url !== baseFace.photo_url);
  const uniquePhotos = [...new Set(relevantFaces.map(f => f.photo_url))];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Images className="w-5 h-5 text-red-400" />
              <div>
                <h2 className="text-lg font-semibold">Choose Best Face</h2>
                <p className="text-xs text-gray-500">Select from cropped faces or use lasso tool</p>
              </div>
            </div>
            <Button onClick={onClose} size="icon" variant="ghost" className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </header>
          
          <main className="p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Face crops from other photos using base coordinates */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Face Options ({relevantFaces.length} found)
                </h3>
                {relevantFaces.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    <AnimatePresence>
                      {uniquePhotos.map((photoUrl, index) => {
                        const faceFromPhoto = relevantFaces.find(f => f.photo_url === photoUrl) || {
                          face_id: `crop-${index}`,
                          photo_url: photoUrl,
                          coordinates: baseFace.coordinates // Use base coordinates for cropping
                        };
                        
                        return (
                          <motion.div
                            key={photoUrl}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <FaceCrop 
                              face={faceFromPhoto}
                              baseFaceCoords={baseFace.coordinates}
                              onClick={() => onFaceSelect(baseFaceId, faceFromPhoto)}
                            />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No other photos available for this face.</p>
                )}
              </div>

              {/* Custom lasso selection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Custom Selection
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {uniquePhotos.map((photoUrl) => (
                    <motion.div
                      key={photoUrl}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => openLassoTool(photoUrl)}
                        variant="outline"
                        className="w-full h-20 p-2 border-2 border-dashed border-teal-300 hover:border-teal-400 hover:bg-teal-50 transition-all duration-300 flex flex-col gap-1"
                      >
                        <Scissors className="w-5 h-5 text-teal-500" />
                        <span className="text-xs text-teal-600 font-medium">Use Lasso</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showLasso && (
          <LassoTool
            imageUrl={selectedPhoto}
            onSelectionComplete={handleLassoSelection}
            onCancel={() => setShowLasso(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
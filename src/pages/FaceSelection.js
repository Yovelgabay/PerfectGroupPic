
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { PhotoSession } from "../entities/PhotoSession";
import { Users, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

import ProcessingOverlay from '../components/faces/ProcessingOverlay';
import FaceHighlight from "../components/faces/FaceHighlight";
import FaceSwapModal from "../components/faces/FaceSwapModal";

export default function FaceSelection() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [baseFaces, setBaseFaces] = useState([]);
  const [otherFaces, setOtherFaces] = useState([]);
  const [selectedReplacements, setSelectedReplacements] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [modalState, setModalState] = useState({
    isOpen: false,
    editingFaceId: null,
    editingFace: null, // Added for precise crop mapping
  });

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    
    if (sessionId) {
      setIsProcessing(true);
      try {
        const sessionData = await PhotoSession.list();
        const currentSession = sessionData.find(s => s.id === sessionId);
        if (currentSession) {
          setSession(currentSession);
          processDetectedFaces(currentSession.detected_faces, currentSession.base_photo_url);
        }
      } catch (err) {
        console.error("Error loading session:", err);
        setError("Could not load your session. Please try again.");
      }
      setIsProcessing(false);
    }
  };

  const processDetectedFaces = (faces, base_url) => {
    if (!faces || !base_url) return;
    const base = faces.filter(f => f.photo_url === base_url);
    const others = faces.filter(f => f.photo_url !== base_url);
    setBaseFaces(base);
    setOtherFaces(others);

    const initialReplacements = {};
    base.forEach(face => {
      initialReplacements[face.face_id] = face;
    });
    setSelectedReplacements(initialReplacements);
  };
  
  const handleFaceSelect = (baseFaceId, replacementFace) => {
    setSelectedReplacements(prev => ({
      ...prev,
      [baseFaceId]: replacementFace,
    }));
    setModalState({ isOpen: false, editingFaceId: null, editingFace: null }); // Reset editingFace
  };

  const openFaceModal = (face) => {
    setModalState({ 
      isOpen: true, 
      editingFaceId: face.face_id,
      editingFace: face // Pass the full face object
    });
  };

  const handleMerge = async () => {
    setIsProcessing(true);
    try {
      await PhotoSession.update(session.id, {
        final_composition: selectedReplacements,
        status: "merging", // Set status to merging for the next step
      });
      navigate(createPageUrl(`Preview?session=${session.id}`));
    } catch (err) {
      console.error("Error during merge:", err);
      setError("Something went wrong while preparing your photo.");
      setIsProcessing(false); // Ensure processing state is reset on error
    }
  };
  
  if (isProcessing || !session) {
    return <ProcessingOverlay title="Finalizing Selections..." icon={Sparkles} />;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Swap the Faces</h1>
        <p className="text-gray-600">Tap a face on the base photo to choose a better expression.</p>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <CardContent className="p-2">
          <motion.div
            className="relative aspect-[4/3] bg-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img src={session.base_photo_url} alt="Base" className="w-full h-full object-cover rounded-lg" />
            {baseFaces.map(face => (
              <FaceHighlight
                key={face.face_id}
                face={face}
                onClick={() => openFaceModal(face)} // Use the new openFaceModal function
                isReplaced={selectedReplacements[face.face_id]?.face_id !== face.face_id}
              />
            ))}
          </motion.div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Button
          onClick={handleMerge}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-red-400 to-teal-400 hover:from-red-500 hover:to-teal-500 text-white font-semibold py-4 rounded-2xl shadow-xl"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Final Image
        </Button>
      </div>

      <AnimatePresence>
        {modalState.isOpen && (
          <FaceSwapModal
            onClose={() => setModalState({ isOpen: false, editingFaceId: null, editingFace: null })} // Reset editingFace on close
            onFaceSelect={handleFaceSelect}
            baseFaceId={modalState.editingFaceId}
            baseFace={modalState.editingFace} // Pass the editingFace object
            otherFaces={otherFaces}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

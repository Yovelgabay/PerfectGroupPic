
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PhotoSession } from "@/entities/PhotoSession";
import { Download, Share2, Sparkles, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

import FilterSelector from "../components/preview/FilterSelector";
import ShareOptions from "../components/preview/ShareOptions";
import MergedFace from "../components/preview/MergedFace";

// Define ProcessingOverlay component as it's used in the outline but not imported
const ProcessingOverlay = ({ title, description, icon: Icon }) => (
  <div className="max-w-md mx-auto px-4 py-20 text-center">
    <div className="w-12 h-12 border-4 border-red-400/30 border-t-red-400 rounded-full animate-spin mx-auto mb-4" />
    <p className="text-gray-600 font-semibold text-lg mb-2">{title}</p>
    <p className="text-gray-500 text-sm">{description}</p>
    {Icon && <Icon className="w-10 h-10 text-red-400 mx-auto mt-6 animate-pulse" />}
  </div>
);

export default function Preview() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("realistic");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    
    if (sessionId) {
      loadAndFinalizeSession(sessionId);
    } else {
      // If no session ID, stop finalizing and possibly redirect or show an error
      console.warn("No session ID found in URL. Cannot load session.");
      setIsFinalizing(false); // Stop the loading indicator
      // Optionally, navigate home or to an error page
      // navigate(createPageUrl("Home")); 
    }
  }, []);

  const loadAndFinalizeSession = async (sessionId) => {
    setIsFinalizing(true);
    try {
      const sessionData = await PhotoSession.list();
      const currentSession = sessionData.find(s => s.id === sessionId);
      
      if (currentSession) {
        setSession(currentSession);
        // If the session is still "merging", update it to "completed"
        if (currentSession.status === 'merging') {
          // Simulate processing time for realism
          setTimeout(async () => {
            try {
              await PhotoSession.update(currentSession.id, { status: "completed" });
              const updatedSession = { ...currentSession, status: "completed" };
              setSession(updatedSession);
              setIsFinalizing(false);
            } catch (updateError) {
              console.error("Error updating session status:", updateError);
              setIsFinalizing(false); // Ensure finalizing stops even if update fails
            }
          }, 1500);
        } else {
          setIsFinalizing(false);
        }
      } else {
        console.error("Session not found for ID:", sessionId);
        setIsFinalizing(false); // Stop finalizing if session not found
      }
    } catch (error) {
      console.error("Error loading session for finalization:", error);
      setIsFinalizing(false);
    }
  };

  const handleDownload = () => {
    if (session?.final_photo_url) {
      const link = document.createElement('a');
      link.href = session.final_photo_url;
      link.download = `${session.session_name}-perfect.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCreateAnother = () => {
    navigate(createPageUrl("Upload"));
  };

  if (isFinalizing || !session) {
    return (
      <ProcessingOverlay
        title="Generating Final Photo..."
        description="Applying face swaps and enhancing your image. This will just take a moment."
        icon={Sparkles}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-400 to-teal-400 rounded-full flex items-center justify-center shadow-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Perfect! ✨</h1>
          <p className="text-gray-600">Your group photo has been enhanced</p>
        </div>

        {/* Preview Image */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              {session.base_photo_url ? (
                <>
                  <img
                    src={session.base_photo_url}
                    alt="Base group photo"
                    className="w-full h-full object-cover"
                  />
                  {session.final_composition && Object.values(session.final_composition).map(face => (
                    <MergedFace key={face.face_id} face={face} />
                  ))}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No base photo available</p>
                  </div>
                </div>
              )}
              
              {/* Filter overlay for preview */}
              <div className={`absolute inset-0 mix-blend-${selectedFilter === 'vintage' ? 'sepia' : selectedFilter === 'sketch' ? 'difference' : 'normal'} opacity-${selectedFilter === 'realistic' ? '0' : '20'}`} />
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{session.session_name}</h3>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{session.uploaded_photos?.length || 0} photos used</span>
              <span>{session.final_composition ? Object.keys(session.final_composition).length : 0} faces swapped</span>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <FilterSelector
          selectedFilter={selectedFilter}
          onFilterSelect={setSelectedFilter}
        />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-red-400 to-teal-400 hover:from-red-500 hover:to-teal-500 text-white font-semibold py-4 rounded-2xl shadow-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Perfect Photo
          </Button>

          <Button
            onClick={() => setShowShareOptions(true)}
            variant="outline"
            className="w-full border-2 border-gray-200 rounded-2xl py-4 font-semibold"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share with Family
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={handleCreateAnother}
              variant="outline"
              className="flex-1 border-gray-200 rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Create Another
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("Home"))}
              variant="outline"
              className="flex-1 border-gray-200 rounded-xl"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Share Modal */}
        {showShareOptions && (
          <ShareOptions
            session={session}
            onClose={() => setShowShareOptions(false)}
          />
        )}
      </motion.div>
    </div>
  );
}

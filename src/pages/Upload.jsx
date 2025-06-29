import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PhotoSession } from "@/entities/PhotoSession";
import { Camera, ArrowRight, Sparkles, AlertCircle } from "lucide-react"; // Removed X, consolidated AlertCircle
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Consolidated Alert, AlertDescription
import { motion, AnimatePresence } from "framer-motion";
import { detectFaces } from "@/integrations/Core";

import PhotoUploader from "../components/upload/PhotoUploader";
import PhotoPreview from "../components/upload/PhotoPreview";
import ProcessingOverlay from "../components/faces/ProcessingOverlay";

export default function Upload() {
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const previewRef = useRef(null);

  useEffect(() => {
    if (uploadedPhotos.length > 0) {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [uploadedPhotos]);

  const handleCreateAndDetect = async () => {
    if (!sessionName.trim()) {
      setError("Please enter a session name.");
      return;
    }
    if (uploadedPhotos.length < 2) {
      setError("Please upload at least 2 photos.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create the session
      const session = await PhotoSession.create({
        session_name: sessionName,
        uploaded_photos: uploadedPhotos,
        status: "detecting_faces"
      });

      // Step 2: Detect faces using the integration
      const result = await detectFaces(uploadedPhotos.map((p) => p.url));

      if (!result.faces || result.faces.length === 0) {
        throw new Error("No faces detected in any of the photos. Please try again with clearer images.");
      }

      setDetectedFaces(result.faces);

      // Step 3: Update session with detected faces and navigate
      await PhotoSession.update(session.id, {
        detected_faces: result.faces,
        status: "adjusting_boxes"
      });
      
      navigate(createPageUrl(`AdjustBoxes?session=${session.id}`));

    } catch (err) {
      console.error("Error during session creation and face detection:", err);
      setError(err.message || "An unexpected error occurred.");
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto px-4 py-6">
       <AnimatePresence>
        {isProcessing && (
          <ProcessingOverlay
            title="Detecting Faces..."
            description="Our AI is analyzing all your photos. This may take a moment."
            icon={Sparkles}
          />
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Session</h1>
        <p className="text-gray-600">Start by giving your session a name and uploading your photos.</p>
      </div>
      
      <div className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="pt-6">
            <Label htmlFor="sessionName" className="text-sm font-medium text-gray-700">
              Session Name
            </Label>
            <Input
              id="sessionName"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., Family Vacation 2024"
              className="mt-2 border-0 bg-gray-50 rounded-xl"
            />
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Camera className="w-5 h-5 text-red-400" />
              Upload Group Photos
            </CardTitle>
            <p className="text-sm text-gray-600">Upload 2-5 similar shots</p>
          </CardHeader>
          <CardContent>
            <PhotoUploader photos={uploadedPhotos} setPhotos={setUploadedPhotos} />
          </CardContent>
        </Card>

        {uploadedPhotos.length > 0 && (
          <motion.div ref={previewRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PhotoPreview
              photos={uploadedPhotos}
              setPhotos={setUploadedPhotos}
              detectedFaces={detectedFaces}
            />
          </motion.div>
        )}

        {error && (
           <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
        )}

        <Button
          onClick={handleCreateAndDetect}
          disabled={isProcessing || uploadedPhotos.length < 2 || !sessionName.trim()}
          className="w-full bg-gradient-to-r from-red-400 to-teal-400 hover:from-red-500 hover:to-teal-500 text-white font-semibold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Detecting Faces...
            </div>
          ) : (
            <>
              <ArrowRight className="w-5 h-5" />
              Detect Faces
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
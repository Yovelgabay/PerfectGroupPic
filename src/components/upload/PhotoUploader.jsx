import React, { useRef, useState, useEffect } from "react";
import { UploadFiles } from "@/integrations/Core";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import CameraCapture from "./CameraCapture";

export default function PhotoUploader({ photos, setPhotos }) {
  const MAX_PHOTOS = 5;
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (
      photos.length < MAX_PHOTOS &&
      errorMsg &&
      errorMsg.startsWith("You can upload up to")
    ) {
      setErrorMsg(null);
    }
  }, [photos.length]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setErrorMsg(`You can upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    if (selected.length < files.length) {
      setErrorMsg(`You can upload up to ${MAX_PHOTOS} photos.`);
    } else {
      setErrorMsg(null);
    }

    setIsUploading(true);
    try {
      const uploaded = await UploadFiles(selected);
      const newPhotos = uploaded.map((f) => ({
        url: f.url,
        filename: f.filename,
        is_base: false,
      }));

      const allPhotos = [...photos, ...newPhotos];
      setPhotos(allPhotos);
    } catch (error) {
      console.error("Error uploading files:", error);
      if (error.message && error.message.includes("Failed to fetch")) {
        setErrorMsg(
          "Upload server not reachable. Did you run `npm run server`?"
        );
      } else {
        setErrorMsg("Failed to upload photos");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    // On desktop, open our custom camera capture component
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowCamera(true);
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handleCameraPhotos = (files) => {
    setShowCamera(false);
    handleFileUpload(files);
  };

  return (
    <div className="space-y-4">
      {showCamera && (
        <CameraCapture onClose={() => setShowCamera(false)} onPhotosCaptured={handleCameraPhotos} />
      )}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Upload Options */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleCameraClick}
          variant="outline"
          className="h-24 border-2 border-dashed border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300 flex-col gap-2"
          disabled={isUploading}
        >
          <Camera className="w-6 h-6 text-red-400" />
          <span className="text-sm font-medium">Take Photos</span>
        </Button>

        <Button
          onClick={handleBrowseClick}
          variant="outline"
          className="h-24 border-2 border-dashed border-teal-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-300 flex-col gap-2"
          disabled={isUploading}
        >
          <Upload className="w-6 h-6 text-teal-400" />
          <span className="text-sm font-medium">Browse Files</span>
        </Button>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-4"
          >
            <div className="w-8 h-8 border-4 border-red-400/30 border-t-red-400 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Uploading photos...</p>
          </motion.div>
        )}
      </AnimatePresence>
      {errorMsg && (
        <p className="text-center text-sm text-red-600">{errorMsg}</p>
      )}

      {/* Upload Instructions */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>📸 Take 2-5 similar group photos</p>
        <p>✨ Best results with consistent lighting</p>
        <p>👥 Make sure everyone is visible</p>
      </div>
    </div>
  );
}
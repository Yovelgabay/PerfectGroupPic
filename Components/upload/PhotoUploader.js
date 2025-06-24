import React, { useRef, useState } from "react";
import { UploadFile } from "@/integrations/Core";
import { Camera, Upload, Plus, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function PhotoUploader({ onPhotosUploaded }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newPhotos = [];

    for (const file of Array.from(files)) {
      try {
        const { file_url } = await UploadFile({ file });
        newPhotos.push({
          url: file_url,
          filename: file.name,
          is_base: false
        });
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    const allPhotos = [...uploadedPhotos, ...newPhotos];
    setUploadedPhotos(allPhotos);
    onPhotosUploaded(allPhotos);
    setIsUploading(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
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

      {/* Upload Instructions */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>📸 Take 2-5 similar group photos</p>
        <p>✨ Best results with consistent lighting</p>
        <p>👥 Make sure everyone is visible</p>
      </div>
    </div>
  );
}
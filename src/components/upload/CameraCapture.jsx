import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CameraCapture({ onClose, onPhotosCaptured }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    async function startCamera() {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
      } catch (err) {
        console.error("Failed to open camera", err);
        onClose();
      }
    }
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onClose]);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `photo-${Date.now()}.png`, { type: "image/png" });
      setPhotos((p) => [...p, { url: URL.createObjectURL(blob), file }]);
    }, "image/png");
  };

  const remove = (index) => {
    setPhotos((p) => {
      const copy = [...p];
      URL.revokeObjectURL(copy[index].url);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleUpload = () => {
    onPhotosCaptured(photos.map((p) => p.file));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 space-y-4 w-80">
        <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-md" />
        <div className="flex justify-center gap-2">
          <Button onClick={capture}>Capture</Button>
          <Button onClick={handleUpload} disabled={photos.length === 0}>
            Upload {photos.length > 0 && `(${photos.length})`}
          </Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                <img src={p.url} alt="capture" className="w-20 h-20 object-cover rounded" />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 w-5 h-5"
                  onClick={() => remove(i)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

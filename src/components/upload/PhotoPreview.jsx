import React from "react";
import {X, CheckCircle} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {motion, AnimatePresence} from "framer-motion";

export default function PhotoPreview({photos, setPhotos}) {
  const removePhoto = (indexToRemove) => {
    URL.revokeObjectURL(photos[indexToRemove].url);
    const newPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(newPhotos);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Uploaded Photos ({photos.length})
          </span>
          {photos.length >= 2 && (
            <span className="text-xs text-green-600 font-normal">
              Ready to proceed!
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{opacity: 0, scale: 0.8}}
                animate={{opacity: 1, scale: 1}}
                exit={{opacity: 0, scale: 0.8}}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                <img
                  src={photo.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 px-0 py-0 right-2 w-6 h-6 rounded-full bg-white text-black hover:bg-gray-100"
                >
                  <X className="w-3 h-3 mx-auto" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-xs text-white font-medium">
                    #{index + 1}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {photos.length < 2 && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Upload at least 2 photos to continue
          </p>
        )}
      </CardContent>
    </Card>
  );
}

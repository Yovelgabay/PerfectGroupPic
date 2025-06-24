import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {PhotoSession} from "@/entities/PhotoSession";
import {createPageUrl} from "@/utils";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {ArrowRight, CheckCircle, Star, Sparkles} from "lucide-react";
import ProcessingOverlay from "../components/faces/ProcessingOverlay";
import {motion} from "framer-motion";

export default function SelectBase() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [basePhotoIndex, setBasePhotoIndex] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session");
    if (sessionId) {
      loadSession(sessionId);
    }
  }, []);

  const loadSession = async (sessionId) => {
    try {
      const sessionData = await PhotoSession.list();
      const currentSession = sessionData.find((s) => s.id === sessionId);
      if (currentSession) {
        setSession(currentSession);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
    setIsLoading(false);
  };

  const handleSelect = async () => {
    setIsLoading(true);
    const selectedPhoto = session.uploaded_photos[basePhotoIndex];
    const updatedPhotos = session.uploaded_photos.map((photo, index) => ({
      ...photo,
      is_base: index === basePhotoIndex,
    }));

    await PhotoSession.update(session.id, {
      uploaded_photos: updatedPhotos,
      base_photo_url: selectedPhoto.url,
      status: "face_selection",
    });

    navigate(createPageUrl(`FaceSelection?session=${session.id}`));
  };

  if (isLoading || !session) {
    return <ProcessingOverlay title="Preparing Photos..." icon={Sparkles} />;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Base Photo
        </h1>
        <p className="text-gray-600">
          This photo will be used for the background and overall composition.
        </p>
      </div>

      <div className="space-y-4">
        {session.uploaded_photos.map((photo, index) => (
          <motion.div
            key={photo.url}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: index * 0.1}}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                basePhotoIndex === index
                  ? "ring-4 ring-teal-400 ring-opacity-50 shadow-xl"
                  : "hover:shadow-lg"
              }`}
              onClick={() => setBasePhotoIndex(index)}
            >
              <CardContent className="p-2 relative">
                <div className="aspect-[4/3] bg-gray-100">
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="absolute top-3 right-3">
                  {basePhotoIndex === index ? (
                    <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full border-2 border-gray-200" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <Button
          onClick={handleSelect}
          className="w-full bg-gradient-to-r from-red-400 to-teal-400 hover:from-red-500 hover:to-teal-500 text-white font-semibold py-4 rounded-2xl shadow-xl"
        >
          <Star className="w-5 h-5 mr-2" />
          Confirm Base Photo & Continue
        </Button>
      </div>
    </div>
  );
}

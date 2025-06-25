import React, {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {PhotoSession} from "@/entities/PhotoSession";
import {createPageUrl} from "@/utils";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {ArrowRight, Edit, Sparkles, Plus} from "lucide-react";
import AdjustableBox from "@components/faces/AdjustableBox";
import ProcessingOverlay from "../components/faces/ProcessingOverlay";

export default function AdjustBoxes() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [faces, setFaces] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageAspectRatio, setImageAspectRatio] = useState("4 / 3");
  const containerRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session");
    if (sessionId) {
      loadSession(sessionId);
    }
  }, []);

  const handleImageLoad = (e) => {
    const {naturalWidth, naturalHeight} = e.target;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setImageAspectRatio(`${naturalWidth} / ${naturalHeight}`);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const sessionData = await PhotoSession.list();
      const currentSession = sessionData.find((s) => s.id === sessionId);
      if (currentSession) {
        setSession(currentSession);
        setFaces(currentSession.detected_faces || []);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
    setIsLoading(false);
  };

  const handleBoxUpdate = (faceId, newCoordinates) => {
    setFaces((prevFaces) =>
      prevFaces.map((face) =>
        face.face_id === faceId ? {...face, coordinates: newCoordinates} : face
      )
    );
  };

  const handleDeleteFace = (faceId) => {
    setFaces((prevFaces) =>
      prevFaces.filter((face) => face.face_id !== faceId)
    );
  };

  const handleAddFace = () => {
    const currentPhotoUrl = session.uploaded_photos[currentPhotoIndex].url;
    const newFaceId = `manual-${Date.now()}`;

    const newFace = {
      face_id: newFaceId,
      photo_url: currentPhotoUrl,
      coordinates: {
        x: 25, // Start at 25% from left
        y: 25, // Start at 25% from top
        width: 20, // 20% width
        height: 25, // 25% height
      },
    };

    setFaces((prevFaces) => [...prevFaces, newFace]);
  };

  const handleNext = async () => {
    const photoUrls = session.uploaded_photos.map((p) => p.url);
    if (currentPhotoIndex < photoUrls.length - 1) {
      setCurrentPhotoIndex((prev) => prev + 1);
    } else {
      // Finished adjusting, save and move to next step
      setIsLoading(true);
      await PhotoSession.update(session.id, {
        detected_faces: faces,
        status: "selecting_base",
      });
      navigate(createPageUrl(`SelectBase?session=${session.id}`));
    }
  };

  if (isLoading || !session) {
    return <ProcessingOverlay title="Loading Photos..." icon={Sparkles} />;
  }

  const currentPhotoUrl = session.uploaded_photos[currentPhotoIndex].url;
  const facesForCurrentPhoto = faces.filter(
    (f) => f.photo_url === currentPhotoUrl
  );

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Adjust Face Boxes
        </h1>
        <p className="text-gray-600">
          Drag and resize the boxes to perfectly frame each face.
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Photo {currentPhotoIndex + 1} of {session.uploaded_photos.length}
        </p>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl overflow-hidden mb-4">
        <CardContent className="p-2">
          <div
            ref={containerRef}
            className="relative bg-gray-100 image-container-for-boxes"
            style={{aspectRatio: imageAspectRatio}}
          >
            <img
              src={currentPhotoUrl}
              alt="Photo to adjust"
              className="absolute top-0 left-0 w-full h-full object-contain"
              onLoad={handleImageLoad}
            />
            {facesForCurrentPhoto.map((face) => (
              <AdjustableBox
                key={face.face_id}
                face={face}
                onUpdate={handleBoxUpdate}
                onDelete={handleDeleteFace}
                containerRef={containerRef}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <Button
          onClick={handleAddFace}
          variant="outline"
          className="w-full border-2 border-dashed border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 font-medium py-3 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Face Box
        </Button>
      </div>

      <Button
        onClick={handleNext}
        className="w-full bg-gradient-to-r from-red-400 to-teal-400 hover:from-red-500 hover:to-teal-500 text-white font-semibold py-4 rounded-2xl shadow-xl"
      >
        <ArrowRight className="w-5 h-5 mr-2" />
        {currentPhotoIndex < session.uploaded_photos.length - 1
          ? "Next Photo"
          : "Finish Adjusting"}
      </Button>
    </div>
  );
}

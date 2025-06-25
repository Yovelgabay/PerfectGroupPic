import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PhotoSession } from "@/entities/PhotoSession";
import { Camera, Clock, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Sessions() {

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      // Until you add authentication, just fetch (or mock) all sessions
      const sessionData = await PhotoSession.filter({}, "-created_date");
      setSessions(sessionData);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "face_selection": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed": return "Complete";
      case "processing": return "Processing";
      case "face_selection": return "Face Selection";
      case "merging": return "Merging";
      default: return "Draft";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-red-400/30 border-t-red-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading your sessions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-600 text-sm">{sessions.length} photo sessions</p>
        </div>
        <Link to={createPageUrl("Upload")}>
          <Button className="bg-gradient-to-r from-red-400 to-teal-400 hover:from-red-500 hover:to-teal-500 text-white rounded-xl flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-100 to-teal-100 rounded-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h3>
          <p className="text-gray-600 mb-6">Create your first perfect group photo</p>
          <Link to={createPageUrl("Upload")}>
            <Button className="bg-gradient-to-r from-red-400 to-teal-400 hover:from-red-500 hover:to-teal-500 text-white rounded-xl flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" />
              Start Creating
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={createPageUrl(
                  session.status === "completed" 
                    ? `Preview?session=${session.id}`
                    : session.status === "face_selection"
                    ? `FaceSelection?session=${session.id}`
                    : "Upload"
                )}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                        {session.final_photo_url ? (
                          <img
                            src={session.final_photo_url}
                            alt="Session preview"
                            className="w-full h-full object-cover"
                          />
                        ) : session.base_photo_url ? (
                          <img
                            src={session.base_photo_url}
                            alt="Session preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                            {session.session_name}
                          </h3>
                          <Badge className={`${getStatusColor(session.status)} text-xs border-0`}>
                            {getStatusText(session.status)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>{session.uploaded_photos?.length || 0} photos</span>
                          </div>
                          {session.detected_faces && (
                            <div className="flex items-center gap-1">
                              <span>
                                {session.detected_faces.reduce((acc, faces) => {
                                  const uniquePersons = new Set(faces.map ? faces.map(f => f.person_id) : []);
                                  return uniquePersons.size;
                                }, 0)} people
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(session.created_date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-red-50 to-teal-50 border-0">
            <CardContent className="p-4 text-center">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {sessions.filter(s => s.status === "completed").length}
                  </div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {sessions.reduce((acc, s) => acc + (s.uploaded_photos?.length || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600">Photos Processed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {sessions.filter(s => s.status === "processing" || s.status === "face_selection").length}
                  </div>
                  <div className="text-xs text-gray-600">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
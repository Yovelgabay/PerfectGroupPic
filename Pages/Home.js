import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { PhotoSession } from "@/entities/PhotoSession";
import { User } from "@/entities/User";
import { Camera, Sparkles, Users, Zap, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Home() {
  const [recentSessions, setRecentSessions] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      const sessions = await PhotoSession.filter({ created_by: userData.email }, '-created_date', 3);
      setRecentSessions(sessions);
    } catch (error) {
      // User not logged in - show guest experience
    }
  };

  const features = [
    {
      icon: Camera,
      title: "Upload 2-5 Photos",
      description: "Take multiple shots of your group",
      color: "from-red-400 to-red-500"
    },
    {
      icon: Sparkles,
      title: "AI Face Detection",
      description: "Automatically find every face",
      color: "from-teal-400 to-teal-500"
    },
    {
      icon: Users,
      title: "Pick Best Faces",
      description: "Choose the perfect expression",
      color: "from-blue-400 to-blue-500"
    },
    {
      icon: Zap,
      title: "Magic Merge",
      description: "Create one perfect photo",
      color: "from-purple-400 to-purple-500"
    }
  ];

  return (
    <div className="max-w-md mx-auto">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center px-6 py-8"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-400 via-teal-400 to-blue-400 rounded-3xl flex items-center justify-center shadow-2xl">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Perfect Group Photos,
          <span className="bg-gradient-to-r from-red-500 to-teal-500 bg-clip-text text-transparent"> Every Time</span>
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          No more failed family photos! Pick the best face from each person across multiple shots.
        </p>

        <Link to={createPageUrl("Upload")}>
          <Button className="w-full bg-gradient-to-r from-red-400 to-teal-400 hover:from-red-500 hover:to-teal-500 text-white font-semibold py-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105">
            <Camera className="w-5 h-5 mr-2" />
            Start Creating Magic
          </Button>
        </Link>
      </motion.div>

      {/* How It Works */}
      <div className="px-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          How It Works
        </h2>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-teal-400" />
              Recent Sessions
            </h2>
            <Link to={createPageUrl("Sessions")} className="text-sm text-teal-500 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <Card key={session.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl overflow-hidden">
                      {session.final_photo_url ? (
                        <img 
                          src={session.final_photo_url} 
                          alt="Session preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{session.session_name}</h3>
                      <p className="text-sm text-gray-600">
                        {session.uploaded_photos?.length || 0} photos • {session.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="px-6 mb-8">
        <Card className="bg-gradient-to-r from-red-50 to-teal-50 border-0">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Perfect for:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {["Family Reunions", "Holiday Photos", "School Groups", "Wedding Parties", "Team Photos"].map((use) => (
                <span key={use} className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-gray-700">
                  {use}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
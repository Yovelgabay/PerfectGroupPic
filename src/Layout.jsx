import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Camera, Sparkles, Home, Users } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  const navigationItems = [
    { name: "Home", url: createPageUrl("Home"), icon: Home },
    { name: "Upload", url: createPageUrl("Upload"), icon: Camera },
    { name: "Sessions", url: createPageUrl("Sessions"), icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-teal-50">
      <style>
        {`
          :root {
            --primary-coral: #FF6B6B;
            --primary-teal: #4ECDC4;
            --primary-blue: #45B7D1;
            --warm-white: #FEFEFE;
            --soft-gray: #F8F9FA;
            --text-primary: #2C3E50;
            --text-secondary: #7F8C8D;
          }
        `}
      </style>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-red-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">PerfectGroupPic</h1>
                <p className="text-xs text-gray-500 -mt-1">AI Photo Magic</p>
              </div>
            </Link>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-red-100 z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around py-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-red-400 to-teal-400 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                  <span className={`text-xs mt-1 font-medium ${isActive ? 'text-white' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
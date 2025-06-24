import React from "react";
import { Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { motion } from "framer-motion";

export default function FilterSelector({ selectedFilter, onFilterSelect }) {
  const filters = [
    { id: "realistic", name: "Realistic", color: "from-gray-400 to-gray-500" },
    { id: "animation", name: "Animation", color: "from-purple-400 to-pink-500" },
    { id: "sketch", name: "Sketch", color: "from-blue-400 to-indigo-500" },
    { id: "vintage", name: "Vintage", color: "from-amber-400 to-orange-500" }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-4 h-4 text-purple-400" />
          Style Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterSelect(filter.id)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                selectedFilter === filter.id
                  ? 'ring-2 ring-purple-400 ring-opacity-50 shadow-lg'
                  : 'hover:shadow-md'
              }`}
            >
              <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${filter.color} mb-2`} />
              <span className={`text-xs font-medium ${
                selectedFilter === filter.id ? 'text-purple-600' : 'text-gray-600'
              }`}>
                {filter.name}
              </span>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

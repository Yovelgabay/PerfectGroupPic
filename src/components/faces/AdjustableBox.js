import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { Button } from '../ui/button';

export default function AdjustableBox({ face, onUpdate, onDelete, containerRef }) {
  const [dragStartPos, setDragStartPos] = useState(null);
  const [resizeStart, setResizeStart] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Dragging the whole box
  const handleBoxDragStart = () => {
    setDragStartPos({ x: face.coordinates.x, y: face.coordinates.y });
  };

  const handleBoxDragEnd = (event, info) => {
    if (!dragStartPos || !containerRef.current) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    
    const dx = (info.offset.x / parentRect.width) * 100;
    const dy = (info.offset.y / parentRect.height) * 100;

    let newX = dragStartPos.x + dx;
    let newY = dragStartPos.y + dy;

    // Clamp position to stay within parent bounds
    newX = Math.max(0, Math.min(newX, 100 - face.coordinates.width));
    newY = Math.max(0, Math.min(newY, 100 - face.coordinates.height));

    onUpdate(face.face_id, {
      ...face.coordinates,
      x: newX,
      y: newY,
    });
    setDragStartPos(null);
  };

  // Dragging the resize handle
  const handleResizeDragStart = () => {
    setResizeStart({
      width: face.coordinates.width,
      height: face.coordinates.height,
    });
  };

  const handleResizeDragEnd = (event, info) => {
    if (!resizeStart || !containerRef.current) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    
    const dx = (info.offset.x / parentRect.width) * 100;
    const dy = (info.offset.y / parentRect.height) * 100;

    let newWidth = resizeStart.width + dx;
    let newHeight = resizeStart.height + dy;

    // Clamp size to stay within parent bounds
    newWidth = Math.max(5, Math.min(newWidth, 100 - face.coordinates.x));
    newHeight = Math.max(5, Math.min(newHeight, 100 - face.coordinates.y));

    onUpdate(face.face_id, {
      ...face.coordinates,
      width: newWidth,
      height: newHeight,
    });
    setResizeStart(null);
  };

  return (
    <motion.div
      className="absolute border-2 border-red-400/70 rounded-lg cursor-grab active:cursor-grabbing bg-red-400/10 hover:bg-red-400/20 transition-colors"
      style={{
        left: `${face.coordinates.x}%`,
        top: `${face.coordinates.y}%`,
        width: `${face.coordinates.width}%`,
        height: `${face.coordinates.height}%`,
      }}
      drag
      onDragStart={handleBoxDragStart}
      onDragEnd={handleBoxDragEnd}
      dragMomentum={false}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Delete button */}
      {isHovered && (
        <Button
          onClick={() => onDelete(face.face_id)}
          size="icon"
          variant="destructive"
          className="absolute -top-2 -left-2 w-5 h-5 rounded-full shadow-md"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X className="w-3 h-3" />
        </Button>
      )}

      {/* Resize handle */}
      <motion.div
        className="absolute -bottom-2 -right-2 w-5 h-5 bg-red-400 rounded-full flex items-center justify-center cursor-nwse-resize text-white shadow-md"
        drag
        onDragStart={handleResizeDragStart}
        onDragEnd={handleResizeDragEnd}
        dragMomentum={false}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Maximize2 className="w-2.5 h-2.5" />
      </motion.div>
    </motion.div>
  );
}

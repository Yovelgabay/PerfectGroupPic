import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2 } from 'lucide-react';

// Draggable and resizable face highlight box
export default function FaceHighlight({ face, onChange, isReplaced }) {
  const containerRef = useRef(null);
  const [box, setBox] = useState(face.coordinates);
  const dragStart = useRef(null);
  const resizeStart = useRef(null);

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const startDrag = (e) => {
    e.stopPropagation();
    dragStart.current = { x: e.clientX, y: e.clientY, box: { ...box } };
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);
  };

  const onDrag = (e) => {
    if (!dragStart.current) return;
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    const { offsetWidth, offsetHeight } = parent;
    const dx = ((e.clientX - dragStart.current.x) / offsetWidth) * 100;
    const dy = ((e.clientY - dragStart.current.y) / offsetHeight) * 100;
    setBox((prev) => ({
      ...prev,
      x: clamp(dragStart.current.box.x + dx, 0, 100 - prev.width),
      y: clamp(dragStart.current.box.y + dy, 0, 100 - prev.height),
    }));
  };

  const endDrag = () => {
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', endDrag);
    dragStart.current = null;
    onChange?.({ ...face, coordinates: box });
  };

  const startResize = (e) => {
    e.stopPropagation();
    resizeStart.current = { x: e.clientX, y: e.clientY, box: { ...box } };
    window.addEventListener('mousemove', onResize);
    window.addEventListener('mouseup', endResize);
  };

  const onResize = (e) => {
    if (!resizeStart.current) return;
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    const { offsetWidth, offsetHeight } = parent;
    const dx = ((e.clientX - resizeStart.current.x) / offsetWidth) * 100;
    const dy = ((e.clientY - resizeStart.current.y) / offsetHeight) * 100;
    setBox((prev) => ({
      ...prev,
      width: clamp(resizeStart.current.box.width + dx, 5, 100 - prev.x),
      height: clamp(resizeStart.current.box.height + dy, 5, 100 - prev.y),
    }));
  };

  const endResize = () => {
    window.removeEventListener('mousemove', onResize);
    window.removeEventListener('mouseup', endResize);
    resizeStart.current = null;
    onChange?.({ ...face, coordinates: box });
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="absolute group cursor-move"
      style={{
        left: `${box.x}%`,
        top: `${box.y}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
      }}
      onMouseDown={startDrag}
    >
      <div
        className={`w-full h-full rounded-lg transition-all duration-300 border-4 ${
          isReplaced
            ? 'border-green-400 bg-green-400/20'
            : 'border-red-400/50 group-hover:border-red-400 group-hover:bg-red-400/20'
        }`}
      />
      <div
        className={`absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg ${
          isReplaced ? 'bg-green-500' : 'bg-red-500 group-hover:bg-red-600'
        }`}
      >
        {isReplaced ? <Check className="w-4 h-4" /> : <Edit2 className="w-3 h-3" />}
      </div>
      <div
        onMouseDown={startResize}
        className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-red-500 cursor-se-resize"
      />
    </motion.div>
  );
}
import React, {useState, useRef, useEffect} from "react";
import {motion} from "framer-motion";
import {Scissors, RotateCcw, CheckCircle, X} from "lucide-react";
import {Button} from "../ui/button";
import {Card, CardContent} from "../ui/card";

export default function LassoTool({imageUrl, onSelectionComplete, onCancel}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const scale = Math.min(
        canvas.width / image.width,
        canvas.height / image.height
      );

      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;
      const x = (canvas.width - scaledWidth) / 2;
      const y = (canvas.height - scaledHeight) / 2;

      ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
      imageRef.current = {
        image,
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
        scale,
      };
      setImageLoaded(true);
    };

    image.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!imageLoaded) return;
    drawCanvas();
  }, [points, isComplete, imageLoaded]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const {image, x, y, width, height} = imageRef.current;

    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, x, y, width, height);

    if (points.length > 1) {
      // Draw lasso path
      ctx.strokeStyle = "#FF6B6B";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      if (isComplete) {
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 107, 107, 0.2)";
        ctx.fill();
      }

      ctx.stroke();

      // Draw points
      points.forEach((point, index) => {
        ctx.fillStyle = index === 0 ? "#4ECDC4" : "#FF6B6B";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    if (isComplete) return;

    const point = getCanvasPoint(e);
    const {x, y, width, height} = imageRef.current;

    // Check if click is within image bounds
    if (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    ) {
      if (points.length > 2) {
        // Check if clicking near the first point to close the lasso
        const firstPoint = points[0];
        const distance = Math.sqrt(
          Math.pow(point.x - firstPoint.x, 2) +
            Math.pow(point.y - firstPoint.y, 2)
        );

        if (distance < 15) {
          setIsComplete(true);
          return;
        }
      }

      setPoints((prev) => [...prev, point]);
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || isComplete) return;

    const point = getCanvasPoint(e);
    const {x, y, width, height} = imageRef.current;

    if (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    ) {
      setPoints((prev) => [...prev, point]);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseDown(touch);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove(touch);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleMouseUp();
  };

  const resetLasso = () => {
    setPoints([]);
    setIsComplete(false);
    setIsDrawing(false);
  };

  const confirmSelection = () => {
    if (!isComplete || points.length < 3) return;

    const {
      x: imgX,
      y: imgY,
      width: imgWidth,
      height: imgHeight,
      scale,
    } = imageRef.current;

    // Convert canvas coordinates to image percentage coordinates
    const normalizedPoints = points.map((point) => ({
      x: ((point.x - imgX) / imgWidth) * 100,
      y: ((point.y - imgY) / imgHeight) * 100,
    }));

    // Calculate bounding box
    const minX = Math.min(...normalizedPoints.map((p) => p.x));
    const maxX = Math.max(...normalizedPoints.map((p) => p.x));
    const minY = Math.min(...normalizedPoints.map((p) => p.y));
    const maxY = Math.max(...normalizedPoints.map((p) => p.y));

    const selection = {
      points: normalizedPoints,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
    };

    onSelectionComplete(selection);
  };

  return (
    <motion.div
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scissors className="w-5 h-5 text-red-400" />
          <div>
            <h3 className="font-semibold text-gray-900">Lasso Tool</h3>
            <p className="text-xs text-gray-600">
              Trace around the face you want to select
            </p>
          </div>
        </div>
        <Button onClick={onCancel} size="icon" variant="ghost">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <Card className="w-full h-full max-w-md max-h-[60vh] overflow-hidden">
          <CardContent className="p-0 h-full">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <div className="bg-white/90 backdrop-blur-sm p-4 text-center">
        {!isComplete ? (
          <p className="text-sm text-gray-600 mb-4">
            {points.length === 0
              ? "Tap and drag to trace around a face"
              : points.length < 3
              ? "Continue tracing..."
              : "Tap near the first point to close the selection"}
          </p>
        ) : (
          <p className="text-sm text-green-600 mb-4 font-medium">
            ✨ Selection complete! Confirm to use this face.
          </p>
        )}

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {points.length > 0 && (
            <Button
              onClick={resetLasso}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}

          {isComplete && (
            <Button
              onClick={confirmSelection}
              className="bg-gradient-to-r from-red-400 to-teal-400 hover:from-red-500 hover:to-teal-500 text-white flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Use This Selection
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

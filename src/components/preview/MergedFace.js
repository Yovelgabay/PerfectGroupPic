import React from "react";
import {motion} from "framer-motion";

export default function MergedFace({face}) {
  // Use the coordinates from the replacement face to position and size the overlay
  const {coordinates, photo_url, isCustom, selection} = face;

  // This style object will be used for both regular and lasso-selected faces.
  // It positions and sizes the container for the face.
  const containerStyle = {
    left: `${coordinates.x}%`,
    top: `${coordinates.y}%`,
    width: `${coordinates.width}%`,
    height: `${coordinates.height}%`,
  };

  // This style object handles the magic of cropping and blending.
  // It uses the replacement photo as a background and positions it
  // so that the correct face appears within the container.
  const cropStyle = {
    backgroundImage: `url(${photo_url})`,
    // Calculate background-size to scale the source image correctly inside the container
    backgroundSize: `${(100 / coordinates.width) * 100}% ${
      (100 / coordinates.height) * 100
    }%`,
    // Calculate background-position to align the face within the container
    backgroundPosition: `${(-coordinates.x / coordinates.width) * 100}% ${
      (-coordinates.y / coordinates.height) * 100
    }%`,
    // This mask creates the soft-edge effect for seamless blending
    maskImage: "radial-gradient(circle, black 60%, transparent 100%)",
    WebkitMaskImage: "radial-gradient(circle, black 60%, transparent 100%)",
  };

  // For custom lasso selections, we apply a clip-path instead of a mask
  if (isCustom && selection) {
    cropStyle.maskImage = "none"; // Remove the radial mask
    cropStyle.WebkitMaskImage = "none";
    cropStyle.clipPath = `polygon(${selection
      .map((point) => `${point.x}% ${point.y}%`)
      .join(", ")})`;
  }

  return (
    <motion.div
      initial={{opacity: 0, scale: 0.8}}
      animate={{opacity: 1, scale: 1}}
      transition={{delay: 0.2, type: "spring", stiffness: 150}}
      className="absolute"
      style={containerStyle}
    >
      <div className="w-full h-full" style={cropStyle} />
    </motion.div>
  );
}

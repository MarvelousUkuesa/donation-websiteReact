// src/components/ImageCarousel.js
import React, { useState, useEffect } from "react";

// Replace with your actual image paths
const images = [
  "./images/backgroundImg/yaam_eventt1_011.jpg",
  "./images/backgroundImg/yaam_eventt1_012.jpg",
  "./images/backgroundImg/yaam_eventt2_008.jpg",
  "./images/backgroundImg/yaam_eventt2_009.jpg",
];
function ImageCarousel() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
      <div className="absolute inset-0 bg-black opacity-50"></div>{" "}
      {/* Overlay for better text readability */}
    </div>
  );
}

export default ImageCarousel;

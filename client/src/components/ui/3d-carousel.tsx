import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Maximize2, ChevronLeft, ChevronRight } from "lucide-react";

interface Carousel3DProps {
  images: string[];
}

export function Carousel3D({ images }: Carousel3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-rotate
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Helper to get image index with wrap-around
  const getIndex = (offset: number) => {
    return (currentIndex + offset + images.length) % images.length;
  };

  return (
    <div 
      className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center perspective-[1200px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background/Side images */}
      <div className="absolute w-full h-full flex items-center justify-center opacity-40 blur-[2px] scale-90 translate-x-[-20%] translate-z-[-200px] rotate-y-[15deg] transition-all duration-700 pointer-events-none">
        <img src={images[getIndex(-1)]} className="w-4/5 h-3/4 object-cover rounded-xl shadow-lg" alt="" />
      </div>
      
      <div className="absolute w-full h-full flex items-center justify-center opacity-40 blur-[2px] scale-90 translate-x-[20%] translate-z-[-200px] rotate-y-[-15deg] transition-all duration-700 pointer-events-none">
        <img src={images[getIndex(1)]} className="w-4/5 h-3/4 object-cover rounded-xl shadow-lg" alt="" />
      </div>

      {/* Main Front Image */}
      <Dialog>
        <DialogTrigger asChild>
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0.5, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0.5, scale: 0.9, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-[90%] md:w-4/5 h-4/5 cursor-pointer group rounded-2xl shadow-2xl overflow-hidden"
          >
            <img 
              src={images[currentIndex]} 
              alt={`Venue image ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <Maximize2 className="text-white w-10 h-10" />
            </div>
            
            {/* Controls */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="max-w-5xl bg-transparent border-0 shadow-none p-0">
          <DialogTrigger asChild>
            <button className="sr-only">Open image</button>
          </DialogTrigger>
          <div className="sr-only" id="dialog-title">Venue Image {currentIndex + 1}</div>
          <img src={images[currentIndex]} alt={`Venue image ${currentIndex + 1}`} className="w-full h-auto max-h-[85vh] object-contain rounded-lg" aria-labelledby="dialog-title" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

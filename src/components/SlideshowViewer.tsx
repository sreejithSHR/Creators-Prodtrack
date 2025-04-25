import React, { useEffect, useRef, useState } from 'react';
import { Tldraw, createTLStore } from '@tldraw/tldraw';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';
import '@tldraw/tldraw/tldraw.css';
import type { Shot } from '../types/database';

interface SlideshowViewerProps {
  shots: Shot[];
  onClose: () => void;
}

export default function SlideshowViewer({ shots, onClose }: SlideshowViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayDuration, setAutoplayDuration] = useState(3000); // 3 seconds
  const store = useRef(createTLStore()).current;
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev === shots.length - 1 ? 0 : prev + 1));
      }, autoplayDuration);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, shots.length, autoplayDuration]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? shots.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === shots.length - 1 ? 0 : prev + 1));
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const currentShot = shots[currentIndex];

  useEffect(() => {
    if (currentShot?.whiteboard_data) {
      try {
        const data = JSON.parse(currentShot.whiteboard_data);
        store.loadSnapshot(data);
      } catch (e) {
        console.error('Failed to load whiteboard data:', e);
      }
    }
  }, [currentShot, store]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'Escape') {
      onClose();
    } else if (e.key === ' ') {
      togglePlayPause();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <div className="text-white flex items-center gap-2">
          <input
            type="number"
            value={autoplayDuration / 1000}
            onChange={(e) => setAutoplayDuration(Number(e.target.value) * 1000)}
            className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
            min="1"
            max="10"
          />
          <span className="text-sm">seconds</span>
        </div>
        <button
          onClick={togglePlayPause}
          className="p-2 text-white hover:text-gray-300"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button
          onClick={onClose}
          className="p-2 text-white hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
        {currentIndex + 1} / {shots.length}
      </div>

      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 text-white hover:text-gray-300"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-white hover:text-gray-300"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div className="max-w-6xl w-full mx-4 bg-white rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">{currentShot.title}</h2>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Shot Type</p>
              <p className="font-medium">{currentShot.type}</p>
            </div>
            {currentShot.duration && (
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{currentShot.duration}</p>
              </div>
            )}
          </div>
          {currentShot.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-1">{currentShot.description}</p>
            </div>
          )}
        </div>

        <div className="h-[600px] relative">
          {currentShot.whiteboard_data ? (
            <Tldraw store={store} readOnly hideUi />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No storyboard available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
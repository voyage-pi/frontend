import { useState, useEffect, useRef } from "react";
import LoadingAnimation from "./LoadingAnimation";

function LoadingItinerary({
  message = "Creating your itinerary...",
  progress = null,
  showProgress = false,
}) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const animationRef = useRef(null);
  const continuousIntervalRef = useRef(null);

  const phrases = [
    "Creating your itinerary...",
    "Calling bloggers...",
    "Organizing activities...",
    "Finding hidden gems...",
    "Calculating distances...",
    "Selecting best routes...",
    "Gathering recommendations...",
    "Optimizing your schedule...",
    "Discovering local spots...",
    "Planning perfect timing...",
    "This is taking a bit...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [phrases.length]);

  // Initialize progress when showProgress becomes true
  useEffect(() => {
    if (showProgress && smoothProgress === 0) {
      setSmoothProgress(5); // Start at 5%
    }
  }, [showProgress]);

  // Handle WebSocket completion (when progress = 100)
  useEffect(() => {
    if (progress === 100 && showProgress) {
      // Clear the fake progress interval
      if (continuousIntervalRef.current) {
        clearInterval(continuousIntervalRef.current);
        continuousIntervalRef.current = null;
      }

      // Animate to 100%
      const startProgress = smoothProgress;
      const targetProgress = 100;
      const duration = 800;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);

        const easeOutQuart = 1 - Math.pow(1 - progressRatio, 4);
        const currentValue =
          startProgress + (targetProgress - startProgress) * easeOutQuart;

        setSmoothProgress(currentValue);

        if (progressRatio < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [progress, showProgress]);

  // Simple fake progress system - ignore WebSocket progress except completion
  useEffect(() => {
    if (showProgress && progress !== 100 && !continuousIntervalRef.current) {
      let timeElapsed = 0;

      continuousIntervalRef.current = setInterval(() => {
        timeElapsed += 200; // Increment by 200ms each time

        setSmoothProgress((prev) => {
          // After 1s: jump to 10-15%
          if (timeElapsed >= 1000 && timeElapsed < 1200 && prev < 10) {
            return 10 + Math.random() * 5; // 10-15%
          }

          // After 6s: jump to 30-40%
          if (timeElapsed >= 6000 && timeElapsed < 6200 && prev < 30) {
            return 30 + Math.random() * 10; // 30-40%
          }

          // After 11s: jump to 50-60%
          if (timeElapsed >= 11000 && timeElapsed < 11200 && prev < 50) {
            return 50 + Math.random() * 10; // 50-60%
          }

          // After 16s: jump to 65-75%
          if (timeElapsed >= 16000 && timeElapsed < 16200 && prev < 65) {
            return 65 + Math.random() * 10; // 65-75%
          }

          // After 21s: jump to 80% and stay there
          if (timeElapsed >= 21000 && prev < 80) {
            return 80;
          }

          // Small increments between jumps (but don't exceed next threshold)
          if (prev < 80) {
            const increment = 0.1 + Math.random() * 0.2; // Very slow increment
            const newProgress = prev + increment;

            // Don't exceed thresholds before their time
            if (timeElapsed < 6000 && newProgress >= 10) return prev;
            if (timeElapsed < 11000 && newProgress >= 30) return prev;
            if (timeElapsed < 16000 && newProgress >= 50) return prev;
            if (timeElapsed < 21000 && newProgress >= 65) return prev;

            return Math.min(newProgress, 80);
          }

          // Stay at 80% once reached
          return prev;
        });
      }, 200); // Update every 200ms
    }

    return () => {
      if (continuousIntervalRef.current) {
        clearInterval(continuousIntervalRef.current);
        continuousIntervalRef.current = null;
      }
    };
  }, [showProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (continuousIntervalRef.current) {
        clearInterval(continuousIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="text-center justify-center items-center flex flex-col h-screen">
      <div className="svg-container">
        <LoadingAnimation />
      </div>
      <div className="text-xl font-light text-primary -pt-3 mb-6">
        {phrases[currentPhrase].split(" ").map((word, index, array) => {
          if (index === array.length - 1) {
            return (
              <span key={index} className="font-bold">
                {word}
              </span>
            );
          }
          return `${word} `;
        })}
      </div>

      {showProgress && (
        <div className="w-full max-w-lg mx-4">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4"></div>
            <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 overflow-hidden shadow-inner border border-gray-200/50">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out relative bg-gradient-to-r from-primary via-rose-500 to-rose-600 shadow-sm"
                style={{ width: `${Math.min(smoothProgress, 100)}%` }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse rounded-full"></div>
                {/* Moving highlight */}
                <div className="absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white/50 to-transparent rounded-full animate-pulse"></div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-full shadow-lg opacity-60"></div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 font-light">
              This may take up to{" "}
              <span className="font-medium text-gray-700">1 minute</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadingItinerary;

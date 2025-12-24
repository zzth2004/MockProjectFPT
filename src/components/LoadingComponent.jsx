import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PRIMARY = "#008236";
const PRIMARY_DARK = "#00591A";

export function LoadingComponent({ isVisible = true, onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onComplete?.();
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isVisible, onComplete]);

  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-white/30 backdrop-blur-sm"
        >
          <div className="relative flex items-center justify-center">
            {/* Vòng tròn quay */}
            <motion.svg
              height={radius * 2}
              width={radius * 2}
              animate={progress < 100 ? { rotate: 360 } : { rotate: 0 }}
              transition={
                progress < 100
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : { duration: 0 }
              }
            >
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={PRIMARY} />
                  <stop offset="100%" stopColor={PRIMARY_DARK} />
                </linearGradient>
              </defs>
              <circle
                stroke="#e0e0e0"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="url(#grad)"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                style={{
                  strokeDashoffset,
                  transition: "stroke-dashoffset 0.05s linear",
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </motion.svg>

            {/* Số % đứng yên */}
            <span
              className="absolute text-xl font-bold"
              style={{ color: PRIMARY }}
            >
              {progress}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

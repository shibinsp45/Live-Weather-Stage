import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BalloonItem } from "../types";

interface BalloonEffectProps {
  key?: string;
  triggerId: number; // Unique timestamp or counter to trigger a new session
  onComplete?: () => void;
}

// Beautiful color palettes for formal, premium-looking balloons
const BALLOON_COLORS = [
  { from: "from-rose-500", to: "to-rose-400", border: "border-rose-400/30", color: "#f43f5e" },
  { from: "from-teal-500", to: "to-teal-400", border: "border-teal-400/30", color: "#14b8a6" },
  { from: "from-indigo-500", to: "to-indigo-400", border: "border-indigo-400/30", color: "#6366f1" },
  { from: "from-amber-500", to: "to-amber-400", border: "border-amber-400/30", color: "#f59e0b" },
  { from: "from-violet-500", to: "to-violet-400", border: "border-violet-400/30", color: "#8b5cf6" },
  { from: "from-sky-500", to: "to-sky-400", border: "border-sky-400/30", color: "#0ea5e9" }
];

export default function BalloonEffect({ triggerId, onComplete }: BalloonEffectProps) {
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);

  useEffect(() => {
    if (triggerId === 0) return;

    // Generate balloons that float up
    const count = 30; // Clean, elegant density
    const newBalloons: BalloonItem[] = Array.from({ length: count }).map((_, i) => {
      const id = `${triggerId}-balloon-${i}`;
      const left = Math.random() * 88 + 6; // Avoid absolute edges
      const sizeMultiplier = Math.random() * 0.4 + 0.8; // Medium multiplier around 1.0 (approx 44px to 54px wide)
      const delay = Math.random() * 3.8; // Staggered delays over 3.8 seconds so they float out for 5s of release
      const duration = Math.random() * 1.5 + 3.2; // Float duration: 3.2 to 4.7 seconds
      const swayRange = Math.random() * 25 + 15; // Wiggle width: 15px to 40px

      // Select random color template
      const colorIndex = Math.floor(Math.random() * BALLOON_COLORS.length);
      const color = JSON.stringify(BALLOON_COLORS[colorIndex]);

      return { id, left, sizeMultiplier, duration, delay, color, swayRange };
    });

    setBalloons(newBalloons);

    // End of full animation cycle including delays and flight: approx 8.5 seconds
    const cleanupTimeout = setTimeout(() => {
      setBalloons((prev) => prev.filter((item) => !item.id.startsWith(`${triggerId}-`)));
      if (onComplete) {
        onComplete();
      }
    }, 8500);

    return () => {
      clearTimeout(cleanupTimeout);
    };
  }, [triggerId, onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {balloons.map((balloon) => {
          const colorObj = JSON.parse(balloon.color);
          const width = 44 * balloon.sizeMultiplier;
          const height = 58 * balloon.sizeMultiplier;

          return (
            <motion.div
              key={balloon.id}
              initial={{
                left: `${balloon.left}%`,
                y: "110vh",
                x: 0,
                opacity: 0,
              }}
              animate={{
                y: "-15vh",
                opacity: [0, 0.95, 0.95, 0],
                x: [0, -balloon.swayRange, balloon.swayRange, -balloon.swayRange / 2, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{
                y: { duration: balloon.duration, delay: balloon.delay, ease: "easeOut" },
                opacity: { times: [0, 0.1, 0.85, 1], duration: balloon.duration, delay: balloon.delay },
                x: {
                  duration: balloon.duration,
                  delay: balloon.delay,
                  ease: "easeInOut",
                  repeat: 0,
                }
              }}
              className="absolute flex flex-col items-center"
              style={{ width, height: height + 60 }} // Extra height for the knot and hanging string
            >
              {/* Balloon main glossy body */}
              <div
                id={`balloon-body-${balloon.id}`}
                className={`relative rounded-t-full rounded-b-[62%] bg-gradient-to-tr ${colorObj.from} ${colorObj.to} shadow-lg shadow-black/10 border ${colorObj.border}`}
                style={{ width, height }}
              >
                {/* 3D Glassy Reflection Arc */}
                <div 
                  id={`balloon-reflection-${balloon.id}`}
                  className="absolute top-2 left-2.5 w-2 h-4 rounded-full bg-white/35 rotate-[-25deg] blur-[0.5px]" 
                />
              </div>

              {/* Balloon little tie/knot (Triangle) */}
              <div 
                id={`balloon-knot-${balloon.id}`}
                className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px]"
                style={{ borderBottomColor: colorObj.color, marginTop: "-2px" }}
              />

              {/* Elegant swaying thread */}
              <div 
                id={`balloon-thread-${balloon.id}`}
                className="w-[1.5px] bg-slate-300 dark:bg-slate-500/60 opacity-60"
                style={{ height: "45px" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

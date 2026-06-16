import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Snowflake } from "lucide-react";
import { SnowflakeItem } from "../types";

interface SnowflakeEffectProps {
  key?: string;
  triggerId: number; // Unique timestamp or counter to trigger a new session
  onComplete?: () => void;
}

export default function SnowflakeEffect({ triggerId, onComplete }: SnowflakeEffectProps) {
  const [snowflakes, setSnowflakes] = useState<SnowflakeItem[]>([]);

  useEffect(() => {
    if (triggerId === 0) return;

    // Generate a beautiful cascade of medium snowflakes
    // Total duration is 5 seconds of active generation/falling
    const count = 45;
    const newSnowflakes: SnowflakeItem[] = Array.from({ length: count }).map((_, i) => {
      const id = `${triggerId}-snow-${i}`;
      const left = Math.random() * 96 + 2; // Keep away from extreme edges slightly
      const size = (Math.random() * 8 + 18) * 2; // Increased to twice their previous size (36px to 52px)
      // Stagger delays over 4 seconds so they fall continuously for 5 seconds
      const delay = Math.random() * 4; 
      // Fall duration: 2.5 to 3.5 seconds
      const duration = Math.random() * 1.5 + 2.5; 
      const opacity = Math.random() * 0.4 + 0.6; // Keep them nice and clean

      return { id, left, size, duration, delay, opacity };
    });

    setSnowflakes(newSnowflakes);

    // Cleanup this specific batch after 8 seconds (delay + duration max is ~7.5s)
    const cleanupTimeout = setTimeout(() => {
      setSnowflakes((prev) => prev.filter((item) => !item.id.startsWith(`${triggerId}-`)));
      if (onComplete) {
        onComplete();
      }
    }, 7500);

    return () => {
      clearTimeout(cleanupTimeout);
    };
  }, [triggerId, onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {snowflakes.map((snowflake) => (
          <motion.div
            key={snowflake.id}
            initial={{ 
              left: `${snowflake.left}%`, 
              y: "-5vh", 
              x: 0, 
              rotate: 0, 
              opacity: 0 
            }}
            animate={{
              y: "105vh",
              opacity: [0, snowflake.opacity, snowflake.opacity, 0],
              rotate: [0, 120, 240, 360],
              x: [0, Math.random() * 30 - 15, Math.random() * 30 - 15, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{
              y: { duration: snowflake.duration, delay: snowflake.delay, ease: "linear" },
              opacity: { times: [0, 0.1, 0.85, 1], duration: snowflake.duration, delay: snowflake.delay, ease: "linear" },
              rotate: { duration: snowflake.duration * 1.5, delay: snowflake.delay, ease: "linear", repeat: Infinity },
              x: { duration: snowflake.duration, delay: snowflake.delay, ease: "easeInOut" }
            }}
            style={{ position: "absolute", width: snowflake.size, height: snowflake.size }}
          >
            <Snowflake 
              id={`svg-snowflake-${snowflake.id}`}
              size={snowflake.size} 
              className="text-sky-200/80 drop-shadow-[0_2px_4px_rgba(186,230,253,0.3)] filter" 
              strokeWidth={1.5}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

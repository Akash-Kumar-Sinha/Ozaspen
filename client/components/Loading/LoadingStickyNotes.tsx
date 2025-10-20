import React from "react";
import { motion } from "framer-motion";
import { StickyNote, Loader2 } from "lucide-react";
import { colorMap } from "@/app/types/types";

const LoadingStickyNotes = () => {
  const colors = Object.keys(colorMap) as (keyof typeof colorMap)[];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background/50">
      <div className="relative flex flex-col items-center">
        <motion.div
          className="absolute rounded-full bg-primary/5 -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: "200px",
            height: "200px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        <div className="relative w-32 h-32 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <Loader2 className="w-8 h-8 text-muted-foreground" />
          </motion.div>

          {colors.slice(0, 4).map((color, index) => {
            const col = index % 2;
            const row = Math.floor(index / 2);
            const baseX = col * 40 - 20;
            const baseY = row * 40 - 20;

            return (
              <motion.div
                key={color}
                initial={{
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: [0, 1, 0.8, 1],
                  opacity: [0, 0.8, 0.5, 0.3],
                  x: [0, baseX * 1.5],
                  y: [0, baseY * 1.5],
                }}
                transition={{
                  duration: 2,
                  delay: index * 0.3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 w-12 h-16 rounded-md shadow-md flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  backgroundColor: colorMap[color],
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 0.8, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <StickyNote className="w-4 h-4 text-black/40" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-foreground mb-3">
            Loading Sticky Notes
          </h3>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>Fetching your notes</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ...
            </motion.span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingStickyNotes;

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { glassPanel } from "./styles";

type Props = { visible: boolean; bottomOffset: number };

export function HintPill({ visible, bottomOffset }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4 }}
          style={{
            ...glassPanel,
            position: "absolute",
            bottom: bottomOffset,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 15,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "9px 18px",
            borderRadius: 9999,
            color: "#e4e0d8",
            fontSize: "0.82rem",
            fontWeight: 500,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          <svg width="15" height="19" viewBox="0 0 16 20" fill="none" stroke="#e4e0d8" strokeWidth="1.6">
            <rect x="2" y="2" width="12" height="16" rx="6" />
            <line x1="8" y1="5" x2="8" y2="8" />
          </svg>
          Döndürmek için sürükleyin · çift tıkla odakla
        </motion.div>
      )}
    </AnimatePresence>
  );
}

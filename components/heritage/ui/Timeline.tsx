"use client";

import { motion } from "framer-motion";
import { glassPanel } from "./styles";
import type { TimelineEntry } from "../lib/types";

type Props = {
  entries: TimelineEntry[];
  activeYear: string | null;
  onSelect: (entry: TimelineEntry) => void;
};

/**
 * Horizontal year navigation docked at the bottom of the stage.
 */
export function Timeline({ entries, activeYear, onSelect }: Props) {
  if (entries.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...glassPanel,
        position: "absolute",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "7px 10px",
        maxWidth: "92vw",
        overflowX: "auto",
      }}
    >
      {entries.map((entry) => {
        const active = entry.year === activeYear;
        return (
          <button
            key={entry.year}
            onClick={() => onSelect(entry)}
            style={{
              position: "relative",
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: 9999,
              border: "none",
              background: active ? "rgba(213,176,94,0.2)" : "transparent",
              color: active ? "#e7c878" : "#b8b4ac",
              fontWeight: active ? 700 : 500,
              fontSize: "0.82rem",
              letterSpacing: "0.02em",
              cursor: "pointer",
              fontFamily: 'Georgia, "Times New Roman", serif',
              transition: "all 0.2s",
            }}
          >
            {entry.year}
          </button>
        );
      })}
    </motion.div>
  );
}

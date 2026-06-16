"use client";

import { motion } from "framer-motion";
import { glassPanel } from "./styles";

type Props = { title: string; location: string };

export function TitleBadge({ title, location }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...glassPanel,
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 18px",
        maxWidth: "min(72vw, 380px)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.95rem",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#9d978c",
            fontSize: "0.74rem",
            marginTop: 2,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9d978c" strokeWidth="2.4">
            <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </div>
      </div>
    </motion.div>
  );
}

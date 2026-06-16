"use client";

import { AnimatePresence, motion } from "framer-motion";
import { glassPanel } from "./styles";
import type { Hotspot } from "../lib/types";

type Props = {
  hotspot: Hotspot | null;
  onClose: () => void;
};

const KIND_LABEL: Record<NonNullable<Hotspot["kind"]>, string> = {
  history: "Tarihçe",
  date: "Yapım Tarihi",
  ottoman: "Osmanlı Dönemi",
  british: "İngiliz Dönemi",
  event: "Tarihî Olay",
};

export function InfoCard({ hotspot, onClose }: Props) {
  return (
    <AnimatePresence>
      {hotspot && (
        <motion.div
          key={hotspot.id}
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            ...glassPanel,
            position: "absolute",
            right: 16,
            bottom: 104,
            zIndex: 30,
            width: "min(86vw, 320px)",
            padding: 18,
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#e7c878",
              fontWeight: 700,
            }}
          >
            {hotspot.kind ? KIND_LABEL[hotspot.kind] : "Bilgi"}
          </span>
          <h3
            style={{
              margin: "8px 0 8px",
              color: "#fff",
              fontSize: "1.05rem",
              fontWeight: 700,
              lineHeight: 1.25,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {hotspot.label}
          </h3>
          <p
            style={{
              margin: 0,
              color: "#cbc6bd",
              fontSize: "0.85rem",
              lineHeight: 1.6,
            }}
          >
            {hotspot.body}
          </p>

          <button
            onClick={onClose}
            aria-label="Kapat"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

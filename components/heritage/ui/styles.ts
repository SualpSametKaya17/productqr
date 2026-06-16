import type { CSSProperties } from "react";

/* Shared glassmorphism surface used across every floating panel. */
export const glassPanel: CSSProperties = {
  background: "rgba(22,22,26,0.62)",
  backdropFilter: "blur(18px) saturate(140%)",
  WebkitBackdropFilter: "blur(18px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 16,
  boxShadow: "0 10px 40px -12px rgba(0,0,0,0.6)",
};

export const goldText = "#e7c878";

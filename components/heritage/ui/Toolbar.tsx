"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { glassPanel } from "./styles";

type Props = {
  autoRotate: boolean;
  isFullscreen: boolean;
  onToggleAutoRotate: () => void;
  onReset: () => void;
  onFocus: () => void;
  onToggleFullscreen: () => void;
  onHelp: () => void;
};

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: 58,
        padding: "9px 4px",
        background: active ? "rgba(213,176,94,0.18)" : "transparent",
        border: "none",
        borderRadius: 11,
        cursor: "pointer",
        color: active ? "#e7c878" : "#b8b4ac",
        transition: "all 0.18s",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </span>
      <span style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.02em" }}>
        {label}
      </span>
    </button>
  );
}

export function Toolbar({
  autoRotate,
  isFullscreen,
  onToggleAutoRotate,
  onReset,
  onFocus,
  onToggleFullscreen,
  onHelp,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...glassPanel,
        position: "absolute",
        left: 16,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 6,
      }}
    >
      <ToolButton label="Otomatik" active={autoRotate} onClick={onToggleAutoRotate}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <polyline points="21 3 21 9 15 9" />
        </svg>
      </ToolButton>

      <ToolButton label="Odakla" onClick={onFocus}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
        </svg>
      </ToolButton>

      <ToolButton label="Sıfırla" onClick={onReset}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.7 3" />
          <polyline points="3 3 3 8 8 8" />
        </svg>
      </ToolButton>

      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 8px" }} />

      <ToolButton
        label={isFullscreen ? "Çık" : "Tam Ekran"}
        onClick={onToggleFullscreen}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M16 21h3a2 2 0 0 0 2-2v-3M8 21H5a2 2 0 0 1-2-2v-3" />
        </svg>
      </ToolButton>

      <ToolButton label="Yardım" onClick={onHelp}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 3" />
          <line x1="12" y1="17" x2="12" y2="17" />
        </svg>
      </ToolButton>
    </motion.div>
  );
}

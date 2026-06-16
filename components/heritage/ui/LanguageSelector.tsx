"use client";

import { motion } from "framer-motion";
import { glassPanel } from "./styles";
import type { LanguageOption } from "../lib/types";

type Props = {
  languages: LanguageOption[];
  currentLang: string;
  onChange: (code: string) => void;
};

export function LanguageSelector({ languages, currentLang, onChange }: Props) {
  if (languages.length <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...glassPanel,
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 20,
        display: "flex",
        gap: 3,
        padding: 4,
        borderRadius: 9999,
      }}
    >
      {languages.map((lang) => {
        const active = lang.code === currentLang;
        return (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            style={{
              position: "relative",
              padding: "0.42rem 0.95rem",
              borderRadius: 9999,
              border: "none",
              background: "transparent",
              color: active ? "#1c1408" : "#cfcabf",
              fontWeight: active ? 700 : 500,
              fontSize: "0.76rem",
              letterSpacing: "0.06em",
              cursor: "pointer",
              transition: "color 0.25s",
            }}
          >
            {active && (
              <motion.span
                layoutId="langPill"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 9999,
                  background: "#e7c878",
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {lang.label}
          </button>
        );
      })}
    </motion.div>
  );
}

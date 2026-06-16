"use client";

import { Html } from "@react-three/drei";

type Props = {
  position: [number, number, number];
  active: boolean;
  onClick: () => void;
};

/**
 * A pulsing marker anchored in 3D space (via drei <Html>) that the user
 * taps to open the matching information card. Occlusion keeps markers on
 * the back of the curve hidden as the diorama rotates.
 */
export function Hotspot3D({ position, active, onClick }: Props) {
  return (
    <Html
      position={position}
      center
      distanceFactor={8}
      occlude
      zIndexRange={[40, 0]}
      style={{ pointerEvents: "auto" }}
    >
      <button
        onClick={onClick}
        aria-label="Bilgi noktası"
        style={{
          position: "relative",
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: active
            ? "rgba(213,176,94,0.95)"
            : "rgba(255,255,255,0.16)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: active
            ? "0 0 0 4px rgba(213,176,94,0.25), 0 4px 14px rgba(0,0,0,0.5)"
            : "0 0 0 1px rgba(255,255,255,0.35), 0 4px 12px rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.25s ease",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: active ? "#1c1408" : "#fff",
          }}
        />
        {/* Pulsing ring */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1.5px solid rgba(213,176,94,0.7)",
            animation: "hotspotPulse 2.2s ease-out infinite",
          }}
        />
      </button>
    </Html>
  );
}

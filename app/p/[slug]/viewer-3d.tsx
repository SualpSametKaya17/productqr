"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";

type Img = { id: string; url: string; alt: string | null };

type Props = {
  title: string;
  location?: string;
  images: Img[];
  fallback?: React.ReactNode;
};

type Mode = "rotate" | "pan";

const START = { rotX: 8, rotY: 0, scale: 1, panX: 0, panY: 0 };

export default function Viewer3D({ title, location = "Lefkoşa · Kıbrıs", images, fallback }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rootRef  = useRef<HTMLDivElement>(null);

  const [mode, setMode]       = useState<Mode>("rotate");
  const [rotX, setRotX]       = useState(START.rotX);
  const [rotY, setRotY]       = useState(START.rotY);
  const [scale, setScale]     = useState(START.scale);
  const [pan, setPan]         = useState({ x: START.panX, y: START.panY });
  const [active, setActive]   = useState(0);
  const [hint, setHint]       = useState(true);
  const [isFull, setIsFull]   = useState(false);
  const [dragging, setDragging] = useState(false);

  const drag = useRef<{ x: number; y: number; rotX: number; rotY: number; px: number; py: number } | null>(null);

  const hasImages = images.length > 0;
  const activeImg = images[active];

  const reset = useCallback(() => {
    setRotX(START.rotX); setRotY(START.rotY);
    setScale(START.scale); setPan({ x: START.panX, y: START.panY });
  }, []);

  /* ── Pointer drag ── */
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, rotX, rotY, px: pan.x, py: pan.y };
    setDragging(true);
    setHint(false);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (mode === "rotate") {
      setRotY(drag.current.rotY + dx * 0.4);
      setRotX(Math.max(-32, Math.min(40, drag.current.rotX - dy * 0.35)));
    } else {
      setPan({ x: drag.current.px + dx, y: drag.current.py + dy });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    drag.current = null;
    setDragging(false);
  };

  /* ── Wheel zoom ── */
  const onWheel = (e: React.WheelEvent) => {
    setScale((s) => Math.max(0.5, Math.min(3, s - e.deltaY * 0.0012)));
    setHint(false);
  };

  /* ── Fullscreen ── */
  const toggleFull = () => {
    const el = rootRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  useEffect(() => {
    const h = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const zoomStep = (dir: 1 | -1) => {
    setScale((s) => Math.max(0.5, Math.min(3, s + dir * 0.25)));
    setHint(false);
  };

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        width: "100%",
        height: isFull ? "100vh" : "min(78vh, 720px)",
        background: "radial-gradient(ellipse at 50% 38%, #2a2a2e 0%, #1a1a1d 55%, #131315 100%)",
        overflow: "hidden",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* ── Top-left 3D badge ── */}
      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 10,
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 16px 10px 12px",
        background: "rgba(28,28,32,0.82)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        maxWidth: "min(70vw, 360px)",
      }}>
        <div style={{
          width: 40, height: 40, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10,
          fontSize: "0.78rem", fontWeight: 800, color: "#fff",
          fontFamily: "system-ui, sans-serif", letterSpacing: "-0.02em",
        }}>3D</div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            color: "#fff", fontWeight: 700, fontSize: "0.92rem", lineHeight: 1.2,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{title}</div>
          <div style={{ color: "#9a968e", fontSize: "0.74rem", marginTop: 1 }}>{location}</div>
        </div>
      </div>

      {/* ── Left toolbar ── */}
      <div style={{
        position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", zIndex: 10,
        display: "flex", flexDirection: "column", gap: 2,
        padding: 6,
        background: "rgba(28,28,32,0.82)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
      }}>
        <Tool label="Döndür" onClick={() => setMode("rotate")} activeState={mode === "rotate"}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-3-6.7" /><polyline points="21 3 21 9 15 9" />
          </svg>
        </Tool>
        <Tool label="Yakınlaştır" onClick={() => zoomStep(1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </Tool>
        <Tool label="Taşı" onClick={() => setMode("pan")} activeState={mode === "pan"}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" /><polyline points="15 19 12 22 9 19" /><polyline points="19 9 22 12 19 15" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" />
          </svg>
        </Tool>
        <Tool label="Reset" onClick={reset}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.7 3" /><polyline points="3 3 3 8 8 8" /><rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
        </Tool>
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 8px" }} />
        <Tool label={isFull ? "Çık" : "Tam Ekran"} onClick={toggleFull}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M16 21h3a2 2 0 0 0 2-2v-3M8 21H5a2 2 0 0 1-2-2v-3" />
          </svg>
        </Tool>
        <Tool label="Yardım" onClick={() => setHint(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 3" /><line x1="12" y1="17" x2="12" y2="17" />
          </svg>
        </Tool>
      </div>

      {/* ── 3D Stage ── */}
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          perspective: 1400,
          cursor: dragging ? "grabbing" : mode === "pan" ? "move" : "grab",
        }}
      >
        <div style={{
          transformStyle: "preserve-3d",
          transform: `translate(${pan.x}px, ${pan.y}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`,
          transition: dragging ? "none" : "transform 0.18s ease-out",
        }}>
          {hasImages && activeImg ? (
            <div style={{
              position: "relative",
              width: "min(86vw, 920px)",
              aspectRatio: "3 / 2",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 50px 90px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05)",
              background: "#0e0e10",
            }}>
              <Image
                src={activeImg.url}
                alt={activeImg.alt ?? title}
                fill
                sizes="(max-width: 920px) 86vw, 920px"
                style={{ objectFit: "cover", pointerEvents: "none" }}
                priority
                draggable={false}
              />
              {/* ground reflection */}
              <div style={{
                position: "absolute", left: 0, right: 0, bottom: 0, height: "26%",
                background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.45))",
                pointerEvents: "none",
              }} />
            </div>
          ) : (
            /* Fallback: CSS 3D model */
            <div style={{ pointerEvents: "none" }}>{fallback}</div>
          )}
        </div>
      </div>

      {/* ── Drag hint ── */}
      {hint && (
        <div style={{
          position: "absolute", bottom: hasImages && images.length > 1 ? 92 : 24,
          left: "50%", transform: "translateX(-50%)", zIndex: 10,
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 18px",
          background: "rgba(28,28,32,0.85)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9999,
          color: "#e4e0d8", fontSize: "0.82rem", fontWeight: 500,
          fontFamily: "system-ui, sans-serif",
          pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="#e4e0d8" strokeWidth="1.6">
            <rect x="2" y="2" width="12" height="16" rx="6" /><line x1="8" y1="5" x2="8" y2="8" />
          </svg>
          Döndürmek için sürükleyin
        </div>
      )}

      {/* ── Thumbnail carousel ── */}
      {hasImages && images.length > 1 && (
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 10,
          display: "flex", alignItems: "center", gap: 8,
          maxWidth: "92vw",
        }}>
          <button onClick={() => setActive((i) => (i - 1 + images.length) % images.length)} style={arrowBtn} aria-label="Önceki">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d8d4cc" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: 2 }}>
            {images.map((img, i) => (
              <button key={img.id} onClick={() => setActive(i)} aria-label={`Görsel ${i + 1}`}
                style={{
                  position: "relative", flexShrink: 0, width: 72, height: 52,
                  borderRadius: 8, overflow: "hidden", cursor: "pointer", padding: 0,
                  border: i === active ? "2px solid #fff" : "2px solid rgba(255,255,255,0.15)",
                  opacity: i === active ? 1 : 0.55, background: "#0e0e10",
                }}>
                <Image src={img.url} alt="" fill sizes="72px" style={{ objectFit: "cover" }} />
              </button>
            ))}
          </div>
          <button onClick={() => setActive((i) => (i + 1) % images.length)} style={arrowBtn} aria-label="Sonraki">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d8d4cc" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Toolbar button (declared outside render) ── */
function Tool({
  label, onClick, activeState, children,
}: { label: string; onClick: () => void; activeState?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        width: 60, padding: "10px 4px",
        background: activeState ? "rgba(255,255,255,0.12)" : "transparent",
        border: "none", borderRadius: 10, cursor: "pointer",
        color: activeState ? "#fff" : "#b8b4ac",
        transition: "all 0.15s",
      }}
    >
      <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </span>
      <span style={{ fontSize: "0.64rem", fontWeight: 500, letterSpacing: "0.02em" }}>{label}</span>
    </button>
  );
}

const arrowBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(28,28,32,0.82)",
  border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
};

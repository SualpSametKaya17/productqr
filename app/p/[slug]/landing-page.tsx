"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ── Types ─────────────────────────────────────────────────────── */
type Language   = { id: string; code: string; name: string; nativeName: string; isDefault: boolean };
type Translation = { title: string; description: string; language: Language };
type ProductImage = { id: string; url: string; alt: string | null; isPrimary: boolean };
type Product    = { id: string; slug: string; images: ProductImage[] };
type Props      = { product: Product; translation: Translation; allLanguages: Language[]; slug: string };

/* ── Keyframe animations ───────────────────────────────────────── */
const STYLES = `
  @keyframes gateFloat {
    0%,100% { transform: rotateX(6deg) rotateY(-18deg) translateY(0px); }
    50%      { transform: rotateX(4deg) rotateY(-12deg) translateY(-16px); }
  }
  @keyframes colFloat {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-14px); }
  }
  @keyframes colSpin {
    from { transform: rotateY(0deg); }
    to   { transform: rotateY(360deg); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform: translateY(22px); }
    to   { opacity:1; transform: translateY(0); }
  }
  @keyframes bounce {
    0%,100% { transform: translateX(-50%) translateY(0); }
    50%      { transform: translateX(-50%) translateY(8px); }
  }
`;

/* ── Helper: split description into paragraphs ─────────────────── */
function getParagraphs(desc: string) {
  const d = desc.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return d.length > 1 ? d : desc.split(/\n+/).map(p => p.trim()).filter(Boolean);
}

function extractTimeline(desc: string) {
  const seen = new Set<string>();
  return desc.split(/\n+/).map(p => p.trim()).filter(Boolean)
    .map(text => { const m = text.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/); return m ? { year: m[1], text } : null; })
    .filter((e): e is { year: string; text: string } => e !== null)
    .filter(({ year }) => { if (seen.has(year)) return false; seen.add(year); return true; })
    .sort((a, b) => +a.year - +b.year)
    .slice(0, 6);
}

/* ═══════════════════════════════════════════════════════════════
   3D GATE — Girne Kapısı
   ═══════════════════════════════════════════════════════════════ */
function Gate3D() {
  const W = 210, H = 268, D = 52;
  const AW = 100, AH = 172;

  return (
    <div style={{ perspective: 1000, perspectiveOrigin: "50% 42%", marginBottom: 8 }}>
      {/* Outer wrapper holds the 3D animation */}
      <div style={{ display: "inline-block", transformStyle: "preserve-3d", animation: "gateFloat 8s ease-in-out infinite" }}>
        {/* ── Container that holds all faces ── */}
        <div style={{ position: "relative", width: W, height: H, transformStyle: "preserve-3d" }}>

          {/* FRONT FACE */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(155deg, #dac8a8 0%, #c8b090 45%, #b89868 100%)",
          }}>
            {/* Stone-block grid */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }} aria-hidden>
              {[52, 104, 156, 208].map(y =>
                <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#5c3c18" strokeWidth="2" />
              )}
              {[0, 42, 84, 126, 168].map((x, col) =>
                [0, 52, 104, 156, 208].map((y, row) => {
                  const ox = row % 2 === 0 ? 0 : 21;
                  return <line key={`${col}-${row}`} x1={x + ox} y1={y} x2={x + ox} y2={y + 52} stroke="#5c3c18" strokeWidth="1.5" />;
                })
              )}
            </svg>

            {/* Arch opening */}
            <div style={{
              position: "absolute",
              left: (W - AW) / 2, bottom: 0,
              width: AW, height: AH,
              background: "linear-gradient(180deg, #100c06 0%, #1e1608 100%)",
              borderRadius: `${AW / 2}px ${AW / 2}px 0 0`,
              boxShadow: "inset 0 -4px 20px rgba(0,0,0,0.6)",
            }} />

            {/* Arch keystone */}
            <div style={{
              position: "absolute",
              left: "50%", transform: "translateX(-50%)",
              bottom: AH - 14,
              width: 22, height: 20,
              background: "#dac8a8",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            }} />
          </div>

          {/* RIGHT DEPTH WALL */}
          <div style={{
            position: "absolute", left: W, top: 0,
            width: D, height: H,
            background: "linear-gradient(90deg, #9c7a50 0%, #7a5c38 100%)",
            transformOrigin: "left center",
            transform: "rotateY(90deg)",
          }}>
            {/* Stone blocks on depth wall */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }} aria-hidden>
              {[52, 104, 156, 208].map(y => <line key={y} x1="0" y1={y} x2={D} y2={y} stroke="#3c2010" strokeWidth="1.5" />)}
            </svg>
          </div>

          {/* TOP CORNICE */}
          <div style={{
            position: "absolute", left: -6, top: -20,
            width: W + 12, height: 24,
            background: "linear-gradient(180deg, #c8b48a 0%, #b09868 100%)",
            transformOrigin: "bottom center",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.2)",
          }} />

          {/* WATCHTOWER */}
          <div style={{
            position: "absolute",
            left: (W - 76) / 2,
            bottom: H,
            width: 76,
            height: 100,
            background: "linear-gradient(155deg, #d0b888 0%, #b49060 100%)",
          }}>
            {/* Battlements */}
            {[2, 22, 42, 56].map(x => (
              <div key={x} style={{
                position: "absolute", top: -18, left: x,
                width: 18, height: 18,
                background: "#b49060",
              }} />
            ))}
            {/* Window */}
            <div style={{
              position: "absolute",
              left: "50%", transform: "translateX(-50%)",
              top: 20, width: 20, height: 28,
              background: "#100c06",
              borderRadius: "10px 10px 0 0",
            }} />
            {/* MDLXII inscription */}
            <div style={{
              position: "absolute", bottom: 8, width: "100%",
              textAlign: "center", fontSize: 8, letterSpacing: "0.06em",
              color: "#e8d4a8", fontFamily: "Georgia, serif", opacity: 0.9,
            }}>MDLXII</div>
            {/* Tower stone blocks */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }} aria-hidden>
              {[30, 60, 90].map(y => <line key={y} x1="0" y1={y} x2="76" y2={y} stroke="#5c3c18" strokeWidth="1.5" />)}
              {[0, 38, 76].map((x, col) =>
                [0, 30, 60, 90].map((y, row) => {
                  const ox = row % 2 === 0 ? 0 : 19;
                  return <line key={`${col}-${row}`} x1={x + ox} y1={y} x2={x + ox} y2={y + 30} stroke="#5c3c18" strokeWidth="1" />;
                })
              )}
            </svg>
          </div>

          {/* GROUND SHADOW */}
          <div style={{
            position: "absolute", bottom: -28, left: "5%",
            width: "90%", height: 28,
            background: "radial-gradient(ellipse, rgba(0,0,0,0.38) 0%, transparent 100%)",
            filter: "blur(8px)",
          }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3D COLUMN — Lefkoşa Dikilitaşı
   ═══════════════════════════════════════════════════════════════ */
function Column3D() {
  const FACES = 12, R = 26, SH = 210;

  return (
    <div style={{ perspective: 900, perspectiveOrigin: "50% 36%", marginBottom: 8 }}>
      <div style={{ display: "inline-block", transformStyle: "preserve-3d", animation: "colFloat 7s ease-in-out infinite" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transformStyle: "preserve-3d" }}>

          {/* Bronze sphere */}
          <div style={{
            width: 44, height: 44, borderRadius: "50%", zIndex: 2, marginBottom: -2,
            background: "radial-gradient(circle at 33% 28%, #f4d878, #c8962a 48%, #7a5018 100%)",
            boxShadow: "0 6px 32px rgba(200,150,40,0.55), 0 2px 8px rgba(0,0,0,0.45)",
          }} />

          {/* Abacus (wide flat top of capital) */}
          <div style={{
            width: 130, height: 14,
            background: "linear-gradient(180deg, #d4bea0 0%, #b89a72 100%)",
            borderRadius: "3px 3px 0 0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.28)",
          }} />

          {/* Echinus (curved capital body) */}
          <div style={{
            width: 110, height: 18,
            background: "linear-gradient(180deg, #c8b28c 0%, #a88e68 100%)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
          }} />

          {/* Shaft — spinning polygonal prism */}
          <div style={{
            position: "relative",
            width: R * 2, height: SH,
            transformStyle: "preserve-3d",
            animation: `colSpin 18s linear infinite`,
          }}>
            {Array.from({ length: FACES }, (_, i) => {
              const angle = (i / FACES) * 360;
              const faceW = 2 * R * Math.sin(Math.PI / FACES) + 1;
              const L = 66 + Math.sin((i / FACES) * Math.PI * 2) * 9;
              return (
                <div key={i} style={{
                  position: "absolute", left: "50%", top: 0,
                  width: faceW, height: SH,
                  background: `linear-gradient(180deg, hsl(34,38%,${L + 6}%) 0%, hsl(32,40%,${L}%) 50%, hsl(30,42%,${L - 5}%) 100%)`,
                  transform: `translateX(-50%) rotateY(${angle}deg) translateZ(${R}px)`,
                  backfaceVisibility: "hidden",
                }}>
                  {/* Fluting groove */}
                  <div style={{
                    position: "absolute", left: "50%", top: 6, bottom: 6,
                    width: 1, background: "rgba(0,0,0,0.14)",
                  }} />
                </div>
              );
            })}
          </div>

          {/* Neck */}
          <div style={{
            width: 60, height: 10,
            background: "linear-gradient(180deg, #c0a880 0%, #a08860 100%)",
          }} />

          {/* Stylobate top */}
          <div style={{
            width: 128, height: 22,
            background: "linear-gradient(180deg, #b8a07a 0%, #9a8060 100%)",
            borderRadius: "0 0 2px 2px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          }} />

          {/* Stylobate middle */}
          <div style={{
            width: 148, height: 22,
            background: "linear-gradient(180deg, #a89070 0%, #887050 100%)",
            boxShadow: "0 5px 16px rgba(0,0,0,0.28)",
          }} />

          {/* Stylobate base */}
          <div style={{
            width: 170, height: 28,
            background: "linear-gradient(180deg, #9a8068 0%, #7a6048 100%)",
            borderRadius: "0 0 4px 4px",
            boxShadow: "0 10px 32px rgba(0,0,0,0.42)",
          }} />

          {/* Shadow */}
          <div style={{
            width: 220, height: 24, marginTop: 6,
            background: "radial-gradient(ellipse, rgba(0,0,0,0.32) 0%, transparent 80%)",
            filter: "blur(7px)",
          }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HERO BACKGROUND — SVG arkaplan siluet
   ═══════════════════════════════════════════════════════════════ */
function GateBg() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.13 }}
      aria-hidden>
      {/* Sky */}
      <rect width="800" height="500" fill="none" />
      {/* Venetian wall base */}
      <rect x="0" y="380" width="800" height="120" fill="#5a3c20" />
      {/* Battlements */}
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={i * 42} y="356" width="26" height="28" fill="#5a3c20" />
      ))}
      {/* Gate body */}
      <rect x="280" y="160" width="240" height="220" fill="#7a5832" />
      {/* Arch opening */}
      <ellipse cx="400" cy="380" rx="88" ry="120" fill="#0e0a04" />
      <rect x="312" y="260" width="176" height="130" fill="#0e0a04" />
      {/* Arch outline */}
      <path d="M312 270 Q400 150 488 270" fill="none" stroke="#9a7848" strokeWidth="8" />
      {/* Keystone */}
      <polygon points="400,148 416,178 384,178" fill="#a88c60" />
      {/* Watchtower */}
      <rect x="360" y="60" width="80" height="105" fill="#6a4c2c" />
      <rect x="350" y="44" width="100" height="20" fill="#5a3c1c" />
      {[354, 378, 402, 426].map(x => <rect key={x} x={x} y="24" width="22" height="22" fill="#5a3c1c" />)}
      <rect x="390" y="78" width="20" height="30" rx="10" fill="#0e0a04" />
      {/* Flanking towers */}
      <rect x="180" y="220" width="80" height="160" fill="#6a4c2c" />
      <rect x="540" y="220" width="80" height="160" fill="#6a4c2c" />
      {[184, 208, 232].map(x => <rect key={x} x={x} y="204" width="22" height="18" fill="#5a3c1c" />)}
      {[544, 568, 592].map(x => <rect key={x} x={x} y="204" width="22" height="18" fill="#5a3c1c" />)}
      {/* Stone texture lines */}
      {[200, 240, 280, 320, 360].map(y =>
        <line key={y} x1="180" y1={y} x2="280" y2={y} stroke="#4a3018" strokeWidth="1.5" />
      )}
      {[200, 240, 280, 320, 360].map(y =>
        <line key={y} x1="540" y1={y} x2="620" y2={y} stroke="#4a3018" strokeWidth="1.5" />
      )}
    </svg>
  );
}

function ColumnBg() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMax slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.13 }}
      aria-hidden>
      {/* Ground / square */}
      <ellipse cx="400" cy="460" rx="300" ry="30" fill="#5a5040" />
      {/* Stairway base */}
      <rect x="280" y="430" width="240" height="30" fill="#7a6a50" />
      <rect x="300" y="406" width="200" height="26" fill="#8a7a60" />
      <rect x="320" y="386" width="160" height="22" fill="#9a8a70" />
      {/* Plinth */}
      <rect x="348" y="360" width="104" height="28" fill="#a89878" />
      <rect x="358" y="340" width="84" height="22" fill="#b4a484" />
      {/* Shaft */}
      <rect x="378" y="96" width="44" height="246" fill="#c0aa88" />
      {/* Fluting */}
      {[382, 390, 398, 406, 414].map(x =>
        <line key={x} x1={x} y1="100" x2={x} y2="340" stroke="#9a8868" strokeWidth="1.5" />
      )}
      {/* Capital */}
      <rect x="362" y="76" width="76" height="22" fill="#b0a080" rx="2" />
      <rect x="352" y="60" width="96" height="18" fill="#a09070" rx="2" />
      {/* Sphere */}
      <circle cx="400" cy="42" r="22" fill="#c8962a" />
      <circle cx="392" cy="34" r="7" fill="#f0d060" opacity="0.6" />
      {/* Decorative rings on shaft */}
      {[140, 200, 270].map(y =>
        <rect key={y} x="374" y={y} width="52" height="6" fill="#a89060" />
      )}
      {/* Background buildings */}
      <rect x="50" y="340" width="120" height="90" fill="#6a5840" opacity="0.4" />
      <rect x="630" y="320" width="100" height="110" fill="#6a5840" opacity="0.4" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage({ product, translation, allLanguages, slug }: Props) {
  const router    = useRouter();
  const langCode  = translation.language.code;
  const paragraphs = getParagraphs(translation.description);
  const timeline  = extractTimeline(translation.description);
  const images    = product.images;
  const [activeIdx, setActiveIdx] = useState(0);
  const activeImg = images[activeIdx];

  const isGate   = slug === "girne-kapisi";
  const isColumn = slug === "lefkosa-dikilitas";

  // Sky gradient: deep blue-grey at top → warm sandy stone at bottom
  const heroBg = isGate
    ? "linear-gradient(175deg, #4a6a88 0%, #7a9ab8 18%, #b0c4d0 35%, #cbb890 58%, #c4a87a 78%, #b89860 100%)"
    : "linear-gradient(175deg, #384858 0%, #607888 18%, #90a8bc 35%, #c8bca0 55%, #d0c090 72%, #c0aa78 100%)";

  return (
    <main style={{ background: "#faf7f2", minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <style>{STYLES}</style>

      {/* ── Language switcher ── */}
      {allLanguages.length > 1 && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 50,
          display: "flex", gap: 4, padding: 4,
          borderRadius: 9999,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(190,170,130,0.3)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        }}>
          {allLanguages.map(lang => {
            const active = lang.code === langCode;
            return (
              <button key={lang.code}
                onClick={() => router.push(`/p/${slug}?lang=${lang.code}`)}
                style={{
                  padding: "0.35rem 0.95rem",
                  borderRadius: 9999, border: "none",
                  background: active ? "#1c1810" : "transparent",
                  color: active ? "#faf7f2" : "#6a5e4a",
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.78rem", letterSpacing: "0.07em",
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                  transition: "all 0.2s",
                }}>
                {lang.code.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════
          HERO — gradient sky + monument silhouette + 3D model
          ════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
        background: heroBg,
      }}>
        {/* Background SVG silhouette */}
        {isGate   && <GateBg />}
        {isColumn && <ColumnBg />}

        {/* Bottom fade to content */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "35%",
          background: "linear-gradient(to bottom, transparent, rgba(200,185,150,0.5))",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, padding: "5rem 1.5rem 3rem" }}>

          {/* Location tag */}
          <p style={{
            margin: "0 0 2rem",
            fontSize: "0.7rem", letterSpacing: "0.36em",
            textTransform: "uppercase",
            color: "rgba(255,245,220,0.75)",
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
            animation: "fadeUp 0.9s ease both",
            textShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}>
            Lefkoşa · Kuzey Kıbrıs
          </p>

          {/* 3D Monument */}
          <div style={{ animation: "fadeUp 1s ease 0.2s both" }}>
            {isGate   && <Gate3D />}
            {isColumn && <Column3D />}
            {!isGate && !isColumn && <div style={{ height: 60 }} />}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: "clamp(2.2rem, 7vw, 4.2rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.01em",
            color: "#1c1408",
            textShadow: "0 2px 16px rgba(255,240,190,0.55), 0 1px 3px rgba(0,0,0,0.2)",
            margin: "1.6rem 0 0.5rem",
            animation: "fadeUp 1s ease 0.4s both",
          }}>
            {translation.title}
          </h1>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            justifyContent: "center", marginTop: "1.2rem",
            animation: "fadeUp 1s ease 0.6s both",
          }}>
            <div style={{ width: 52, height: 1, background: "rgba(80,55,25,0.45)" }} />
            <div style={{ width: 6, height: 6, background: "rgba(80,55,25,0.55)", transform: "rotate(45deg)" }} />
            <div style={{ width: 52, height: 1, background: "rgba(80,55,25,0.45)" }} />
          </div>
        </div>

        {/* Scroll arrow */}
        <div style={{
          position: "absolute", bottom: "2rem", left: "50%",
          animation: "bounce 2s ease-in-out infinite", opacity: 0.5,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3c2c10" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PHOTO GALLERY
          ════════════════════════════════════════ */}
      {images.length > 0 && activeImg && (
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 1.5rem 0" }}>
          <div style={{
            position: "relative", width: "100%", aspectRatio: "16 / 9",
            borderRadius: 14, overflow: "hidden",
            background: "#e8d8bc",
            boxShadow: "0 32px 72px -30px rgba(80,55,20,0.45)",
          }}>
            <Image
              src={activeImg.url}
              alt={activeImg.alt ?? translation.title}
              fill
              sizes="(max-width: 960px) 100vw, 960px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setActiveIdx(i)}
                  aria-label={`Görsel ${i + 1}`}
                  style={{
                    position: "relative", width: 84, height: 60,
                    borderRadius: 8, overflow: "hidden",
                    cursor: "pointer", padding: 0,
                    border: `2px solid ${i === activeIdx ? "#9c6b3f" : "transparent"}`,
                    opacity: i === activeIdx ? 1 : 0.55,
                    transition: "all 0.2s",
                    background: "#e8d8bc",
                  }}>
                  <Image src={img.url} alt={img.alt ?? ""} fill sizes="84px" style={{ objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ════════════════════════════════════════
          STORY
          ════════════════════════════════════════ */}
      <article style={{ maxWidth: 660, margin: "0 auto", padding: "clamp(3rem,8vh,5.5rem) 1.5rem 1rem" }}>
        {paragraphs.map((para, i) => (
          <p key={i} style={{
            margin: "0 0 1.65rem",
            fontSize: i === 0 ? "1.22rem" : "1.02rem",
            lineHeight: i === 0 ? 1.7 : 1.9,
            color: i === 0 ? "#1c1810" : "#4a4438",
            fontFamily: i === 0 ? 'Georgia, "Times New Roman", serif' : "system-ui, sans-serif",
          }}>
            {para}
          </p>
        ))}
      </article>

      {/* ════════════════════════════════════════
          TIMELINE
          ════════════════════════════════════════ */}
      {timeline.length > 1 && (
        <section style={{ maxWidth: 620, margin: "0 auto", padding: "1rem 1.5rem 4rem" }}>
          <h2 style={{
            fontSize: "0.72rem", letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#9c6b3f", fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
            marginBottom: "2rem",
          }}>
            Kilometre Taşları
          </h2>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 7, top: 6, bottom: 6,
              width: 1,
              background: "linear-gradient(180deg, #d0be9a, #e4d8c4)",
            }} />
            {timeline.map(ev => (
              <div key={ev.year} style={{ position: "relative", paddingLeft: 36, marginBottom: 28 }}>
                <div style={{
                  position: "absolute", left: 0, top: 5,
                  width: 15, height: 15, borderRadius: "50%",
                  background: "#faf7f2",
                  border: "2px solid #9c6b3f",
                }} />
                <div style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "1.3rem", color: "#9c6b3f", lineHeight: 1, marginBottom: 5,
                }}>
                  {ev.year}
                </div>
                <p style={{ margin: 0, fontSize: "0.93rem", lineHeight: 1.75, color: "#5a5040" }}>
                  {ev.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════ */}
      <footer style={{
        borderTop: "1px solid #e8dcc8",
        background: "#f2ece0",
        padding: "3.5rem 1.5rem",
        textAlign: "center",
      }}>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{
            padding: 14, background: "#fff",
            borderRadius: 16,
            border: "1px solid #e0d4bc",
            boxShadow: "0 12px 36px -16px rgba(80,55,20,0.32)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/qr/${slug}`} alt="QR Kod" width={112} height={112}
              style={{ display: "block", borderRadius: 8 }} />
          </div>
          <p style={{
            margin: 0, fontSize: "0.68rem",
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: "#9c8870", fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
          }}>
            Lefkoşa Turizm
          </p>
        </div>
      </footer>
    </main>
  );
}

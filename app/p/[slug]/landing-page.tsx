"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getModelUrl } from "@/components/heritage/lib/content";

/* Mini WebGL figurine for the biblo card — client-only (no SSR). */
const BibloModel = dynamic(() => import("@/components/heritage/BibloModel"), {
  ssr: false,
});

/* ── Types ─────────────────────────────────────────────────────── */
type Language    = { id: string; code: string; name: string; nativeName: string; isDefault: boolean };
type Translation = { title: string; description: string; language: Language };
type ProductImage = { id: string; url: string; alt: string | null; isPrimary: boolean };
type Product     = { id: string; slug: string; images: ProductImage[] };
type Props       = { product: Product; translation: Translation; allLanguages: Language[]; slug: string };

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
   3D GATE — Girne Kapısı (used in biblo card only)
   ═══════════════════════════════════════════════════════════════ */
function Gate3D() {
  const W = 210, H = 268, D = 52;
  const AW = 100, AH = 172;

  return (
    <div style={{ perspective: 1000, perspectiveOrigin: "50% 42%", marginBottom: 8 }}>
      <div style={{ display: "inline-block", transformStyle: "preserve-3d", animation: "gateFloat 8s ease-in-out infinite" }}>
        <div style={{ position: "relative", width: W, height: H, transformStyle: "preserve-3d" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(155deg, #dac8a8 0%, #c8b090 45%, #b89868 100%)",
          }}>
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
            <div style={{
              position: "absolute",
              left: (W - AW) / 2, bottom: 0,
              width: AW, height: AH,
              background: "linear-gradient(180deg, #100c06 0%, #1e1608 100%)",
              borderRadius: `${AW / 2}px ${AW / 2}px 0 0`,
              boxShadow: "inset 0 -4px 20px rgba(0,0,0,0.6)",
            }} />
            <div style={{
              position: "absolute",
              left: "50%", transform: "translateX(-50%)",
              bottom: AH - 14,
              width: 22, height: 20,
              background: "#dac8a8",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            }} />
          </div>
          <div style={{
            position: "absolute", left: W, top: 0,
            width: D, height: H,
            background: "linear-gradient(90deg, #9c7a50 0%, #7a5c38 100%)",
            transformOrigin: "left center",
            transform: "rotateY(90deg)",
          }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.2 }} aria-hidden>
              {[52, 104, 156, 208].map(y => <line key={y} x1="0" y1={y} x2={D} y2={y} stroke="#3c2010" strokeWidth="1.5" />)}
            </svg>
          </div>
          <div style={{
            position: "absolute", left: -6, top: -20,
            width: W + 12, height: 24,
            background: "linear-gradient(180deg, #c8b48a 0%, #b09868 100%)",
            transformOrigin: "bottom center",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.2)",
          }} />
          <div style={{
            position: "absolute",
            left: (W - 76) / 2,
            bottom: H,
            width: 76,
            height: 100,
            background: "linear-gradient(155deg, #d0b888 0%, #b49060 100%)",
          }}>
            {[2, 22, 42, 56].map(x => (
              <div key={x} style={{
                position: "absolute", top: -18, left: x,
                width: 18, height: 18,
                background: "#b49060",
              }} />
            ))}
            <div style={{
              position: "absolute",
              left: "50%", transform: "translateX(-50%)",
              top: 20, width: 20, height: 28,
              background: "#100c06",
              borderRadius: "10px 10px 0 0",
            }} />
            <div style={{
              position: "absolute", bottom: 8, width: "100%",
              textAlign: "center", fontSize: 8, letterSpacing: "0.06em",
              color: "#e8d4a8", fontFamily: "Georgia, serif", opacity: 0.9,
            }}>MDLXII</div>
          </div>
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
   3D COLUMN — Lefkoşa Dikilitaşı (used in biblo card only)
   ═══════════════════════════════════════════════════════════════ */
function Column3D() {
  const FACES = 12, R = 26, SH = 210;

  return (
    <div style={{ perspective: 900, perspectiveOrigin: "50% 36%", marginBottom: 8 }}>
      <div style={{ display: "inline-block", transformStyle: "preserve-3d", animation: "colFloat 7s ease-in-out infinite" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transformStyle: "preserve-3d" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", zIndex: 2, marginBottom: -2,
            background: "radial-gradient(circle at 33% 28%, #f4d878, #c8962a 48%, #7a5018 100%)",
            boxShadow: "0 6px 32px rgba(200,150,40,0.55), 0 2px 8px rgba(0,0,0,0.45)",
          }} />
          <div style={{
            width: 130, height: 14,
            background: "linear-gradient(180deg, #d4bea0 0%, #b89a72 100%)",
            borderRadius: "3px 3px 0 0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.28)",
          }} />
          <div style={{
            width: 110, height: 18,
            background: "linear-gradient(180deg, #c8b28c 0%, #a88e68 100%)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
          }} />
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
                  <div style={{
                    position: "absolute", left: "50%", top: 6, bottom: 6,
                    width: 1, background: "rgba(0,0,0,0.14)",
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{ width: 60, height: 10, background: "linear-gradient(180deg, #c0a880 0%, #a08860 100%)" }} />
          <div style={{
            width: 128, height: 22,
            background: "linear-gradient(180deg, #b8a07a 0%, #9a8060 100%)",
            borderRadius: "0 0 2px 2px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
          }} />
          <div style={{
            width: 148, height: 22,
            background: "linear-gradient(180deg, #a89070 0%, #887050 100%)",
            boxShadow: "0 5px 16px rgba(0,0,0,0.28)",
          }} />
          <div style={{
            width: 170, height: 28,
            background: "linear-gradient(180deg, #9a8068 0%, #7a6048 100%)",
            borderRadius: "0 0 4px 4px",
            boxShadow: "0 10px 32px rgba(0,0,0,0.42)",
          }} />
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
   ORNAMENTAL FRAME — museum-quality heritage border
   ═══════════════════════════════════════════════════════════════ */
const FRAME_G  = "#9c6b3f";
const FRAME_GL = "rgba(156,107,63,0.45)";
const FRAME_GB = "rgba(156,107,63,0.22)";

/* Corner SVG — top-left orientation; CSS mirrors handle other corners */
function FrameCorner() {
  return (
    <svg width="66" height="66" viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* L-shaped bracket lines */}
      <line x1="9" y1="9" x2="9" y2="58" stroke={FRAME_G} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9" y1="9" x2="58" y2="9" stroke={FRAME_G} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Diamond at the corner apex */}
      <rect x="4.5" y="4.5" width="9" height="9" transform="rotate(45 9 9)" fill={FRAME_G}/>
      {/* End circles */}
      <circle cx="9"  cy="58" r="2.5" fill={FRAME_G} opacity="0.65"/>
      <circle cx="58" cy="9"  r="2.5" fill={FRAME_G} opacity="0.65"/>
      {/* Short accent ticks */}
      <line x1="9"  y1="25" x2="18" y2="25" stroke={FRAME_GL} strokeWidth="1.1"/>
      <line x1="25" y1="9"  x2="25" y2="18" stroke={FRAME_GL} strokeWidth="1.1"/>
      <line x1="9"  y1="40" x2="15" y2="40" stroke={FRAME_GL} strokeWidth="0.8"/>
      <line x1="40" y1="9"  x2="40" y2="15" stroke={FRAME_GL} strokeWidth="0.8"/>
    </svg>
  );
}

/* Small diamond used in the centre-top ornament */
function FrameCentreDiamond() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3.8" y="3.8" width="10.4" height="10.4" transform="rotate(45 9 9)" fill={FRAME_G}/>
      <rect x="5.8" y="5.8" width="6.4"  height="6.4"  transform="rotate(45 9 9)" fill="#faf7f2"/>
    </svg>
  );
}

function OrnamentalFrame({ children }: { children: React.ReactNode }) {
  const GB = FRAME_GB;
  const G  = FRAME_G;

  return (
    <div style={{
      position: "relative",
      maxWidth: 740,
      margin: "0 auto",
      padding: "0 clamp(1.2rem, 5vw, 3.5rem)",
      overflow: "visible",
    }}>
      {/* Thin connecting border — sits behind the corner ornaments */}
      <div style={{
        position: "absolute",
        inset: "9px 9px",
        border: `1px solid ${GB}`,
        pointerEvents: "none",
      }} />

      {/* ── Corner ornaments ── */}
      <div style={{ position: "absolute", top: -4, left: -4 }}>
        <FrameCorner />
      </div>
      <div style={{ position: "absolute", top: -4, right: -4, transform: "scaleX(-1)" }}>
        <FrameCorner />
      </div>
      <div style={{ position: "absolute", bottom: -4, left: -4, transform: "scaleY(-1)" }}>
        <FrameCorner />
      </div>
      <div style={{ position: "absolute", bottom: -4, right: -4, transform: "scale(-1,-1)" }}>
        <FrameCorner />
      </div>

      {/* ── Centre-top ornament (sits on the top border line) ── */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%) translateY(-50%)",
        display: "flex", alignItems: "center", gap: 8,
        background: "#faf7f2", padding: "0 10px",
        marginTop: 9,
      }}>
        <div style={{ width: 34, height: 1, background: GB }}/>
        <FrameCentreDiamond />
        <div style={{ width: 34, height: 1, background: GB }}/>
      </div>

      {/* ── Centre-bottom ornament ── */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%",
        transform: "translateX(-50%) translateY(50%)",
        display: "flex", alignItems: "center", gap: 8,
        background: "#faf7f2", padding: "0 10px",
        marginBottom: 9,
      }}>
        <div style={{ width: 34, height: 1, background: GB }}/>
        <div style={{ width: 7, height: 7, background: G, transform: "rotate(45deg)", flexShrink: 0 }}/>
        <div style={{ width: 34, height: 1, background: GB }}/>
      </div>

      {/* Content */}
      <div style={{ padding: "clamp(2.8rem,7vh,5rem) 0 clamp(2.4rem,6vh,4rem)" }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BIBLO CARD
   ═══════════════════════════════════════════════════════════════ */
function BibloCard({
  model, title, bibloImg, modelUrl, visible, onClose,
}: {
  model: React.ReactNode;
  title: string;
  bibloImg?: string;
  modelUrl?: string;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 20,
        zIndex: 55,
        width: "min(92vw, 380px)",
        transform: visible
          ? "translateX(-50%) translateY(0) scale(1)"
          : "translateX(-50%) translateY(140%) scale(0.96)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 14,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(156,107,63,0.18)",
        borderRadius: 18,
        boxShadow: "0 24px 60px -18px rgba(60,40,15,0.45)",
      }}>
        <div style={{
          position: "relative",
          flexShrink: 0,
          width: 96, height: 110,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(160deg, #f4ede0, #e6d9c2)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "inset 0 2px 8px rgba(120,90,50,0.18)",
          cursor: modelUrl ? "grab" : "default",
        }}>
          {modelUrl ? (
            <>
              {visible && <BibloModel modelUrl={modelUrl} />}
              {/* "3D" hint chip */}
              <span style={{
                position: "absolute", bottom: 5, right: 6,
                fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.08em",
                color: "#fff", background: "rgba(28,24,16,0.66)",
                padding: "2px 5px", borderRadius: 6,
                fontFamily: "system-ui, sans-serif", pointerEvents: "none",
              }}>3D</span>
            </>
          ) : bibloImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bibloImg} alt={`${title} biblosu`}
              style={{ width: "84%", height: "84%", objectFit: "contain" }} />
          ) : (
            <div style={{ transform: "scale(0.24)", transformOrigin: "center" }}>{model}</div>
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <span style={{
            fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#9c6b3f", fontWeight: 700, fontFamily: "system-ui, sans-serif",
          }}>
            Hatıra Biblosu
          </span>
          <p style={{
            margin: "4px 0 0",
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "1.02rem", color: "#1c1408", lineHeight: 1.25,
          }}>
            {title}
          </p>
          <p style={{ margin: "5px 0 0", fontSize: "0.74rem", color: "#8a7a60" }}>
            El yapımı koleksiyon biblosu
          </p>
        </div>
        <button
          onClick={onClose}
          title="Kartı kaldır"
          style={{
            position: "absolute", top: -12, right: -12,
            width: 30, height: 30, borderRadius: "50%",
            background: "#1c1810", color: "#fff",
            border: "2px solid #faf7f2", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage({ translation, allLanguages, slug }: Props) {
  const router     = useRouter();
  const langCode   = translation.language.code;
  const paragraphs = getParagraphs(translation.description);
  const timeline   = extractTimeline(translation.description);

  const isGate   = slug === "girne-kapisi";
  const isColumn = slug === "lefkosa-dikilitas";

  const fallbackModel = isGate ? <Gate3D /> : isColumn ? <Column3D /> : null;

  // Real GLB figurine shown inside the biblo card, when one exists.
  const modelUrl = getModelUrl(slug);

  const switchLang = (code: string) =>
    router.push(`/p/${slug}?lang=${code}`, { scroll: false });

  const [bibloVisible,   setBibloVisible]   = useState(false);
  const [bibloDismissed, setBibloDismissed] = useState(false);

  useEffect(() => {
    if (bibloDismissed) return;
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.35;
      setBibloVisible(past && !bibloDismissed);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [bibloDismissed]);

  return (
    <main style={{ background: "#faf7f2", minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <style>{STYLES}</style>

      {/* ── Language switcher ── */}
      {allLanguages.length > 1 && (
        <div style={{
          position: "fixed", top: 16, right: 16, zIndex: 60,
          display: "flex", gap: 4, padding: 4,
          borderRadius: 9999,
          background: "rgba(28,28,32,0.82)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
        }}>
          {allLanguages.map(lang => {
            const active = lang.code === langCode;
            return (
              <button key={lang.code}
                onClick={() => switchLang(lang.code)}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: 9999, border: "none",
                  background: active ? "#fff" : "transparent",
                  color: active ? "#1c1810" : "#cfcabf",
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
          TOP SPACER — clears the fixed language bar
          ════════════════════════════════════════ */}
      <div style={{ height: "clamp(4.5rem, 12vh, 7rem)" }} />

      {/* ════════════════════════════════════════
          ORNAMENTAL FRAME — wraps title + story + timeline
          ════════════════════════════════════════ */}
      <OrnamentalFrame>

        {/* ── Title ── */}
        <section style={{ textAlign: "center", padding: "0 1rem" }}>
          <p style={{
            margin: "0 0 1.2rem",
            fontSize: "0.7rem", letterSpacing: "0.34em",
            textTransform: "uppercase", color: "#9c6b3f",
            fontWeight: 700, fontFamily: "system-ui, sans-serif",
          }}>
            Lefkoşa · Kuzey Kıbrıs
          </p>
          <h1 style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 400,
            fontSize: "clamp(2.1rem, 6vw, 3.8rem)",
            lineHeight: 1.1, letterSpacing: "-0.01em",
            color: "#1c1408", margin: 0,
          }}>
            {translation.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginTop: "1.4rem" }}>
            <div style={{ width: 52, height: 1, background: "rgba(156,107,63,0.4)" }} />
            <div style={{ width: 6, height: 6, background: "#9c6b3f", transform: "rotate(45deg)" }} />
            <div style={{ width: 52, height: 1, background: "rgba(156,107,63,0.4)" }} />
          </div>
        </section>

        {/* ── Story ── */}
        <article style={{ maxWidth: 600, margin: "0 auto", padding: "clamp(2.2rem,6vh,4rem) 1rem 0.5rem" }}>
          {paragraphs.map((para, i) => (
            <p key={i} style={{
              margin: "0 0 1.65rem",
              fontSize: i === 0 ? "1.18rem" : "1rem",
              lineHeight: i === 0 ? 1.75 : 1.9,
              color: i === 0 ? "#1c1810" : "#4a4438",
              fontFamily: i === 0 ? 'Georgia, "Times New Roman", serif' : "system-ui, sans-serif",
            }}>
              {para}
            </p>
          ))}
        </article>

        {/* ── Timeline ── */}
        {timeline.length > 1 && (
          <section style={{ maxWidth: 560, margin: "0 auto", padding: "0.5rem 1rem 0" }}>
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

      </OrnamentalFrame>

      {/* ════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════ */}
      <footer style={{
        borderTop: "1px solid #e8dcc8",
        background: "#f2ece0",
        padding: "3.5rem 1.5rem",
        marginTop: "clamp(4rem,10vh,6rem)",
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

      {/* ── Hatıra biblosu kartı ── */}
      <BibloCard
        model={fallbackModel}
        modelUrl={modelUrl}
        title={translation.title}
        visible={bibloVisible}
        onClose={() => { setBibloDismissed(true); setBibloVisible(false); }}
      />
    </main>
  );
}

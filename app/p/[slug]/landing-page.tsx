"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Language = {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
};

type Translation = {
  title: string;
  description: string;
  language: Language;
};

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
};

type Product = {
  id: string;
  slug: string;
  images: ProductImage[];
};

type Props = {
  product: Product;
  translation: Translation;
  allLanguages: Language[];
  slug: string;
};

/* ── helpers ─────────────────────────────────────────────────────── */

function extractTimeline(description: string) {
  const paras = description.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const seen = new Set<string>();
  return paras
    .map((text) => {
      const m = text.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
      return m ? { year: m[1], text } : null;
    })
    .filter((e): e is { year: string; text: string } => e !== null)
    .filter(({ year }) => {
      if (seen.has(year)) return false;
      seen.add(year);
      return true;
    })
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
}

function getParagraphs(description: string) {
  return description.split(/\n+/).map((p) => p.trim()).filter(Boolean);
}

/* ── decorative SVG ornament ─────────────────────────────────────── */
function Ornament({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" style={{ display: "block", margin: "0 auto" }}>
      <path d="M30 4 L32 28 L56 30 L32 32 L30 56 L28 32 L4 30 L28 28 Z" fill="#c9a84c" opacity="0.8" />
      <circle cx="30" cy="30" r="4" fill="#c9a84c" />
    </svg>
  );
}

/* ── timeline entry ──────────────────────────────────────────────── */
function TimelineItem({ year, text, idx }: { year: string; text: string; idx: number }) {
  const isLeft = idx % 2 === 0;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isLeft ? "flex-start" : "flex-end",
        marginBottom: 40,
        position: "relative",
      }}
    >
      {/* dot on the centre line */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 18,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#c9a84c",
          border: "3px solid #0d0a06",
          transform: "translateX(-50%)",
          boxShadow: "0 0 12px rgba(201,168,76,0.7)",
          zIndex: 2,
        }}
      />
      <div
        className="lp-timeline-card"
        style={{
          width: "calc(50% - 32px)",
          background: "rgba(255,240,200,0.04)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 16,
          padding: "22px 24px",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#c9a84c",
            marginBottom: 10,
            textShadow: "0 0 20px rgba(201,168,76,0.4)",
            letterSpacing: "-0.02em",
          }}
        >
          {year}
        </div>
        <p style={{ fontSize: "0.9rem", lineHeight: 1.75, color: "#c4b490", margin: 0 }}>{text}</p>
      </div>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────────── */
export default function LandingPage({ product, translation, allLanguages, slug }: Props) {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [activeImg, setActiveImg] = useState<ProductImage | null>(
    product.images.find((i) => i.isPrimary) ?? product.images[0] ?? null
  );

  /* mouse-track 3D tilt */
  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x: y, y: x });
  }, []);

  const onMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [onMouseMove, onMouseLeave]);

  /* scroll parallax */
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* content parsing */
  const paragraphs = getParagraphs(translation.description);
  const leadParagraph = paragraphs[0] ?? "";
  const bodyParagraphs = paragraphs.slice(1);
  const timelineEvents = extractTimeline(translation.description);
  const timelineSlugs = new Set(timelineEvents.map((e) => e.text));
  const nonTimelineBody = bodyParagraphs.filter((p) => !timelineSlugs.has(p));

  const langCode = translation.language.code;

  return (
    <div className="lp-root" style={{ background: "#0d0a06", color: "#f5e6c8", minHeight: "100vh" }}>

      {/* ══════ HERO ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* animated gradient bg */}
        <div
          className="lp-bg"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(-45deg, #0d0a06, #1c1408, #0d0b04, #180f05, #0d0a06)",
          }}
        />

        {/* floating colour orbs */}
        <div
          className="lp-orb-a"
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.35) 0%, transparent 70%)",
            top: -150,
            left: -150,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          className="lp-orb-b"
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,26,26,0.4) 0%, transparent 70%)",
            bottom: -80,
            right: -60,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <div
          className="lp-orb-c"
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.25) 0%, transparent 70%)",
            top: "40%",
            left: "65%",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            transform: `translateY(${scrollY * 0.15}px)`,
            pointerEvents: "none",
          }}
        />

        {/* rotating ornament top-left */}
        <div
          className="lp-rotate"
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            opacity: 0.12,
            pointerEvents: "none",
          }}
        >
          <Ornament size={80} />
        </div>

        {/* ── language switcher ── */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            zIndex: 10,
          }}
        >
          {allLanguages.map((lang) => {
            const isActive = lang.code === langCode;
            return (
              <button
                key={lang.code}
                onClick={() => router.push(`/p/${slug}?lang=${lang.code}`)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 999,
                  border: `1px solid ${isActive ? "#c9a84c" : "rgba(201,168,76,0.3)"}`,
                  background: isActive ? "#c9a84c" : "rgba(13,10,6,0.6)",
                  color: isActive ? "#0d0a06" : "#c9a84c",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  transition: "all 0.25s",
                  letterSpacing: "0.02em",
                }}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>

        {/* ── 3D hero card ── */}
        <div
          className="lp-card-3d"
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "0 24px",
            maxWidth: 740,
            width: "100%",
            ["--tilt-x" as string]: `${tilt.x}deg`,
            ["--tilt-y" as string]: `${tilt.y}deg`,
          }}
        >
          {/* top gold line */}
          <div className="lp-line" style={{ width: 60, height: 2, background: "linear-gradient(90deg, transparent, #c9a84c, transparent)", margin: "0 auto 28px" }} />

          {/* star ornaments */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
            {[0, 400, 800].map((delay) => (
              <div
                key={delay}
                className="lp-star"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#c9a84c",
                  animationDelay: `${delay}ms`,
                }}
              />
            ))}
          </div>

          <h1
            style={{
              fontSize: "clamp(2.2rem, 7vw, 4.5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#f5e6c8",
              textShadow: "0 0 80px rgba(201,168,76,0.45), 0 4px 30px rgba(0,0,0,0.9)",
              letterSpacing: "-0.02em",
              margin: "0 0 8px",
            }}
          >
            {translation.title}
          </h1>

          {/* subtitle / lead */}
          <p
            style={{
              fontSize: "clamp(0.95rem, 2.2vw, 1.15rem)",
              color: "#a89060",
              fontStyle: "italic",
              lineHeight: 1.7,
              maxWidth: 600,
              margin: "24px auto 0",
            }}
          >
            {leadParagraph}
          </p>

          {/* bottom gold line */}
          <div className="lp-line" style={{ width: 60, height: 2, background: "linear-gradient(90deg, transparent, #c9a84c, transparent)", margin: "28px auto 0" }} />
        </div>

        {/* scroll indicator */}
        <div
          className="lp-scroll"
          style={{
            position: "absolute",
            bottom: 36,
            left: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            pointerEvents: "none",
          }}
        >
          <span style={{ color: "#c9a84c", fontSize: 11, letterSpacing: "0.15em", opacity: 0.7 }}>
            SCROLL
          </span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="1" y="1" width="14" height="22" rx="7" stroke="rgba(201,168,76,0.4)" strokeWidth="1.5" />
            <rect x="6.5" y="5" width="3" height="6" rx="1.5" fill="#c9a84c" />
          </svg>
        </div>
      </section>

      {/* ══════ TIMELINE ══════════════════════════════════════════ */}
      {timelineEvents.length > 0 && (
        <section style={{ padding: "100px 20px", maxWidth: 900, margin: "0 auto" }}>
          {/* section header */}
          <div style={{ textAlign: "center", marginBottom: 70 }}>
            <Ornament size={40} />
            <h2
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                fontWeight: 600,
                color: "#f5e6c8",
                margin: "20px 0 8px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {langCode === "tr" ? "Tarihçe" : "History"}
            </h2>
            <div style={{ width: 40, height: 1, background: "#c9a84c", margin: "0 auto", opacity: 0.6 }} />
          </div>

          {/* vertical line */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 1,
                background:
                  "linear-gradient(to bottom, transparent, rgba(201,168,76,0.5) 10%, rgba(201,168,76,0.5) 90%, transparent)",
                transform: "translateX(-50%)",
                pointerEvents: "none",
              }}
            />
            {timelineEvents.map((e, i) => (
              <TimelineItem key={e.year} year={e.year} text={e.text} idx={i} />
            ))}
          </div>
        </section>
      )}

      {/* ══════ BODY CONTENT ══════════════════════════════════════ */}
      {nonTimelineBody.length > 0 && (
        <section
          style={{
            padding: "0 20px 80px",
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "rgba(255,240,200,0.025)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: 20,
              padding: "40px 36px",
            }}
          >
            {nonTimelineBody.map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.95,
                  color: i === nonTimelineBody.length - 1 ? "#c9a84c" : "#c4b490",
                  fontStyle: i === nonTimelineBody.length - 1 ? "italic" : "normal",
                  fontWeight: i === nonTimelineBody.length - 1 ? 600 : 400,
                  marginBottom: i < nonTimelineBody.length - 1 ? 22 : 0,
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* ══════ IMAGE GALLERY ══════════════════════════════════════ */}
      {product.images.length > 0 && (
        <section style={{ padding: "0 20px 100px", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ width: 40, height: 1, background: "rgba(201,168,76,0.5)", margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: "1.1rem", color: "#a89060", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
              {langCode === "tr" ? "Fotoğraflar" : "Photos"}
            </h2>
          </div>

          {/* main image */}
          {activeImg && (
            <div
              className="lp-shimmer"
              style={{
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                aspectRatio: "16 / 9",
                border: "1px solid rgba(201,168,76,0.25)",
                marginBottom: 16,
              }}
            >
              <Image
                src={activeImg.url}
                alt={activeImg.alt ?? translation.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          )}

          {/* thumbnails */}
          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(img)}
                  className="lp-image-thumb"
                  style={{
                    width: 80,
                    height: 60,
                    borderRadius: 10,
                    overflow: "hidden",
                    border: `2px solid ${img.id === activeImg?.id ? "#c9a84c" : "rgba(201,168,76,0.2)"}`,
                    position: "relative",
                    cursor: "pointer",
                    padding: 0,
                    background: "none",
                  }}
                >
                  <Image src={img.url} alt={img.alt ?? ""} fill style={{ objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══════ FOOTER ════════════════════════════════════════════ */}
      <footer
        style={{
          background: "#050302",
          borderTop: "1px solid rgba(201,168,76,0.1)",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <Ornament size={28} />
        <p style={{ color: "#3d3020", fontSize: 11, letterSpacing: "0.12em", marginTop: 16 }}>
          POWERED BY PRODUCTQR
        </p>
      </footer>
    </div>
  );
}

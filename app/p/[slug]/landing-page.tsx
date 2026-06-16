"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ── Types ───────────────────────────────────────────────────────── */
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

/* ── Content helpers ─────────────────────────────────────────────── */
function getParagraphs(description: string): string[] {
  // Try double-newline splits first; fall back to single newlines
  const doubleSplit = description.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (doubleSplit.length > 1) return doubleSplit;
  return description.split(/\n+/).map((p) => p.trim()).filter(Boolean);
}

function extractTimeline(description: string): Array<{ year: string; text: string }> {
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

/* ── SVG Ornament ────────────────────────────────────────────────── */
function Ornament({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      style={{ display: "block", margin: "0 auto" }}
      aria-hidden="true"
    >
      <path
        d="M30 4 L32 28 L56 30 L32 32 L30 56 L28 32 L4 30 L28 28 Z"
        fill="#c9a84c"
        opacity="0.85"
      />
      <circle cx="30" cy="30" r="4" fill="#c9a84c" />
    </svg>
  );
}

/* ── Diamond Divider ─────────────────────────────────────────────── */
function GoldDivider({ width = 80 }: { width?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          height: 1,
          width,
          background: "linear-gradient(to right, transparent, #c9a84c)",
        }}
      />
      <div
        style={{
          width: 8,
          height: 8,
          background: "#c9a84c",
          transform: "rotate(45deg)",
          flexShrink: 0,
          boxShadow: "0 0 8px rgba(201,168,76,0.6)",
        }}
      />
      <div
        style={{
          height: 1,
          width,
          background: "linear-gradient(to left, transparent, #c9a84c)",
        }}
      />
    </div>
  );
}

/* ── Timeline Card ───────────────────────────────────────────────── */
function TimelineItem({
  year,
  text,
  idx,
}: {
  year: string;
  text: string;
  idx: number;
}) {
  const isLeft = idx % 2 === 0;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isLeft ? "flex-start" : "flex-end",
        marginBottom: 44,
        position: "relative",
      }}
    >
      {/* Centre dot */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 20,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#c9a84c",
          border: "3px solid #0d0d14",
          transform: "translateX(-50%)",
          boxShadow: "0 0 14px rgba(201,168,76,0.8)",
          zIndex: 2,
        }}
      />

      <div
        className="sot-timeline-card"
        style={{
          width: "calc(50% - 36px)",
          background: "rgba(201,168,76,0.03)",
          border: "1px solid rgba(201,168,76,0.18)",
          borderRadius: 16,
          padding: "24px 26px",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            color: "#c9a84c",
            marginBottom: 10,
            letterSpacing: "-0.02em",
            fontFamily: "Georgia, serif",
            textShadow: "0 0 24px rgba(201,168,76,0.4)",
          }}
        >
          {year}
        </div>
        <p
          style={{
            fontSize: "0.9rem",
            lineHeight: 1.8,
            color: "#9a9088",
            margin: 0,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

/* ── Section Header ──────────────────────────────────────────────── */
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 60 }}>
      <div className="sot-rotate" style={{ display: "inline-block", opacity: 0.25, marginBottom: 20 }}>
        <Ornament size={36} />
      </div>
      <h2
        style={{
          fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
          fontWeight: 600,
          color: "#f5f0e8",
          margin: "0 0 16px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {label}
      </h2>
      <GoldDivider width={40} />
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function LandingPage({
  product,
  translation,
  allLanguages,
  slug,
}: Props) {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [activeImg, setActiveImg] = useState<ProductImage | null>(
    product.images.find((i) => i.isPrimary) ?? product.images[0] ?? null
  );

  /* Mouse-track 3D tilt on hero */
  const onMouseMove = useCallback((e: MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
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

  /* Scroll parallax */
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Content */
  const paragraphs = getParagraphs(translation.description);
  const leadParagraph = paragraphs[0] ?? "";
  const bodyParagraphs = paragraphs.slice(1);
  const timelineEvents = extractTimeline(translation.description);
  const timelineTexts = new Set(timelineEvents.map((e) => e.text));
  const nonTimelineBody = bodyParagraphs.filter((p) => !timelineTexts.has(p));

  const langCode = translation.language.code;
  const historyLabel = langCode === "tr" ? "Tarihçe" : "History";
  const photosLabel = langCode === "tr" ? "Fotoğraflar" : "Gallery";

  return (
    <div
      className="lp-root"
      style={{
        background: "#0d0d14",
        color: "#f5f0e8",
        minHeight: "100vh",
        position: "relative",
      }}
    >

      {/* ══════ BACKGROUND ORBS ══════════════════════════════════════ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        {/* Gold orb — top left */}
        <div
          className="sot-orb-a"
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)",
            top: "-15%",
            left: "-15%",
            filter: "blur(40px)",
          }}
        />
        {/* Purple orb — bottom right */}
        <div
          className="sot-orb-b"
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(100,80,180,0.07) 0%, transparent 70%)",
            bottom: "5%",
            right: "-8%",
            filter: "blur(50px)",
          }}
        />
        {/* Subtle gold — mid-right */}
        <div
          className="sot-orb-c"
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)",
            top: "45%",
            left: "60%",
            filter: "blur(35px)",
          }}
        />
      </div>

      {/* ══════ ALL CONTENT (above orbs) ══════════════════════════════ */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Language Switcher ── */}
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 50,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {allLanguages.map((lang) => {
            const isActive = lang.code === langCode;
            return (
              <button
                key={lang.code}
                onClick={() => router.push(`/p/${slug}?lang=${lang.code}`)}
                aria-current={isActive ? "true" : undefined}
                style={{
                  padding: "0.4rem 1rem",
                  borderRadius: 9999,
                  border: `1px solid ${isActive ? "#c9a84c" : "rgba(201,168,76,0.4)"}`,
                  background: isActive ? "#c9a84c" : "rgba(13,13,20,0.75)",
                  color: isActive ? "#0d0d14" : "#c9a84c",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  letterSpacing: "0.05em",
                  transition: "all 0.2s",
                  boxShadow: isActive
                    ? "0 0 16px rgba(201,168,76,0.35)"
                    : "0 2px 12px rgba(0,0,0,0.4)",
                }}
              >
                {lang.nativeName}
              </button>
            );
          })}
        </div>

        {/* ══════ HERO SECTION ══════════════════════════════════════ */}
        <section
          ref={heroRef}
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "7rem 2rem 5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle scrolling grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
              backgroundSize: "70px 70px",
              transform: `translateY(${scrollY * 0.12}px)`,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />

          {/* Rotating ornament — top-left */}
          <div
            className="sot-rotate"
            style={{
              position: "absolute",
              top: 48,
              left: 48,
              opacity: 0.1,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          >
            <Ornament size={70} />
          </div>

          {/* Rotating ornament — bottom-right */}
          <div
            className="sot-rotate"
            style={{
              position: "absolute",
              bottom: 80,
              right: 48,
              opacity: 0.07,
              pointerEvents: "none",
              animationDirection: "reverse",
            }}
            aria-hidden="true"
          >
            <Ornament size={55} />
          </div>

          {/* 3D Arch shape */}
          <div
            className="sot-arch-float"
            style={{
              position: "absolute",
              top: "8%",
              left: "50%",
              width: 220,
              height: 220,
              border: "1.5px solid rgba(201,168,76,0.2)",
              borderRadius: "50% 50% 0 0",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
          <div
            style={{
              position: "absolute",
              top: "8%",
              left: "50%",
              width: 180,
              height: 180,
              border: "1px solid rgba(201,168,76,0.1)",
              borderRadius: "50% 50% 0 0",
              transform: "translateX(-50%) translateY(20px)",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />

          {/* Hero card with 3D mouse tilt */}
          <div
            className="sot-card-3d"
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: 760,
              width: "100%",
              ["--tilt-x" as string]: `${tilt.x}deg`,
              ["--tilt-y" as string]: `${tilt.y}deg`,
            }}
          >
            {/* Gold accent line */}
            <div
              className="sot-line"
              style={{
                width: 60,
                height: 2,
                background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
                margin: "0 auto 2rem",
              }}
            />

            {/* Pulsing stars */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {[0, 380, 760].map((delay) => (
                <div
                  key={delay}
                  className="sot-star"
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

            {/* Location badge */}
            <span
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "#c9a84c",
                marginBottom: "1rem",
                display: "block",
                fontFamily: "system-ui, -apple-system, sans-serif",
                opacity: 0.85,
              }}
            >
              Lefkoşa · Kuzey Kıbrıs
            </span>

            {/* Main title */}
            <h1
              className="sot-fade-up"
              style={{
                fontSize: "clamp(2.4rem, 7.5vw, 4.75rem)",
                fontWeight: 700,
                lineHeight: 1.05,
                marginBottom: "1.5rem",
                textShadow:
                  "0 2px 4px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.9), 0 0 100px rgba(201,168,76,0.12)",
                color: "#f5f0e8",
                letterSpacing: "-0.02em",
              }}
            >
              {translation.title}
            </h1>

            {/* Gold ornamental divider */}
            <div style={{ margin: "0 0 2rem" }}>
              <GoldDivider width={70} />
            </div>

            {/* Lead paragraph */}
            {leadParagraph && (
              <p
                className="sot-fade-up-d"
                style={{
                  fontSize: "clamp(0.95rem, 2vw, 1.125rem)",
                  color: "#a89468",
                  fontStyle: "italic",
                  lineHeight: 1.75,
                  maxWidth: 580,
                  margin: "0 auto",
                  fontFamily: "Georgia, serif",
                }}
              >
                {leadParagraph}
              </p>
            )}

            {/* Bottom accent */}
            <div
              className="sot-line"
              style={{
                width: 60,
                height: 2,
                background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
                margin: "2.5rem auto 0",
              }}
            />
          </div>

          {/* Scroll indicator */}
          <div
            className="sot-scroll"
            style={{
              position: "absolute",
              bottom: "2.5rem",
              left: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          >
            <span
              style={{
                color: "#c9a84c",
                fontSize: 10,
                letterSpacing: "0.2em",
                opacity: 0.6,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              SCROLL
            </span>
            <svg width="16" height="26" viewBox="0 0 16 26" fill="none">
              <rect
                x="1"
                y="1"
                width="14"
                height="24"
                rx="7"
                stroke="rgba(201,168,76,0.35)"
                strokeWidth="1.5"
              />
              <rect x="6.5" y="5" width="3" height="7" rx="1.5" fill="#c9a84c" />
            </svg>
          </div>
        </section>

        {/* ══════ IMAGE GALLERY ══════════════════════════════════════ */}
        {product.images.length > 0 && (
          <section
            style={{
              padding: "3rem 1.5rem 5rem",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            <SectionHeader label={photosLabel} />

            {/* Main image — 3D card */}
            {activeImg && (
              <div
                className="sot-img-card sot-pulse-gold"
                style={{
                  position: "relative",
                  borderRadius: 20,
                  overflow: "hidden",
                  aspectRatio: "16 / 9",
                  border: "1px solid rgba(201,168,76,0.22)",
                  marginBottom: 16,
                  background: "#13131f",
                }}
              >
                <Image
                  src={activeImg.url}
                  alt={activeImg.alt ?? translation.title}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
                {/* Gold corner accents */}
                {[
                  { top: 12, left: 12 },
                  { top: 12, right: 12 },
                  { bottom: 12, left: 12 },
                  { bottom: 12, right: 12 },
                ].map((pos, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: 20,
                      height: 20,
                      borderTop: i < 2 ? "2px solid rgba(201,168,76,0.5)" : undefined,
                      borderBottom: i >= 2 ? "2px solid rgba(201,168,76,0.5)" : undefined,
                      borderLeft: i % 2 === 0 ? "2px solid rgba(201,168,76,0.5)" : undefined,
                      borderRight: i % 2 === 1 ? "2px solid rgba(201,168,76,0.5)" : undefined,
                      ...pos,
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 12,
                }}
              >
                {product.images.map((img) => {
                  const isActive = img.id === activeImg?.id;
                  return (
                    <button
                      key={img.id}
                      onClick={() => setActiveImg(img)}
                      className="sot-thumb"
                      style={{
                        width: 80,
                        height: 58,
                        borderRadius: 10,
                        overflow: "hidden",
                        border: `2px solid ${isActive ? "#c9a84c" : "rgba(201,168,76,0.15)"}`,
                        position: "relative",
                        cursor: "pointer",
                        padding: 0,
                        background: "#13131f",
                        boxShadow: isActive
                          ? "0 0 14px rgba(201,168,76,0.4)"
                          : "none",
                      }}
                      aria-label={img.alt ?? `Image ${img.id}`}
                      aria-pressed={isActive}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt ?? ""}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══════ HISTORY TIMELINE ══════════════════════════════════ */}
        {timelineEvents.length > 0 && (
          <section
            style={{
              padding: "2rem 1.5rem 5rem",
              maxWidth: 860,
              margin: "0 auto",
            }}
          >
            <SectionHeader label={historyLabel} />

            {/* Vertical centre line */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background:
                    "linear-gradient(to bottom, transparent, rgba(201,168,76,0.4) 8%, rgba(201,168,76,0.4) 92%, transparent)",
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              />
              {timelineEvents.map((e, i) => (
                <TimelineItem key={e.year} year={e.year} text={e.text} idx={i} />
              ))}
            </div>
          </section>
        )}

        {/* ══════ STORY / BODY PARAGRAPHS ═══════════════════════════ */}
        {nonTimelineBody.length > 0 && (
          <section
            style={{
              maxWidth: 700,
              margin: "0 auto",
              padding: "2rem 1.5rem 6rem",
            }}
          >
            <div
              style={{
                background: "rgba(201,168,76,0.025)",
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: 20,
                padding: "40px 36px",
              }}
            >
              {nonTimelineBody.map((para, i) => {
                const isLast = i === nonTimelineBody.length - 1;
                const isFirst = i === 0;
                return (
                  <div
                    key={i}
                    style={{
                      marginBottom: isLast ? 0 : "2.25rem",
                      paddingLeft: "1.25rem",
                      borderLeft: isFirst
                        ? "2px solid #c9a84c"
                        : "2px solid rgba(201,168,76,0.12)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "1.0rem",
                        lineHeight: 1.9,
                        color: isLast ? "#c9a84c" : isFirst ? "#e8dcc8" : "#9a9088",
                        fontStyle: isLast ? "italic" : "normal",
                        fontWeight: isLast ? 600 : 400,
                        margin: 0,
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      {para}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* If no timeline and no body, show all paragraphs in story section */}
        {timelineEvents.length === 0 && nonTimelineBody.length === 0 && paragraphs.length > 1 && (
          <section
            style={{
              maxWidth: 700,
              margin: "0 auto",
              padding: "2rem 1.5rem 6rem",
            }}
          >
            <div
              style={{
                background: "rgba(201,168,76,0.025)",
                border: "1px solid rgba(201,168,76,0.1)",
                borderRadius: 20,
                padding: "40px 36px",
              }}
            >
              {paragraphs.slice(1).map((para, i, arr) => {
                const isLast = i === arr.length - 1;
                const isFirst = i === 0;
                return (
                  <div
                    key={i}
                    style={{
                      marginBottom: isLast ? 0 : "2.25rem",
                      paddingLeft: "1.25rem",
                      borderLeft: isFirst
                        ? "2px solid #c9a84c"
                        : "2px solid rgba(201,168,76,0.12)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "1.0rem",
                        lineHeight: 1.9,
                        color: isFirst ? "#e8dcc8" : "#9a9088",
                        margin: 0,
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      {para}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════ FOOTER ════════════════════════════════════════════ */}
        <footer
          style={{
            background: "#0a0a11",
            borderTop: "1px solid rgba(201,168,76,0.12)",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          {/* QR Code */}
          <div style={{ marginBottom: "2rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${product.slug}`}
              alt="QR Code"
              width={120}
              height={120}
              style={{
                width: 120,
                height: 120,
                borderRadius: "0.75rem",
                border: "1px solid rgba(201,168,76,0.2)",
                display: "inline-block",
                filter: "invert(1) sepia(0.1)",
                boxShadow: "0 0 30px rgba(201,168,76,0.08)",
              }}
            />
          </div>

          {/* Ornament */}
          <div style={{ marginBottom: "1.25rem" }}>
            <Ornament size={24} />
          </div>

          {/* Location tag */}
          <p
            style={{
              color: "#2e2e42",
              fontSize: "0.7rem",
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Lefkoşa Turizm
          </p>
        </footer>
      </div>
    </div>
  );
}

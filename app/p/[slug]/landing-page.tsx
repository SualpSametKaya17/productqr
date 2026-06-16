"use client";

import { useState } from "react";
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

/* ── Palette ─────────────────────────────────────────────────────── */
const C = {
  bg: "#faf8f4",
  bgSoft: "#f2eee7",
  ink: "#1c1b18",
  body: "#4a4842",
  muted: "#8b877d",
  line: "#e4ddd1",
  accent: "#9c6b3f",
  accentSoft: "#bfa88a",
  serif: 'Georgia, "Times New Roman", serif',
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function getParagraphs(description: string): string[] {
  const double = description.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (double.length > 1) return double;
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
    .sort((a, b) => parseInt(a.year) - parseInt(b.year))
    .slice(0, 6);
}

/* ── Component ────────────────────────────────────────────────────── */
export default function LandingPage({ product, translation, allLanguages, slug }: Props) {
  const router = useRouter();
  const langCode = translation.language.code;
  const paragraphs = getParagraphs(translation.description);
  const timeline = extractTimeline(translation.description);
  const images = product.images;
  const [activeIdx, setActiveIdx] = useState(0);
  const activeImg = images[activeIdx];

  return (
    <main
      style={{
        background: C.bg,
        minHeight: "100vh",
        color: C.ink,
        fontFamily: C.sans,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* ── Language switcher (fixed top-right) ── */}
      {allLanguages.length > 1 && (
        <div
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 50,
            display: "flex",
            gap: 6,
            padding: 5,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: `1px solid ${C.line}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
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
                  padding: "0.35rem 0.85rem",
                  borderRadius: 9999,
                  border: "none",
                  background: isActive ? C.ink : "transparent",
                  color: isActive ? C.bg : C.body,
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "0.78rem",
                  letterSpacing: "0.03em",
                  cursor: "pointer",
                  fontFamily: C.sans,
                  transition: "all 0.2s",
                }}
              >
                {lang.code.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Hero ── */}
      <header
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "clamp(5rem, 14vh, 9rem) 1.5rem 2.5rem",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "0.72rem",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: C.accent,
            fontWeight: 600,
            marginBottom: "1.6rem",
          }}
        >
          Lefkoşa · Kuzey Kıbrıs
        </span>

        <h1
          style={{
            fontFamily: C.serif,
            fontWeight: 400,
            fontSize: "clamp(2.4rem, 7vw, 4.4rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.015em",
            color: C.ink,
            margin: 0,
          }}
        >
          {translation.title}
        </h1>

        {/* thin rule */}
        <div
          style={{
            width: 56,
            height: 2,
            background: C.accent,
            margin: "2rem auto 0",
          }}
        />
      </header>

      {/* ── Hero image ── */}
      {activeImg && (
        <section style={{ maxWidth: 1040, margin: "0 auto", padding: "1rem 1.5rem 0" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 14,
              overflow: "hidden",
              background: C.bgSoft,
              boxShadow: "0 30px 60px -25px rgba(40,30,15,0.35)",
            }}
          >
            <Image
              src={activeImg.url}
              alt={activeImg.alt ?? translation.title}
              fill
              sizes="(max-width: 1040px) 100vw, 1040px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>

          {/* thumbnails */}
          {images.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIdx(i)}
                  aria-label={`Görsel ${i + 1}`}
                  style={{
                    position: "relative",
                    width: 84,
                    height: 60,
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: "pointer",
                    padding: 0,
                    border: i === activeIdx ? `2px solid ${C.accent}` : `2px solid transparent`,
                    opacity: i === activeIdx ? 1 : 0.6,
                    transition: "opacity 0.2s, border-color 0.2s",
                    background: C.bgSoft,
                  }}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? ""}
                    fill
                    sizes="84px"
                    style={{ objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Story ── */}
      <article
        style={{
          maxWidth: 660,
          margin: "0 auto",
          padding: "clamp(3rem, 8vh, 5rem) 1.5rem 1rem",
        }}
      >
        {paragraphs.map((para, i) => (
          <p
            key={i}
            style={{
              margin: i === 0 ? "0 0 1.6rem" : "0 0 1.5rem",
              fontSize: i === 0 ? "1.22rem" : "1.05rem",
              lineHeight: i === 0 ? 1.65 : 1.85,
              color: i === 0 ? C.ink : C.body,
              fontWeight: i === 0 ? 400 : 400,
              fontFamily: i === 0 ? C.serif : C.sans,
            }}
          >
            {para}
          </p>
        ))}
      </article>

      {/* ── Timeline ── */}
      {timeline.length > 1 && (
        <section
          style={{
            maxWidth: 660,
            margin: "0 auto",
            padding: "2.5rem 1.5rem 3rem",
          }}
        >
          <h2
            style={{
              fontFamily: C.sans,
              fontSize: "0.74rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.accent,
              fontWeight: 600,
              marginBottom: "2rem",
            }}
          >
            Kilometre Taşları
          </h2>
          <div style={{ position: "relative" }}>
            {/* vertical line */}
            <div
              style={{
                position: "absolute",
                left: 7,
                top: 6,
                bottom: 6,
                width: 1,
                background: C.line,
              }}
            />
            {timeline.map((ev) => (
              <div
                key={ev.year}
                style={{ position: "relative", paddingLeft: 36, marginBottom: 26 }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 5,
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    background: C.bg,
                    border: `2px solid ${C.accent}`,
                  }}
                />
                <div
                  style={{
                    fontFamily: C.serif,
                    fontSize: "1.35rem",
                    color: C.accent,
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {ev.year}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    color: C.body,
                  }}
                >
                  {ev.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: `1px solid ${C.line}`,
          background: C.bgSoft,
          padding: "3.5rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              padding: 12,
              background: "#fff",
              borderRadius: 14,
              border: `1px solid ${C.line}`,
              boxShadow: "0 8px 24px -12px rgba(40,30,15,0.25)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${slug}`}
              alt="QR Kod"
              width={108}
              height={108}
              style={{ display: "block", borderRadius: 6 }}
            />
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: C.muted,
              fontWeight: 600,
            }}
          >
            Lefkoşa Turizm
          </p>
        </div>
      </footer>
    </main>
  );
}

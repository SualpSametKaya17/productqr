/* ───────────────────────────────────────────────────────────────
   Shared types for the Heritage 3D experience
   ─────────────────────────────────────────────────────────────── */

export type LanguageOption = {
  code: string;
  label: string;
};

export type TimelineEntry = {
  year: string;
  text: string;
};

/**
 * A point of interest anchored on the diorama.
 * `u` / `v` are normalized image coordinates (0..1, top-left origin)
 * that get mapped onto the curved photo plane in 3D space.
 */
export type Hotspot = {
  id: string;
  u: number;
  v: number;
  label: string;
  body: string;
  kind?: "history" | "date" | "ottoman" | "british" | "event";
};

/**
 * Imperative handle the 3D scene exposes to the surrounding UI so that
 * glassmorphism buttons can drive the camera without prop-drilling refs.
 */
export type ExperienceAPI = {
  resetView: () => void;
  focusMonument: () => void;
  setAutoRotate: (on: boolean) => void;
};

export type HeritageData = {
  imageUrl: string;
  /** Optional depth + normal maps that turn the photo into a 3D relief. */
  depthUrl?: string;
  normalUrl?: string;
  title: string;
  location: string;
  languages: LanguageOption[];
  currentLang: string;
  timeline: TimelineEntry[];
  hotspots: Hotspot[];
};

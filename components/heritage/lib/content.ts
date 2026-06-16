import type { Hotspot } from "./types";

/**
 * Curated information hotspots per monument and language. Coordinates are
 * normalized (0..1) over the source photo and map onto the 3D diorama.
 * Falls back to Turkish when a language is not translated.
 */
type LangMap = Record<string, Hotspot[]>;
type SlugMap = Record<string, LangMap>;

const CONTENT: SlugMap = {
  "lefkosa-dikilitas": {
    tr: [
      {
        id: "history",
        kind: "history",
        u: 0.5,
        v: 0.2,
        label: "Venedik Sütunu",
        body:
          "Tek parça granitten yapılan sütunun, antik Salamis kentinden getirildiği ve Roma dönemine ait bir yapıdan alındığı düşünülmektedir.",
      },
      {
        id: "date",
        kind: "date",
        u: 0.5,
        v: 0.58,
        label: "16. Yüzyıl",
        body:
          "Sütun, 16. yüzyılın ortalarında Venedikliler tarafından Lefkoşa'ya getirilmiş ve Venedik valisinin sarayının önüne dikilmiştir.",
      },
      {
        id: "ottoman",
        kind: "ottoman",
        u: 0.33,
        v: 0.47,
        label: "Osmanlı Dönemi",
        body:
          "1571'de Kıbrıs'ın Osmanlılar tarafından fethedilmesinin ardından sütun yerinden söküldü; tepesindeki Aziz Markos Aslanı kayboldu.",
      },
      {
        id: "british",
        kind: "british",
        u: 0.69,
        v: 0.5,
        label: "İngiliz Dönemi",
        body:
          "İngiliz yönetiminde sütun 1915'te bugünkü yerine yeniden dikildi. Kayıp aslan heykelinin yerine tepeye bronz bir küre yerleştirildi.",
      },
      {
        id: "event",
        kind: "event",
        u: 0.5,
        v: 0.82,
        label: "Sarayönü Meydanı",
        body:
          "Bugün meydanın merkezinde yükselen anıt; Venedik, Osmanlı ve İngiliz dönemlerinin izlerini tek bir yapıda birleştirir.",
      },
    ],
    en: [
      {
        id: "history",
        kind: "history",
        u: 0.5,
        v: 0.2,
        label: "Venice Column",
        body:
          "The single-piece granite column is believed to have been brought from ancient Salamis and taken from a Roman-era structure.",
      },
      {
        id: "date",
        kind: "date",
        u: 0.5,
        v: 0.58,
        label: "16th Century",
        body:
          "Brought to Nicosia by the Venetians in the mid-16th century, it was erected in front of the Venetian governor's palace.",
      },
      {
        id: "ottoman",
        kind: "ottoman",
        u: 0.33,
        v: 0.47,
        label: "Ottoman Period",
        body:
          "After the Ottoman conquest of Cyprus in 1571 the column was removed, and the Lion of Saint Mark atop it disappeared.",
      },
      {
        id: "british",
        kind: "british",
        u: 0.69,
        v: 0.5,
        label: "British Period",
        body:
          "Under British rule the column was re-erected at its present location in 1915, with a bronze sphere replacing the lost lion.",
      },
      {
        id: "event",
        kind: "event",
        u: 0.5,
        v: 0.82,
        label: "Atatürk Square",
        body:
          "Rising at the center of the square today, the monument unites traces of the Venetian, Ottoman and British eras in one structure.",
      },
    ],
  },
};

/**
 * Pre-generated depth + normal maps (see scripts/generate-depth.mjs) that
 * turn a flat photo into a real displaced 3D relief. Slugs without an entry
 * gracefully fall back to the concave photo slab.
 */
/**
 * Pre-built 3D model files in public/models/.
 * Convention: drop your .glb at public/models/{slug}.glb, then add an
 * entry here. The model takes priority over depth-map relief.
 */
export const MODELS: Record<string, string> = {
  "lefkosa-dikilitas": "/models/lefkosa-dikilitas.glb",
  "girne-kapisi": "/models/girne-kapisi.glb",
};

export function getModelUrl(slug: string): string | undefined {
  return MODELS[slug];
}

export const RELIEF_MAPS: Record<string, { depth: string; normal: string }> = {
  "lefkosa-dikilitas": {
    depth: "/images/dikilitas-depth.png",
    normal: "/images/dikilitas-normal.png",
  },
};

export function getReliefMaps(slug: string) {
  return RELIEF_MAPS[slug] ?? null;
}

export function buildHotspots(slug: string, lang: string): Hotspot[] {
  const forSlug = CONTENT[slug];
  if (!forSlug) return [];
  return forSlug[lang] ?? forSlug.tr ?? [];
}

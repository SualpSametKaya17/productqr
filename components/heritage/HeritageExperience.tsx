"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader } from "@react-three/drei";
import { useFullscreen } from "./hooks/useFullscreen";
import { TitleBadge } from "./ui/TitleBadge";
import { LanguageSelector } from "./ui/LanguageSelector";
import { Toolbar } from "./ui/Toolbar";
import { InfoCard } from "./ui/InfoCard";
import { Timeline } from "./ui/Timeline";
import { HintPill } from "./ui/HintPill";
import type { ExperienceAPI, HeritageData, Hotspot, TimelineEntry } from "./lib/types";

/* WebGL canvas is loaded client-only so it never runs during SSR. */
const HeritageScene = dynamic(() => import("./scene/HeritageScene"), {
  ssr: false,
});

type Props = HeritageData & {
  onLanguageChange: (code: string) => void;
};

export default function HeritageExperience({
  imageUrl,
  depthUrl,
  normalUrl,
  title,
  location,
  languages,
  currentLang,
  timeline,
  hotspots,
  onLanguageChange,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ExperienceAPI | null>(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [focused, setFocused] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [activeInfo, setActiveInfo] = useState<Hotspot | null>(null);
  const [activeYear, setActiveYear] = useState<string | null>(null);

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(rootRef);

  const hotspotMap = useMemo(
    () => new Map(hotspots.map((h) => [h.id, h])),
    [hotspots]
  );

  const handleHotspotClick = (id: string) => {
    setActiveInfo(hotspotMap.get(id) ?? null);
    setActiveYear(null);
    setShowHint(false);
  };

  const handleTimelineSelect = (entry: TimelineEntry) => {
    setActiveInfo({
      id: `year-${entry.year}`,
      u: 0,
      v: 0,
      label: entry.year,
      body: entry.text,
      kind: "event",
    });
    setActiveYear(entry.year);
    apiRef.current?.focusMonument();
    setShowHint(false);
  };

  const dismissHint = () => setShowHint(false);

  return (
    <div
      ref={rootRef}
      onPointerDown={dismissHint}
      onDoubleClick={() => apiRef.current?.focusMonument()}
      style={{
        position: "relative",
        width: "100%",
        height: isFullscreen ? "100vh" : "min(86vh, 820px)",
        background:
          "radial-gradient(ellipse at 50% 40%, #1a1a1e 0%, #111113 55%, #0a0a0c 100%)",
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      <style>{`
        @keyframes hotspotPulse {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.1); opacity: 0; }
          100% { transform: scale(2.1); opacity: 0; }
        }
      `}</style>

      <HeritageScene
        imageUrl={imageUrl}
        depthUrl={depthUrl}
        normalUrl={normalUrl}
        hotspots={hotspots}
        activeHotspot={activeInfo?.id ?? null}
        autoRotate={autoRotate}
        focused={focused}
        onHotspotClick={handleHotspotClick}
        onReady={(api) => (apiRef.current = api)}
        onFocusChange={setFocused}
      />

      <TitleBadge title={title} location={location} />

      <LanguageSelector
        languages={languages}
        currentLang={currentLang}
        onChange={onLanguageChange}
      />

      <Toolbar
        autoRotate={autoRotate}
        isFullscreen={isFullscreen}
        onToggleAutoRotate={() => setAutoRotate((v) => !v)}
        onReset={() => {
          apiRef.current?.resetView();
          setActiveInfo(null);
          setActiveYear(null);
        }}
        onFocus={() => apiRef.current?.focusMonument()}
        onToggleFullscreen={toggleFullscreen}
        onHelp={() => setShowHint(true)}
      />

      <InfoCard hotspot={activeInfo} onClose={() => setActiveInfo(null)} />

      <Timeline
        entries={timeline}
        activeYear={activeYear}
        onSelect={handleTimelineSelect}
      />

      <HintPill visible={showHint} bottomOffset={timeline.length >= 2 ? 74 : 24} />

      {/* drei DOM loader reflects asset/texture loading progress. */}
      <Loader
        containerStyles={{ background: "transparent" }}
        innerStyles={{ background: "rgba(255,255,255,0.12)", width: 160 }}
        barStyles={{ background: "#e7c878" }}
        dataStyles={{ color: "#cbc6bd", fontSize: "0.75rem", letterSpacing: "0.1em" }}
      />
    </div>
  );
}

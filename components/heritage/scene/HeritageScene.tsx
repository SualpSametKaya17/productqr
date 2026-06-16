"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Diorama } from "./Diorama";
import { Stage } from "./Stage";
import { CameraRig } from "./CameraRig";
import { PostFX } from "./PostFX";
import type { ExperienceAPI, Hotspot } from "../lib/types";

type Props = {
  imageUrl: string;
  hotspots: Hotspot[];
  activeHotspot: string | null;
  autoRotate: boolean;
  focused: boolean;
  onHotspotClick: (id: string) => void;
  onReady: (api: ExperienceAPI) => void;
  onFocusChange: (focused: boolean) => void;
};

/**
 * The WebGL surface. Mounted client-only (see HeritageExperience) so it
 * never runs during SSR. Atmospheric fog + a near-black background let
 * the lit diorama appear to float as a physical miniature.
 */
export default function HeritageScene({
  imageUrl,
  hotspots,
  activeHotspot,
  autoRotate,
  focused,
  onHotspotClick,
  onReady,
  onFocusChange,
}: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.4, 8.5], fov: 38, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#0b0b0d"]} />
      <fog attach="fog" args={["#0b0b0d", 11, 26]} />

      <Suspense fallback={null}>
        <Diorama
          imageUrl={imageUrl}
          hotspots={hotspots}
          activeHotspot={activeHotspot}
          onHotspotClick={onHotspotClick}
        />
        <Stage />
      </Suspense>

      <CameraRig
        autoRotate={autoRotate}
        onReady={onReady}
        onFocusChange={onFocusChange}
      />
      <PostFX focused={focused} />
    </Canvas>
  );
}

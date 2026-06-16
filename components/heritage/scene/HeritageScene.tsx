"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Diorama } from "./Diorama";
import { Model3D } from "./Model3D";
import { Stage } from "./Stage";
import { CameraRig } from "./CameraRig";
import { PostFX } from "./PostFX";
import type { ExperienceAPI, Hotspot } from "../lib/types";

type Props = {
  imageUrl: string;
  modelUrl?: string;
  depthUrl?: string;
  normalUrl?: string;
  hotspots: Hotspot[];
  activeHotspot: string | null;
  autoRotate: boolean;
  focused: boolean;
  onHotspotClick: (id: string) => void;
  onReady: (api: ExperienceAPI) => void;
  onFocusChange: (focused: boolean) => void;
};

export default function HeritageScene({
  imageUrl,
  modelUrl,
  depthUrl,
  normalUrl,
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
      camera={{ position: [0, 1.2, 8.5], fov: 38, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#0b0b0d"]} />
      <fog attach="fog" args={["#0b0b0d", 14, 30]} />

      <Suspense fallback={null}>
        {modelUrl ? (
          <Model3D
            modelUrl={modelUrl}
            hotspots={hotspots}
            activeHotspot={activeHotspot}
            onHotspotClick={onHotspotClick}
          />
        ) : (
          <Diorama
            imageUrl={imageUrl}
            depthUrl={depthUrl}
            normalUrl={normalUrl}
            hotspots={hotspots}
            activeHotspot={activeHotspot}
            onHotspotClick={onHotspotClick}
          />
        )}
        <Stage />
      </Suspense>

      <CameraRig
        autoRotate={autoRotate}
        fullOrbit={Boolean(modelUrl)}
        onReady={onReady}
        onFocusChange={onFocusChange}
      />
      <PostFX focused={focused} />
    </Canvas>
  );
}

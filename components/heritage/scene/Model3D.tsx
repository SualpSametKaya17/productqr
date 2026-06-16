"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Bounds } from "@react-three/drei";
import * as THREE from "three";
import type { Hotspot as HotspotType } from "../lib/types";
import { Hotspot3D } from "./Hotspot3D";

type Props = {
  modelUrl: string;
  hotspots?: HotspotType[];
  activeHotspot?: string | null;
  onHotspotClick?: (id: string) => void;
};

/**
 * Loads and renders a GLTF/GLB model with:
 * - Auto-center + auto-scale via <Bounds>
 * - All embedded animations played
 * - Gentle cinematic float
 * - Shadow casting on every mesh
 */
function ModelContent({
  modelUrl,
  hotspots = [],
  activeHotspot = null,
  onHotspotClick,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, groupRef);

  /* Play all animations found in the file. */
  useEffect(() => {
    Object.values(actions).forEach((action) => {
      action?.reset().fadeIn(0.4).play();
    });
    return () => {
      Object.values(actions).forEach((a) => a?.fadeOut(0.4));
    };
  }, [actions]);

  /* Enable shadows on every mesh in the model. */
  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [scene]);

  /* Cinematic float. */
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.55) * 0.06;
    groupRef.current.rotation.y += 0.0002;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />

      {/* Hotspots float at a fixed radius around the model origin */}
      {hotspots.map((h) => (
        <Hotspot3D
          key={h.id}
          position={[(h.u - 0.5) * 3.5, (0.5 - h.v) * 3.5, 1.8]}
          active={activeHotspot === h.id}
          onClick={() => onHotspotClick?.(h.id)}
        />
      ))}
    </group>
  );
}

export function Model3D(props: Props) {
  return (
    <Bounds fit clip observe margin={1.28}>
      <ModelContent {...props} />
    </Bounds>
  );
}

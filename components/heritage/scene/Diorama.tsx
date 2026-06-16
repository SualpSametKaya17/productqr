"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Hotspot as HotspotType } from "../lib/types";
import { Hotspot3D } from "./Hotspot3D";

/* Base height of the floating slab in world units. */
const BASE_HEIGHT = 3.4;
/* How deeply the front face curves toward the viewer (concave). */
const CURVE = 0.42;

type Props = {
  imageUrl: string;
  hotspots: HotspotType[];
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
};

/**
 * Builds a subtly concave plane so the photo reads as a curved museum
 * display rather than a flat billboard. Vertices are bent on Z by the
 * square of their X offset, then normals are recomputed for lighting.
 */
function useCurvedPlane(width: number, height: number) {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, 80, 60);
    const pos = geo.attributes.position;
    const halfW = width / 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = -Math.pow(x / halfW, 2) * CURVE;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [width, height]);
}

export function Diorama({ imageUrl, hotspots, activeHotspot, onHotspotClick }: Props) {
  const group = useRef<THREE.Group>(null);

  const texture = useTexture(imageUrl, (loaded) => {
    const tex = loaded as THREE.Texture;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });

  const img = texture.image as { width: number; height: number } | undefined;
  const aspect = img ? img.width / img.height : 1.4;

  const width = BASE_HEIGHT * aspect;
  const height = BASE_HEIGHT;
  const geometry = useCurvedPlane(width, height);

  /* Gentle cinematic float + breathing rotation when idle. */
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.6) * 0.06;
    group.current.rotation.z = Math.sin(t * 0.4) * 0.004;
  });

  /* Map normalized image coords -> local position on the curved face. */
  const localFromUV = (u: number, v: number): [number, number, number] => {
    const x = (u - 0.5) * width;
    const y = (0.5 - v) * height;
    const z = -Math.pow(x / (width / 2), 2) * CURVE + 0.06;
    return [x, y, z];
  };

  return (
    <group ref={group}>
      {/* Solid dark backing so the slab has real physical thickness. */}
      <mesh position={[0, 0, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.18, height + 0.18, 0.42]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Thin luminous bezel framing the photo. */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width + 0.1, height + 0.1]} />
        <meshStandardMaterial
          color="#2a2622"
          emissive="#5b4a2e"
          emissiveIntensity={0.25}
          roughness={0.6}
        />
      </mesh>

      {/* The photographic front face. */}
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial
          map={texture}
          roughness={0.72}
          metalness={0.04}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Anchored hotspots ride along with the curved face. */}
      {hotspots.map((h) => (
        <Hotspot3D
          key={h.id}
          position={localFromUV(h.u, h.v)}
          active={activeHotspot === h.id}
          onClick={() => onHotspotClick(h.id)}
        />
      ))}
    </group>
  );
}

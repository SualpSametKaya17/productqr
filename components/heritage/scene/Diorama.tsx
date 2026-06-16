"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Hotspot as HotspotType } from "../lib/types";
import { Hotspot3D } from "./Hotspot3D";

/* Base height of the floating diorama in world units. */
const BASE_HEIGHT = 3.4;
/* How far the brightest (nearest) pixels extrude toward the viewer. */
const RELIEF_DEPTH = 1.15;
/* Fallback concave curve when no depth map is supplied. */
const CURVE = 0.42;

type Props = {
  imageUrl: string;
  depthUrl?: string;
  normalUrl?: string;
  hotspots: HotspotType[];
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
};

/* Anchors hotspots + cinematic float, shared by both render paths. */
function DioramaFrame({
  width,
  height,
  hotspots,
  activeHotspot,
  onHotspotClick,
  curved,
  children,
}: {
  width: number;
  height: number;
  hotspots: HotspotType[];
  activeHotspot: string | null;
  onHotspotClick: (id: string) => void;
  curved: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.6) * 0.06;
    group.current.rotation.z = Math.sin(t * 0.4) * 0.004;
  });

  const localFromUV = (u: number, v: number): [number, number, number] => {
    const x = (u - 0.5) * width;
    const y = (0.5 - v) * height;
    // Float markers in front of the relief (or the curved face).
    const z = curved
      ? -Math.pow(x / (width / 2), 2) * CURVE + 0.06
      : RELIEF_DEPTH * 0.5;
    return [x, y, z];
  };

  return (
    <group ref={group}>
      {/* Solid dark backing gives the diorama real physical thickness. */}
      <mesh position={[0, 0, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.5]} />
        <meshStandardMaterial color="#0c0c0e" roughness={0.85} metalness={0.1} />
      </mesh>

      {children}

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

/* ── Real depth-displaced relief mesh (photo → 3D) ── */
function ReliefDiorama({
  imageUrl,
  depthUrl,
  normalUrl,
  hotspots,
  activeHotspot,
  onHotspotClick,
}: Required<Pick<Props, "imageUrl" | "depthUrl" | "normalUrl">> &
  Pick<Props, "hotspots" | "activeHotspot" | "onHotspotClick">) {
  const colorMap = useTexture(imageUrl, (t) => {
    const tex = t as THREE.Texture;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });
  const displacementMap = useTexture(depthUrl);
  const normalMap = useTexture(normalUrl);

  const img = colorMap.image as { width: number; height: number } | undefined;
  const aspect = img ? img.width / img.height : 1.4;
  const width = BASE_HEIGHT * aspect;
  const height = BASE_HEIGHT;

  return (
    <DioramaFrame
      width={width}
      height={height}
      hotspots={hotspots}
      activeHotspot={activeHotspot}
      onHotspotClick={onHotspotClick}
      curved={false}
    >
      <mesh castShadow position={[0, 0, -RELIEF_DEPTH * 0.5]}>
        {/* High subdivision so the displacement reads as smooth geometry. */}
        <planeGeometry args={[width, height, 320, 230]} />
        <meshStandardMaterial
          map={colorMap}
          displacementMap={displacementMap}
          displacementScale={RELIEF_DEPTH}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(1.1, 1.1)}
          roughness={0.78}
          metalness={0.05}
          side={THREE.FrontSide}
        />
      </mesh>
    </DioramaFrame>
  );
}

/* ── Fallback: concave photo slab (no depth map available) ── */
function SlabDiorama({
  imageUrl,
  hotspots,
  activeHotspot,
  onHotspotClick,
}: Pick<Props, "imageUrl" | "hotspots" | "activeHotspot" | "onHotspotClick">) {
  const colorMap = useTexture(imageUrl, (t) => {
    const tex = t as THREE.Texture;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });

  const img = colorMap.image as { width: number; height: number } | undefined;
  const aspect = img ? img.width / img.height : 1.4;
  const width = BASE_HEIGHT * aspect;
  const height = BASE_HEIGHT;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, 80, 60);
    const pos = geo.attributes.position;
    const halfW = width / 2;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, -Math.pow(x / halfW, 2) * CURVE);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [width, height]);

  return (
    <DioramaFrame
      width={width}
      height={height}
      hotspots={hotspots}
      activeHotspot={activeHotspot}
      onHotspotClick={onHotspotClick}
      curved
    >
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial map={colorMap} roughness={0.72} metalness={0.04} />
      </mesh>
    </DioramaFrame>
  );
}

export function Diorama({ imageUrl, depthUrl, normalUrl, ...rest }: Props) {
  if (depthUrl && normalUrl) {
    return (
      <ReliefDiorama
        imageUrl={imageUrl}
        depthUrl={depthUrl}
        normalUrl={normalUrl}
        {...rest}
      />
    );
  }
  return <SlabDiorama imageUrl={imageUrl} {...rest} />;
}

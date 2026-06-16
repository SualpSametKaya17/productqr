"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import type { Hotspot as HotspotType } from "../lib/types";
import { Hotspot3D } from "./Hotspot3D";

/* Target height the model is normalized to, in world units. */
const TARGET_HEIGHT = 4.2;

type Props = {
  modelUrl: string;
  hotspots?: HotspotType[];
  activeHotspot?: string | null;
  onHotspotClick?: (id: string) => void;
};

export function Model3D({
  modelUrl,
  hotspots = [],
  activeHotspot = null,
  onHotspotClick,
}: Props) {
  const floatRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, floatRef);

  /* Warm limestone fallback for meshes that ship without a texture. */
  const stoneMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#c9bca2"),
        roughness: 0.82,
        metalness: 0.0,
        envMapIntensity: 0.9,
      }),
    []
  );

  /* Fix normals, dress untextured meshes, enable shadows. */
  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;

      if (!mesh.geometry.attributes.normal) {
        mesh.geometry.computeVertexNormals();
      }

      const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
      const hasTexture = Boolean(mat?.map);
      const hasVertexColor = Boolean(mesh.geometry.attributes.color);

      if (!hasTexture && !hasVertexColor) {
        mesh.material = stoneMaterial;
      } else if (mat) {
        mat.envMapIntensity = 1;
        if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
        mat.needsUpdate = true;
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [scene, stoneMaterial]);

  /* Center at origin + uniform scale so height == TARGET_HEIGHT. */
  const { scale, center } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const c = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(c);
    return { scale: TARGET_HEIGHT / (size.y || 1), center: c };
  }, [scene]);

  /* Play any embedded animations. */
  useEffect(() => {
    const list = Object.values(actions);
    list.forEach((a) => a?.reset().fadeIn(0.4).play());
    return () => list.forEach((a) => a?.fadeOut(0.3));
  }, [actions]);

  /* Cinematic float. */
  useFrame((state) => {
    if (!floatRef.current) return;
    floatRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.07;
  });

  /* Place hotspots along the left/right edges of the monument so they
     never overlap the model. Alternate sides, descending top -> bottom. */
  const placed = hotspots.map((h, i) => {
    const n = Math.max(hotspots.length - 1, 1);
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * TARGET_HEIGHT * 0.42;
    const y = TARGET_HEIGHT * (0.4 - (i / n) * 0.78);
    const z = TARGET_HEIGHT * 0.16; // sit slightly toward the viewer
    return { ...h, pos: [x, y, z] as [number, number, number] };
  });

  return (
    <group ref={floatRef}>
      <group scale={scale}>
        <group position={[-center.x, -center.y, -center.z]}>
          <primitive object={scene} />
        </group>
      </group>

      {placed.map((h) => (
        <Hotspot3D
          key={h.id}
          position={h.pos}
          active={activeHotspot === h.id}
          onClick={() => onHotspotClick?.(h.id)}
        />
      ))}
    </group>
  );
}

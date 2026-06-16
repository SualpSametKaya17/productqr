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

  /* Warm limestone material for models that ship without textures. */
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

  /* Normalize (center + uniform scale) and dress the meshes once. */
  const { normalized, modelHeight } = useMemo(() => {
    const root = scene;

    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;

      // Meshy raw exports often lack normals — compute them for lighting.
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
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });

    // Center at origin and scale so its height == TARGET_HEIGHT.
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const scale = TARGET_HEIGHT / (size.y || 1);

    const wrapper = new THREE.Group();
    root.position.sub(center); // recenter
    wrapper.add(root);
    wrapper.scale.setScalar(scale);

    return { normalized: wrapper, modelHeight: TARGET_HEIGHT };
  }, [scene, stoneMaterial]);

  /* Play any embedded animations. */
  useEffect(() => {
    const list = Object.values(actions);
    list.forEach((a) => a?.reset().fadeIn(0.4).play());
    return () => list.forEach((a) => a?.fadeOut(0.3));
  }, [actions]);

  /* Cinematic float + very slow idle drift. */
  useFrame((state) => {
    if (!floatRef.current) return;
    const t = state.clock.elapsedTime;
    floatRef.current.position.y = Math.sin(t * 0.55) * 0.07;
  });

  /* Arrange hotspots in a frontal arc around the monument. */
  const placed = hotspots.map((h, i) => {
    const n = Math.max(hotspots.length, 1);
    const angle = -0.9 + (i / Math.max(n - 1, 1)) * 1.8; // front ~±100°
    const radius = modelHeight * 0.34;
    const y = modelHeight * (0.42 - (i / Math.max(n - 1, 1)) * 0.78);
    return {
      ...h,
      pos: [
        Math.sin(angle) * radius,
        y,
        Math.cos(angle) * radius,
      ] as [number, number, number],
    };
  });

  return (
    <group ref={floatRef}>
      <primitive object={normalized} />

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

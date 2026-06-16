"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  PresentationControls,
  ContactShadows,
  Environment,
  Preload,
} from "@react-three/drei";
import * as THREE from "three";

/* Height the figurine is normalized to inside the little stage. */
const TARGET_HEIGHT = 2.0;

/* ── The model itself: centered, scaled, slowly auto-rotating ── */
function Figurine({ modelUrl }: { modelUrl: string }) {
  const spinRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelUrl);

  /* Clone so the card instance never fights another viewer for the
     same cached scene graph. */
  const model = useMemo(() => scene.clone(true), [scene]);

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

  /* Fix normals + dress untextured meshes, same as the big viewer. */
  useEffect(() => {
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (!mesh.geometry.attributes.normal) mesh.geometry.computeVertexNormals();

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
    });
  }, [model, stoneMaterial]);

  /* Center at origin + uniform scale to TARGET_HEIGHT. */
  const { scale, center } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const c = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(c);
    return { scale: TARGET_HEIGHT / (size.y || 1), center: c };
  }, [model]);

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={spinRef}>
      <group scale={scale}>
        <group position={[-center.x, -center.y, -center.z]}>
          <primitive object={model} />
        </group>
      </group>
    </group>
  );
}

/* ── Compact, draggable, self-contained mini stage for the card ── */
export default function BibloModel({ modelUrl }: { modelUrl: string }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 4.2], fov: 32, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#ffd9a0" />

      <Suspense fallback={null}>
        <PresentationControls
          global
          snap
          speed={1.2}
          damping={0.5}
          rotation={[0, -0.3, 0]}
          polar={[-0.25, 0.35]}
          azimuth={[-Infinity, Infinity]}
        >
          <Figurine modelUrl={modelUrl} />
        </PresentationControls>

        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.4}
          scale={6}
          blur={2.4}
          far={3}
          resolution={256}
          frames={60}
        />
        <Environment preset="city" />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}

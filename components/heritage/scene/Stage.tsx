"use client";

import { Environment, ContactShadows } from "@react-three/drei";

/**
 * Dark museum stage. Tuned for performance: lighting is HDR + analytic
 * lights only (no real-time shadow map pass), and grounding comes from a
 * single cheap ContactShadows pass instead of a full reflective floor.
 */
export function Stage() {
  return (
    <>
      {/* Image-based ambient lighting from an HDR studio preset. */}
      <Environment preset="city" environmentIntensity={0.6} />

      {/* Soft fill so the dark side never crushes to black. */}
      <ambientLight intensity={0.4} />

      {/* Cinematic key light (no shadow map — cheaper). */}
      <spotLight
        position={[5, 9, 6]}
        angle={0.5}
        penumbra={0.8}
        intensity={140}
        distance={40}
        color="#fff3df"
      />

      {/* Warm rim light from behind for separation against the fog. */}
      <pointLight position={[-6, 3, -6]} intensity={45} color="#c98a3a" />

      {/* Grounding contact shadow directly beneath the model. */}
      <ContactShadows
        position={[0, -2.1, 0]}
        opacity={0.65}
        scale={14}
        blur={2.8}
        far={5}
        resolution={512}
        frames={60}
        color="#000000"
      />

      {/* Faint dark floor for a subtle sense of place (very cheap). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.12, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#0a0a0c" />
      </mesh>
    </>
  );
}

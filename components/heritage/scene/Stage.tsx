"use client";

import {
  Environment,
  ContactShadows,
  MeshReflectorMaterial,
} from "@react-three/drei";

/**
 * The dark museum stage: HDR image-based lighting, a key spot, soft
 * contact shadows and a faintly reflective floor for a polished,
 * photogrammetry-exhibit feel.
 */
export function Stage() {
  return (
    <>
      {/* Image-based ambient lighting from an HDR studio preset. */}
      <Environment preset="city" environmentIntensity={0.55} />

      {/* Soft fill so the dark side of the slab never crushes to black. */}
      <ambientLight intensity={0.35} />

      {/* Cinematic key light, casts the contact shadow. */}
      <spotLight
        position={[5, 9, 6]}
        angle={0.5}
        penumbra={0.8}
        intensity={120}
        distance={40}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        color="#fff3df"
      />

      {/* Warm rim light from behind for separation against the fog. */}
      <pointLight position={[-6, 3, -6]} intensity={40} color="#c98a3a" />

      {/* Grounding contact shadow directly beneath the slab. */}
      <ContactShadows
        position={[0, -2.05, 0]}
        opacity={0.7}
        scale={16}
        blur={2.6}
        far={6}
        resolution={1024}
        color="#000000"
      />

      {/* Subtly reflective floor — fakes screen-space reflections. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.08, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          resolution={1024}
          mirror={0.45}
          mixBlur={8}
          mixStrength={1.2}
          blur={[400, 100]}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0a0c"
          metalness={0.5}
        />
      </mesh>
    </>
  );
}

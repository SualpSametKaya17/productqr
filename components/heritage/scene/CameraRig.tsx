"use client";

import { useEffect, useRef, ComponentRef } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import type { ExperienceAPI } from "../lib/types";

const HOME = new THREE.Vector3(0, 0.4, 8.5);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);
const FOCUS = new THREE.Vector3(0, 0.6, 4.6);
const FOCUS_TARGET = new THREE.Vector3(0, 0.7, 0);
const IDLE_DELAY = 3200;

type Props = {
  autoRotate: boolean;
  /** Remove azimuth limits so the model can be orbited 360°. */
  fullOrbit?: boolean;
  onReady: (api: ExperienceAPI) => void;
  onFocusChange: (focused: boolean) => void;
};

export function CameraRig({ autoRotate, fullOrbit = false, onReady, onFocusChange }: Props) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const camera = useThree((s) => s.camera);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interacting = useRef(false);

  const glide = (pos: THREE.Vector3, target: THREE.Vector3, focused: boolean) => {
    const c = controls.current;
    if (!c) return;
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(c.target);
    gsap.to(camera.position, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      duration: 1.1,
      ease: "power3.inOut",
      onUpdate: () => c.update(),
    });
    gsap.to(c.target, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: 1.1,
      ease: "power3.inOut",
      onComplete: () => onFocusChange(focused),
    });
    if (focused) onFocusChange(true);
  };

  useEffect(() => {
    onReady({
      resetView: () => glide(HOME, HOME_TARGET, false),
      focusMonument: () => glide(FOCUS, FOCUS_TARGET, true),
      setAutoRotate: () => {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Pause auto-rotation briefly after any user interaction. */
  const handleStart = () => {
    interacting.current = true;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    const c = controls.current;
    if (c) c.autoRotate = false;
  };

  const handleEnd = () => {
    interacting.current = false;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      const c = controls.current;
      if (c && autoRotate && !interacting.current) c.autoRotate = true;
    }, IDLE_DELAY);
  };

  useEffect(() => {
    const c = controls.current;
    if (c) c.autoRotate = autoRotate && !interacting.current;
  }, [autoRotate]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.6}
      zoomSpeed={0.7}
      minDistance={4}
      maxDistance={12}
      minPolarAngle={fullOrbit ? Math.PI * 0.05 : Math.PI * 0.26}
      maxPolarAngle={fullOrbit ? Math.PI * 0.85 : Math.PI * 0.62}
      minAzimuthAngle={fullOrbit ? -Infinity : -Math.PI * 0.42}
      maxAzimuthAngle={fullOrbit ? Infinity : Math.PI * 0.42}
      autoRotate={autoRotate}
      autoRotateSpeed={0.45}
      onStart={handleStart}
      onEnd={handleEnd}
    />
  );
}

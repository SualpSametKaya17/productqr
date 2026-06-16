"use client";

import { ReactElement } from "react";
import {
  EffectComposer,
  Bloom,
  Vignette,
  DepthOfField,
  SMAA,
} from "@react-three/postprocessing";

type Props = {
  focused: boolean;
};

/**
 * Post-processing chain: subtle bloom for luminous highlights, a vignette
 * to frame the dark stage, SMAA for clean edges, and depth-of-field that
 * eases in only while focusing on the monument (kept off otherwise for
 * mobile performance).
 */
export function PostFX({ focused }: Props) {
  const effects: ReactElement[] = [
    <Bloom
      key="bloom"
      intensity={0.55}
      luminanceThreshold={0.62}
      luminanceSmoothing={0.25}
      mipmapBlur
    />,
    <Vignette key="vignette" eskil={false} offset={0.28} darkness={0.82} />,
    <SMAA key="smaa" />,
  ];

  if (focused) {
    effects.splice(
      1,
      0,
      <DepthOfField
        key="dof"
        focusDistance={0.012}
        focalLength={0.05}
        bokehScale={3.2}
      />
    );
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  );
}

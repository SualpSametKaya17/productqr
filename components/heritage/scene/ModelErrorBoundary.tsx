"use client";

import { Component, ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

/**
 * Catches errors from 3D model loading (missing file, decode failure)
 * so a heavy/absent GLB degrades gracefully instead of blanking the
 * whole WebGL canvas.
 */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[HeritageScene] 3D model failed to load:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

"use client";

import { useEffect, useRef } from "react";

// Extend JSX to support model-viewer web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          poster?: string;
          "camera-controls"?: boolean | string;
          "auto-rotate"?: boolean | string;
          "auto-rotate-delay"?: number | string;
          "rotation-per-second"?: string;
          ar?: boolean | string;
          "ar-modes"?: string;
          "shadow-intensity"?: number | string;
          "shadow-softness"?: number | string;
          "environment-image"?: string;
          exposure?: number | string;
          "field-of-view"?: string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          loading?: string;
          reveal?: string;
          style?: React.CSSProperties;
          className?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface ModelViewerProps {
  src: string;
  alt: string;
  poster?: string;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
  exposure?: number;
  shadowIntensity?: number;
}

/**
 * Wrapper for @google/model-viewer web component.
 * Dynamically imports the script client-side only.
 */
export function ModelViewer({
  src,
  alt,
  poster,
  className = "",
  autoRotate = true,
  cameraControls = true,
  ar = true,
  exposure = 0.8,
  shadowIntensity = 1,
}: ModelViewerProps) {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    // Dynamically load @google/model-viewer from CDN (no SSR issues)
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.head.appendChild(script);

    return () => {
      // Don't remove — other instances may use it
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* @ts-ignore - model-viewer is a web component */}
      <model-viewer
        src={src}
        alt={alt}
        poster={poster}
        camera-controls={cameraControls ? "" : undefined}
        auto-rotate={autoRotate ? "" : undefined}
        auto-rotate-delay="1000"
        rotation-per-second="30deg"
        ar={ar ? "" : undefined}
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity={shadowIntensity}
        shadow-softness="0.5"
        exposure={exposure}
        loading="lazy"
        reveal="auto"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
          "--progress-bar-color": "var(--color-gold)",
          "--progress-bar-height": "2px",
        } as React.CSSProperties}
      />
      {/* AR button hint */}
      {ar && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-xs text-[var(--color-text-muted)] bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
            Drag to rotate · Pinch to zoom
          </span>
        </div>
      )}
    </div>
  );
}

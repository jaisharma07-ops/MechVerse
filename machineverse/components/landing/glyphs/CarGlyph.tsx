import type { SVGProps } from "react";

/**
 * Stylized side-profile sedan silhouette. Stroke-only, single coordinate
 * system. Every shape has pathLength=1 so the parent can drive a
 * stroke-dashoffset transition for the "blueprint draws itself" effect.
 */
export default function CarGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 400 180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Body silhouette */}
      <path
        pathLength={1}
        d="M 30 130 L 70 130 L 90 80 Q 110 62 145 60 L 245 60 Q 280 62 305 92 L 365 100 L 380 110 L 380 130 L 350 130"
      />
      {/* Underside / sill */}
      <path
        pathLength={1}
        d="M 70 130 L 145 130 M 235 130 L 350 130"
      />
      {/* Greenhouse / windows */}
      <path
        pathLength={1}
        d="M 110 80 L 140 65 L 230 65 L 260 80 Z"
      />
      <line pathLength={1} x1="180" y1="65" x2="180" y2="80" />
      {/* Front wheel */}
      <circle pathLength={1} cx="120" cy="135" r="20" />
      <circle pathLength={1} cx="120" cy="135" r="8" />
      {/* Rear wheel */}
      <circle pathLength={1} cx="290" cy="135" r="20" />
      <circle pathLength={1} cx="290" cy="135" r="8" />
      {/* Bumper / vents */}
      <line pathLength={1} x1="370" y1="118" x2="380" y2="118" />
      <line pathLength={1} x1="30" y1="120" x2="50" y2="120" />
      {/* Door cut */}
      <line pathLength={1} x1="200" y1="78" x2="200" y2="125" />
    </svg>
  );
}

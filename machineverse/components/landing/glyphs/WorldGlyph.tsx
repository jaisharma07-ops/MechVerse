import type { SVGProps } from "react";

/**
 * Composite "All Vehicles" glyph — a globe surrounded by three rotating
 * orbital rings each tagged with a tiny vehicle silhouette. Used in the
 * featured banner at the bottom of the bento.
 */
export default function WorldGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Globe */}
      <circle pathLength={1} cx="200" cy="200" r="60" />
      <ellipse pathLength={1} cx="200" cy="200" rx="60" ry="22" />
      <ellipse pathLength={1} cx="200" cy="200" rx="22" ry="60" />
      <line pathLength={1} x1="140" y1="200" x2="260" y2="200" />
      {/* Orbit ring 1 */}
      <ellipse pathLength={1} cx="200" cy="200" rx="130" ry="50" />
      {/* Orbit ring 2 — tilted */}
      <ellipse
        pathLength={1}
        cx="200"
        cy="200"
        rx="155"
        ry="60"
        transform="rotate(35 200 200)"
      />
      {/* Orbit ring 3 — opposite tilt */}
      <ellipse
        pathLength={1}
        cx="200"
        cy="200"
        rx="180"
        ry="55"
        transform="rotate(-25 200 200)"
      />
      {/* Three vehicle markers on the orbits */}
      <circle pathLength={1} cx="330" cy="200" r="6" />
      <circle pathLength={1} cx="70" cy="200" r="6" />
      <circle pathLength={1} cx="200" cy="50" r="6" />
      <circle pathLength={1} cx="200" cy="350" r="6" />
      {/* Corner crosshairs */}
      <path pathLength={1} d="M 20 20 L 50 20 M 20 20 L 20 50" />
      <path pathLength={1} d="M 380 20 L 350 20 M 380 20 L 380 50" />
      <path pathLength={1} d="M 20 380 L 50 380 M 20 380 L 20 350" />
      <path pathLength={1} d="M 380 380 L 350 380 M 380 380 L 380 350" />
    </svg>
  );
}

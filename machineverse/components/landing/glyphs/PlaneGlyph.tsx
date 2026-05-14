import type { SVGProps } from "react";

export default function PlaneGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 480 220"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Fuselage */}
      <path
        pathLength={1}
        d="M 30 120 Q 28 108 42 105 L 360 100 Q 410 100 440 112 Q 460 118 440 124 Q 410 132 360 132 L 42 127 Q 28 132 30 120 Z"
      />
      {/* Nose / cockpit windows */}
      <path pathLength={1} d="M 42 112 L 70 118 M 42 122 L 70 122" />
      {/* Wing — main, swept */}
      <path
        pathLength={1}
        d="M 200 122 L 130 175 L 100 175 L 175 130 Z"
      />
      {/* Tail wing */}
      <path
        pathLength={1}
        d="M 380 110 L 330 75 L 315 75 L 365 105 Z"
      />
      {/* Vertical stabilizer */}
      <path
        pathLength={1}
        d="M 360 95 L 395 60 L 415 60 L 405 95 Z"
      />
      {/* Engine pods on wing */}
      <ellipse pathLength={1} cx="150" cy="153" rx="14" ry="6" />
      <ellipse pathLength={1} cx="120" cy="165" rx="14" ry="6" />
      {/* Window strip */}
      <line
        pathLength={1}
        x1="90"
        y1="118"
        x2="350"
        y2="116"
        strokeDasharray="4 5"
      />
    </svg>
  );
}

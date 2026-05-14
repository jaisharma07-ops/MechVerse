import type { SVGProps } from "react";

export default function RocketGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Nose cone */}
      <path pathLength={1} d="M 100 18 L 78 78 L 122 78 Z" />
      {/* Capsule / payload */}
      <path
        pathLength={1}
        d="M 78 78 Q 78 68 100 68 Q 122 68 122 78 L 122 120 L 78 120 Z"
      />
      <line pathLength={1} x1="78" y1="100" x2="122" y2="100" />
      {/* Stage separator 1 */}
      <line pathLength={1} x1="76" y1="120" x2="124" y2="120" strokeDasharray="3 3" />
      {/* Upper stage */}
      <path pathLength={1} d="M 76 120 L 76 220 L 124 220 L 124 120" />
      {/* Window */}
      <circle pathLength={1} cx="100" cy="150" r="6" />
      {/* Stage separator 2 */}
      <line pathLength={1} x1="74" y1="220" x2="126" y2="220" strokeDasharray="3 3" />
      {/* Lower stage / booster */}
      <path pathLength={1} d="M 74 220 L 74 320 L 126 320 L 126 220" />
      {/* Body bands */}
      <line pathLength={1} x1="74" y1="250" x2="126" y2="250" />
      <line pathLength={1} x1="74" y1="280" x2="126" y2="280" />
      {/* Logo block */}
      <rect pathLength={1} x="86" y="232" width="28" height="12" />
      {/* Fins */}
      <path pathLength={1} d="M 74 290 L 48 340 L 48 320 L 74 300" />
      <path pathLength={1} d="M 126 290 L 152 340 L 152 320 L 126 300" />
      {/* Tail flare */}
      <path pathLength={1} d="M 74 320 L 68 340 L 132 340 L 126 320" />
      {/* Engine bells */}
      <path pathLength={1} d="M 74 340 L 78 380 L 92 380 L 88 340" />
      <path pathLength={1} d="M 88 340 L 92 380 L 108 380 L 104 340" />
      <path pathLength={1} d="M 104 340 L 108 380 L 124 380 L 120 340" />
      <path pathLength={1} d="M 120 340 L 124 380 L 132 380 L 126 340" />
      {/* Centerline */}
      <line
        pathLength={1}
        x1="100"
        y1="10"
        x2="100"
        y2="390"
        strokeDasharray="2 6"
      />
    </svg>
  );
}

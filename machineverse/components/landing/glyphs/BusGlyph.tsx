import type { SVGProps } from "react";

export default function BusGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 440 180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Body outline */}
      <path
        pathLength={1}
        d="M 30 50 Q 30 35 50 35 L 400 35 Q 420 35 420 50 L 420 125 L 30 125 Z"
      />
      {/* Roof detail */}
      <line pathLength={1} x1="50" y1="40" x2="400" y2="40" />
      {/* Front windshield */}
      <path pathLength={1} d="M 36 50 L 36 82 L 80 82 L 80 50 Z" />
      {/* Passenger windows */}
      <path
        pathLength={1}
        d="M 92 50 L 400 50 L 400 86 L 92 86 Z"
      />
      <line pathLength={1} x1="122" y1="50" x2="122" y2="86" />
      <line pathLength={1} x1="160" y1="50" x2="160" y2="86" />
      <line pathLength={1} x1="200" y1="50" x2="200" y2="86" />
      <line pathLength={1} x1="240" y1="50" x2="240" y2="86" />
      <line pathLength={1} x1="280" y1="50" x2="280" y2="86" />
      <line pathLength={1} x1="320" y1="50" x2="320" y2="86" />
      <line pathLength={1} x1="360" y1="50" x2="360" y2="86" />
      {/* Doors */}
      <path pathLength={1} d="M 100 92 L 100 125 L 140 125 L 140 92 Z" />
      <line pathLength={1} x1="120" y1="92" x2="120" y2="125" />
      <path pathLength={1} d="M 272 92 L 272 125 L 312 125 L 312 92 Z" />
      <line pathLength={1} x1="292" y1="92" x2="292" y2="125" />
      {/* Headlight */}
      <circle pathLength={1} cx="44" cy="110" r="5" />
      {/* Bumper */}
      <line pathLength={1} x1="30" y1="118" x2="60" y2="118" />
      {/* Wheels */}
      <circle pathLength={1} cx="80" cy="135" r="22" />
      <circle pathLength={1} cx="80" cy="135" r="9" />
      <circle pathLength={1} cx="360" cy="135" r="22" />
      <circle pathLength={1} cx="360" cy="135" r="9" />
      {/* Wheel arches */}
      <path pathLength={1} d="M 56 125 Q 80 102 104 125" />
      <path pathLength={1} d="M 336 125 Q 360 102 384 125" />
      {/* Ground */}
      <line
        pathLength={1}
        x1="20"
        y1="160"
        x2="420"
        y2="160"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

import type { SVGProps } from "react";

export default function TrainGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 460 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Bullet-train body — long sweeping nose */}
      <path
        pathLength={1}
        d="M 30 100 Q 60 60 130 50 L 410 50 Q 430 50 430 70 L 430 100 L 30 100 Z"
      />
      {/* Underside curve */}
      <path
        pathLength={1}
        d="M 30 100 Q 50 106 90 106 L 410 106 Q 430 106 430 100"
      />
      {/* Cockpit window */}
      <path pathLength={1} d="M 55 82 Q 80 68 110 68 L 110 86 L 55 86 Z" />
      {/* Passenger windows */}
      <line pathLength={1} x1="130" y1="72" x2="410" y2="72" />
      <line pathLength={1} x1="130" y1="86" x2="410" y2="86" />
      <line pathLength={1} x1="160" y1="72" x2="160" y2="86" />
      <line pathLength={1} x1="195" y1="72" x2="195" y2="86" />
      <line pathLength={1} x1="230" y1="72" x2="230" y2="86" />
      <line pathLength={1} x1="265" y1="72" x2="265" y2="86" />
      <line pathLength={1} x1="300" y1="72" x2="300" y2="86" />
      <line pathLength={1} x1="335" y1="72" x2="335" y2="86" />
      <line pathLength={1} x1="370" y1="72" x2="370" y2="86" />
      {/* Pantograph */}
      <path pathLength={1} d="M 250 50 L 240 28 L 280 28 L 270 50" />
      <line pathLength={1} x1="220" y1="22" x2="300" y2="22" />
      {/* Bogies */}
      <path pathLength={1} d="M 70 106 L 70 118 L 130 118 L 130 106" />
      <path pathLength={1} d="M 180 106 L 180 118 L 240 118 L 240 106" />
      <path pathLength={1} d="M 300 106 L 300 118 L 360 118 L 360 106" />
      {/* Wheels */}
      <circle pathLength={1} cx="86" cy="122" r="8" />
      <circle pathLength={1} cx="114" cy="122" r="8" />
      <circle pathLength={1} cx="196" cy="122" r="8" />
      <circle pathLength={1} cx="224" cy="122" r="8" />
      <circle pathLength={1} cx="316" cy="122" r="8" />
      <circle pathLength={1} cx="344" cy="122" r="8" />
      {/* Rail */}
      <line
        pathLength={1}
        x1="20"
        y1="135"
        x2="440"
        y2="135"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

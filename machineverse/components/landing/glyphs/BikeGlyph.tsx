import type { SVGProps } from "react";

export default function BikeGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 400 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Wheels */}
      <circle pathLength={1} cx="85" cy="145" r="42" />
      <circle pathLength={1} cx="85" cy="145" r="22" />
      <circle pathLength={1} cx="85" cy="145" r="3" />
      <circle pathLength={1} cx="320" cy="145" r="42" />
      <circle pathLength={1} cx="320" cy="145" r="22" />
      <circle pathLength={1} cx="320" cy="145" r="3" />
      {/* Wheel spokes */}
      <line pathLength={1} x1="85" y1="103" x2="85" y2="187" />
      <line pathLength={1} x1="43" y1="145" x2="127" y2="145" />
      <line pathLength={1} x1="320" y1="103" x2="320" y2="187" />
      <line pathLength={1} x1="278" y1="145" x2="362" y2="145" />
      {/* Frame */}
      <path
        pathLength={1}
        d="M 130 100 L 200 80 L 260 100 L 290 130 L 320 145 M 130 100 L 85 145 M 215 100 L 230 130 L 290 130"
      />
      {/* Fairing / front cowl */}
      <path
        pathLength={1}
        d="M 130 100 Q 90 78 95 55 Q 100 45 120 50 L 158 78 Q 168 88 162 100 Z"
      />
      {/* Windshield */}
      <path pathLength={1} d="M 110 50 Q 125 35 145 38 L 155 60" />
      {/* Tank + seat */}
      <path
        pathLength={1}
        d="M 165 100 Q 175 80 200 80 Q 222 80 232 95 L 265 90 Q 280 90 285 100"
      />
      {/* Exhaust */}
      <path pathLength={1} d="M 250 130 L 320 160 L 360 158" />
    </svg>
  );
}

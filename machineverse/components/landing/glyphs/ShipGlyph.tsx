import type { SVGProps } from "react";

export default function ShipGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 480 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Hull */}
      <path
        pathLength={1}
        d="M 30 120 L 70 100 L 430 100 L 462 120 L 442 160 L 56 160 L 30 120 Z"
      />
      {/* Waterline */}
      <line
        pathLength={1}
        x1="20"
        y1="138"
        x2="468"
        y2="138"
        strokeDasharray="4 4"
      />
      {/* Hull plating */}
      <line pathLength={1} x1="60" y1="148" x2="442" y2="148" />
      {/* Container stacks */}
      <rect pathLength={1} x="80" y="60" width="105" height="40" />
      <rect pathLength={1} x="80" y="42" width="105" height="18" />
      <rect pathLength={1} x="200" y="72" width="95" height="28" />
      <rect pathLength={1} x="200" y="54" width="95" height="18" />
      <rect pathLength={1} x="310" y="75" width="60" height="25" />
      {/* Container divisions */}
      <line pathLength={1} x1="106" y1="60" x2="106" y2="100" />
      <line pathLength={1} x1="132" y1="60" x2="132" y2="100" />
      <line pathLength={1} x1="158" y1="60" x2="158" y2="100" />
      <line pathLength={1} x1="225" y1="72" x2="225" y2="100" />
      <line pathLength={1} x1="250" y1="72" x2="250" y2="100" />
      <line pathLength={1} x1="275" y1="72" x2="275" y2="100" />
      <line pathLength={1} x1="330" y1="75" x2="330" y2="100" />
      <line pathLength={1} x1="350" y1="75" x2="350" y2="100" />
      {/* Bridge / superstructure */}
      <path
        pathLength={1}
        d="M 386 100 L 386 50 L 420 50 L 420 70 L 432 70 L 432 100"
      />
      <line pathLength={1} x1="390" y1="60" x2="416" y2="60" />
      <line pathLength={1} x1="390" y1="74" x2="430" y2="74" />
      <line pathLength={1} x1="390" y1="86" x2="430" y2="86" />
      {/* Funnel */}
      <rect pathLength={1} x="395" y="28" width="14" height="22" />
      <line pathLength={1} x1="398" y1="32" x2="406" y2="32" />
      {/* Mast */}
      <line pathLength={1} x1="80" y1="42" x2="80" y2="14" />
    </svg>
  );
}

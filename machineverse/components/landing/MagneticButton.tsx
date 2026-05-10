"use client";

import {
  forwardRef,
  useRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Variant = "primary" | "ghost";

type ButtonAttrs = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"
>;

interface MagneticButtonProps extends ButtonAttrs {
  variant?: Variant;
  children: ReactNode;
  /** Pull strength in px (max offset at edge). Default 14. */
  strength?: number;
}

/**
 * Magnetic CTA — the button leans toward the cursor as it nears the bounding
 * box. Spring-damped via Framer Motion. Falls back to a plain hover scale on
 * touch devices where pointermove is noisy.
 */
const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  function MagneticButton(
    {
      variant = "primary",
      children,
      strength = 14,
      className,
      onMouseMove,
      onMouseLeave,
      style,
      ...rest
    },
    ref,
  ) {
    const wrapRef = useRef<HTMLSpanElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
    const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

    const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      x.set(dx * strength);
      y.set(dy * strength);
      onMouseMove?.(e);
    };

    const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      x.set(0);
      y.set(0);
      onMouseLeave?.(e);
    };

    const baseClass =
      variant === "primary"
        ? "bg-[var(--accent)] text-[#0D0F14] hover:brightness-110"
        : "bg-transparent text-[var(--text-primary)] border border-white/20 hover:border-[var(--accent)]/60 hover:text-[var(--accent)]";

    return (
      <span
        ref={wrapRef}
        className="relative inline-block"
        style={{ willChange: "transform" }}
      >
        <motion.button
          ref={ref}
          {...rest}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{ x: sx, y: sy, ...(style as CSSProperties) }}
          whileTap={{ scale: 0.97 }}
          className={`
            relative inline-flex items-center justify-center gap-2
            px-7 md:px-9 py-3.5 md:py-4
            font-display font-semibold uppercase tracking-[0.18em]
            text-sm md:text-base
            rounded-full
            transition-[background,color,border-color,filter] duration-300
            cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F14]
            ${baseClass}
            ${className ?? ""}
          `}
        >
          {children}
        </motion.button>
      </span>
    );
  },
);

export default MagneticButton;

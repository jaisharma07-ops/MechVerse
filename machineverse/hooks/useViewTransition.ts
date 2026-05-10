"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Returns a navigator that uses View Transitions API when available,
 * falling back to a normal router.push() otherwise. Pre-warm the
 * destination route via prefetch() — call onMouseEnter/onFocus.
 */
export function useViewTransition() {
  const router = useRouter();

  const navigate = useCallback(
    (href: string) => {
      const start = (
        document as Document & {
          startViewTransition?: (cb: () => void) => unknown;
        }
      ).startViewTransition;
      if (typeof start !== "function") {
        router.push(href);
        return;
      }
      start.call(document, () => {
        router.push(href);
      });
    },
    [router],
  );

  const prefetch = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router],
  );

  return { navigate, prefetch };
}

"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function ThemeProvider() {
  const darkMode = useStore((s) => s.darkMode);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode, hydrated]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return null;
}

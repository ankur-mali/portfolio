"use client";

import { useTheme } from "@/context/theme-context";
import React from "react";
import { BsMoon, BsSun } from "react-icons/bs";

export default function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="glass fixed bottom-5 right-5 z-[998] grid h-12 w-12 place-items-center rounded-full transition hover:scale-[1.06] active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-wine-500"
      onClick={toggleTheme}
    >
      {theme === "light" ? <BsSun /> : <BsMoon />}
    </button>
  );
}

import React from "react";
import { BsArrowRight } from "react-icons/bs";

/** Classic view → 3D town. A full page load on purpose, so the town starts fresh with its welcome screen. */
export default function TownLink() {
  return (
    <a
      href="/"
      className="glass fixed bottom-5 left-5 z-[998] inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-gray-900 transition hover:bg-white/80 active:scale-[0.97] active:duration-75 focus-visible:ring-2 focus-visible:ring-wine-500 dark:text-gray-50 dark:hover:bg-white/10"
    >
      <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-wine-600 text-[0.7rem] text-wine-50 dark:bg-wine-300 dark:text-wine-900">
        3D
      </span>
      Walk the 3D town
      <BsArrowRight aria-hidden />
    </a>
  );
}

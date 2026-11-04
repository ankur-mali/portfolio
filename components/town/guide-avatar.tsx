"use client";

import React from "react";
import clsx from "clsx";
import { GUIDE_NAME } from "@/lib/stops";

/** A small animated 2D Ember (matches the 3D robot): floats, blinks, antenna glows. */
export function GuideAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 80" className={clsx("guide-float drop-shadow-lg", className)} aria-hidden>
      {/* hover glow */}
      <ellipse cx="32" cy="76" rx="14" ry="3" fill="#f5a524" opacity="0.35" className="guide-shadow" />
      {/* antenna */}
      <line x1="32" y1="6" x2="32" y2="15" stroke="#3a3f47" strokeWidth="2" />
      <circle cx="32" cy="5" r="4" fill="#ffae42" className="guide-antenna" />
      {/* head */}
      <ellipse cx="32" cy="27" rx="17" ry="14" fill="#f3efe6" stroke="#d9d2c4" strokeWidth="1.2" />
      <rect x="19" y="20" width="26" height="13" rx="6.5" fill="#1d2433" />
      <g className="guide-eyes">
        <ellipse cx="26.5" cy="26.5" rx="2.4" ry="2.8" fill="#7fe7ff" />
        <ellipse cx="37.5" cy="26.5" rx="2.4" ry="2.8" fill="#7fe7ff" />
      </g>
      {/* body + scarf */}
      <ellipse cx="32" cy="55" rx="15" ry="15" fill="#f3efe6" stroke="#d9d2c4" strokeWidth="1.2" />
      <path d="M18 43c6 4 22 4 28 0" stroke="#b8453a" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M38 45l3 11" stroke="#b8453a" strokeWidth="4" strokeLinecap="round" />
      {/* waving arm */}
      <g className="guide-wave">
        <ellipse cx="49" cy="50" rx="3.2" ry="7" fill="#f3efe6" stroke="#d9d2c4" strokeWidth="1" transform="rotate(-35 49 50)" />
      </g>
      <ellipse cx="15" cy="56" rx="3.2" ry="7" fill="#f3efe6" stroke="#d9d2c4" strokeWidth="1" transform="rotate(20 15 56)" />
    </svg>
  );
}

/** Ember's line for the current stop, docked just above the card so it never covers a building.
 *  Phones also show the small animated Ember (the 3D one is hidden there). */
export function GuideLine({ text }: { text: string }) {
  return (
    <div className="pointer-events-none mb-2 flex items-end gap-1.5 max-md:justify-end [@media(max-height:640px)]:hidden" aria-live="polite">
      <p className="glass glass-card glass-fade relative max-w-[min(26rem,82%)] rounded-2xl px-3.5 py-2 text-[0.85rem] leading-snug text-stone-800 max-md:rounded-br-sm md:rounded-bl-sm dark:text-stone-100">
        <span className="mr-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-wine-600 dark:text-wine-300">{GUIDE_NAME}</span>
        {text}
      </p>
      <GuideAvatar className="h-12 w-10 shrink-0 md:hidden" />
    </div>
  );
}

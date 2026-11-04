"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { HiDownload } from "react-icons/hi";
import {
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuEllipsis,
  LuList,
  LuMail,
  LuMoon,
  LuSun,
  LuVolume2,
  LuVolumeX,
} from "react-icons/lu";
import { useTheme } from "@/context/theme-context";
import { CONTACT_STOP, LANTERN_COUNT, MULTIPLAI_STOP, stops } from "@/lib/stops";
import { scrollToStop, useTown } from "@/lib/town-store";
import { profile, profilePhoto } from "@/lib/data";

const pill =
  "glass pointer-events-auto flex items-center rounded-full text-stone-800 dark:text-stone-100";
const pillBtn = clsx(pill, "min-h-11 justify-center transition active:scale-[0.97] active:duration-75 hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-wine-500 dark:hover:bg-white/10");
const iconPill = clsx(pillBtn, "h-11 w-11 text-lg");
const popover =
  "glass glass-card pointer-events-auto absolute rounded-2xl p-1.5 text-stone-800 dark:text-stone-100";

/** Close a popover on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

function LanternIcon({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path d="M9 3h6M12 3v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 8l5-3 5 3v9l-5 3-5-3z" fill={lit ? "currentColor" : "none"} fillOpacity={lit ? 0.22 : 0} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Lantern counter. Explains the game once, a moment after entering, then on tap. */
function Lanterns() {
  const lit = useTown((s) => s.visited.slice(0, LANTERN_COUNT).filter(Boolean).length);
  const [hint, setHint] = useState(false);
  const [bump, setBump] = useState(false);
  useEffect(() => {
    const show = setTimeout(() => setHint(true), 2500);
    const hide = setTimeout(() => setHint(false), 9000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);
  useEffect(() => {
    if (lit <= 1) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [lit]);
  const ref = useDismiss(hint, () => setHint(false));
  const done = lit === LANTERN_COUNT;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setHint((h) => !h)}
        aria-expanded={hint}
        aria-label={`Lanterns lit ${lit} of ${LANTERN_COUNT}`}
        className={clsx(pillBtn, "gap-1.5 whitespace-nowrap px-3 text-sm font-semibold transition-transform", bump && "scale-110")}
      >
        <span className={lit > 0 ? "text-wine-600 dark:text-wine-300" : ""}>
          <LanternIcon lit={lit > 0} />
        </span>
        <span aria-hidden>
          {lit}/{LANTERN_COUNT}
        </span>
      </button>
      {hint && (
        <p role="status" className={clsx(popover, "pop-in origin-top-right top-[calc(100%+0.5rem)] w-64 px-3.5 py-3 text-sm leading-snug max-sm:fixed max-sm:inset-x-3 max-sm:top-[4.25rem] max-sm:w-auto sm:right-0")}>
          {done
            ? "Every lantern is lit. The campfire at MULTIPLAI is burning!"
            : `Every stop you visit lights a lantern. Light all ${LANTERN_COUNT} to start the campfire at ${stops[MULTIPLAI_STOP].label}.`}
        </p>
      )}
    </div>
  );
}

/** Phones: sound, day/night and the classic view live in one small menu. */
function MoreMenu() {
  const [open, setOpen] = useState(false);
  const soundOn = useTown((s) => s.soundOn);
  const setSound = useTown((s) => s.setSound);
  const { theme, toggleTheme } = useTheme();
  const ref = useDismiss(open, () => setOpen(false));
  const item = "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10";
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="More options" className={iconPill}>
        <LuEllipsis />
      </button>
      {open && (
        <div className={clsx(popover, "pop-in right-0 top-[calc(100%+0.5rem)] w-52 origin-top-right")}>
          <button type="button" className={item} onClick={() => setSound(!soundOn)} aria-pressed={soundOn}>
            {soundOn ? <LuVolume2 /> : <LuVolumeX />} {soundOn ? "Sound on" : "Sound off"}
          </button>
          <button type="button" className={item} onClick={toggleTheme}>
            {theme === "dark" ? <LuSun /> : <LuMoon />} {theme === "dark" ? "Day mode" : "Night mode"}
          </button>
          <Link href="/classic" className={item}>
            <LuList /> Classic view
          </Link>
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const soundOn = useTown((s) => s.soundOn);
  const setSound = useTown((s) => s.setSound);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-3 sm:p-5">
      <button
        type="button"
        onClick={() => scrollToStop(0)}
        aria-label={`${profile.name}: back to the start`}
        className={clsx(pill, "gap-2 p-1 text-left transition hover:bg-white lg:pr-4 dark:hover:bg-white/10")}
      >
        <Image
          src={profilePhoto}
          alt=""
          sizes="40px"
          className="h-9 w-9 shrink-0 rounded-full border-2 border-white object-cover object-[50%_28%] dark:border-white/20"
        />
        <span className="hidden leading-tight lg:block">
          <span className="block whitespace-nowrap text-sm font-semibold">{profile.name}</span>
          <span className="block text-xs text-stone-600 dark:text-stone-400">
            {profile.role} @ {profile.company}
          </span>
        </span>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Lanterns />
        <a href={profile.cv} download className={clsx(pillBtn, "gap-1.5 px-3.5 text-sm font-semibold")}>
          <HiDownload aria-hidden /> CV
        </a>
        <button type="button" onClick={() => scrollToStop(CONTACT_STOP)} className={clsx(pillBtn, "gap-1.5 px-3.5 text-sm font-semibold")}>
          <LuMail aria-hidden /> Contact
        </button>
        {/* Larger screens: the extra controls inline. */}
        <button
          type="button"
          onClick={() => setSound(!soundOn)}
          className={clsx(iconPill, "max-sm:hidden")}
          aria-label={soundOn ? "Mute ambient sound" : "Play ambient sound"}
          aria-pressed={soundOn}
        >
          {soundOn ? <LuVolume2 /> : <LuVolumeX />}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className={clsx(iconPill, "max-sm:hidden")}
          aria-label={theme === "dark" ? "Switch to day" : "Switch to night"}
          title={theme === "dark" ? "Day" : "Night"}
        >
          {theme === "dark" ? <LuSun /> : <LuMoon />}
        </button>
        <Link href="/classic" className={clsx(pillBtn, "whitespace-nowrap px-4 text-sm font-semibold max-sm:hidden")}>
          Classic view
        </Link>
        <div className="sm:hidden">
          <MoreMenu />
        </div>
      </div>
    </div>
  );
}

/** Bottom pill: previous / next, the current stop (tap for the full list), and dots on wide screens. */
export function MiniMap() {
  const active = useTown((s) => s.activeStop);
  const visited = useTown((s) => s.visited);
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const go = (i: number) => {
    setOpen(false);
    scrollToStop(Math.max(0, Math.min(stops.length - 1, i)));
  };
  const arrow =
    "grid h-11 w-11 shrink-0 place-items-center rounded-full transition active:scale-[0.97] active:duration-75 hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-wine-500 disabled:opacity-30 dark:hover:bg-white/10";

  return (
    <nav aria-label="Journey stops" className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex justify-center px-3 sm:bottom-5">
      <div ref={ref} className="relative">
        {open && (
          <ol className={clsx(popover, "pop-in origin-bottom bottom-[calc(100%+0.5rem)] left-1/2 max-h-[60svh] w-[min(20rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-y-auto")}>
            {stops.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === active ? "step" : undefined}
                  className={clsx(
                    "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left transition active:scale-[0.97] active:duration-75",
                    i === active ? "bg-wine-100 dark:bg-wine-400/20" : "hover:bg-black/5 dark:hover:bg-white/10",
                  )}
                >
                  <span className="w-5 text-right text-xs tabular-nums text-stone-600 dark:text-stone-400">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{s.label}</span>
                    <span className="block text-xs text-stone-600 dark:text-stone-400">{s.place}</span>
                  </span>
                  {visited[i] && <LuCheck aria-label="visited" className="text-wine-600 dark:text-wine-300" />}
                </button>
              </li>
            ))}
          </ol>
        )}
        <div className={clsx(pill, "gap-0.5 p-1")}>
          <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous stop" className={arrow}>
            <LuChevronLeft />
          </button>
          <ol className="hidden items-center px-1 lg:flex">
            {stops.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to ${s.label}`}
                  aria-current={i === active ? "step" : undefined}
                  title={`${s.label} · ${s.place}`}
                  className="group grid h-11 place-items-center px-1"
                >
                  <span
                    className={clsx(
                      "block rounded-full transition-all",
                      i === active
                        ? "h-2.5 w-6 bg-wine-600 dark:bg-wine-300"
                        : visited[i]
                          ? "h-2.5 w-2.5 bg-wine-300 group-hover:bg-wine-600 dark:bg-wine-500"
                          : "h-2.5 w-2.5 bg-stone-400/60 group-hover:bg-stone-600",
                    )}
                  />
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-haspopup="true"
            className="min-h-11 min-w-[9.5rem] rounded-full px-3 text-center leading-tight transition active:scale-[0.97] active:duration-75 hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-wine-500 dark:hover:bg-white/10"
          >
            <span className="block max-w-[12rem] truncate text-sm font-semibold">{stops[active].label}</span>
            <span className="block text-xs text-stone-600 dark:text-stone-400">
              {stops[active].place} · {active + 1}/{stops.length}
            </span>
          </button>
          <button type="button" onClick={() => go(active + 1)} disabled={active === stops.length - 1} aria-label="Next stop" className={arrow}>
            <LuChevronRight />
          </button>
        </div>
      </div>
    </nav>
  );
}

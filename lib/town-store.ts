import { create } from "zustand";
import { stops } from "./stops";

// Scroll progress changes every frame, so it lives outside React state.
// `progress` is a float stop index: 2.5 = halfway between stop 2 and 3.
export const scrollState = { progress: 0, raw: 0 };

export type Quality = "high" | "low";

type TownState = {
  ready: boolean;
  setReady: () => void;
  entered: boolean;
  activeStop: number;
  /** True while the camera travels between stops: cards step aside so the town is visible. */
  travelling: boolean;
  visited: boolean[];
  peek: boolean;
  soundOn: boolean;
  quality: Quality;
  reducedMotion: boolean;
  enter: (withSound: boolean) => void;
  setActiveStop: (i: number, travelling?: boolean) => void;
  togglePeek: () => void;
  setSound: (on: boolean) => void;
  setQuality: (q: Quality) => void;
  setReducedMotion: (r: boolean) => void;
};

export const useTown = create<TownState>((set) => ({
  ready: false,
  setReady: () => set({ ready: true }),
  entered: false,
  activeStop: 0,
  travelling: false,
  visited: stops.map(() => false),
  peek: false,
  soundOn: false,
  quality: "high",
  reducedMotion: false,
  enter: (withSound) => set({ entered: true, soundOn: withSound }),
  setActiveStop: (i, travelling = false) =>
    set((s) => {
      if (s.activeStop === i && s.travelling === travelling && s.visited[i]) return s;
      // Every stop passed on the way counts as visited, so jumping ahead still lights its lanterns.
      const visited = s.visited.slice();
      const [from, to] = [Math.min(s.activeStop, i), Math.max(s.activeStop, i)];
      for (let k = from; k <= to; k++) visited[k] = true;
      return { activeStop: i, travelling, visited, peek: s.activeStop === i ? s.peek : false };
    }),
  togglePeek: () => set((s) => ({ peek: !s.peek })),
  setSound: (on) => set({ soundOn: on }),
  setQuality: (quality) => set({ quality }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));

export function scrollToStop(i: number) {
  const el = document.getElementById(`stop-${stops[i]?.id}`);
  if (!el) return;
  const reduce = useTown.getState().reducedMotion;
  window.scrollTo({ top: el.offsetTop, behavior: reduce ? "auto" : "smooth" });
}

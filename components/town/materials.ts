import * as THREE from "three";

// Shared materials. One instance each keeps draw-call state changes low, and
// the night-time glow can be driven by updating a handful of materials per frame.

const std = (color: string, opts: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...opts });

export const M = {
  snow: std("#f4f7fb", { roughness: 1 }),
  snowShade: std("#e3eaf3", { roughness: 1 }),
  road: std("#b9aea2", { roughness: 1 }),
  plaster: std("#efe3cc"),
  plasterWarm: std("#e9d2b0"),
  plasterRose: std("#e6c3b4"),
  plasterSage: std("#cfd8c3"),
  plasterBlue: std("#c9d4e0"),
  timber: std("#4a3324"),
  timberLight: std("#7a5638"),
  wood: std("#8a6240"),
  barnRed: std("#8e3b2f"),
  stone: std("#9a958e"),
  stoneDark: std("#6f6a64"),
  roof: std("#5b3a2c"),
  roofSlate: std("#4a4f59"),
  metal: std("#9aa3ad", { metalness: 0.6, roughness: 0.4 }),
  darkMetal: std("#3a3f47", { metalness: 0.5, roughness: 0.5 }),
  white: std("#f2efe8"),
  red: std("#b8453a"),
  green: std("#2f4f3a"),
  pine: std("#2d4a3a"),
  pineDark: std("#22392d"),
  trunk: std("#5a4030"),
  ice: new THREE.MeshStandardMaterial({ color: "#bfe0ee", roughness: 0.15, metalness: 0.1 }),
  icicle: new THREE.MeshStandardMaterial({ color: "#eaf6ff", roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.85 }),
  wreath: std("#2c5a3a", { roughness: 0.8 }),
  shutterGreen: std("#3d5a47"),
  shutterBlue: std("#3f5f7d"),
  shutterRed: std("#7a2e35"),
  shutterCream: std("#ece2cc"),
  apple: std("#c0392b", { roughness: 0.5 }),
  gold: std("#c9a14a", { metalness: 0.7, roughness: 0.35 }),
  banner: std("#2f5d8a"),
  bannerRed: std("#9b2f3a"),
  awningA: std("#c0533f"),
  awningB: std("#f1e6d2"),
  awningC: std("#3f6f8f"),
  book: [std("#7b2e2e"), std("#2e4a7b"), std("#3e6b3a"), std("#8a6a2a")],
  // Glowing parts: emissiveIntensity is animated with the time of day.
  window: new THREE.MeshStandardMaterial({
    color: "#3b2a1c",
    emissive: "#ffb55a",
    emissiveIntensity: 0.15,
    roughness: 0.6,
  }),
  lanternOn: new THREE.MeshStandardMaterial({
    color: "#ffd9a0",
    emissive: "#ffae42",
    emissiveIntensity: 2.2,
    toneMapped: false,
  }),
  lanternOff: std("#55504a", { roughness: 0.7 }),
  fire: new THREE.MeshBasicMaterial({ color: "#ff8a2a", toneMapped: false, transparent: true, opacity: 0.9 }),
  fireCore: new THREE.MeshBasicMaterial({ color: "#ffd36a", toneMapped: false }),
  clock: new THREE.MeshStandardMaterial({
    color: "#f6edd5",
    emissive: "#ffe2a8",
    emissiveIntensity: 0.2,
  }),
  beam: new THREE.MeshBasicMaterial({
    color: "#fff1c2",
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    toneMapped: false,
  }),
  smoke: new THREE.MeshStandardMaterial({
    color: "#d8d8dc",
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    roughness: 1,
  }),
};

/** Called once per frame with 0 (day) … 1 (night). */
export function updateNightMaterials(night: number, t: number) {
  M.window.emissiveIntensity = 0.12 + night * 1.6 + Math.sin(t * 2.3) * 0.02 * night;
  M.clock.emissiveIntensity = 0.15 + night * 1.2;
  M.lanternOn.emissiveIntensity = 1.4 + night * 1.8;
  M.beam.opacity = 0.05 + night * 0.25;
}

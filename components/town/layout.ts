import * as THREE from "three";

// World layout of the town. Units are roughly metres; +z is "south" (toward the
// camera), so the camera looks north-west across the road at each landmark.

type StopLayout = {
  /** Point on the road where the robot guide waits. */
  anchor: [number, number];
  /** Landmark position relative to the anchor. */
  side: [number, number];
  /** Camera distance from the landmark. */
  dist: number;
  /** Camera angle around the landmark, in degrees (45 = classic isometric). */
  azimuth: number;
  /** How high above the landmark base the camera looks. */
  lookY: number;
};

// One entry per stop, in the same order as lib/stops.ts.
export const stopLayouts: StopLayout[] = [
  { anchor: [-44, 44], side: [-4, -5], dist: 19, azimuth: 40, lookY: 1.6 }, // home
  { anchor: [-20, 40], side: [-6, -5], dist: 28, azimuth: 40, lookY: 3 }, // education: SRH Berlin (station beside it)
  { anchor: [-8, 30], side: [-6, -3], dist: 22, azimuth: 50, lookY: 1.4 }, // orchard
  { anchor: [-16, 16], side: [-6, -4], dist: 23, azimuth: 30, lookY: 2 }, // hangar
  { anchor: [-4, 6], side: [-4, -5], dist: 26, azimuth: 45, lookY: 4.5 }, // library
  { anchor: [10, 12], side: [-1, -8], dist: 26, azimuth: 60, lookY: 4 }, // lighthouse
  { anchor: [18, -2], side: [-6, -4], dist: 25, azimuth: 40, lookY: 2.5 }, // town hall
  { anchor: [8, -14], side: [-5, -5], dist: 27, azimuth: 55, lookY: 4 }, // windmill (skills; market nearby)
  { anchor: [22, -44], side: [-8, -8], dist: 34, azimuth: 42, lookY: 4 }, // MULTIPLAI
  { anchor: [38, -52], side: [-3, -3], dist: 100, azimuth: 45, lookY: 0 }, // finale: whole town
];

const v3 = (x: number, z: number, y = 0) => new THREE.Vector3(x, y, z);

/** Spreads the stops apart without editing every coordinate. */
export const SPREAD = 1.4;

/** World placement of a building from a road point and a side offset (front faces the road). */
export function placeAt(anchor: [number, number], side: [number, number]) {
  const x = anchor[0] * SPREAD + side[0];
  const z = anchor[1] * SPREAD + side[1];
  return { position: v3(x, z), rotY: Math.atan2(-side[0], -side[1]) };
}

export const anchors = stopLayouts.map((s) => v3(s.anchor[0] * SPREAD, s.anchor[1] * SPREAD));
export const landmarks = stopLayouts.map((s) => placeAt(s.anchor, s.side));

/** Buildings that share a stop or stand beside the road without one. */
export const scenery = {
  station: placeAt([-32, 36], [-3, -6]),
  university: placeAt([-20, 40], [-6, -5]),
  market: placeAt([10, -34], [-4, -5]),
};

// The road runs through every stop, plus a few waypoints past the extra buildings.
// Each entry: [x, z] before SPREAD, and the stop index it belongs to (or -1).
const roadPlan: [number, number, number][] = [
  [-62, 52, -1],
  [-44, 44, 0],
  [-32, 36, -1],
  [-20, 40, 1],
  [-8, 30, 2],
  [-16, 16, 3],
  [-4, 6, 4],
  [10, 12, 5],
  [18, -2, 6],
  [8, -14, 7],
  [10, -34, -1],
  [22, -44, 8],
  [38, -52, 9],
  [56, -60, -1],
  [74, -64, -1],
];

export const roadCurve = new THREE.CatmullRomCurve3(
  roadPlan.map(([x, z]) => v3(x * SPREAD, z * SPREAD)),
  false,
  "centripetal",
);

const stopT = stopLayouts.map((_, i) => roadPlan.findIndex((r) => r[2] === i) / (roadPlan.length - 1));

/** Curve parameter (non arc-length) on the road for a float stop index (2.5 = between stops 2 and 3). */
export function anchorT(i: number) {
  const lo = Math.max(0, Math.min(stopT.length - 1, Math.floor(i)));
  const hi = Math.min(stopT.length - 1, lo + 1);
  return THREE.MathUtils.lerp(stopT[lo], stopT[hi], THREE.MathUtils.clamp(i - lo, 0, 1));
}

// Whole-town framing for the finale and the intro swoop.
export const TOWN_CENTER = v3(-2 * SPREAD, -2 * SPREAD);

/** Global zoom: larger = camera further from each landmark. */
const DIST_SCALE = 1.5;

function cameraFor(i: number) {
  const s = stopLayouts[i];
  const target =
    i === stopLayouts.length - 1
      ? TOWN_CENTER.clone()
      : landmarks[i].position.clone().add(new THREE.Vector3(0, s.lookY, 0));
  const a = THREE.MathUtils.degToRad(s.azimuth);
  const dir = new THREE.Vector3(Math.cos(a), 0.92, Math.sin(a)).normalize();
  return { target, position: target.clone().addScaledVector(dir, s.dist * DIST_SCALE) };
}

const cams = stopLayouts.map((_, i) => cameraFor(i));
export const cameraTargetCurve = new THREE.CatmullRomCurve3(
  cams.map((c) => c.target),
  false,
  "centripetal",
);
export const cameraPositionCurve = new THREE.CatmullRomCurve3(
  cams.map((c) => c.position),
  false,
  "centripetal",
);

// Welcome screen: a low, slow orbit so the town reads as a place (rooftops, depth,
// distant hills) rather than a map seen from far above.
export const INTRO_CAMERA = {
  position: TOWN_CENTER.clone().add(new THREE.Vector3(46, 30, 54)),
  target: TOWN_CENTER.clone().add(new THREE.Vector3(0, 4, 0)),
};

/** Keep scatter (trees, rocks) away from the road and the landmarks. */
const roadSamples = roadCurve.getSpacedPoints(400);
export function isFreeSpot(x: number, z: number, roadClear = 4.5, landmarkClear = 9) {
  for (const p of roadSamples) {
    if ((p.x - x) ** 2 + (p.z - z) ** 2 < roadClear ** 2) return false;
  }
  for (const l of [...landmarks, ...Object.values(scenery)]) {
    if ((l.position.x - x) ** 2 + (l.position.z - z) ** 2 < landmarkClear ** 2) return false;
  }
  return true;
}

/** Deterministic pseudo-random numbers so the town looks the same every visit. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

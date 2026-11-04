"use client";

import * as THREE from "three";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { M, updateNightMaterials } from "./materials";
import { anchorT, anchors, isFreeSpot, roadCurve, seeded } from "./layout";
import { B, G, Glow } from "./parts";
import { scrollState, useTown } from "@/lib/town-store";
import { LANTERN_COUNT, MULTIPLAI_STOP, stops } from "@/lib/stops";
import { useTheme } from "@/context/theme-context";

// ---------------------------------------------------------------- ground + road
// Frozen lake just behind the lighthouse.
export const LAKE = { x: 9, z: 2.8, r: 6.2 };

function Ground() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 320, 120, 120);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // soft drifts, rising into hills far from the town
      const d = Math.hypot(x - 0, z + 4);
      const drift = Math.sin(x * 0.21) * Math.cos(z * 0.17) * 0.12 + Math.sin(x * 0.07 + z * 0.05) * 0.13;
      const hills = Math.max(0, d - 95) ** 1.35 * 0.09;
      pos.setY(i, drift * Math.min(1, d / 20) + hills - 0.3);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const mat = useMemo(() => {
    const m = M.snow.clone();
    if (M.snow.map) {
      m.map = M.snow.map.clone();
      m.map.repeat.set(70, 70);
      m.map.needsUpdate = true;
      m.bumpMap = m.map;
    }
    return m;
  }, []);
  return <mesh geometry={geo} material={mat} receiveShadow />;
}

function Road() {
  const geo = useMemo(() => {
    const n = 600;
    const pts = roadCurve.getSpacedPoints(n);
    const width = 2.4;
    const verts: number[] = [];
    const uvs: number[] = [];
    const idx: number[] = [];
    const len = roadCurve.getLength();
    for (let i = 0; i <= n; i++) {
      const p = pts[i];
      const t = roadCurve.getTangentAt(i / n);
      const side = new THREE.Vector3(-t.z, 0, t.x).normalize().multiplyScalar(width / 2);
      verts.push(p.x + side.x, 0.03, p.z + side.z, p.x - side.x, 0.03, p.z - side.z);
      const v = ((i / n) * len) / width; // one cobble tile per road-width of length
      uvs.push(0, v, 1, v);
      if (i < n) {
        // counter-clockwise seen from above, so the road faces up (it was culled before)
        const a = i * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  // Ploughed snow along both edges of the road.
  const banks = useMemo(() => {
    const pts = roadCurve.getSpacedPoints(260);
    const out: { p: THREE.Vector3; rot: number; s: number }[] = [];
    pts.forEach((p, i) => {
      const t = roadCurve.getTangentAt(i / 260);
      const side = new THREE.Vector3(-t.z, 0, t.x).normalize();
      const rot = Math.atan2(t.x, t.z);
      for (const sgn of [-1, 1]) {
        out.push({ p: p.clone().addScaledVector(side, sgn * 1.5), rot, s: 0.85 + ((i * 7 + (sgn + 1) * 3) % 5) * 0.08 });
      }
    });
    return out;
  }, []);
  const bankRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    banks.forEach((b, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), b.rot);
      m.compose(b.p.clone().setY(-0.02), q, new THREE.Vector3(0.75 * b.s, 0.24 * b.s, 2.6));
      bankRef.current!.setMatrixAt(i, m);
    });
    bankRef.current!.instanceMatrix.needsUpdate = true;
    bankRef.current!.computeBoundingSphere();
  }, [banks]);
  return (
    <>
      <mesh geometry={geo} material={M.road} receiveShadow />
      <instancedMesh ref={bankRef} args={[G.sphereLow, M.snow, banks.length]} receiveShadow />
    </>
  );
}

function Lake() {
  return (
    <group position={[LAKE.x, 0, LAKE.z]}>
      <B geo={G.circle} s={[LAKE.r * 2, LAKE.r * 2, 1]} p={[0, 0.05, 0]} r={[-Math.PI / 2, 0, 0]} m={M.ice} shadow={false} />
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[LAKE.r * 2.3, LAKE.r * 2.3, 1]} geometry={G.circle} material={M.snowShade} />
    </group>
  );
}

// ---------------------------------------------------------------- forest (instanced)
function Forest({ count }: { count: number }) {
  const foliage = useRef<THREE.InstancedMesh>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);

  const trees = useMemo(() => {
    const rnd = seeded(7);
    const out: { x: number; z: number; s: number }[] = [];
    let guard = 0;
    while (out.length < count && guard++ < count * 40) {
      // denser near the edges of the town, some inside
      const x = (rnd() - 0.5) * 230;
      const z = (rnd() - 0.5) * 230 - 6;
      if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 3) continue;
      if (!isFreeSpot(x, z, 5, 11)) continue;
      out.push({ x, z, s: 0.7 + rnd() * 0.9 });
    }
    return out;
  }, [count]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    trees.forEach((t, i) => {
      for (let k = 0; k < 3; k++) {
        const y = (1.2 + k * 1.05) * t.s;
        sc.set((2.6 - k * 0.65) * t.s, 1.7 * t.s, (2.6 - k * 0.65) * t.s);
        m.compose(v.set(t.x, y, t.z), q, sc);
        foliage.current!.setMatrixAt(i * 3 + k, m);
        sc.set((2.0 - k * 0.55) * t.s, 0.7 * t.s, (2.0 - k * 0.55) * t.s);
        m.compose(v.set(t.x, y + 0.55 * t.s, t.z), q, sc);
        caps.current!.setMatrixAt(i * 3 + k, m);
      }
      m.compose(v.set(t.x, 0.5 * t.s, t.z), q, sc.set(0.3 * t.s, t.s, 0.3 * t.s));
      trunks.current!.setMatrixAt(i, m);
    });
    [foliage, caps, trunks].forEach((r) => {
      r.current!.instanceMatrix.needsUpdate = true;
      r.current!.computeBoundingSphere();
    });
  }, [trees]);

  return (
    <>
      <instancedMesh ref={foliage} args={[G.cone8, M.pine, trees.length * 3]} castShadow receiveShadow />
      <instancedMesh ref={caps} args={[G.cone8, M.snow, trees.length * 3]} />
      <instancedMesh ref={trunks} args={[G.cyl8, M.trunk, trees.length]} />
    </>
  );
}

function Rocks() {
  const rocks = useMemo(() => {
    const rnd = seeded(31);
    return Array.from({ length: 40 }, () => ({ x: (rnd() - 0.5) * 170, z: (rnd() - 0.5) * 170, s: 0.4 + rnd() * 0.9 })).filter((r) =>
      isFreeSpot(r.x, r.z, 3.5, 8),
    );
  }, []);
  return (
    <>
      {rocks.map((r, i) => (
        <group key={i} position={[r.x, 0, r.z]}>
          <B geo={G.sphereLow} s={[r.s * 1.4, r.s, r.s * 1.2]} p={[0, r.s * 0.3, 0]} m={M.stoneDark} />
          <B geo={G.sphereLow} s={[r.s * 1.2, r.s * 0.45, r.s]} p={[0, r.s * 0.65, 0]} m={M.snow} shadow={false} />
        </group>
      ))}
    </>
  );
}

// ---------------------------------------------------------------- street lamps + shrubs
/** Gas-style street lamps along the road; their glass glows with the windows at night. */
function StreetLamps() {
  const lamps = useMemo(() => {
    const len = roadCurve.getLength();
    const out: { p: THREE.Vector3; rot: number }[] = [];
    let k = 0;
    for (let d = 8; d < len - 8; d += 15, k++) {
      const u = d / len;
      const p = roadCurve.getPointAt(u);
      // keep clear of the game lanterns at each stop
      if (anchors.some((a) => a.distanceTo(p) < 5)) continue;
      const t = roadCurve.getTangentAt(u);
      const side = new THREE.Vector3(-t.z, 0, t.x).normalize().multiplyScalar(k % 2 ? 1.9 : -1.9);
      out.push({ p: p.clone().add(side), rot: Math.atan2(t.x, t.z) });
    }
    return out;
  }, []);
  const post = useRef<THREE.InstancedMesh>(null);
  const head = useRef<THREE.InstancedMesh>(null);
  const cap = useRef<THREE.InstancedMesh>(null);
  const snowCap = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const q45 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
    lamps.forEach((l, i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), l.rot);
      m.compose(l.p.clone().setY(1.5), q, new THREE.Vector3(0.12, 3, 0.12));
      post.current!.setMatrixAt(i, m);
      m.compose(l.p.clone().setY(3.2), q45, new THREE.Vector3(0.36, 0.46, 0.36));
      head.current!.setMatrixAt(i, m);
      m.compose(l.p.clone().setY(3.55), q45, new THREE.Vector3(0.6, 0.3, 0.6));
      cap.current!.setMatrixAt(i, m);
      m.compose(l.p.clone().setY(3.66), q45, new THREE.Vector3(0.48, 0.14, 0.48));
      snowCap.current!.setMatrixAt(i, m);
    });
    for (const r of [post, head, cap, snowCap]) {
      r.current!.instanceMatrix.needsUpdate = true;
      r.current!.computeBoundingSphere();
    }
  }, [lamps]);
  return (
    <>
      <instancedMesh ref={post} args={[G.cyl8, M.darkMetal, lamps.length]} castShadow />
      <instancedMesh ref={head} args={[G.box, M.window, lamps.length]} />
      <instancedMesh ref={cap} args={[G.cone4, M.darkMetal, lamps.length]} />
      <instancedMesh ref={snowCap} args={[G.cone4, M.snow, lamps.length]} />
    </>
  );
}

/** Snow-covered shrubs dotted around the houses and the road. */
function Shrubs({ count }: { count: number }) {
  const items = useMemo(() => {
    const rnd = seeded(91);
    const out: { x: number; z: number; s: number }[] = [];
    let guard = 0;
    while (out.length < count && guard++ < count * 30) {
      const x = (rnd() - 0.5) * 140;
      const z = (rnd() - 0.5) * 140 - 4;
      if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r + 1) continue;
      if (!isFreeSpot(x, z, 2.6, 6)) continue;
      out.push({ x, z, s: 0.5 + rnd() * 0.7 });
    }
    return out;
  }, [count]);
  const leaf = useRef<THREE.InstancedMesh>(null);
  const cap = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    items.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, 0.35 * b.s, b.z), q, new THREE.Vector3(1.3 * b.s, 0.9 * b.s, 1.2 * b.s));
      leaf.current!.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(b.x, 0.7 * b.s, b.z), q, new THREE.Vector3(1.05 * b.s, 0.45 * b.s, 0.95 * b.s));
      cap.current!.setMatrixAt(i, m);
    });
    for (const r of [leaf, cap]) {
      r.current!.instanceMatrix.needsUpdate = true;
      r.current!.computeBoundingSphere();
    }
  }, [items]);
  return (
    <>
      <instancedMesh ref={leaf} args={[G.sphereLow, M.pineDark, items.length]} castShadow receiveShadow />
      <instancedMesh ref={cap} args={[G.sphereLow, M.snow, items.length]} />
    </>
  );
}

// ---------------------------------------------------------------- lanterns (the "lanterns lit" game)
function Lantern({ index }: { index: number }) {
  const lit = useTown((s) => s.visited[index]);
  const pop = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  const { position } = useMemo(() => {
    const a = anchors[index];
    const t = roadCurve.getTangent(anchorT(index));
    const side = new THREE.Vector3(t.z, 0, -t.x).normalize().multiplyScalar(2.1);
    return { position: a.clone().add(side) };
  }, [index]);

  useFrame(({ clock }) => {
    if (!pop.current) return;
    if (lit && born.current === null) born.current = clock.elapsedTime;
    const k = born.current === null ? 0 : Math.min(1, (clock.elapsedTime - born.current) * 2.5);
    const s = lit ? 1 + Math.sin(k * Math.PI) * 0.6 : 1;
    pop.current.scale.setScalar(s);
  });

  return (
    <group position={position}>
      <B geo={G.cyl8} s={[0.14, 2.4, 0.14]} p={[0, 1.2, 0]} m={M.darkMetal} />
      <B s={[0.7, 0.08, 0.08]} p={[0.3, 2.35, 0]} m={M.darkMetal} />
      <group ref={pop} position={[0.6, 2.0, 0]}>
        <B s={[0.36, 0.48, 0.36]} m={lit ? M.lanternOn : M.lanternOff} shadow={false} />
        <B geo={G.cone4} s={[0.5, 0.25, 0.5]} p={[0, 0.36, 0]} r={[0, Math.PI / 4, 0]} m={M.darkMetal} shadow={false} />
        <B geo={G.cone4} s={[0.42, 0.12, 0.42]} p={[0, 0.45, 0]} r={[0, Math.PI / 4, 0]} m={M.snow} shadow={false} />
        {lit && <Glow position={[0, 0, 0]} size={2.4} />}
      </group>
    </group>
  );
}

function Lanterns() {
  return (
    <>
      {Array.from({ length: LANTERN_COUNT }, (_, i) => (
        <Lantern key={i} index={i} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------- snowfall
function Snowfall({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const camera = useThree((s) => s.camera);
  const { geo, speeds } = useMemo(() => {
    const rnd = seeded(99);
    const pos = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 60;
      pos[i * 3 + 1] = rnd() * 30;
      pos[i * 3 + 2] = (rnd() - 0.5) * 60;
      speeds[i] = 0.6 + rnd() * 0.8;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo: g, speeds };
  }, [count]);
  const mat = useMemo(() => {
    // soft round flake (points render as squares without a texture)
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.45, "rgba(255,255,255,0.85)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.PointsMaterial({
      color: "#ffffff",
      map: new THREE.CanvasTexture(c),
      size: 0.22,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, []);
  useFrame(({ clock }, dt) => {
    const p = ref.current;
    if (!p) return;
    // keep the snow box centred under the camera's view
    const c = camera.position;
    p.position.set(Math.round(c.x * 0.6), 0, Math.round(c.z * 0.6));
    const arr = geo.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= speeds[i] * dt * 1.6;
      arr[i * 3] += Math.sin(t * 0.7 + i) * dt * 0.3;
      if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] += 30;
    }
    geo.attributes.position.needsUpdate = true;
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />;
}

// ---------------------------------------------------------------- sky + time of day
// Key frames along the road: [progress, sky, sunColor, sunIntensity, ambient].
// Keyed to the MULTIPLAI stop (night, campfire) and the last stop (dawn).
const MS = MULTIPLAI_STOP;
const LAST_STOP = stops.length - 1;
const DAY: [number, string, string, number, number][] = [
  [0, "#cfe1f0", "#fff3e0", 2.6, 1.15],
  [MS - 5, "#cadcee", "#fff0da", 2.5, 1.1],
  [MS - 2.5, "#efc2a0", "#ffb27a", 1.9, 0.95],
  [MS - 1, "#8a7fae", "#c49ad8", 1.0, 0.75],
  [MS, "#2a3566", "#8b98e0", 0.45, 0.62],
  [MS + 0.7, "#334079", "#8b98e0", 0.5, 0.62],
  [LAST_STOP, "#f2c2a8", "#ffc6a0", 1.6, 0.85],
];
const NIGHT: typeof DAY = [
  [0, "#1c2650", "#8d9ae6", 0.5, 0.6],
  [LAST_STOP, "#1f2a55", "#8d9ae6", 0.5, 0.6],
];

function sample(keys: typeof DAY, p: number) {
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1][0] < p) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const k = THREE.MathUtils.clamp((p - a[0]) / (b[0] - a[0] || 1), 0, 1);
  return {
    sky: new THREE.Color(a[1]).lerp(new THREE.Color(b[1]), k),
    sun: new THREE.Color(a[2]).lerp(new THREE.Color(b[2]), k),
    sunI: THREE.MathUtils.lerp(a[3], b[3], k),
    amb: THREE.MathUtils.lerp(a[4], b[4], k),
  };
}

function SkyAndLights({ shadows }: { shadows: boolean }) {
  const { theme } = useTheme();
  const scene = useThree((s) => s.scene);
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const bg = useMemo(() => new THREE.Color(), []);
  const fog = useMemo(() => new THREE.Fog("#c8dcec", 70, 230), []);
  const nightMix = useRef(theme === "dark" ? 1 : 0);

  useLayoutEffect(() => {
    scene.background = bg;
    scene.fog = fog;
  }, [scene, bg, fog]);

  useFrame(({ clock, camera }, dt) => {
    nightMix.current = THREE.MathUtils.damp(nightMix.current, theme === "dark" ? 1 : 0, 2.5, dt);
    const p = scrollState.progress;
    const d = sample(DAY, p);
    const n = sample(NIGHT, p);
    const k = nightMix.current;
    bg.copy(d.sky).lerp(n.sky, k);
    fog.color.copy(bg);
    // the finale is a wide shot, so push the fog back there
    const far = THREE.MathUtils.lerp(230, 420, THREE.MathUtils.smoothstep(p, MS, LAST_STOP));
    fog.far = far;
    fog.near = far * 0.35;
    const sunI = THREE.MathUtils.lerp(d.sunI, n.sunI, k);
    const amb = THREE.MathUtils.lerp(d.amb, n.amb, k);
    if (sun.current) {
      sun.current.color.copy(d.sun).lerp(n.sun, k);
      sun.current.intensity = sunI;
      // shadow camera follows what we look at
      const tgt = camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(20));
      sun.current.position.set(tgt.x + 30, 45, tgt.z + 18);
      sun.current.target.position.copy(tgt);
      sun.current.target.updateMatrixWorld();
    }
    if (hemi.current) hemi.current.intensity = amb;
    // how "night" it is, for windows and lanterns
    const night = THREE.MathUtils.clamp(1 - sunI / 2.2, 0, 1);
    updateNightMaterials(night, clock.elapsedTime);
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#e4ecf8", "#9b8f84", 1]} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={140}
        shadow-bias={-0.0004}
      />
    </>
  );
}

export function Environment({ quality }: { quality: "high" | "low" }) {
  const reducedMotion = useTown((s) => s.reducedMotion);
  const high = quality === "high";
  return (
    <>
      <SkyAndLights shadows={high} />
      <Ground />
      <Road />
      <Lake />
      <Forest count={high ? 380 : 200} />
      <Rocks />
      <Shrubs count={high ? 150 : 70} />
      <StreetLamps />
      <Lanterns />
      {!reducedMotion && <Snowfall count={high ? 2600 : 900} />}
    </>
  );
}

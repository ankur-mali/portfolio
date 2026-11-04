"use client";

import * as THREE from "three";
import React, { createContext, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { M } from "./materials";
import { makeSmokeTexture } from "./textures";
import { useTown } from "@/lib/town-store";

type V3 = [number, number, number];

// ---------- shared unit geometries (scaled per mesh) ----------
function makePrism() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, 0);
  shape.lineTo(0.5, 0);
  shape.lineTo(0, 1);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  return g;
}

export const G = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
  cyl8: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
  cone: new THREE.ConeGeometry(0.5, 1, 16),
  cone4: new THREE.ConeGeometry(0.5, 1, 4),
  cone8: new THREE.ConeGeometry(0.5, 1, 8),
  sphere: new THREE.SphereGeometry(0.5, 16, 12),
  sphereLow: new THREE.IcosahedronGeometry(0.5, 1),
  prism: makePrism(),
  torus: new THREE.TorusGeometry(0.5, 0.06, 8, 24),
  circle: new THREE.CircleGeometry(0.5, 32),
  plane: new THREE.PlaneGeometry(1, 1),
};

let glowTexture: THREE.Texture | null = null;
export function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,210,140,1)");
  grd.addColorStop(0.25, "rgba(255,170,80,0.55)");
  grd.addColorStop(1, "rgba(255,140,40,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  glowTexture = new THREE.CanvasTexture(c);
  return glowTexture;
}

// ---------- explode ("peek inside") ----------
// A landmark provides a ref holding 0 … 1; every <Part> moves along its offset.
export const ExplodeContext = createContext<{ current: number }>({ current: 0 });

export function Part({
  offset,
  children,
  position = [0, 0, 0],
  rotation,
}: {
  offset: V3;
  children: React.ReactNode;
  position?: V3;
  rotation?: V3;
}) {
  const amount = useContext(ExplodeContext);
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const e = amount.current;
    g.position.set(
      position[0] + offset[0] * e,
      position[1] + offset[1] * e,
      position[2] + offset[2] * e,
    );
  });
  return (
    <group ref={ref} position={position} rotation={rotation}>
      {children}
    </group>
  );
}

// ---------- primitives ----------
type BoxProps = {
  s: V3;
  p?: V3;
  r?: V3;
  m: THREE.Material;
  geo?: THREE.BufferGeometry;
  shadow?: boolean;
};

export function B({ s, p = [0, 0, 0], r, m, geo = G.box, shadow = true }: BoxProps) {
  return (
    <mesh
      geometry={geo}
      material={m}
      scale={s}
      position={p}
      rotation={r}
      castShadow={shadow}
      receiveShadow
    />
  );
}

/** Two sloped slabs with a snow layer, a rounded snow lip and icicles at the eaves.
 *  `y` = top of the walls. Optional warm string lights along the front edges. */
export function GableRoof({
  w,
  d,
  h,
  y,
  overhang = 0.35,
  m = M.roof,
  snow = true,
  lights = false,
}: {
  w: number;
  d: number;
  h: number;
  y: number;
  overhang?: number;
  m?: THREE.Material;
  snow?: boolean;
  lights?: boolean;
}) {
  const ang = Math.atan2(h, w / 2);
  const len = w / 2 / Math.cos(ang) + overhang;
  const t = 0.18;
  const dd = d + overhang * 2;
  const slabs = [-1, 1].map((sgn) => {
    const cx = sgn * Math.cos(ang) * (len / 2) + sgn * Math.sin(ang) * (t / 2);
    const cy = h - Math.sin(ang) * (len / 2) + Math.cos(ang) * (t / 2);
    // lower (eave) edge of this slab
    const ex = cx + sgn * Math.cos(ang) * (len / 2);
    const ey = cy - Math.sin(ang) * (len / 2);
    return { sgn, cx, cy, ex, ey };
  });

  // Icicles: one instanced mesh per roof, lengths vary along the eave.
  const icicleRef = useRef<THREE.InstancedMesh>(null);
  const icicles = useMemo(() => {
    if (!snow) return [];
    const out: { x: number; y: number; z: number; l: number }[] = [];
    const n = Math.max(3, Math.floor(dd / 0.3));
    for (const sl of slabs)
      for (let i = 0; i < n; i++) {
        const z = -dd / 2 + (dd / (n - 1)) * i;
        const k = Math.abs(Math.sin(i * 12.9898 + sl.sgn * 78.233) * 43758.5453) % 1;
        if (k < 0.25) continue; // gaps look natural
        out.push({ x: sl.ex, y: sl.ey - t * 0.6, z, l: 0.12 + k * 0.42 });
      }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, d, h, snow]);
  useLayoutEffect(() => {
    const mesh = icicleRef.current;
    if (!mesh) return;
    const mx = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    icicles.forEach((c, i) => {
      mx.compose(new THREE.Vector3(c.x, c.y - c.l / 2, c.z), q, new THREE.Vector3(0.07, c.l, 0.07));
      mesh.setMatrixAt(i, mx);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [icicles]);

  // String lights along the two front rake edges, eave to ridge.
  const bulbRef = useRef<THREE.InstancedMesh>(null);
  const bulbs = useMemo(() => {
    if (!lights) return [];
    const out: THREE.Vector3[] = [];
    const z = dd / 2 + 0.02;
    for (const sl of slabs) {
      for (let i = 0; i <= 9; i++) {
        const k = i / 9;
        const sag = Math.sin(k * Math.PI * 9) * 0.03;
        out.push(new THREE.Vector3(sl.ex * (1 - k), sl.ey - 0.06 + (h + 0.05 - sl.ey) * k - sag, z));
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lights, w, d, h]);
  useLayoutEffect(() => {
    const mesh = bulbRef.current;
    if (!mesh) return;
    const mx = new THREE.Matrix4();
    bulbs.forEach((b, i) => {
      mx.compose(b, new THREE.Quaternion(), new THREE.Vector3(0.09, 0.09, 0.09));
      mesh.setMatrixAt(i, mx);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [bulbs]);

  return (
    <group position={[0, y, 0]}>
      {slabs.map(({ sgn, cx, cy, ex, ey }) => (
        <React.Fragment key={sgn}>
          <group position={[cx, cy, 0]} rotation={[0, 0, -sgn * ang]}>
            <B s={[len, t, dd]} m={m} />
            {snow && <B s={[len * 0.96, 0.14, dd * 0.98]} p={[-sgn * len * 0.01, t / 2 + 0.06, 0]} m={M.snow} />}
          </group>
          {/* rounded snow lip curling over the eave */}
          {snow && <B geo={G.cyl8} s={[0.2, dd * 0.98, 0.2]} p={[ex, ey + t * 0.55, 0]} r={[Math.PI / 2, 0, 0]} m={M.snow} shadow={false} />}
        </React.Fragment>
      ))}
      <B s={[0.3, 0.22, dd]} p={[0, h + 0.12, 0]} m={snow ? M.snow : m} />
      {icicles.length > 0 && <instancedMesh ref={icicleRef} args={[G.cone8, M.icicle, icicles.length]} />}
      {bulbs.length > 0 && <instancedMesh ref={bulbRef} args={[G.sphereLow, M.lanternOn, bulbs.length]} />}
    </group>
  );
}

/** Small glowing window with a dark frame and a snowy sill. */
export function Win({
  p,
  w = 0.55,
  h = 0.75,
  ry = 0,
  shutter,
}: {
  p: V3;
  w?: number;
  h?: number;
  ry?: number;
  shutter?: THREE.Material;
}) {
  // Phones / slower devices skip the small extras (each one is a separate draw call).
  const fine = useTown((s) => s.quality === "high");
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <B s={[w + 0.14, h + 0.14, 0.06]} m={M.timber} shadow={false} />
      <B s={[w, h, 0.08]} p={[0, 0, 0.02]} m={M.window} shadow={false} />
      {/* cross frame: four panes */}
      <B s={[0.05, h, 0.1]} p={[0, 0, 0.03]} m={M.timber} shadow={false} />
      {fine && <B s={[w, 0.05, 0.1]} p={[0, h * 0.08, 0.03]} m={M.timber} shadow={false} />}
      {/* snowy sill */}
      <B s={[w + 0.24, 0.07, 0.18]} p={[0, -h / 2 - 0.08, 0.06]} m={M.timberLight} shadow={false} />
      <B s={[w + 0.2, 0.06, 0.16]} p={[0, -h / 2 - 0.03, 0.06]} m={M.snow} shadow={false} />
      {fine &&
        shutter &&
        [-1, 1].map((sx) => (
          <group key={sx} position={[sx * (w / 2 + 0.2), 0, 0.03]}>
            <B s={[0.24, h + 0.06, 0.05]} m={shutter} shadow={false} />
            <B s={[0.16, 0.03, 0.06]} p={[0, h * 0.22, 0.01]} m={M.timber} shadow={false} />
            <B s={[0.16, 0.03, 0.06]} p={[0, -h * 0.22, 0.01]} m={M.timber} shadow={false} />
          </group>
        ))}
    </group>
  );
}

/** Front door with panels, a brass handle, a winter wreath and a wall lamp that glows at night. */
function Door({ wreath = true }: { wreath?: boolean }) {
  const fine = useTown((s) => s.quality === "high");
  return (
    <>
      <B s={[0.95, 1.65, 0.1]} p={[0, 0.82 + 0.2, 0]} m={M.timberLight} />
      {fine && [0.55, 1.35].map((y) => (
        <B key={y} s={[0.66, 0.5, 0.04]} p={[0, y, 0.06]} m={M.timber} shadow={false} />
      ))}
      <B geo={G.sphere} s={[0.09, 0.09, 0.09]} p={[0.32, 0.98, 0.09]} m={M.gold} shadow={false} />
      <B s={[1.15, 0.12, 0.16]} p={[0, 1.9, 0.02]} m={M.timber} />
      {fine && wreath && (
        <group position={[0, 1.42, 0.1]}>
          <mesh geometry={G.torus} material={M.wreath} scale={[0.42, 0.42, 1.4]} />
          <B geo={G.sphere} s={[0.1, 0.1, 0.06]} p={[0, -0.19, 0.04]} m={M.red} shadow={false} />
        </group>
      )}
      {/* wall lamp */}
      <group position={[0.72, 1.55, 0.1]}>
        <B s={[0.05, 0.05, 0.22]} p={[0, 0.12, -0.04]} m={M.darkMetal} shadow={false} />
        <B s={[0.16, 0.22, 0.16]} p={[0, 0, 0.06]} m={M.window} shadow={false} />
        <B geo={G.cone4} s={[0.24, 0.12, 0.24]} p={[0, 0.17, 0.06]} r={[0, Math.PI / 4, 0]} m={M.darkMetal} shadow={false} />
      </group>
      <B s={[1.4, 0.18, 0.9]} p={[0, 0.09, 0.45]} m={M.stone} />
    </>
  );
}

export type HouseProps = {
  w: number;
  d: number;
  h: number;
  roofH?: number;
  wall?: THREE.Material;
  roofM?: THREE.Material;
  timber?: boolean;
  chimney?: boolean;
  smoke?: boolean;
  door?: boolean;
  /** Window columns per long side. */
  cols?: number;
  position?: V3;
  rotation?: V3;
  /** Exploded offset for the roof, used by "peek inside". */
  peekRoof?: number;
  /** Warm string lights along the front roof edges. */
  lights?: boolean;
  children?: React.ReactNode;
};

/** Shutter colour that suits each wall colour. */
function shutterFor(wall: THREE.Material) {
  if (wall === M.plasterWarm) return M.shutterBlue;
  if (wall === M.plasterSage || wall === M.plasterBlue) return M.shutterRed;
  if (wall === M.barnRed) return M.shutterCream;
  return M.shutterGreen;
}

/** Half-timbered house. Origin = centre of the ground floor footprint; front = +z. */
export function House({
  w,
  d,
  h,
  roofH = w * 0.55,
  wall = M.plaster,
  roofM = M.roof,
  timber = true,
  chimney = true,
  smoke = true,
  door = true,
  cols,
  position,
  rotation,
  peekRoof = 2.2,
  lights = false,
  children,
}: HouseProps) {
  const shutter = shutterFor(wall);
  const floors = Math.max(1, Math.round(h / 2.3));
  const nCols = cols ?? Math.max(1, Math.floor(w / 1.6));
  const sideCols = Math.max(1, Math.floor(d / 1.8));
  const floorH = h / floors;

  const windows: React.ReactNode[] = [];
  for (let f = 0; f < floors; f++) {
    const y = floorH * f + floorH * 0.55;
    for (let c = 0; c < nCols; c++) {
      const x = -w / 2 + (w / nCols) * (c + 0.5);
      if (door && f === 0 && Math.abs(x) < 0.7) continue;
      windows.push(<Win key={`f${f}c${c}`} p={[x, y, d / 2 + 0.01]} shutter={shutter} />);
      windows.push(<Win key={`b${f}c${c}`} p={[x, y, -d / 2 - 0.01]} ry={Math.PI} shutter={shutter} />);
    }
    for (let c = 0; c < sideCols; c++) {
      const z = -d / 2 + (d / sideCols) * (c + 0.5);
      windows.push(<Win key={`r${f}c${c}`} p={[w / 2 + 0.01, y, z]} ry={Math.PI / 2} />);
      windows.push(<Win key={`l${f}c${c}`} p={[-w / 2 - 0.01, y, z]} ry={-Math.PI / 2} />);
    }
  }

  const frame: React.ReactNode[] = [];
  if (timber) {
    const t = 0.12;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        frame.push(
          <B key={`post${sx}${sz}`} s={[t, h, t]} p={[(sx * w) / 2, h / 2, (sz * d) / 2]} m={M.timber} shadow={false} />,
        );
    for (let f = 1; f <= floors; f++) {
      const y = floorH * f;
      for (const sz of [-1, 1])
        frame.push(<B key={`beam${f}${sz}`} s={[w + 0.06, t, 0.08]} p={[0, y, (sz * (d / 2 + 0.02))]} m={M.timber} shadow={false} />);
      for (const sx of [-1, 1])
        frame.push(<B key={`sbeam${f}${sx}`} s={[0.08, t, d + 0.06]} p={[sx * (w / 2 + 0.02), y, 0]} m={M.timber} shadow={false} />);
    }
    // vertical studs between window columns + diagonal braces at the ends
    for (let f = 0; f < floors; f++) {
      const yc = floorH * f + floorH / 2;
      for (let c = 1; c < nCols; c++) {
        const x = -w / 2 + (w / nCols) * c;
        for (const sz of [-1, 1])
          frame.push(<B key={`stud${f}${c}${sz}`} s={[0.09, floorH, 0.07]} p={[x, yc, sz * (d / 2 + 0.02)]} m={M.timber} shadow={false} />);
      }
      const bl = Math.hypot(w / nCols / 2, floorH) * 0.9;
      const ba = Math.atan2(floorH, w / nCols / 2);
      for (const sx of [-1, 1])
        frame.push(
          <B
            key={`brace${f}${sx}`}
            s={[bl, 0.08, 0.06]}
            p={[sx * (w / 2 - w / nCols / 4), yc, d / 2 + 0.03]}
            r={[0, 0, sx * ba]}
            m={M.timber}
            shadow={false}
          />,
        );
    }
  }

  return (
    <group position={position} rotation={rotation}>
      <B s={[w, h, d]} p={[0, h / 2, 0]} m={wall} />
      {/* stone plinth */}
      <B s={[w + 0.12, 0.4, d + 0.12]} p={[0, 0.2, 0]} m={M.stone} />
      {/* gable ends */}
      <mesh geometry={G.prism} material={wall} scale={[w, roofH, d - 0.02]} position={[0, h, 0]} castShadow receiveShadow />
      {windows}
      {frame}
      {door && (
        <group position={[0, 0, d / 2 + 0.02]}>
          <Door />
        </group>
      )}
      {/* gable window */}
      <Win p={[0, h + roofH * 0.35, d / 2 + 0.01]} w={0.45} h={0.5} />
      <Part offset={[0, peekRoof, 0]}>
        <GableRoof w={w} d={d} h={roofH} y={h} m={roofM} lights={lights} />
        {chimney && (
          <group position={[w * 0.22, h + roofH * 0.55, -d * 0.18]}>
            <B s={[0.6, roofH * 0.9 + 0.6, 0.6]} p={[0, 0.3, 0]} m={M.stoneDark} />
            <B s={[0.75, 0.16, 0.75]} p={[0, roofH * 0.45 + 0.65, 0]} m={M.snow} />
            {smoke && <Smoke position={[0, roofH * 0.45 + 0.9, 0]} />}
          </group>
        )}
      </Part>
      {children}
    </group>
  );
}

/** Rising chimney smoke: soft puffs that drift, swell and fade. */
let smokeTex: THREE.Texture | null = null;
export function Smoke({ position, count = 7, spread = 0.5 }: { position: V3; count?: number; spread?: number }) {
  const ref = useRef<THREE.Group>(null);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count]);
  const mats = useMemo(() => {
    if (!smokeTex) smokeTex = makeSmokeTexture();
    return seeds.map(() => new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
  }, [seeds]);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime * 0.16;
    g.children.forEach((c, i) => {
      const k = (t + seeds[i]) % 1;
      c.position.set(Math.sin((k + i) * 3) * spread * k + k * 1.1, k * 4.2, Math.cos(i * 1.7) * spread * k);
      const sz = 0.5 + k * 2.2;
      c.scale.set(sz, sz, sz);
      // fade in quickly, then thin out as it rises
      mats[i].opacity = Math.min(1, k * 6) * (1 - k) * 0.75;
    });
  });
  return (
    <group ref={ref} position={position}>
      {mats.map((m, i) => (
        <sprite key={i} material={m} />
      ))}
    </group>
  );
}

/** Stone ring, logs, flickering flames and a warm point light. */
export function Campfire({ position, lit = true, size = 1, light = true }: { position: V3; lit?: boolean; size?: number; light?: boolean }) {
  const flames = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const grow = useRef(lit ? 1 : 0);
  useFrame(({ clock }, dt) => {
    grow.current = THREE.MathUtils.damp(grow.current, lit ? 1 : 0, 2, dt);
    const t = clock.elapsedTime;
    const g = grow.current;
    if (flames.current) {
      flames.current.visible = g > 0.02;
      flames.current.children.forEach((c, i) => {
        const f = 0.85 + Math.sin(t * (9 + i * 2.3) + i) * 0.12 + Math.sin(t * 23 + i * 5) * 0.06;
        c.scale.set((0.5 - i * 0.08) * g, (1.1 - i * 0.18) * f * g, (0.5 - i * 0.08) * g);
      });
    }
    if (lamp.current) lamp.current.intensity = g * (6 + Math.sin(t * 13) * 1.2 + Math.sin(t * 7.3) * 0.9);
  });
  const stones = 9;
  return (
    <group position={position} scale={size}>
      {Array.from({ length: stones }, (_, i) => {
        const a = (i / stones) * Math.PI * 2;
        return <B key={i} geo={G.sphereLow} s={[0.42, 0.3, 0.38]} p={[Math.cos(a) * 0.75, 0.12, Math.sin(a) * 0.75]} m={M.stoneDark} />;
      })}
      {[0, 1, 2].map((i) => (
        <B key={i} geo={G.cyl8} s={[0.16, 1.1, 0.16]} p={[0, 0.18, 0]} r={[Math.PI / 2.4, (i * Math.PI * 2) / 3, 0]} m={M.timber} />
      ))}
      <group ref={flames} position={[0, 0.25, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            geometry={G.cone}
            material={i === 2 ? M.fireCore : M.fire}
            position={[Math.sin(i * 2.1) * 0.12, 0.45 - i * 0.05, Math.cos(i * 2.1) * 0.12]}
          />
        ))}
      </group>
      {!lit && <Smoke position={[0, 0.3, 0]} count={4} spread={0.2} />}
      {light && <pointLight ref={lamp} position={[0, 1.1, 0]} color="#ff9a45" distance={14} decay={1.6} />}
    </group>
  );
}

export function Bench({ position, rotation }: { position: V3; rotation?: V3 }) {
  return (
    <group position={position} rotation={rotation}>
      <B s={[1.6, 0.12, 0.45]} p={[0, 0.45, 0]} m={M.wood} />
      <B s={[1.6, 0.06, 0.48]} p={[0, 0.53, 0]} m={M.snow} shadow={false} />
      {[-0.65, 0.65].map((x) => (
        <B key={x} s={[0.12, 0.45, 0.4]} p={[x, 0.22, 0]} m={M.timber} />
      ))}
    </group>
  );
}

export function Fence({ from, to, posts = 6 }: { from: [number, number]; to: [number, number]; posts?: number }) {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const ang = Math.atan2(dz, dx);
  return (
    <group position={[from[0], 0, from[1]]} rotation={[0, -ang, 0]}>
      {Array.from({ length: posts }, (_, i) => (
        <group key={i} position={[(len / (posts - 1)) * i, 0, 0]}>
          <B s={[0.12, 0.9, 0.12]} p={[0, 0.45, 0]} m={M.wood} />
          <B s={[0.16, 0.08, 0.16]} p={[0, 0.94, 0]} m={M.snow} shadow={false} />
        </group>
      ))}
      <B s={[len, 0.08, 0.06]} p={[len / 2, 0.7, 0]} m={M.wood} />
      <B s={[len, 0.08, 0.06]} p={[len / 2, 0.4, 0]} m={M.wood} />
    </group>
  );
}

/** A snowy pine made of three stacked cones. */
export function Pine({ position, scale = 1 }: { position: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <B geo={G.cyl8} s={[0.3, 1, 0.3]} p={[0, 0.5, 0]} m={M.trunk} />
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 1.2 + i * 1.05, 0]}>
          <B geo={G.cone8} s={[2.6 - i * 0.65, 1.7, 2.6 - i * 0.65]} m={M.pine} />
          <B geo={G.cone8} s={[2.0 - i * 0.55, 0.7, 2.0 - i * 0.55]} p={[0, 0.55, 0]} m={M.snow} shadow={false} />
        </group>
      ))}
    </group>
  );
}

export function SnowPile({ position, s = 1 }: { position: V3; s?: number }) {
  return <B geo={G.sphereLow} s={[1.4 * s, 0.5 * s, 1.1 * s]} p={position} m={M.snow} />;
}

/** Glow sprite used for lanterns, windows at night and the robot's eye. */
export function Glow({ position, size = 1.4, opacity = 0.9 }: { position: V3; size?: number; opacity?: number }) {
  const tex = useMemo(() => getGlowTexture(), []);
  return (
    <sprite position={position} scale={[size, size, size]}>
      <spriteMaterial map={tex} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
  );
}

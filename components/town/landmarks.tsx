"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { M } from "./materials";
import { B, Bench, Campfire, ExplodeContext, Fence, G, Glow, House, Part, Pine, Smoke, SnowPile, Win } from "./parts";
import { landmarks, scenery } from "./layout";
import { useTown } from "@/lib/town-store";
import { LANTERN_COUNT } from "@/lib/stops";

type V3 = [number, number, number];

/** Places a landmark at its stop and drives its "peek inside" explode amount.
 *  `free` skips the stop's transform for landmarks that place their own buildings. */
function Landmark({ index, children, free = false }: { index: number; children: React.ReactNode; free?: boolean }) {
  const amount = useRef({ current: 0 }).current;
  useFrame((_, dt) => {
    const s = useTown.getState();
    const target = s.peek && s.activeStop === index ? 1 : 0;
    amount.current = THREE.MathUtils.damp(amount.current, target, 4, dt);
  });
  const l = landmarks[index];
  return (
    <ExplodeContext.Provider value={amount}>
      {free ? children : <group position={l.position} rotation={[0, l.rotY, 0]}>{children}</group>}
    </ExplodeContext.Provider>
  );
}

function useSpin(speed: number, axis: "x" | "y" | "z" = "y") {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation[axis] += speed * dt;
  });
  return ref;
}

// ---------------------------------------------------------------- 0 Home
function Snowman({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <B geo={G.sphere} s={[1, 0.95, 1]} p={[0, 0.45, 0]} m={M.snow} />
      <B geo={G.sphere} s={[0.7, 0.68, 0.7]} p={[0, 1.15, 0]} m={M.snow} />
      <B geo={G.sphere} s={[0.48, 0.48, 0.48]} p={[0, 1.65, 0]} m={M.snow} />
      <B geo={G.cone} s={[0.08, 0.3, 0.08]} p={[0, 1.65, 0.3]} r={[Math.PI / 2, 0, 0]} m={M.awningA} />
      <B geo={G.cyl} s={[0.5, 0.08, 0.5]} p={[0, 1.36, 0]} m={M.bannerRed} />
    </group>
  );
}

function Home() {
  return (
    <>
      <House w={4.4} d={3.6} h={2.6} roofH={2.3} wall={M.plasterWarm} cols={2} lights />
      <B s={[1.6, 0.9, 0.7]} p={[-3, 0.45, -0.6]} m={M.wood} />
      <B s={[1.7, 0.12, 0.8]} p={[-3, 0.95, -0.6]} m={M.snow} />
      <Bench position={[2.6, 0, 2.2]} rotation={[0, -0.6, 0]} />
      <Campfire position={[3.6, 0, 3.6]} size={0.7} />
      <Snowman position={[-2.4, 0, 2.6]} />
      <Fence from={[-3.6, 4.2]} to={[-1, 4.2]} posts={4} />
      <Pine position={[-4.5, 0, -3]} scale={1.1} />
      <Pine position={[3.8, 0, -3.2]} scale={0.9} />
    </>
  );
}

// ---------------------------------------------------------------- 1 Arrival
function Train() {
  return (
    <group position={[-3, 0.35, 3.4]}>
      {/* locomotive */}
      <Part offset={[-3, 0, 0]}>
        <B geo={G.cyl} s={[1.1, 2.6, 1.1]} p={[0, 0.95, 0]} r={[0, 0, Math.PI / 2]} m={M.green} />
        <B s={[1.3, 1.6, 1.3]} p={[1.6, 1.15, 0]} m={M.green} />
        <B s={[1.5, 0.15, 1.5]} p={[1.6, 2.0, 0]} m={M.snow} />
        <B geo={G.cyl} s={[0.35, 0.8, 0.35]} p={[-0.8, 1.8, 0]} m={M.darkMetal} />
        <Smoke position={[-0.8, 2.3, 0]} count={5} spread={0.3} />
        <Win p={[1.6, 1.3, 0.66]} w={0.5} h={0.5} />
        {[-0.8, 0, 0.8, 1.6].map((x) => (
          <B key={x} geo={G.cyl} s={[0.55, 0.15, 0.55]} p={[x, 0.15, 0.6]} r={[Math.PI / 2, 0, 0]} m={M.darkMetal} />
        ))}
      </Part>
      {/* carriages */}
      {[3.6, 7.2].map((x, i) => (
        <Part key={x} offset={[2 + i * 2, 0, 0]}>
          <group position={[x, 0, 0]}>
            <B s={[3.2, 1.6, 1.3]} p={[0, 1.0, 0]} m={i ? M.bannerRed : M.banner} />
            <B s={[3.3, 0.14, 1.4]} p={[0, 1.86, 0]} m={M.snow} />
            {[-1, 0, 1].map((k) => (
              <Win key={k} p={[k * 0.95, 1.15, 0.66]} w={0.55} h={0.5} />
            ))}
            {[-1.1, 1.1].map((k) => (
              <B key={k} geo={G.cyl} s={[0.5, 0.15, 0.5]} p={[k, 0.15, 0.6]} r={[Math.PI / 2, 0, 0]} m={M.darkMetal} />
            ))}
          </group>
        </Part>
      ))}
    </group>
  );
}

function Arrival() {
  const sleepers = useMemo(() => Array.from({ length: 18 }, (_, i) => -9 + i), []);
  return (
    <>
      <House w={6} d={3} h={2.8} roofH={1.8} wall={M.plasterRose} roofM={M.roofSlate} cols={3} />
      {/* platform + canopy */}
      <B s={[12, 0.35, 1.6]} p={[0, 0.17, 2.3]} m={M.stone} />
      {[-4, 0, 4].map((x) => (
        <B key={x} s={[0.14, 2.4, 0.14]} p={[x, 1.4, 2.8]} m={M.timber} />
      ))}
      <B s={[10, 0.14, 1.5]} p={[0, 2.6, 2.4]} r={[0.12, 0, 0]} m={M.roofSlate} />
      <B s={[10, 0.1, 1.5]} p={[0, 2.72, 2.4]} r={[0.12, 0, 0]} m={M.snow} />
      {/* station clock */}
      <B geo={G.cyl} s={[0.7, 0.08, 0.7]} p={[0, 2.3, 3.1]} r={[Math.PI / 2, 0, 0]} m={M.clock} />
      {/* rails */}
      {[3.0, 3.8].map((z) => (
        <B key={z} s={[18, 0.08, 0.08]} p={[0, 0.12, z]} m={M.metal} shadow={false} />
      ))}
      {sleepers.map((x) => (
        <B key={x} s={[0.25, 0.08, 1.4]} p={[x, 0.05, 3.4]} m={M.timber} shadow={false} />
      ))}
      <Train />
      <Pine position={[-6.5, 0, -1.5]} />
      <Pine position={[6.8, 0, -2]} scale={0.8} />
    </>
  );
}

// ---------------------------------------------------------------- 2 University
function University() {
  const bell = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (bell.current) bell.current.rotation.z = Math.sin(clock.elapsedTime * 1.4) * 0.15;
  });
  return (
    <>
      <House w={10} d={5} h={4.6} roofH={3} wall={M.plasterSage} roofM={M.roofSlate} cols={5} door={false} peekRoof={3} />
      {/* bell tower */}
      <group position={[0, 0, 2.6]}>
        <B s={[2.4, 7.5, 2.2]} p={[0, 3.75, 0]} m={M.plaster} />
        <B s={[2.6, 0.5, 2.4]} p={[0, 0.25, 0]} m={M.stone} />
        <B s={[1.2, 2, 0.1]} p={[0, 1.2, 1.12]} m={M.timberLight} />
        <Win p={[0, 4.2, 1.11]} w={0.6} h={0.9} />
        <B geo={G.cyl} s={[1.1, 0.08, 1.1]} p={[0, 6.2, 1.12]} r={[Math.PI / 2, 0, 0]} m={M.clock} />
        <Part offset={[0, 3, 0]}>
          {[-1, 1].map((x) =>
            [-1, 1].map((z) => <B key={`${x}${z}`} s={[0.25, 1.8, 0.25]} p={[x * 1, 8.4, z * 0.9]} m={M.timber} />),
          )}
          <mesh ref={bell} geometry={G.cone} material={M.gold} scale={[0.9, 0.9, 0.9]} position={[0, 8.4, 0]} />
          <B geo={G.cone4} s={[3.6, 3.2, 3.4]} p={[0, 10.9, 0]} r={[0, Math.PI / 4, 0]} m={M.roofSlate} />
          <B geo={G.cone4} s={[2.2, 1.4, 2.1]} p={[0, 11.9, 0]} r={[0, Math.PI / 4, 0]} m={M.snow} />
          <B geo={G.cyl} s={[0.08, 1, 0.08]} p={[0, 13, 0]} m={M.gold} />
        </Part>
      </group>
      <B s={[3.4, 0.25, 1.6]} p={[0, 0.12, 4.4]} m={M.stone} />
      <Pine position={[-6.8, 0, 2]} scale={1.2} />
      <Pine position={[6.8, 0, 2.4]} scale={1.1} />
      <Bench position={[-3.5, 0, 4]} />
      <Bench position={[3.5, 0, 4]} />
    </>
  );
}

// ---------------------------------------------------------------- 3 Orchard
function AppleTree({ position, s = 1 }: { position: V3; s?: number }) {
  const apples = useMemo(() => {
    const r = Array.from({ length: 7 }, (_, i) => {
      const a = i * 2.4;
      return [Math.cos(a) * 0.8, 1.7 + Math.sin(i * 1.3) * 0.4, Math.sin(a) * 0.8] as V3;
    });
    return r;
  }, []);
  return (
    <group position={position} scale={s}>
      <B geo={G.cyl8} s={[0.28, 1.4, 0.28]} p={[0, 0.7, 0]} m={M.trunk} />
      <B geo={G.sphereLow} s={[2, 1.6, 2]} p={[0, 1.9, 0]} m={M.pine} />
      <B geo={G.sphereLow} s={[1.6, 0.7, 1.6]} p={[0, 2.5, 0]} m={M.snow} shadow={false} />
      {apples.map((p, i) => (
        <B key={i} geo={G.sphere} s={[0.2, 0.2, 0.2]} p={p} m={M.apple} shadow={false} />
      ))}
    </group>
  );
}

function RobotArm({ position }: { position: V3 }) {
  const base = useRef<THREE.Group>(null);
  const upper = useRef<THREE.Group>(null);
  const fore = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (base.current) base.current.rotation.y = Math.sin(t * 0.6) * 1.1;
    if (upper.current) upper.current.rotation.z = -0.5 + Math.sin(t * 1.2) * 0.25;
    if (fore.current) fore.current.rotation.z = 1.1 + Math.sin(t * 1.2 + 1) * 0.3;
  });
  return (
    <group position={position}>
      <B geo={G.cyl} s={[1, 0.4, 1]} p={[0, 0.2, 0]} m={M.darkMetal} />
      <group ref={base} position={[0, 0.4, 0]}>
        <Part offset={[0, 0.6, 0]}>
          <B geo={G.cyl} s={[0.6, 0.5, 0.6]} p={[0, 0.25, 0]} m={M.awningA} />
          <group ref={upper} position={[0, 0.5, 0]}>
            <Part offset={[0, 0.6, 0]}>
              <B s={[0.25, 1.6, 0.25]} p={[0, 0.8, 0]} m={M.awningB} />
              <group ref={fore} position={[0, 1.6, 0]}>
                <Part offset={[0.5, 0.5, 0]}>
                  <B geo={G.sphere} s={[0.32, 0.32, 0.32]} m={M.darkMetal} />
                  <B s={[0.2, 1.3, 0.2]} p={[0, 0.65, 0]} m={M.awningB} />
                  <B s={[0.35, 0.12, 0.35]} p={[0, 1.35, 0]} m={M.darkMetal} />
                  {[-0.1, 0.1].map((x) => (
                    <B key={x} s={[0.05, 0.3, 0.12]} p={[x, 1.52, 0]} m={M.metal} />
                  ))}
                </Part>
              </group>
            </Part>
          </group>
        </Part>
      </group>
    </group>
  );
}

function Orchard() {
  const trees: V3[] = [
    [3.6, 0, 1.2],
    [6, 0, 0],
    [3.8, 0, -1.8],
    [6.4, 0, -3],
    [8.4, 0, -1.2],
    [8.6, 0, 1.8],
  ];
  return (
    <>
      <House w={5} d={4.2} h={3} roofH={2.6} wall={M.barnRed} timber={false} chimney={false} cols={2} />
      {trees.map((p, i) => (
        <AppleTree key={i} position={p} s={0.85 + (i % 3) * 0.1} />
      ))}
      <RobotArm position={[5.2, 0, 2.8]} />
      <B geo={G.cyl8} s={[0.9, 0.5, 0.9]} p={[3.8, 0.25, 3.6]} m={M.wood} />
      {[0, 1, 2, 3].map((i) => (
        <B key={i} geo={G.sphere} s={[0.22, 0.22, 0.22]} p={[3.6 + (i % 2) * 0.3, 0.55, 3.5 + (i > 1 ? 0.25 : 0)]} m={M.apple} />
      ))}
      <Fence from={[2, 4.8]} to={[10, 4.8]} posts={6} />
    </>
  );
}

// ---------------------------------------------------------------- 4 Hangar
function Engine({ position }: { position: V3 }) {
  const fan = useSpin(4, "y");
  const nacelle = useMemo(() => new THREE.CylinderGeometry(1.15, 1.0, 2.6, 24, 1, true), []);
  const shell = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c4ccd4", metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide }),
    [],
  );
  return (
    <group position={position}>
      {/* stand */}
      <B s={[2.8, 0.25, 1.4]} p={[0, 0.12, 0]} m={M.darkMetal} />
      {[-1, 1].map((x) => (
        <B key={x} s={[0.2, 1, 0.2]} p={[x, 0.7, 0]} m={M.darkMetal} />
      ))}
      <group position={[0, 2.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Part offset={[-2.6, 0, 0]}>
          <mesh geometry={nacelle} material={shell} castShadow />
        </Part>
        {/* core stages */}
        {[0, 1, 2].map((i) => (
          <Part key={i} offset={[0.9 + i * 0.8, 0, 0]}>
            <B geo={G.cyl} s={[1.2 - i * 0.25, 0.7, 1.2 - i * 0.25]} p={[0, -0.6 + i * 0.6, 0]} m={i === 1 ? M.gold : M.darkMetal} />
          </Part>
        ))}
        <Part offset={[-1.2, 0, 0]}>
          <group ref={fan} position={[0, 1.15, 0]}>
            <B geo={G.cone} s={[0.6, 0.5, 0.6]} p={[0, 0.2, 0]} m={M.white} />
            {Array.from({ length: 14 }, (_, i) => (
              <group key={i} rotation={[0, -(i / 14) * Math.PI * 2, 0]}>
                <B s={[0.9, 0.04, 0.22]} p={[0.55, 0, 0]} r={[0.5, 0, 0]} m={M.darkMetal} shadow={false} />
              </group>
            ))}
          </group>
        </Part>
      </group>
    </group>
  );
}

function Hangar() {
  return (
    <>
      <House w={8} d={6} h={4} roofH={2.6} wall={M.plasterBlue} cols={3} door={false} />
      {/* big open doorway with warm light inside */}
      <B s={[3.6, 3.1, 0.1]} p={[0, 1.95, 3.02]} m={M.window} shadow={false} />
      <B s={[4, 0.25, 0.2]} p={[0, 3.6, 3.05]} m={M.timber} />
      <Engine position={[4.6, 0, 4.6]} />
      <B s={[0.9, 0.9, 0.9]} p={[-3.2, 0.45, 4.4]} m={M.wood} />
      <B s={[0.7, 0.7, 0.7]} p={[-2.9, 1.25, 4.2]} r={[0, 0.4, 0]} m={M.wood} />
      <SnowPile position={[-4.5, 0.15, 4]} />
      <Pine position={[-5.5, 0, -2.5]} />
    </>
  );
}

// ---------------------------------------------------------------- 5 Library
function FloatingBooks() {
  const ref = useRef<THREE.Group>(null);
  const amount = React.useContext(ExplodeContext);
  const books = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ a: (i / 12) * Math.PI * 2, y: 3.5 + (i % 4) * 1.3, m: M.book[i % 4] })),
    [],
  );
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const r = 4 + amount.current * 2.5;
    g.children.forEach((c, i) => {
      const b = books[i];
      const a = b.a + t * 0.25;
      c.position.set(Math.cos(a) * r, b.y + Math.sin(t * 1.3 + i) * 0.3, Math.sin(a) * r);
      c.rotation.set(Math.sin(t + i) * 0.3, -a, Math.sin(t * 0.7 + i) * 0.4);
    });
  });
  return (
    <group ref={ref}>
      {books.map((b, i) => (
        <group key={i}>
          <B s={[1.05, 1.4, 0.26]} m={b.m} shadow={false} />
          <B s={[0.96, 1.3, 0.28]} p={[0.04, 0, 0]} m={M.white} shadow={false} />
          <Glow position={[0, 0, 0]} size={1.8} opacity={0.4} />
        </group>
      ))}
    </group>
  );
}

function Library() {
  const towerWindows = useMemo(() => {
    const out: { p: V3; ry: number }[] = [];
    for (let f = 0; f < 3; f++)
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + f * 0.5;
        out.push({ p: [Math.sin(a) * 2.62, 2 + f * 2.4, Math.cos(a) * 2.62], ry: a });
      }
    return out;
  }, []);
  return (
    <>
      <B geo={G.cyl} s={[5.2, 8.5, 5.2]} p={[0, 4.25, 0]} m={M.plaster} />
      <B geo={G.cyl} s={[5.6, 0.8, 5.6]} p={[0, 0.4, 0]} m={M.stone} />
      {[2.9, 5.3, 7.7].map((y) => (
        <B key={y} geo={G.cyl} s={[5.32, 0.14, 5.32]} p={[0, y, 0]} m={M.timber} shadow={false} />
      ))}
      {towerWindows.map((w, i) => (
        <Win key={i} p={w.p} ry={w.ry} w={0.6} h={0.95} />
      ))}
      <B s={[1.1, 1.9, 0.2]} p={[0, 1.15, 2.55]} m={M.timberLight} />
      <Part offset={[0, 3, 0]}>
        <B geo={G.cone} s={[6.6, 4.6, 6.6]} p={[0, 10.8, 0]} m={M.roof} />
        <B geo={G.cone} s={[4.4, 2.4, 4.4]} p={[0, 11.9, 0]} m={M.snow} />
        <B geo={G.cyl} s={[0.08, 1.2, 0.08]} p={[0, 13.6, 0]} m={M.gold} />
      </Part>
      <FloatingBooks />
      <House w={3.6} d={3} h={2.4} roofH={1.6} wall={M.plasterWarm} position={[4.4, 0, 0.8]} cols={2} door={false} peekRoof={1.5} />
      <Bench position={[-2.8, 0, 3.6]} rotation={[0, 0.4, 0]} />
    </>
  );
}

// ---------------------------------------------------------------- 6 Lighthouse
function Lighthouse() {
  const beam = useSpin(0.9);
  const tower = useMemo(() => new THREE.CylinderGeometry(0.95, 1.5, 9, 20), []);
  // Red bands follow the taper: radius at height y (tower spans y = 0.4 … 9.4).
  const bands = useMemo(
    () =>
      [2.8, 5.8].map((yc) => {
        const r = (y: number) => 1.5 - ((y - 0.4) / 9) * 0.55 + 0.02;
        return { y: yc, geo: new THREE.CylinderGeometry(r(yc + 0.55), r(yc - 0.55), 1.1, 20) };
      }),
    [],
  );
  const beamGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(1.4, 16, 20, 1, true);
    g.rotateZ(Math.PI / 2);
    g.translate(8, 0, 0);
    return g;
  }, []);
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <B key={i} geo={G.sphereLow} s={[2.2, 1.2, 1.8]} p={[Math.cos(i * 1.3) * 1.6, 0.3, Math.sin(i * 1.3) * 1.6]} m={M.stoneDark} />
      ))}
      <mesh geometry={tower} material={M.white} position={[0, 4.9, 0]} castShadow receiveShadow />
      {bands.map((b) => (
        <mesh key={b.y} geometry={b.geo} material={M.red} position={[0, b.y, 0]} castShadow />
      ))}
      <Part offset={[0, 2.5, 0]}>
        <B geo={G.cyl} s={[2.6, 0.2, 2.6]} p={[0, 9.5, 0]} m={M.darkMetal} />
        <B geo={G.cyl} s={[1.6, 1.4, 1.6]} p={[0, 10.3, 0]} m={M.lanternOn} shadow={false} />
        <Glow position={[0, 10.3, 0]} size={4} opacity={0.7} />
        <B geo={G.cone} s={[2.1, 1.3, 2.1]} p={[0, 11.6, 0]} m={M.red} />
        <B geo={G.cone} s={[1.2, 0.6, 1.2]} p={[0, 11.95, 0]} m={M.snow} />
        <group ref={beam} position={[0, 10.3, 0]}>
          <mesh geometry={beamGeo} material={M.beam} />
        </group>
      </Part>
      <House w={3.4} d={2.8} h={2.2} roofH={1.5} wall={M.plasterBlue} position={[3.8, 0, 1.6]} rotation={[0, -0.4, 0]} cols={2} />
    </>
  );
}

// ---------------------------------------------------------------- 7 Town hall
function Scales({ position }: { position: V3 }) {
  const beam = useRef<THREE.Group>(null);
  const pans = useRef<THREE.Group[]>([]);
  useFrame(({ clock }) => {
    const a = Math.sin(clock.elapsedTime * 0.8) * 0.18;
    if (beam.current) beam.current.rotation.z = a;
    pans.current.forEach((p) => p && (p.rotation.z = -a));
  });
  return (
    <group position={position}>
      <B s={[1.4, 1, 1.4]} p={[0, 0.5, 0]} m={M.stone} />
      <B s={[1.5, 0.14, 1.5]} p={[0, 1.05, 0]} m={M.snow} />
      <B geo={G.cyl} s={[0.16, 2.6, 0.16]} p={[0, 2.3, 0]} m={M.gold} />
      <group ref={beam} position={[0, 3.5, 0]}>
        <B s={[2.6, 0.1, 0.1]} m={M.gold} />
        {[-1.25, 1.25].map((x, i) => (
          <group key={x} position={[x, 0, 0]} ref={(g) => { if (g) pans.current[i] = g; }}>
            <Part offset={[x * 0.6, 0.4, 0]}>
              <B s={[0.03, 0.9, 0.03]} p={[0, -0.45, 0]} m={M.gold} shadow={false} />
              <B geo={G.cyl} s={[0.8, 0.06, 0.8]} p={[0, -0.92, 0]} m={M.gold} />
            </Part>
          </group>
        ))}
      </group>
    </group>
  );
}

function ReasoningSteps() {
  const glows = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 1.6;
    glows.current?.children.forEach((c, i) => {
      const k = Math.max(0, Math.sin(t - i * 0.7));
      c.scale.setScalar(0.4 + k * 1.2);
    });
  });
  const steps: V3[] = [0, 1, 2, 3, 4].map((i) => [1.4 - (i % 2) * 0.6, 0.06, 7.2 - i * 0.95]);
  return (
    <>
      {steps.map((p, i) => (
        <B key={i} geo={G.cyl8} s={[0.6, 0.1, 0.6]} p={p} m={M.stone} shadow={false} />
      ))}
      <group ref={glows}>
        {steps.map((p, i) => (
          <Glow key={i} position={[p[0], 0.2, p[2]]} size={1} opacity={0.8} />
        ))}
      </group>
    </>
  );
}

function TownHall() {
  return (
    <>
      <House w={9.5} d={5} h={4.2} roofH={2.8} wall={M.plaster} cols={5} chimney={false} peekRoof={3} lights>
        <Part offset={[0, 4.5, 0]}>
          <group position={[0, 6.2, 0]}>
            <B s={[1.7, 2.6, 1.7]} p={[0, 1.3, 0]} m={M.plasterWarm} />
            <B geo={G.cyl} s={[1.1, 0.08, 1.1]} p={[0, 1.6, 0.86]} r={[Math.PI / 2, 0, 0]} m={M.clock} />
            <B geo={G.cone4} s={[2.6, 2.2, 2.6]} p={[0, 3.7, 0]} r={[0, Math.PI / 4, 0]} m={M.roofSlate} />
            <B geo={G.cone4} s={[1.4, 0.9, 1.4]} p={[0, 4.4, 0]} r={[0, Math.PI / 4, 0]} m={M.snow} />
          </group>
        </Part>
      </House>
      <Scales position={[-2.6, 0, 4.4]} />
      <ReasoningSteps />
      <Pine position={[6.4, 0, 1]} />
    </>
  );
}

// ---------------------------------------------------------------- 8 Windmill (skills)
function Windmill() {
  const sails = useSpin(0.7, "z");
  const body = useMemo(() => new THREE.CylinderGeometry(1.5, 2.4, 7, 8), []);
  return (
    <>
      <B s={[5.4, 0.6, 5.4]} p={[0, 0.3, 0]} m={M.stone} />
      <mesh geometry={body} material={M.plasterWarm} position={[0, 4.1, 0]} castShadow receiveShadow />
      <Win p={[0, 3.4, 2.05]} ry={0} w={0.55} h={0.8} />
      <B s={[1, 1.8, 0.2]} p={[0, 1.5, 2.3]} m={M.timberLight} />
      <Part offset={[0, 1.5, 2.5]}>
        <B geo={G.cone8} s={[3.6, 2.4, 3.6]} p={[0, 8.7, 0]} m={M.roof} />
        <B geo={G.cone8} s={[2.4, 1.2, 2.4]} p={[0, 9.3, 0]} m={M.snow} />
        <group ref={sails} position={[0, 7.8, 1.9]}>
          <B geo={G.cyl} s={[0.5, 0.6, 0.5]} r={[Math.PI / 2, 0, 0]} m={M.timber} />
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
              <B s={[0.18, 5.4, 0.12]} p={[0, 2.8, 0.25]} m={M.timber} />
              <B s={[1.1, 4.4, 0.04]} p={[0.62, 3.1, 0.3]} m={M.awningB} />
            </group>
          ))}
        </group>
      </Part>
      <House w={3.2} d={2.6} h={2} roofH={1.4} wall={M.plasterSage} position={[-4.2, 0, 1.2]} rotation={[0, 0.5, 0]} cols={1} />
      <Fence from={[2.8, 3.8]} to={[6.5, 1.5]} posts={4} />
    </>
  );
}

const crateColors = [M.awningA, M.banner, M.green, M.gold, M.bannerRed, M.awningC, M.barnRed];

// ---------------------------------------------------------------- 9 Market (side quests)
function Stall({ position, awning, rotation }: { position: V3; awning: THREE.Material; rotation?: V3 }) {
  return (
    <group position={position} rotation={rotation}>
      <B s={[2.6, 1, 1.2]} p={[0, 0.5, 0]} m={M.wood} />
      <B s={[2.7, 0.1, 1.3]} p={[0, 1.05, 0]} m={M.timberLight} />
      {[-1.2, 1.2].map((x) =>
        [-0.5, 0.5].map((z) => <B key={`${x}${z}`} s={[0.1, 2.4, 0.1]} p={[x, 1.2, z]} m={M.timber} />),
      )}
      {[0, 1, 2, 3, 4].map((i) => (
        <B key={i} s={[0.56, 0.08, 1.7]} p={[-1.12 + i * 0.56, 2.45, 0.2]} r={[0.25, 0, 0]} m={i % 2 ? M.awningB : awning} />
      ))}
      <B s={[2.8, 0.1, 1.7]} p={[0, 2.53, 0.2]} r={[0.25, 0, 0]} m={M.snow} shadow={false} />
      {[0, 1, 2].map((i) => (
        <B key={i} geo={i === 1 ? G.sphere : G.box} s={[0.4, 0.35, 0.4]} p={[-0.8 + i * 0.8, 1.28, 0.1]} m={crateColors[i + 2]} />
      ))}
    </group>
  );
}

function LightString({ from, to, n = 8 }: { from: V3; to: V3; n?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const k = i / (n - 1);
        const sag = Math.sin(k * Math.PI) * 0.5;
        const p: V3 = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k - sag, from[2] + (to[2] - from[2]) * k];
        return (
          <group key={i}>
            <B geo={G.sphere} s={[0.12, 0.12, 0.12]} p={p} m={M.lanternOn} shadow={false} />
            <Glow position={p} size={0.7} opacity={0.6} />
          </group>
        );
      })}
    </>
  );
}

function DecoratedTree({ position, scale = 1 }: { position: V3; scale?: number }) {
  const lights = useMemo(
    () => Array.from({ length: 14 }, (_, i) => [Math.cos(i * 2.3) * (1.2 - i * 0.07), 1.2 + i * 0.22, Math.sin(i * 2.3) * (1.2 - i * 0.07)] as V3),
    [],
  );
  return (
    <group position={position} scale={scale}>
      <Pine position={[0, 0, 0]} />
      {lights.map((p, i) => (
        <group key={i}>
          <B geo={G.sphere} s={[0.14, 0.14, 0.14]} p={p} m={i % 3 ? M.lanternOn : M.apple} shadow={false} />
        </group>
      ))}
      <B geo={G.sphere} s={[0.4, 0.4, 0.4]} p={[0, 4.6, 0]} m={M.gold} />
      <Glow position={[0, 4.6, 0]} size={1.6} />
    </group>
  );
}

function Market() {
  return (
    <>
      <Part offset={[-1.5, 0.8, 0]}>
        <Stall position={[-3, 0, 0]} awning={M.awningA} rotation={[0, 0.25, 0]} />
      </Part>
      <Part offset={[0, 0.8, -1]}>
        <Stall position={[0.2, 0, -0.8]} awning={M.awningC} />
      </Part>
      <Part offset={[1.5, 0.8, 0]}>
        <Stall position={[3.4, 0, 0]} awning={M.bannerRed} rotation={[0, -0.25, 0]} />
      </Part>
      <LightString from={[-4.2, 2.6, 0.8]} to={[0.2, 2.8, 0.2]} />
      <LightString from={[0.2, 2.8, 0.2]} to={[4.6, 2.6, 0.8]} />
      <DecoratedTree position={[0.4, 0, 3.4]} scale={0.8} />
      <House w={4} d={3.2} h={2.6} roofH={1.8} wall={M.plasterRose} position={[-1, 0, -4.4]} cols={2} lights />
    </>
  );
}

// ---------------------------------------------------------------- 10 MULTIPLAI guildhall
function Banner({ position, m }: { position: V3; m: THREE.Material }) {
  return (
    <group position={position}>
      <B s={[0.9, 0.06, 0.06]} p={[0, 0, 0]} m={M.timber} shadow={false} />
      <B s={[0.8, 1.8, 0.04]} p={[0, -0.95, 0.02]} m={m} shadow={false} />
      <B s={[0.8, 0.12, 0.05]} p={[0, -1.4, 0.03]} m={M.gold} shadow={false} />
    </group>
  );
}

function Guildhall() {
  const allLit = useTown((s) => s.visited.slice(0, LANTERN_COUNT).every(Boolean));
  const terraceH = 0.9;
  return (
    <>
      {/* stone terrace with steps */}
      <B s={[22, terraceH, 12]} p={[0, terraceH / 2, -1]} m={M.stone} />
      <B s={[22.2, 0.12, 12.2]} p={[0, terraceH + 0.02, -1]} m={M.snowShade} shadow={false} />
      {[0, 1, 2].map((i) => (
        <B key={i} s={[5, terraceH - i * 0.3, 0.6]} p={[0, (terraceH - i * 0.3) / 2, 5.2 + i * 0.6]} m={M.stone} />
      ))}
      <group position={[0, terraceH, -2]}>
        <House w={11} d={6.5} h={5.6} roofH={3.6} wall={M.plaster} roofM={M.roofSlate} cols={6} door={false} peekRoof={3.5} lights />
        <House w={5} d={5.5} h={4.2} roofH={2.6} wall={M.plasterWarm} position={[-8, 0, 0.3]} rotation={[0, Math.PI / 2, 0]} cols={3} door={false} />
        <House w={5} d={5.5} h={4.2} roofH={2.6} wall={M.plasterWarm} position={[8, 0, 0.3]} rotation={[0, -Math.PI / 2, 0]} cols={3} door={false} />
        {/* clock tower */}
        <group position={[0, 0, 3.7]}>
          <B s={[3, 11, 2.6]} p={[0, 5.5, 0]} m={M.plasterWarm} />
          {[3.6, 7.2].map((y) => (
            <B key={y} s={[3.1, 0.18, 2.7]} p={[0, y, 0]} m={M.timber} shadow={false} />
          ))}
          <B s={[1.6, 2.6, 0.12]} p={[0, 1.3, 1.31]} m={M.timberLight} />
          <B s={[1.9, 0.18, 0.2]} p={[0, 2.7, 1.34]} m={M.gold} />
          <Win p={[0, 5.3, 1.31]} w={0.8} h={1.3} />
          <B geo={G.cyl} s={[1.7, 0.1, 1.7]} p={[0, 9.1, 1.32]} r={[Math.PI / 2, 0, 0]} m={M.clock} />
          <Glow position={[0, 9.1, 1.6]} size={3} opacity={0.35} />
          <Part offset={[0, 4, 0]}>
            <B geo={G.cone4} s={[4.4, 5, 4]} p={[0, 13.5, 0]} r={[0, Math.PI / 4, 0]} m={M.roofSlate} />
            <B geo={G.cone4} s={[2.6, 2.2, 2.4]} p={[0, 15, 0]} r={[0, Math.PI / 4, 0]} m={M.snow} />
            <B geo={G.cyl} s={[0.1, 1.8, 0.1]} p={[0, 16.8, 0]} m={M.gold} />
            <B geo={G.sphere} s={[0.35, 0.35, 0.35]} p={[0, 17.7, 0]} m={M.gold} />
          </Part>
        </group>
        {[-4, -2, 2, 4].map((x, i) => (
          <Banner key={x} position={[x, 4.4, 3.3]} m={i % 2 ? M.bannerRed : M.banner} />
        ))}
      </group>
      {/* campfire square in front */}
      <B geo={G.cyl} s={[9, 0.08, 9]} p={[0, 0.04, 10.5]} m={M.road} shadow={false} />
      <Campfire position={[0, 0.08, 10.5]} size={1.6} lit={allLit} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = Math.PI * 0.15 + (i / 4) * Math.PI * 1.7 + Math.PI / 2;
        return <Bench key={i} position={[Math.cos(a) * 3.4, 0, 10.5 + Math.sin(a) * 3.4]} rotation={[0, -a + Math.PI / 2, 0]} />;
      })}
      <DecoratedTree position={[-9, terraceH, 3]} scale={1.2} />
      <Pine position={[12.5, 0, 1]} scale={1.3} />
      <Pine position={[-12.5, 0, -4]} scale={1.2} />
    </>
  );
}

// ---------------------------------------------------------------- 11 Mailbox + signpost
function Mailbox() {
  return (
    <>
      <group position={[0, 0, 0]}>
        <B s={[0.16, 1.1, 0.16]} p={[0, 0.55, 0]} m={M.timber} />
        <B s={[0.8, 0.9, 0.6]} p={[0, 1.5, 0]} m={M.red} />
        <B geo={G.prism} s={[0.95, 0.35, 0.7]} p={[0, 1.95, 0]} m={M.red} />
        <B s={[0.5, 0.06, 0.04]} p={[0, 1.65, 0.31]} m={M.darkMetal} />
        <B s={[0.9, 0.1, 0.7]} p={[0, 2.12, 0]} m={M.snow} />
      </group>
      <group position={[2.2, 0, 0.4]}>
        <B s={[0.16, 3, 0.16]} p={[0, 1.5, 0]} m={M.wood} />
        {[0, 1, 2].map((i) => (
          <B key={i} s={[1.6, 0.36, 0.08]} p={[0.5 - (i % 2), 2.6 - i * 0.55, 0]} r={[0, i * 0.6 - 0.6, 0]} m={M.timberLight} />
        ))}
      </group>
      <Campfire position={[-2, 0, 1.6]} size={0.6} light={false} />
    </>
  );
}

/** Station and SRH Berlin share the "Origins" stop; each keeps its own spot by the road. */
function Origins() {
  return (
    <>
      <group position={scenery.station.position} rotation={[0, scenery.station.rotY, 0]}>
        <Arrival />
      </group>
      <group position={scenery.university.position} rotation={[0, scenery.university.rotY, 0]}>
        <University />
      </group>
    </>
  );
}

export function Landmarks() {
  // Same order as lib/stops.ts.
  const items: { C: () => React.JSX.Element; free?: boolean }[] = [
    { C: Home },
    { C: Origins, free: true },
    { C: Orchard },
    { C: Hangar },
    { C: Library },
    { C: Lighthouse },
    { C: TownHall },
    { C: Windmill },
    { C: Guildhall },
    { C: Mailbox },
  ];
  return (
    <>
      {items.map(({ C, free }, i) => (
        <Landmark key={i} index={i} free={free}>
          <C />
        </Landmark>
      ))}
      {/* The market (side quests) stands by the road next to the windmill. */}
      <Landmark index={7} free>
        <group position={scenery.market.position} rotation={[0, scenery.market.rotY, 0]}>
          <Market />
        </group>
      </Landmark>
    </>
  );
}

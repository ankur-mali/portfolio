"use client";

import * as THREE from "three";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { roadCurve, seeded, TOWN_CENTER } from "./layout";
import { useTown } from "@/lib/town-store";

// Small signs of life: villagers strolling the road and birds circling over the roofs.

const coats = ["#7a2e35", "#2f4a6b", "#3d5a47", "#b0853f", "#5b4a6b", "#8e3b2f"];
const hats = ["#c0533f", "#e9e0cf", "#2f5d8a", "#9b2f3a", "#3f6f8f"];
const skins = ["#e2b99a", "#c68e6a", "#a8714d", "#8d5a3b", "#f0cdb0"];

function Villager({ seed, reducedMotion }: { seed: number; reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null);
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const cfg = useMemo(() => {
    const r = seeded(seed * 97 + 13);
    return {
      start: r(),
      speed: 0.9 + r() * 0.7, // metres per second
      dir: r() > 0.5 ? 1 : -1,
      side: (r() > 0.5 ? 1 : -1) * (0.35 + r() * 0.45),
      coat: new THREE.MeshStandardMaterial({ color: coats[Math.floor(r() * coats.length)], roughness: 0.9 }),
      hat: new THREE.MeshStandardMaterial({ color: hats[Math.floor(r() * hats.length)], roughness: 0.9 }),
      skin: new THREE.MeshStandardMaterial({ color: skins[Math.floor(r() * skins.length)], roughness: 0.7 }),
      scarf: new THREE.MeshStandardMaterial({ color: hats[Math.floor(r() * hats.length)], roughness: 0.9 }),
      boots: new THREE.MeshStandardMaterial({ color: "#3a2a20", roughness: 0.9 }),
      height: 0.9 + r() * 0.2,
    };
  }, [seed]);
  const geo = useMemo(
    () => ({
      body: new THREE.CapsuleGeometry(0.22, 0.42, 4, 10),
      head: new THREE.SphereGeometry(0.16, 14, 10),
      hat: new THREE.SphereGeometry(0.17, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      pom: new THREE.SphereGeometry(0.06, 8, 6),
      scarf: new THREE.TorusGeometry(0.15, 0.05, 6, 14),
      leg: new THREE.CylinderGeometry(0.06, 0.06, 0.32, 6),
    }),
    [],
  );
  const len = useMemo(() => roadCurve.getLength(), []);
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), s: new THREE.Vector3() }), []);

  useFrame(({ clock }) => {
    const g = root.current;
    if (!g) return;
    const time = reducedMotion ? 0 : clock.elapsedTime;
    // walk along the road and wrap around at its ends
    let u = (cfg.start + (cfg.dir * cfg.speed * time) / len) % 1;
    if (u < 0) u += 1;
    u = 0.04 + u * 0.92;
    roadCurve.getPointAt(u, tmp.p);
    roadCurve.getTangentAt(u, tmp.t);
    tmp.s.set(-tmp.t.z, 0, tmp.t.x).normalize();
    const step = Math.sin(time * cfg.speed * 7);
    g.position.copy(tmp.p).addScaledVector(tmp.s, cfg.side);
    g.position.y = Math.abs(step) * 0.04;
    g.rotation.y = Math.atan2(tmp.t.x * cfg.dir, tmp.t.z * cfg.dir);
    if (legL.current) legL.current.rotation.x = step * 0.5;
    if (legR.current) legR.current.rotation.x = -step * 0.5;
  });

  return (
    <group ref={root} scale={cfg.height}>
      <mesh ref={legL} geometry={geo.leg} material={cfg.boots} position={[-0.09, 0.16, 0]} castShadow />
      <mesh ref={legR} geometry={geo.leg} material={cfg.boots} position={[0.09, 0.16, 0]} castShadow />
      <mesh geometry={geo.body} material={cfg.coat} position={[0, 0.66, 0]} castShadow />
      <mesh geometry={geo.scarf} material={cfg.scarf} position={[0, 1.0, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={geo.head} material={cfg.skin} position={[0, 1.18, 0]} castShadow />
      <mesh geometry={geo.hat} material={cfg.hat} position={[0, 1.22, 0]} />
      <mesh geometry={geo.pom} material={cfg.scarf} position={[0, 1.4, 0]} />
    </group>
  );
}

/** Two small flocks circling over the town, wings flapping. */
function Birds({ count }: { count: number }) {
  const left = useRef<THREE.InstancedMesh>(null);
  const right = useRef<THREE.InstancedMesh>(null);
  const reducedMotion = useTown((s) => s.reducedMotion);
  const birds = useMemo(() => {
    const r = seeded(404);
    return Array.from({ length: count }, (_, i) => ({
      flock: i % 2,
      phase: r() * Math.PI * 2,
      // high and wide, so they read as distant flocks and never pass in front of a stop's camera
      radius: 70 + r() * 30,
      height: 52 + r() * 10,
      speed: 0.09 + r() * 0.03,
      flap: 7 + r() * 3,
      off: new THREE.Vector3((r() - 0.5) * 6, (r() - 0.5) * 3, (r() - 0.5) * 6),
    }));
  }, [count]);
  const wing = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.9, 0.3);
    g.translate(0.45, 0, 0); // hinge at the body
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3b3b45", side: THREE.DoubleSide, roughness: 1 }), []);
  const tmp = useMemo(
    () => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), one: new THREE.Vector3(1, 1, 1) }),
    [],
  );

  useLayoutEffect(() => {
    for (const r of [left, right]) r.current!.frustumCulled = false;
  }, []);

  useFrame(({ clock }) => {
    const time = reducedMotion ? 0 : clock.elapsedTime;
    birds.forEach((b, i) => {
      const dirSign = b.flock ? 1 : -1;
      const a = b.phase * 0.15 + (b.flock ? 0 : Math.PI) + time * b.speed * dirSign;
      tmp.p.set(
        TOWN_CENTER.x + Math.cos(a) * b.radius + b.off.x,
        b.height + Math.sin(time * 0.6 + b.phase) * 0.8 + b.off.y,
        TOWN_CENTER.z + Math.sin(a) * b.radius + b.off.z,
      );
      const heading = -a + (dirSign > 0 ? 0 : Math.PI);
      const flap = Math.sin(time * b.flap + b.phase) * 0.7;
      for (const [ref, side] of [[left, -1], [right, 1]] as const) {
        tmp.e.set(0, heading, side * flap, "YXZ");
        tmp.q.setFromEuler(tmp.e);
        tmp.m.compose(tmp.p, tmp.q, tmp.one);
        if (side < 0) tmp.m.multiply(new THREE.Matrix4().makeScale(-1, 1, 1));
        ref.current!.setMatrixAt(i, tmp.m);
      }
    });
    left.current!.instanceMatrix.needsUpdate = true;
    right.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={left} args={[wing, mat, birds.length]} />
      <instancedMesh ref={right} args={[wing, mat, birds.length]} />
    </>
  );
}

export function TownLife({ quality }: { quality: "high" | "low" }) {
  const reducedMotion = useTown((s) => s.reducedMotion);
  const villagers = quality === "high" ? 10 : 5;
  return (
    <>
      {Array.from({ length: villagers }, (_, i) => (
        <Villager key={i} seed={i + 1} reducedMotion={reducedMotion} />
      ))}
      <Birds count={quality === "high" ? 14 : 8} />
    </>
  );
}

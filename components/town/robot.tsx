"use client";

import * as THREE from "three";
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { M } from "./materials";
import { B, G, Glow } from "./parts";
import { anchorT, anchors, landmarks, roadCurve } from "./layout";
import { scrollState, useTown } from "@/lib/town-store";
import { stops } from "@/lib/stops";

/** Ember, the robot guide: floats along the road and comments on each stop. */
export function Robot() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const reducedMotion = useTown((s) => s.reducedMotion);

  const mats = useMemo(
    () => ({
      shell: new THREE.MeshStandardMaterial({ color: "#f3efe6", roughness: 0.45, metalness: 0.15 }),
      visor: new THREE.MeshStandardMaterial({ color: "#1d2433", roughness: 0.3, metalness: 0.4 }),
      eye: new THREE.MeshBasicMaterial({ color: "#7fe7ff", toneMapped: false }),
      scarf: new THREE.MeshStandardMaterial({ color: "#b8453a", roughness: 0.9 }),
    }),
    [],
  );

  const tmp = useMemo(() => ({ p: new THREE.Vector3(), side: new THREE.Vector3() }), []);

  useFrame(({ clock, camera }, dt) => {
    const g = root.current;
    if (!g) return;
    // Phones show the 2D Ember beside the card instead (see <GuideLine>).
    g.visible = window.innerWidth >= 768;
    const p = THREE.MathUtils.clamp(scrollState.progress, 0, stops.length - 1);
    const u = THREE.MathUtils.clamp(anchorT(p), 0, 1);
    roadCurve.getPoint(u, tmp.p);
    // wait a third of the way from the road toward the current landmark
    const i = Math.round(p);
    tmp.side.copy(landmarks[i].position).sub(anchors[i]).setY(0);
    const settle = 1 - Math.min(1, Math.abs(p - i) * 2.5);
    tmp.p.addScaledVector(tmp.side, 0.16 * settle);
    const t = clock.elapsedTime;
    const bob = reducedMotion ? 0 : Math.sin(t * 2.2) * 0.12;
    g.position.lerp(tmp.p.setY(1.4 + bob), 1 - Math.exp(-dt * 6));
    // look toward the camera, tilt into the direction of travel while moving
    const yaw = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, yaw, 5, dt);
    const moving = Math.abs(p - Math.round(p)) > 0.08;
    if (body.current) body.current.rotation.x = THREE.MathUtils.damp(body.current.rotation.x, moving ? 0.25 : 0, 4, dt);
  });

  return (
    <group ref={root} position={[-44, 1.4, 46]}>
      <group ref={body} scale={0.75}>
        {/* body */}
        <B geo={G.sphere} s={[1.1, 1.25, 1.1]} p={[0, 0, 0]} m={mats.shell} />
        <B geo={G.torus} s={[1.05, 1.05, 1.6]} p={[0, 0.42, 0]} r={[Math.PI / 2, 0, 0]} m={mats.scarf} />
        <B s={[0.22, 0.5, 0.12]} p={[0.25, 0.1, 0.5]} r={[0.2, 0, 0.1]} m={mats.scarf} />
        {/* head */}
        <group position={[0, 0.95, 0]}>
          <B geo={G.sphere} s={[0.95, 0.8, 0.9]} m={mats.shell} />
          <B geo={G.sphere} s={[0.72, 0.42, 0.3]} p={[0, 0.02, 0.33]} m={mats.visor} />
          {[-0.15, 0.15].map((x) => (
            <B key={x} geo={G.sphere} s={[0.11, 0.13, 0.05]} p={[x, 0.04, 0.48]} m={mats.eye} shadow={false} />
          ))}
          <B geo={G.cyl} s={[0.04, 0.4, 0.04]} p={[0, 0.55, 0]} m={M.darkMetal} />
          <B geo={G.sphere} s={[0.14, 0.14, 0.14]} p={[0, 0.78, 0]} m={M.lanternOn} shadow={false} />
          <Glow position={[0, 0.78, 0]} size={0.9} />
        </group>
        {/* arms */}
        {[-1, 1].map((sx) => (
          <B key={sx} geo={G.sphere} s={[0.22, 0.55, 0.22]} p={[sx * 0.6, -0.05, 0]} r={[0, 0, sx * 0.35]} m={mats.shell} />
        ))}
        {/* hover glow */}
        <Glow position={[0, -0.85, 0]} size={1.2} opacity={0.6} />
      </group>
    </group>
  );
}


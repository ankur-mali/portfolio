"use client";

import * as THREE from "three";
import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Environment } from "./environment";
import { Landmarks } from "./landmarks";
import { Robot } from "./robot";
import { TownLife } from "./life";
import { applyTextures } from "./textures";
import { INTRO_CAMERA, TOWN_CENTER, cameraPositionCurve, cameraTargetCurve } from "./layout";
import { scrollState, useTown } from "@/lib/town-store";
import { stops } from "@/lib/stops";

const LAST = stops.length - 1;

function CameraRig() {
  const camera = useThree((s) => s.camera);
  const entered = useTown((s) => s.entered);
  const reducedMotion = useTown((s) => s.reducedMotion);
  const pointer = useRef({ x: 0, y: 0 });
  const enteredAt = useRef<number | null>(null);
  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      look: TOWN_CENTER.clone(),
      want: new THREE.Vector3(),
      wantT: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    camera.position.copy(INTRO_CAMERA.position);
    camera.lookAt(INTRO_CAMERA.target);
  }, [camera]);

  // Shift the view so the landmark sits beside the info panel, not under it:
  // right of centre on desktop (panel on the left), above centre on phones (panel at the bottom).
  const size = useThree((s) => s.size);
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const { width: w, height: h } = size;
    // Portrait screens: widen the field of view so landmarks still fit across.
    const aspect = w / h;
    cam.fov = aspect < 1 ? 32 * Math.pow(1 / aspect, 0.62) : 32;
    if (w >= 1024) cam.setViewOffset(w, h, -w * 0.16, 0, w, h);
    else cam.setViewOffset(w, h, 0, h * 0.3, w, h);
    cam.updateProjectionMatrix();
    return () => {
      cam.clearViewOffset();
    };
  }, [camera, size]);

  useFrame(({ clock }, dt) => {
    const u = THREE.MathUtils.clamp(scrollState.progress / LAST, 0, 1);
    cameraPositionCurve.getPoint(u, tmp.pos);
    cameraTargetCurve.getPoint(u, tmp.tgt);

    // Before entering: a slow orbit of the whole town behind the loader.
    if (!entered) {
      const a = clock.elapsedTime * (reducedMotion ? 0 : 0.035);
      const r = Math.hypot(INTRO_CAMERA.position.x - TOWN_CENTER.x, INTRO_CAMERA.position.z - TOWN_CENTER.z);
      tmp.want.set(TOWN_CENTER.x + Math.cos(a + 0.8) * r, INTRO_CAMERA.position.y, TOWN_CENTER.z + Math.sin(a + 0.8) * r);
      tmp.wantT.copy(INTRO_CAMERA.target);
    } else {
      if (enteredAt.current === null) enteredAt.current = clock.elapsedTime;
      tmp.want.copy(tmp.pos);
      tmp.wantT.copy(tmp.tgt);
      if (!reducedMotion) {
        // gentle parallax
        tmp.want.x += pointer.current.x * 0.8;
        tmp.want.y -= pointer.current.y * 0.5;
      }
    }

    // Slow damping right after entering gives the swoop from the overview.
    const sinceEnter = enteredAt.current === null ? 0 : clock.elapsedTime - enteredAt.current;
    const lambda = reducedMotion
      ? 30
      : entered
        ? THREE.MathUtils.lerp(0.7, 3.2, THREE.MathUtils.smoothstep(sinceEnter, 0.5, 4))
        : 1.5;
    const s = 1 - Math.exp(-lambda * dt);
    camera.position.lerp(tmp.want, s);
    tmp.look.lerp(tmp.wantT, s);
    camera.lookAt(tmp.look);
  });
  return null;
}

function Ready() {
  const setReady = useTown((s) => s.setReady);
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) setReady();
  });
  return null;
}

export default function TownScene() {
  // Surfaces (plaster, stone, wood, cobbles, snow) before any building renders.
  useMemo(() => applyTextures(), []);
  const quality = useTown((s) => s.quality);
  const setQuality = useTown((s) => s.setQuality);
  const high = quality === "high";
  return (
    <Canvas
      shadows={high}
      dpr={high ? [1, 1.75] : [0.8, 1.1]}
      camera={{ fov: 32, near: 0.5, far: 600, position: INTRO_CAMERA.position.toArray() }}
      gl={{ antialias: high, powerPreference: "high-performance" }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setQuality("low")} flipflops={2} />
      <CameraRig />
      <Environment quality={quality} />
      <Landmarks />
      <TownLife quality={quality} />
      <Robot />
      <Ready />
      {high && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={0.55} luminanceThreshold={1} luminanceSmoothing={0.25} />
          <Vignette offset={0.25} darkness={0.55} />
        </EffectComposer>
      )}
    </Canvas>
  );
}

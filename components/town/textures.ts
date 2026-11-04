import * as THREE from "three";
import { M } from "./materials";

// Small procedural textures (drawn once on a canvas, nothing to download). They are
// greyscale and multiply the material colour, and double as bump maps for a bit of relief.

function canvas(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Deterministic random so textures look the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Lime plaster: soft mottling and a few hairline cracks. */
function plaster() {
  return canvas(256, (ctx, n) => {
    const r = rng(11);
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 900; i++) {
      const v = 215 + Math.floor(r() * 40);
      ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
      const s = 2 + r() * 14;
      ctx.beginPath();
      ctx.arc(r() * n, r() * n, s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(150,150,150,0.25)";
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 6; i++) {
      let x = r() * n;
      let y = r() * n;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 6; k++) {
        x += (r() - 0.5) * 18;
        y += r() * 12;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });
}

/** Rough fieldstone: irregular blocks with darker mortar. */
function stone() {
  return canvas(256, (ctx, n) => {
    const r = rng(23);
    ctx.fillStyle = "#8c8c8c";
    ctx.fillRect(0, 0, n, n);
    const rows = 7;
    for (let row = 0; row < rows; row++) {
      const y = (row / rows) * n;
      const h = n / rows;
      let x = row % 2 ? -18 : 0;
      while (x < n) {
        const w = 28 + r() * 36;
        const v = 175 + Math.floor(r() * 60);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 6);
        ctx.fill();
        x += w;
      }
    }
  });
}

/** Planked wood: long grain streaks and a few knots. */
function wood() {
  return canvas(256, (ctx, n) => {
    const r = rng(37);
    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 140; i++) {
      const v = 150 + Math.floor(r() * 90);
      ctx.strokeStyle = `rgba(${v},${v},${v},0.55)`;
      ctx.lineWidth = 0.6 + r() * 1.6;
      const y = r() * n;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(n * 0.3, y + (r() - 0.5) * 6, n * 0.7, y + (r() - 0.5) * 6, n, y);
      ctx.stroke();
    }
    for (let p = 1; p < 4; p++) {
      ctx.fillStyle = "rgba(90,90,90,0.5)";
      ctx.fillRect(0, (p / 4) * n, n, 1.5);
    }
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = "rgba(110,110,110,0.5)";
      ctx.beginPath();
      ctx.ellipse(r() * n, r() * n, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** Cobblestones dusted with snow, laid in arcs along the road. */
function cobbles() {
  return canvas(256, (ctx, n) => {
    const r = rng(53);
    ctx.fillStyle = "#6f6a64";
    ctx.fillRect(0, 0, n, n);
    const size = 22;
    for (let y = 0; y < n + size; y += size * 0.86) {
      const off = Math.floor(y / (size * 0.86)) % 2 ? size / 2 : 0;
      for (let x = -size; x < n + size; x += size) {
        const v = 150 + Math.floor(r() * 70);
        ctx.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
        ctx.beginPath();
        ctx.ellipse(x + off + (r() - 0.5) * 3, y + (r() - 0.5) * 3, size * 0.44, size * 0.38, r() * 0.6, 0, Math.PI * 2);
        ctx.fill();
        // a little snow caught on top of each stone
        ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.35})`;
        ctx.beginPath();
        ctx.ellipse(x + off - 2, y - 3, size * 0.25, size * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

/** Fresh snow: almost white, with soft drifts and tiny sparkles. */
function snow() {
  return canvas(256, (ctx, n) => {
    const r = rng(71);
    ctx.fillStyle = "#fbfbfb";
    ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 260; i++) {
      const v = 228 + Math.floor(r() * 22);
      ctx.fillStyle = `rgba(${v},${v},${v + 4},0.4)`;
      ctx.beginPath();
      ctx.ellipse(r() * n, r() * n, 6 + r() * 26, 3 + r() * 10, r() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fillRect(r() * n, r() * n, 1, 1);
    }
  });
}

/** Soft round puff for chimney smoke. */
export function makeSmokeTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
  g.addColorStop(0, "rgba(235,235,240,0.9)");
  g.addColorStop(0.5, "rgba(225,225,232,0.45)");
  g.addColorStop(1, "rgba(220,220,228,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

let applied = false;
export let roadTexture: THREE.Texture | null = null;

/** Give the shared materials their surfaces. Runs once, in the browser. */
export function applyTextures() {
  if (applied) return;
  applied = true;
  const tex = { plaster: plaster(), stone: stone(), wood: wood(), cobbles: cobbles(), snow: snow() };
  const set = (m: THREE.MeshStandardMaterial, t: THREE.Texture, repeat: number, bump: number) => {
    const map = t.clone();
    map.repeat.set(repeat, repeat);
    map.needsUpdate = true;
    m.map = map;
    m.bumpMap = map;
    m.bumpScale = bump;
    m.needsUpdate = true;
  };
  for (const m of [M.plaster, M.plasterWarm, M.plasterRose, M.plasterSage, M.plasterBlue, M.white, M.barnRed]) set(m, tex.plaster, 1.5, 0.6);
  for (const m of [M.stone, M.stoneDark]) set(m, tex.stone, 1, 1.2);
  for (const m of [M.wood, M.timber, M.timberLight, M.trunk]) set(m, tex.wood, 1, 0.8);
  for (const m of [M.snow, M.snowShade]) set(m, tex.snow, 6, 0.4);
  roadTexture = tex.cobbles;
  set(M.road, tex.cobbles, 1, 0.8);
}

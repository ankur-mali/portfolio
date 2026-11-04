import { MULTIPLAI_STOP, stops } from "./stops";

// Procedural ambient sound (no audio files): winter wind everywhere, a crackling
// fire near the campfires, and a soft warm chord around the MULTIPLAI square.

type Mix = { wind: number; fire: number; pad: number };

class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private wind: GainNode | null = null;
  private fire: GainNode | null = null;
  private pad: GainNode | null = null;
  private crackleTimer: number | null = null;

  start() {
    if (this.ctx) {
      void this.ctx.resume();
      this.fadeMaster(0.7);
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    // brown-noise wind through a slowly moving low-pass filter
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 500;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain).connect(lp.frequency);
    this.wind = ctx.createGain();
    this.wind.gain.value = 0.5;
    noise.connect(lp).connect(this.wind).connect(this.master);
    noise.start();
    lfo.start();

    // fire: short filtered noise pops at random intervals
    this.fire = ctx.createGain();
    this.fire.gain.value = 0;
    this.fire.connect(this.master);
    const pop = () => {
      if (!this.ctx || !this.fire) return;
      const c = this.ctx;
      const s = c.createBufferSource();
      const b = c.createBuffer(1, Math.floor(c.sampleRate * 0.03), c.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
      s.buffer = b;
      const bp = c.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1200 + Math.random() * 2500;
      const g = c.createGain();
      g.gain.value = 0.25 + Math.random() * 0.6;
      s.connect(bp).connect(g).connect(this.fire);
      s.start();
      this.crackleTimer = window.setTimeout(pop, 40 + Math.random() * 220);
    };
    pop();

    // pad: a quiet major chord with slow vibrato
    this.pad = ctx.createGain();
    this.pad.gain.value = 0;
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 900;
    padFilter.connect(this.pad).connect(this.master);
    [196, 246.94, 293.66, 392].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i % 2 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 4;
      const g = ctx.createGain();
      g.gain.value = 0.06;
      o.connect(g).connect(padFilter);
      o.start();
    });

    this.fadeMaster(0.7);
  }

  stop() {
    this.fadeMaster(0);
  }

  setMix({ wind, fire, pad }: Mix) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.wind?.gain.setTargetAtTime(wind, t, 0.4);
    this.fire?.gain.setTargetAtTime(fire, t, 0.4);
    this.pad?.gain.setTargetAtTime(pad, t, 0.8);
  }

  private fadeMaster(v: number) {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.6);
  }
}

export const ambient = typeof window === "undefined" ? null : new Ambient();

/** Sound mix for a given scroll position along the road. */
export function mixForProgress(p: number): Mix {
  const near = (c: number, w: number) => Math.max(0, 1 - Math.abs(p - c) / w);
  const ms = MULTIPLAI_STOP;
  const last = stops.length - 1;
  return {
    wind: 0.55 - near(ms, 1.5) * 0.25,
    fire: Math.max(near(0, 0.9) * 0.5, near(ms, 1.4) * 0.9, near(last, 1) * 0.4),
    pad: Math.max(near(ms, 1.2), near(last, 1) * 0.8) * 0.9,
  };
}

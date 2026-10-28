import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useScroll } from "framer-motion";
import { achievements } from "../../data/portfolio";
import { EASE } from "../../lib/asset";
import { smoother, worldTransform } from "../../lib/camera";
import { scrollToY } from "../../lib/scroll";
import { useLightbox } from "../kit/Lightbox";
import { T, buildRoom, cameraAt } from "./room";

const pad = (n) => String(n).padStart(2, "0");
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t) => 1 - (1 - t) ** 3;
const r3 = (n) => Math.round(n * 1000) / 1000;
const SAFE = "214,31,40"; // the safelight is red whatever the site accent is

function bezier(p0, p1, p2, p3, t) {
  const v = 1 - t;
  return [0, 1, 2].map((k) => v * v * v * p0[k] + 3 * v * v * t * p1[k] + 3 * v * t * t * p2[k] + t * t * t * p3[k]);
}

// The safelight buzzing on as the reader steps into the room: [progress, level].
const FLICKER = [
  [0, 0],
  [0.2, 0.75],
  [0.32, 0.08],
  [0.55, 0.9],
  [0.7, 0.25],
  [0.9, 1],
];
function flickerAt(s) {
  if (s <= 0) return 0;
  for (let i = 1; i < FLICKER.length; i++) {
    if (s < FLICKER[i][0]) return FLICKER[i - 1][1];
  }
  return 1;
}

// The room light clicking on, driven by the scroll so it plays both ways.
function roomLightAt(x) {
  if (x <= 0) return 0;
  if (x < 0.18) return 0.85;
  if (x < 0.3) return 0.15;
  if (x < 0.42) return 1;
  if (x < 0.5) return 0.55;
  return 1;
}

/** A flat panel placed in the world by its top-left corner. */
const at = (x, y, z, extra = "") => ({
  position: "absolute",
  left: 0,
  top: 0,
  transformOrigin: "0 0",
  transform: `translate3d(${x}px, ${y}px, ${z}px) ${extra}`,
});

/**
 * Recognition, developed. A darkroom under a red safelight: each achievement
 * is a batch of prints that comes up in its own tray as you scroll (shadows
 * first, then the mid-tones), is lifted out dripping, swings across and is
 * pegged to a drying line. When all ten are up the safelight goes off, the
 * room light clicks on and the colour comes back into every print along the
 * line. Click any print to see the photo in full.
 */
export default function Darkroom({ slides }) {
  const outer = useRef(null);
  const worldRef = useRef(null);
  const stageRef = useRef(null);
  const printRefs = useRef([]);
  const layerRefs = useRef([]);
  const shadowRefs = useRef([]);
  const pegRefs = useRef([]);
  const rippleRefs = useRef([]);
  const lightRefs = useRef({});
  const handRef = useRef(null);
  const flashRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { open } = useLightbox();
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const room = useMemo(() => buildRoom(size.w, size.h, slides, achievements.length), [size, slides]);
  const [view, setView] = useState({ batch: 0, count: 0 });
  const viewRef = useRef(view);
  const live = useInView(outer, { margin: "200px 0px 200px 0px" });
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });

  useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => setSize({ w: window.innerWidth, h: window.innerHeight }), 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!live) return undefined;
    const { prints, sched, revealStart, u } = room;
    const world = worldRef.current;
    const lights = lightRefs.current;
    const state = prints.map(() => ({ px: null, vx: 0, vz: 0, az: 0, ax: 0, wz: 0, wx: 0, splash: -1e9, entered: false, pegged: -1e9, was: false }));
    const cache = new Map();
    const set = (el, prop, value) => {
      if (!el) return;
      let c = cache.get(el);
      if (!c) cache.set(el, (c = {}));
      if (c[prop] !== value) {
        if (prop.startsWith("--")) el.style.setProperty(prop, value);
        else el.style[prop] = value;
        c[prop] = value;
      }
    };
    const cam = { yaw: 0, pitch: 0 };
    let raf;
    let prev = performance.now();

    const frame = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - prev) / 1000));
      prev = now;
      const time = now / 1000;
      const t = scrollYProgress.get() * room.total;

      // the camera, with a little of the pointer in it
      const c = cameraAt(room, t);
      cam.yaw += (pointer.current.x * 0.022 - cam.yaw) * Math.min(1, dt * 3);
      cam.pitch += (-pointer.current.y * 0.014 - cam.pitch) * Math.min(1, dt * 3);
      c.yaw += cam.yaw;
      c.pitch += cam.pitch;
      set(world, "transform", worldTransform(room, c));

      // light: the safelight (with a faint hum), then the room light at the end
      const rv = (t - revealStart) / T.reveal;
      const safe = flickerAt(t / (T.intro * 0.8)) * (1 - smoother(clamp01((rv - 0.1) / 0.14))) * (0.97 + 0.03 * Math.sin(time * 9));
      const white = roomLightAt((rv - 0.14) / 0.2);
      set(lights.safe, "opacity", String(r3(safe)));
      set(stageRef.current, "--safe", String(r3(safe)));
      set(lights.lens, "opacity", String(r3(0.25 + 0.75 * safe)));
      set(lights.white, "opacity", String(r3(white)));
      set(lights.bulb, "opacity", String(r3(0.15 + 0.85 * white)));
      set(lights.dark, "opacity", String(r3(0.9 - 0.75 * Math.max(safe * 0.7, white))));
      set(flashRef.current, "opacity", String(r3(0.16 * white * clamp01(1 - (rv - 0.24) / 0.16) * clamp01((rv - 0.14) / 0.02))));

      let developing = -1;
      let count = 0;
      prints.forEach((p, i) => {
        const s = sched[p.owner];
        const n = room.batches[p.owner].length;
        const enter = clamp01((t - (s.moveStart + 0.12 + p.k * 0.03)) / 0.17);
        const devLen = T.dev - 0.06 - (n - 1) * 0.025;
        const dev = clamp01((t - (s.devStart + p.k * 0.025)) / devLen);
        // the lifts are spread over the camera's tilt up to the line, so it follows them there
        const hangLen = n > 1 ? T.hang * 0.5 : T.hang * 0.85;
        const step = n > 1 ? (T.hang * 0.44) / (n - 1) : 0;
        const hang = clamp01((t - (s.hangStart + 0.02 + p.k * step)) / hangLen);
        const color = clamp01((rv - 0.3 - p.order * 0.035) / 0.2);
        if (dev > 0 && dev < 1) developing = p.owner;
        if (dev > 0.5) count++;
        const st = state[i];

        // where the print is: lying in its tray, or on its way to the line, or pegged
        let x;
        let y;
        let z;
        let rx;
        let rz = 0;
        let s3 = 0;
        if (hang <= 0) {
          const e = easeOut(enter);
          x = p.tray[0] + Math.sin(time * 1.1 + i) * u(0.0015) * e;
          y = p.tray[1] - u(0.24) * (1 - e);
          z = p.tray[2] - u(0.03) * (1 - e);
          rx = 90 - 22 * (1 - e);
          rz = (1 - e) * (p.k % 2 ? 9 : -9) + Math.sin(time * 0.8 + i * 2) * 0.6 * e;
          if (enter >= 1 && !st.entered) st.splash = now;
          st.entered = enter >= 1;
        } else {
          const s1 = clamp01(hang / 0.26);
          const s2 = clamp01((hang - 0.18) / 0.64);
          s3 = clamp01((hang - 0.8) / 0.2);
          const lift = [p.tray[0], p.tray[1] - u(0.2) * easeOut(s1), p.tray[2]];
          const above = [p.hang[0], p.hang[1] - u(0.06), p.hang[2]];
          const path = s2 > 0 ? bezier(lift, [lift[0], lift[1] - u(0.16), lift[2] - u(0.05)], [above[0], above[1] - u(0.14), above[2] + u(0.12)], above, smoother(s2)) : lift;
          x = path[0];
          y = path[1] + u(0.06) * smoother(s3);
          z = path[2];
          rx = 90 * (1 - smoother(s1));
          rz = p.rz0 * s3;
        }

        // a hanging print is a pendulum: it lags when it is carried, and swings when it stops
        const hangs = hang > 0 ? 1 - rx / 90 : 0;
        if (st.px) {
          const vx = (x - st.px[0]) / dt;
          const vz = (z - st.px[2]) / dt;
          const ax = Math.max(-9000, Math.min(9000, (vx - st.vx) / dt));
          const az = Math.max(-9000, Math.min(9000, (vz - st.vz) / dt));
          st.vx = vx;
          st.vz = vz;
          const L = p.H;
          const damp = s3 > 0.6 ? 5.5 : 3;
          const k = 42;
          st.wz += (-k * st.az - damp * st.wz + (ax / L) * hangs) * dt;
          st.az = Math.max(-0.5, Math.min(0.5, st.az + st.wz * dt));
          st.wx += (-k * st.ax - damp * st.wx - (az / L) * hangs) * dt;
          st.ax = Math.max(-0.5, Math.min(0.5, st.ax + st.wx * dt));
        }
        st.px = [x, y, z];
        const swingZ = (st.az * 180) / Math.PI;
        const swingX = (st.ax * 180) / Math.PI;
        // the moment it is pegged it starts to dry: drips for a few seconds
        if (s3 > 0.65 && !st.was) st.pegged = now;
        st.was = s3 > 0.65;

        const el = printRefs.current[i];
        set(el, "transform", `translate3d(${r3(x)}px, ${r3(y)}px, ${r3(z)}px) rotateX(${r3(rx + swingX)}deg) rotateZ(${r3(rz + swingZ)}deg)`);
        set(el, "opacity", String(r3(clamp01(enter * 5))));
        set(el, "pointerEvents", dev > 0.5 ? "auto" : "none");
        const btn = el?.firstElementChild;
        if (btn && btn.tabIndex !== (dev > 0.5 ? 0 : -1)) btn.tabIndex = dev > 0.5 ? 0 : -1;

        // developing: the shadows come up first, then the mid-tones; the colour only in white light
        const L = layerRefs.current[i];
        if (L) {
          set(L.a, "opacity", String(r3(smoother(clamp01(dev / 0.55)))));
          set(L.b, "opacity", String(r3(smoother(clamp01((dev - 0.38) / 0.62)))));
          set(L.c, "opacity", String(r3(smoother(color))));
          set(L.tint, "opacity", String(r3(0.5 * safe * (1 - color))));
          const sinceDry = (now - st.pegged) / 1000;
          const wet = hang <= 0 ? enter : st.was ? clamp01(1 - sinceDry / 4) : 1;
          set(L.sheen, "opacity", String(r3(wet * 0.7)));
          set(L.drip, "opacity", String(r3(hang > 0 ? wet * hangs : 0)));
        }

        const sh = shadowRefs.current[i];
        set(sh, "transform", `translate3d(${r3(p.hang[0] + u(0.012))}px, ${r3(p.hang[1] + u(0.022))}px, ${room.WZ + 2}px) rotateZ(${r3(rz + swingZ * 0.8)}deg)`);
        set(sh, "opacity", String(r3(s3 * (0.35 + 0.35 * white))));

        const peg = pegRefs.current[i];
        if (peg) {
          const shut = smoother(clamp01((s3 - 0.55) / 0.3));
          set(peg.l, "transform", `rotate(${r3(14 * (1 - shut))}deg)`);
          set(peg.r, "transform", `rotate(${r3(-14 * (1 - shut))}deg)`);
        }

        const ring = rippleRefs.current[i];
        if (ring) {
          const k = (now - st.splash) / 1600;
          set(ring, "opacity", String(k >= 0 && k < 1 && hang <= 0 ? r3((1 - k) * 0.8) : "0"));
          set(ring, "transform", `translate(-50%, -50%) scale(${r3(0.2 + 1.6 * clamp01(k))})`);
        }
      });

      // the darkroom timer sweeps round while a batch is in the developer
      if (handRef.current) {
        let sweep = 0;
        sched.forEach((s) => {
          sweep += clamp01((t - s.devStart) / T.dev);
        });
        set(handRef.current, "transform", `translate(-50%, -100%) rotate(${r3(sweep * 300)}deg)`);
      }
      room.trays.forEach((tr) => {
        const a = lights[`agitate${tr.b}`];
        set(a, "opacity", developing === tr.b ? "1" : "0");
      });

      // React only hears about the batch on screen and how many prints are up
      let batch = t < T.intro * 0.85 ? -1 : 0;
      sched.forEach((s, b) => {
        if (t >= s.moveStart + 0.12) batch = b;
      });
      if (rv > 0.3) batch = achievements.length;
      const v = viewRef.current;
      if (v.batch !== batch || v.count !== count) {
        viewRef.current = { batch, count };
        setView(viewRef.current);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [live, room, scrollYProgress]);

  const { P, WZ, LX, RIM, LIQ, prints, trays, lines, lamp, bulb, timer, enlarger, shelf, u } = room;
  const total = room.total;
  const goTo = (b) => {
    const top = outer.current.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + (room.sched[b].devStart + T.dev * 0.9) * window.innerHeight, { duration: 1.6 });
  };
  const onPointer = (e) => {
    pointer.current = { x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 };
  };

  // the room's planes
  const wallW = u(4.4);
  const wallH = u(1.75);
  const wallX = LX - wallW / 2;
  const wallY = u(-1.6);
  const benchW = u(3.6);
  const benchD = -u(0.05) - WZ;
  const benchX = LX - benchW / 2;
  const item = achievements[Math.max(0, Math.min(view.batch, achievements.length - 1))];
  const archive = view.batch >= achievements.length;

  return (
    <div ref={outer} className="relative" data-live={live} style={{ height: `${(total + 1) * 100}vh` }}>
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden bg-[#070404]" style={{ perspective: `${P}px`, "--safe": 0 }} onPointerMove={onPointer}>
        <div ref={worldRef} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
          {/* ---------- the back wall ---------- */}
          <div aria-hidden="true" style={{ ...at(wallX, wallY, WZ), width: wallW, height: wallH }} className="overflow-hidden bg-[#0d0807]">
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
                backgroundSize: `${u(0.07)}px ${u(0.07)}px`,
              }}
            />
            {/* the safelight's pool on the wall, and the cone it throws */}
            <div ref={(el) => (lightRefs.current.safe = el)} className="absolute inset-0" style={{ opacity: 0 }}>
              <div
                className="absolute"
                style={{
                  left: lamp[0] - wallX - u(1.1),
                  top: lamp[1] - wallY - u(0.4),
                  width: u(2.2),
                  height: u(1.9),
                  background: `radial-gradient(closest-side, rgba(${SAFE},0.42), rgba(${SAFE},0.12) 55%, transparent)`,
                }}
              />
              <div
                className="absolute"
                style={{
                  left: lamp[0] - wallX - u(0.7),
                  top: lamp[1] - wallY + u(0.03),
                  width: u(1.4),
                  height: u(1.2),
                  clipPath: "polygon(44% 0, 56% 0, 100% 100%, 0 100%)",
                  background: `linear-gradient(to bottom, rgba(${SAFE},0.28), rgba(${SAFE},0.06) 70%, transparent)`,
                }}
              />
            </div>
            {/* the room light, warm and even */}
            <div
              ref={(el) => (lightRefs.current.white = el)}
              className="absolute inset-0"
              style={{
                opacity: 0,
                background: `radial-gradient(60% 55% at ${((bulb[0] - wallX) / wallW) * 100 - 14}% 52%, rgba(255,236,214,0.3), rgba(255,226,200,0.1) 60%, transparent)`,
              }}
            />
          </div>

          {/* the safelight itself */}
          <div aria-hidden="true" style={{ ...at(lamp[0] - u(0.07), lamp[1] - u(0.035), lamp[2]), width: u(0.14), height: u(0.07) }}>
            <div className="absolute inset-0 rounded-[6px] bg-gradient-to-b from-[#2a2422] to-[#151110] shadow-[0_10px_30px_rgba(0,0,0,0.6)]" />
            <div className="absolute inset-[14%] rounded-[3px] bg-[#2a0707]" />
            <div
              ref={(el) => (lightRefs.current.lens = el)}
              className="absolute inset-[14%] rounded-[3px]"
              style={{ opacity: 0.25, background: `radial-gradient(circle at 50% 40%, #ff8d7a, rgb(${SAFE}) 55%, #5a0909)`, boxShadow: `0 0 ${u(0.05)}px rgba(${SAFE},0.9)` }}
            />
          </div>

          {/* the darkroom timer */}
          <div aria-hidden="true" style={{ ...at(timer[0] - u(0.065), timer[1] - u(0.065), timer[2]), width: u(0.13), height: u(0.13) }}>
            <div className="absolute inset-0 rounded-full border border-white/10 bg-[radial-gradient(circle_at_40%_35%,#221c1a,#0c0909)] shadow-[0_12px_30px_rgba(0,0,0,0.7)]" />
            {Array.from({ length: 12 }, (_, n) => (
              <span
                key={n}
                className="absolute left-1/2 top-1/2 block w-px origin-bottom"
                style={{ height: u(0.05), transform: `translate(-50%, -100%) rotate(${n * 30}deg)` }}
              >
                <span className="block h-[22%] w-full" style={{ background: `rgba(${SAFE},0.8)` }} />
              </span>
            ))}
            <span ref={handRef} className="absolute left-1/2 top-1/2 block w-[2px] origin-bottom rounded-full" style={{ height: u(0.048), background: "#ffb3a6", transform: "translate(-50%, -100%)" }} />
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb3a6]" />
          </div>

          {/* the enlarger: baseboard and easel on the bench, a column, the head on its arm */}
          {(() => {
            const [ex, , ez] = enlarger;
            const metal = "bg-gradient-to-r from-[#2c2523] via-[#463b37] to-[#1c1716]";
            return (
              <>
                <div aria-hidden="true" style={{ ...at(ex - u(0.17), -3, ez - u(0.14), "rotateX(90deg)"), width: u(0.34), height: u(0.32) }} className="rounded-[3px] bg-[#1b1412]" />
                <div aria-hidden="true" style={{ ...at(ex - u(0.11), -5, ez - u(0.02), "rotateX(90deg)"), width: u(0.22), height: u(0.16) }} className="overflow-hidden rounded-[2px] border-[3px] border-[#2a2321] bg-[#e6dfd4]">
                  <div className="absolute inset-0" style={{ background: `rgb(${SAFE})`, mixBlendMode: "multiply", opacity: "calc(var(--safe) * 0.6)" }} />
                </div>
                <div aria-hidden="true" style={{ ...at(ex - u(0.013), -u(0.8), ez - u(0.12)), width: u(0.026), height: u(0.8) }} className={`rounded-t-[3px] ${metal}`} />
                <div aria-hidden="true" style={{ ...at(ex - u(0.02), -u(0.6), ez - u(0.12)), width: u(0.04), height: u(0.03) }} className="rounded-[2px] bg-[#2c2523]" />
                {/* the head, a box: its side, its top, its face */}
                <div aria-hidden="true" style={{ ...at(ex - u(0.09), -u(0.66), ez - u(0.1), "rotateY(-90deg)"), width: u(0.16), height: u(0.13) }} className="rounded-[3px] bg-gradient-to-b from-[#3a302d] to-[#1e1817]" />
                <div aria-hidden="true" style={{ ...at(ex - u(0.09), -u(0.66), ez - u(0.1), "rotateX(90deg)"), width: u(0.18), height: u(0.16) }} className="rounded-[3px] bg-[#3a302d]" />
                <div aria-hidden="true" style={{ ...at(ex - u(0.09), -u(0.66), ez + u(0.06)), width: u(0.18), height: u(0.13) }} className="rounded-[4px] bg-gradient-to-b from-[#40352f] to-[#211a18] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="label absolute left-1/2 top-[38%] -translate-x-1/2 whitespace-nowrap text-[0.42rem] text-paper/30" style={{ letterSpacing: "0.3em" }}>
                    Enlarger
                  </span>
                </div>
                <div aria-hidden="true" style={{ ...at(ex - u(0.06), -u(0.53), ez + u(0.04)), width: u(0.12), height: u(0.13), clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)" }} className="bg-[repeating-linear-gradient(to_bottom,#151110_0_5px,#2a2220_5px_8px)]" />
                <div aria-hidden="true" style={{ ...at(ex - u(0.035), -u(0.4), ez + u(0.04)), width: u(0.07), height: u(0.03) }} className="rounded-b-[8px] bg-gradient-to-b from-[#26201e] to-[#0b0909]">
                  <span className="absolute inset-x-[30%] bottom-[18%] top-[30%] rounded-full" style={{ background: `radial-gradient(circle, rgba(${SAFE},0.5), transparent 70%)`, opacity: "var(--safe)" }} />
                </div>
              </>
            );
          })()}

          {/* a shelf of chemistry */}
          {(() => {
            const [sx, sy] = shelf;
            const bottles = [
              ["Developer", 0.15, 0.06, "#3a1d0d"],
              ["Stop bath", 0.12, 0.055, "#2d1709"],
              ["Fixer", 0.14, 0.06, "#3a1d0d"],
              ["", 0.09, 0.045, "#24120a"],
            ];
            let bx = sx + u(0.03);
            return (
              <>
                <div aria-hidden="true" style={{ ...at(sx, sy, WZ, "rotateX(90deg)"), width: u(0.5), height: u(0.09) }} className="bg-[#1d1513]" />
                <div aria-hidden="true" style={{ ...at(sx, sy, WZ + u(0.09)), width: u(0.5), height: u(0.014) }} className="bg-gradient-to-b from-[#2b201d] to-[#120c0b]" />
                {bottles.map(([label, bh, bw, glass], n) => {
                  const x = bx;
                  bx += u(bw) + u(0.035);
                  return (
                    <div key={n} aria-hidden="true" style={{ ...at(x, sy - u(bh), WZ + u(0.05)), width: u(bw), height: u(bh) }}>
                      <span className="absolute left-1/2 top-0 block h-[16%] w-[38%] -translate-x-1/2 rounded-t-[2px] bg-[#151010]" />
                      <span className="absolute inset-x-0 bottom-0 top-[14%] block rounded-t-[30%] rounded-b-[4px]" style={{ background: `linear-gradient(90deg, ${glass}, #6b3a1c 40%, ${glass})` }}>
                        <span className="absolute inset-y-[10%] left-[18%] block w-[10%] rounded-full bg-white/10" />
                        {label && (
                          <span className="label absolute inset-x-[10%] top-[38%] block bg-[#e4d8c2] py-[3px] text-center text-[0.36rem] text-[#3a2416]" style={{ letterSpacing: "0.12em" }}>
                            {label}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </>
            );
          })()}

          {/* ---------- the drying lines ---------- */}
          {lines.map((ln, li) => {
            const x0 = ln.x0;
            const top = ln.y - u(0.02);
            const wd = ln.x1 - ln.x0;
            const ht = ln.sag + u(0.04);
            const y0 = ln.y - top;
            return (
              <svg key={li} aria-hidden="true" width={wd} height={ht} viewBox={`0 0 ${wd} ${ht}`} style={{ ...at(x0, top, ln.z), overflow: "visible" }}>
                <path d={`M0 ${y0} Q${wd / 2} ${y0 + ln.sag * 2} ${wd} ${y0}`} fill="none" stroke="rgba(230,210,200,0.55)" strokeWidth="1.2" />
                <circle cx="0" cy={y0} r="3" fill="#3a3330" />
                <circle cx={wd} cy={y0} r="3" fill="#3a3330" />
              </svg>
            );
          })}

          {/* ---------- the bench and the trays ---------- */}
          <div aria-hidden="true" style={{ ...at(benchX, 0, WZ, "rotateX(90deg)"), width: benchW, height: benchD }} className="overflow-hidden bg-[#140c0a]">
            <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 23px)" }} />
            <div
              className="absolute inset-0"
              style={{ opacity: "var(--safe)", background: `radial-gradient(45% 80% at ${((lamp[0] - benchX) / benchW) * 100}% 0%, rgba(${SAFE},0.22), transparent 70%)` }}
            />
          </div>
          <div aria-hidden="true" style={{ ...at(benchX, 0, -u(0.05)), width: benchW, height: u(0.08) }} className="bg-gradient-to-b from-[#1c120f] to-[#070404]" />

          {trays.map((tr) => {
            const x0 = tr.x - tr.TW / 2;
            const z0 = tr.z - tr.TD / 2;
            const wall = (style, extra = null) => (
              <div aria-hidden="true" style={style} className="overflow-hidden bg-gradient-to-b from-[#d6cfc6] to-[#9e968c]">
                <div className="absolute inset-0" style={{ background: `rgb(${SAFE})`, mixBlendMode: "multiply", opacity: "calc(var(--safe) * 0.55)" }} />
                {extra}
              </div>
            );
            const list = room.batches[tr.b];
            return (
              <div key={tr.b} className="contents">
                <div aria-hidden="true" style={{ ...at(x0, -2, z0, "rotateX(90deg)"), width: tr.TW, height: tr.TD }} className="rounded-[4px] bg-[#8d867d]" />
                {/* the developer, with the batch lying just under its surface */}
                <div
                  aria-hidden="true"
                  style={{ ...at(x0 + 3, LIQ, z0 + 3, "rotateX(90deg)"), width: tr.TW - 6, height: tr.TD - 6 }}
                  className="overflow-hidden rounded-[3px]"
                >
                  <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, rgba(40,8,6,0.38), rgba(20,4,3,0.22))" }} />
                  <div className="absolute inset-y-0 -left-1/2 w-1/2 animate-[tray-sheen_7s_ease-in-out_infinite]" style={{ background: "linear-gradient(100deg, transparent, rgba(255,170,150,0.14), transparent)" }} />
                  <div ref={(el) => (lightRefs.current[`agitate${tr.b}`] = el)} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: 0 }}>
                    {[0, 1].map((n) => (
                      <span
                        key={n}
                        className="absolute left-1/2 top-1/2 block aspect-square w-1/2 rounded-full border animate-[tray-ring_3.2s_ease-out_infinite]"
                        style={{ borderColor: "rgba(255,150,130,0.25)", animationDelay: `${n * 1.6}s` }}
                      />
                    ))}
                  </div>
                  {list.map((p) => (
                    <span
                      key={p.i}
                      ref={(el) => (rippleRefs.current[p.i] = el)}
                      className="absolute block aspect-square rounded-full border"
                      style={{
                        left: p.tray[0] - (x0 + 3),
                        top: p.tray[2] + p.H / 2 - (z0 + 3),
                        width: p.W * 1.3,
                        borderColor: "rgba(255,170,150,0.55)",
                        opacity: 0,
                      }}
                    />
                  ))}
                </div>
                {wall({ ...at(x0, -RIM, z0), width: tr.TW, height: RIM })}
                {wall({ ...at(x0, -RIM, z0, "rotateY(-90deg)"), width: tr.TD, height: RIM })}
                {wall({ ...at(x0 + tr.TW, -RIM, z0, "rotateY(-90deg)"), width: tr.TD, height: RIM })}
                {wall(
                  { ...at(x0, -RIM, z0 + tr.TD), width: tr.TW, height: RIM },
                  <span
                    className="label absolute left-[8%] top-1/2 -translate-y-1/2 -rotate-1 whitespace-nowrap bg-[#e9dcc0] px-2 py-1 text-[0.5rem] text-[#2a1a12] shadow-sm"
                    style={{ letterSpacing: "0.16em" }}
                  >
                    {pad(tr.b + 1)} · {achievements[tr.b].short}
                  </span>
                )}
              </div>
            );
          })}

          {/* ---------- the prints ---------- */}
          {prints.map((p) => (
            <span
              key={`shadow-${p.i}`}
              ref={(el) => (shadowRefs.current[p.i] = el)}
              aria-hidden="true"
              className="absolute left-0 top-0 block rounded-[2px] bg-black"
              style={{ width: p.W, height: p.H, marginLeft: -p.W / 2, transformOrigin: "50% 0", opacity: 0, boxShadow: `0 0 ${u(0.025)}px ${u(0.008)}px rgba(0,0,0,0.9)` }}
            />
          ))}
          {prints.map((p) => {
            const s = slides[p.i];
            return (
              <div
                key={p.i}
                ref={(el) => (printRefs.current[p.i] = el)}
                className="absolute left-0 top-0"
                style={{ width: p.W, height: p.H, marginLeft: -p.W / 2, transformOrigin: "50% 0", opacity: 0, pointerEvents: "none" }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => open(slides, p.i)}
                  aria-label={`Open photo: ${s.alt}`}
                  className="group relative block h-full w-full rounded-[2px] bg-[#efe9df] shadow-[0_8px_22px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-cine hover:scale-[1.04] focus-visible:scale-[1.04]"
                  style={{ padding: p.m }}
                >
                  <span className="relative block h-full w-full overflow-hidden bg-[#f3eee6]">
                    {[
                      ["a", "grayscale(1) contrast(2.4) brightness(1.45)"],
                      ["b", "grayscale(1) contrast(1.1) brightness(0.97)"],
                      ["c", "none"],
                    ].map(([key, filter]) => (
                      <img
                        key={key}
                        ref={(el) => {
                          layerRefs.current[p.i] = { ...layerRefs.current[p.i], [key]: el };
                        }}
                        src={s.src}
                        alt=""
                        draggable={false}
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ filter, opacity: 0 }}
                      />
                    ))}
                    <span
                      ref={(el) => {
                        layerRefs.current[p.i] = { ...layerRefs.current[p.i], sheen: el };
                      }}
                      className="absolute inset-0 overflow-hidden"
                      style={{ opacity: 0 }}
                    >
                      <span className="absolute inset-y-0 -left-full w-full animate-[print-sheen_2.6s_ease-in-out_infinite]" style={{ background: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.32) 50%, transparent 80%)" }} />
                    </span>
                  </span>
                  {/* the safelight colours everything in the room, paper included */}
                  <span
                    ref={(el) => {
                      layerRefs.current[p.i] = { ...layerRefs.current[p.i], tint: el };
                    }}
                    className="pointer-events-none absolute inset-0 rounded-[2px]"
                    style={{ background: `rgb(${SAFE})`, mixBlendMode: "multiply", opacity: 0 }}
                  />
                  {/* drips off the bottom edge while it is still wet */}
                  <span
                    ref={(el) => {
                      layerRefs.current[p.i] = { ...layerRefs.current[p.i], drip: el };
                    }}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-full block"
                    style={{ opacity: 0 }}
                  >
                    {[0.3, 0.68].map((left, n) => (
                      <span
                        key={left}
                        className="absolute top-0 block h-[5px] w-[3px] rounded-full bg-[#f0d6cf]/70 animate-[print-drip_1.6s_ease-in_infinite]"
                        style={{ left: `${left * 100}%`, animationDelay: `${n * 0.7 + p.i * 0.13}s` }}
                      />
                    ))}
                  </span>
                </button>
              </div>
            );
          })}

          {/* pegs, waiting open on the line */}
          {prints.map((p) => (
            <span
              key={`peg-${p.i}`}
              aria-hidden="true"
              className="absolute left-0 top-0 block"
              style={{ ...at(p.wire[0] - u(0.006), p.wire[1] - u(0.012), p.wire[2] + 6), width: u(0.012), height: u(0.036) }}
            >
              {["l", "r"].map((side) => (
                <span
                  key={side}
                  ref={(el) => {
                    pegRefs.current[p.i] = { ...pegRefs.current[p.i], [side]: el };
                  }}
                  className={`absolute top-0 block h-full w-1/2 origin-top rounded-[2px] bg-gradient-to-b from-[#c9a27a] to-[#8a6a4b] ${side === "l" ? "left-0" : "right-0"}`}
                  style={{ transform: `rotate(${side === "l" ? 14 : -14}deg)` }}
                />
              ))}
              <span className="absolute inset-x-0 top-[38%] block h-[3px] rounded-full bg-[#9aa0a6]" />
            </span>
          ))}

          {/* the room light: a bare bulb on its cord */}
          <div aria-hidden="true" style={{ ...at(bulb[0] - u(0.03), bulb[1] - u(0.5), bulb[2]), width: u(0.06), height: u(0.56) }}>
            <span className="absolute left-1/2 top-0 block w-px -translate-x-1/2 bg-[#2b2522]" style={{ height: u(0.5) }} />
            <span className="absolute left-1/2 block -translate-x-1/2 rounded-[3px] bg-[#2b2522]" style={{ top: u(0.49), width: u(0.016), height: u(0.018) }} />
            <span
              ref={(el) => (lightRefs.current.bulb = el)}
              className="absolute left-1/2 block -translate-x-1/2 rounded-full"
              style={{
                top: u(0.505),
                width: u(0.042),
                height: u(0.05),
                opacity: 0.15,
                background: "radial-gradient(circle at 45% 40%, #fffaf0, #ffd9a6 45%, #b07a3c)",
                boxShadow: `0 0 ${u(0.06)}px ${u(0.02)}px rgba(255,220,170,0.7), 0 0 ${u(0.25)}px ${u(0.08)}px rgba(255,210,160,0.25)`,
              }}
            />
          </div>
        </div>

        {/* darkness that lifts as the lights come up */}
        <div ref={(el) => (lightRefs.current.dark = el)} aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 0.9, background: "radial-gradient(75% 70% at 55% 45%, rgba(7,4,4,0.35), #070404 90%)" }} />
        <div ref={flashRef} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#fff3e2]" style={{ opacity: 0 }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[46%] bg-gradient-to-r from-[#070404]/90 via-[#070404]/55 to-transparent" />

        {/* ---------- interface ---------- */}
        <div className="pointer-events-none absolute inset-0">
          <div className="container-x flex h-full flex-col justify-between pb-8 pt-24 md:pt-28">
            <div className="pointer-events-auto flex items-start justify-between gap-6">
              <ol className="flex flex-wrap gap-2">
                {achievements.map((a, b) => (
                  <li key={a.title}>
                    <button
                      type="button"
                      onClick={() => goTo(b)}
                      aria-current={b === view.batch ? "true" : undefined}
                      className={`label rounded-full border px-3.5 py-2 transition-colors duration-500 ${
                        b === view.batch ? "border-paper/60 bg-paper/10 text-paper" : "border-white/10 text-dim hover:text-mute"
                      }`}
                    >
                      {pad(b + 1)} <span className="ml-1 hidden md:inline">{a.short}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="label text-right text-dim">
                <p className="text-paper">
                  Prints {pad(view.count)} <span className="text-dim">/ {pad(slides.length)}</span>
                </p>
                <p className="mt-2">{archive ? "Click a print to see it" : "Scroll to develop"}</p>
              </div>
            </div>

            <div className="pointer-events-auto max-w-[min(30rem,34vw)]">
              <AnimatePresence mode="wait">
                {view.batch < 0 ? null : archive ? (
                  <motion.div key="archive" initial="hidden" animate="show" exit="exit" variants={notes}>
                    <motion.p variants={develop} className="label flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[#ffd9a6]" />
                      <span className="text-paper/80">Lights on</span>
                    </motion.p>
                    <motion.h3 variants={developTitle} className="display mt-4 text-[clamp(1.8rem,3.2vw,3.2rem)]">
                      The whole archive.
                    </motion.h3>
                    <motion.p variants={develop} className="mt-4 text-[0.92rem] leading-[1.6] text-mute">
                      {slides.length} prints from {achievements.length} recognitions, drying on the line. Click any of them to see the photograph in full.
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.div key={view.batch} initial="hidden" animate="show" exit="exit" variants={notes}>
                    <motion.p variants={develop} className="label flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ background: `rgb(${SAFE})`, boxShadow: `0 0 12px rgba(${SAFE},0.9)` }} />
                      <span className="text-accent-strong">{item.badge}</span>
                    </motion.p>
                    <span className="mt-3 block overflow-hidden pb-[0.1em]">
                      <motion.h3 variants={developTitle} className="display text-[clamp(1.6rem,2.9vw,2.9rem)]">
                        {item.title}
                      </motion.h3>
                    </span>
                    <motion.dl variants={develop} className="mt-4 grid grid-cols-3 border-t border-white/10 pt-3">
                      {[
                        ["Year", item.year],
                        ["Role", item.role],
                        ["Where", item.where],
                      ].map(([k, v], n) => (
                        <div key={k} className={n ? "border-l border-white/10 pl-3" : "pr-3"}>
                          <dt className="label text-[0.58rem] text-dim">{k}</dt>
                          <dd className="mt-1.5 text-[0.8rem] leading-snug text-paper/90">{v}</dd>
                        </div>
                      ))}
                    </motion.dl>
                    <motion.p variants={develop} className="mt-4 text-[0.9rem] leading-[1.6] text-mute [@media(max-height:820px)]:line-clamp-3">
                      {item.detail}
                    </motion.p>
                    <motion.p variants={develop} className="mt-3 border-l pl-4 text-[0.88rem] text-paper/85 [@media(max-height:780px)]:hidden" style={{ borderColor: `rgb(${SAFE})` }}>
                      {item.impact}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// The notes come up the way the prints do: out of the red, into focus.
const notes = {
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};
const develop = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
};
const developTitle = {
  hidden: { opacity: 0, y: 10, color: `rgb(${SAFE})` },
  show: { opacity: 1, y: 0, color: "rgb(239,237,233)", transition: { duration: 1.4, ease: EASE } },
};

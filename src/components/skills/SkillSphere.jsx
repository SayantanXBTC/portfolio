import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { foundations } from "../../data/portfolio";
import { useAccent } from "../../context/AccentContext";
import { useFinePointer } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { MiniIcon, tintFor } from "../kit/SkillIcon";

// Every skill once, in group order. Spread over a sphere with a Fibonacci
// lattice, consecutive skills sit on neighbouring latitudes, so each group
// forms its own band around the globe.
const ITEMS = foundations.flatMap((g, gi) => g.items.map((item) => ({ ...item, group: g.key, groupTitle: g.title, gi })));
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const POINTS = ITEMS.map((_, i) => {
  const y = 1 - (2 * (i + 0.5)) / ITEMS.length;
  const r = Math.sqrt(1 - y * y);
  const phi = i * GOLDEN;
  return [Math.cos(phi) * r, y, Math.sin(phi) * r];
});
const GROUP_Y = foundations.map((_, gi) => {
  const ys = POINTS.filter((_, i) => ITEMS[i].gi === gi).map((p) => p[1]);
  return ys.reduce((a, b) => a + b, 0) / ys.length;
});
const AUTO = 0.2; // radians per second when left alone
const PERSP = 2.7; // camera distance, in globe radii
const TAU = Math.PI * 2;

// the wireframe: latitudes and meridians, sampled once
const SEG = 48;
const WIRE = [
  ...[-0.66, -0.33, 0, 0.33, 0.66].map((y) => {
    const r = Math.sqrt(1 - y * y);
    return Array.from({ length: SEG + 1 }, (_, k) => [Math.cos((k / SEG) * TAU) * r, y, Math.sin((k / SEG) * TAU) * r]);
  }),
  ...Array.from({ length: 6 }, (_, m) => {
    const a = (m / 6) * Math.PI;
    return Array.from({ length: SEG + 1 }, (_, k) => {
      const t = (k / SEG) * TAU;
      return [Math.cos(t) * Math.cos(a), Math.sin(t), Math.cos(t) * Math.sin(a)];
    });
  }),
];

const hexToRgb = (hex) => {
  const v = parseInt(hex.slice(1), 16);
  return `${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}`;
};

/**
 * All the skills as a globe you can handle. It turns on its own; drag it (or
 * swipe sideways) to spin it with inertia, and it leans toward the pointer.
 * The skills of a group form a band: point at a skill or a group and the band
 * lights up and its skills are joined by lines. Click a skill and the globe
 * turns it to face you, then takes you to it.
 */
export default function SkillSphere({ onPick }) {
  const box = useRef(null);
  const canvas = useRef(null);
  const nodes = useRef([]);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { accent } = useAccent();
  const visible = useInView(box, { margin: "100px 0px 100px 0px" });
  const [size, setSize] = useState(380);
  const [hover, setHover] = useState(null); // index of the skill pointed at
  const [band, setBand] = useState(null); // group lit up
  const [picked, setPicked] = useState(null);
  const st = useRef({ ax: -0.3, ay: 0, vx: 0, vy: AUTO, drag: null, moved: 0, target: null, lx: 0, ly: 0, tlx: 0, tly: 0, hover: null, band: null, t: 0 });
  const proj = useRef(POINTS.map(() => [0, 0, 0]));

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setSize(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    st.current.hover = hover;
    st.current.band = band ?? (hover !== null ? ITEMS[hover].gi : null);
  }, [hover, band]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return undefined;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(size * dpr);
    cv.height = Math.round(size * dpr);
    const ctx = cv.getContext("2d");
    const R = size * 0.36;
    const c = size / 2;
    const glow = hexToRgb(accent.bright);
    // rotate a unit point by the globe's turn and tilt, then project with perspective
    const project = (x, y, z, ax, ay) => {
      const [sy, cy, sx, cx] = [Math.sin(ay), Math.cos(ay), Math.sin(ax), Math.cos(ax)];
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      const k = PERSP / (PERSP - z2);
      return [c + x1 * R * k, c + y2 * R * k, z2, k];
    };

    const draw = (ax, ay, t) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const lit = st.current.band;

      // wireframe: the far half faint, the near half brighter
      for (const near of [false, true]) {
        ctx.beginPath();
        WIRE.forEach((line) => {
          let pen = false;
          line.forEach(([x, y, z]) => {
            const [px, py, pz] = project(x, y, z, ax, ay);
            if (pz >= 0 === near) {
              if (pen) ctx.lineTo(px, py);
              else ctx.moveTo(px, py);
              pen = true;
            } else pen = false;
          });
        });
        ctx.strokeStyle = near ? "rgba(255,255,255,0.11)" : "rgba(255,255,255,0.035)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // the lit group's band, a ring at its latitude
      if (lit !== null) {
        const y = GROUP_Y[lit];
        const r = Math.sqrt(1 - y * y);
        for (const near of [false, true]) {
          ctx.beginPath();
          let pen = false;
          for (let k = 0; k <= SEG; k += 1) {
            const [px, py, pz] = project(Math.cos((k / SEG) * TAU) * r, y, Math.sin((k / SEG) * TAU) * r, ax, ay);
            if (pz >= 0 === near) {
              if (pen) ctx.lineTo(px, py);
              else ctx.moveTo(px, py);
              pen = true;
            } else pen = false;
          }
          ctx.strokeStyle = `rgba(${glow}, ${near ? 0.7 : 0.18})`;
          ctx.lineWidth = near ? 1.6 : 1;
          ctx.stroke();
        }
      }

      // a tilted orbit with three bright points riding it
      const inc = 1.15;
      const orbit = (u) => {
        const x = Math.cos(u) * 1.22;
        const z = Math.sin(u) * 1.22;
        return project(x, -z * Math.sin(inc) * 0.35, z * Math.cos(inc), ax * 0.3 + 0.35, 0.4);
      };
      for (const near of [false, true]) {
        ctx.beginPath();
        let pen = false;
        for (let k = 0; k <= 72; k += 1) {
          const [px, py, pz] = orbit((k / 72) * TAU);
          if (pz >= 0 === near) {
            if (pen) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
            pen = true;
          } else pen = false;
        }
        ctx.strokeStyle = `rgba(${glow}, ${near ? 0.35 : 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      for (let m = 0; m < 3; m += 1) {
        const [px, py, pz, k] = orbit(t * 0.5 + (m * TAU) / 3);
        const rad = (pz >= 0 ? 2.6 : 1.6) * k;
        const g = ctx.createRadialGradient(px, py, 0, px, py, rad * 5);
        g.addColorStop(0, `rgba(${glow}, ${pz >= 0 ? 0.9 : 0.35})`);
        g.addColorStop(1, `rgba(${glow}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, rad * 5, 0, TAU);
        ctx.fill();
      }

      // the lit group's skills, joined in a constellation
      if (lit !== null) {
        const idx = ITEMS.map((it, i) => (it.gi === lit ? i : -1)).filter((i) => i >= 0);
        ctx.lineWidth = 1.2;
        for (let a = 0; a < idx.length; a += 1) {
          for (let b = a + 1; b < idx.length; b += 1) {
            const p = proj.current[idx[a]];
            const q = proj.current[idx[b]];
            const depth = (p[2] + q[2] + 2) / 4;
            ctx.strokeStyle = `rgba(${glow}, ${0.12 + 0.55 * depth})`;
            ctx.beginPath();
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
            ctx.stroke();
          }
        }
      }
    };

    const place = () => {
      const s = st.current;
      const ax = s.ax + s.ly;
      const ay = s.ay + s.lx;
      POINTS.forEach(([x, y, z], i) => {
        const [px, py, pz, k] = project(x, y, z, ax, ay);
        proj.current[i] = [px, py, pz];
        const el = nodes.current[i];
        if (!el) return;
        const near = (pz + 1) / 2; // 0 far .. 1 near
        const on = s.hover === i;
        const inBand = s.band !== null && ITEMS[i].gi === s.band;
        el.style.transform = `translate3d(${px - c}px, ${py - c}px, 0) scale(${(0.62 + 0.38 * near) * k * (on ? 1.4 : inBand ? 1.12 : 1)})`;
        el.style.opacity = String(s.band !== null && !inBand ? 0.12 + 0.35 * near * near : 0.16 + 0.84 * near * near);
        el.style.zIndex = String(on ? 200 : Math.round(near * 100));
      });
      draw(ax, ay, s.t);
    };
    place();
    if (!visible || reduce) return undefined;

    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = st.current;
      s.t += dt;
      // lean toward the pointer
      s.lx += (s.tlx - s.lx) * Math.min(1, dt * 4);
      s.ly += (s.tly - s.ly) * Math.min(1, dt * 4);
      if (s.target && !s.target.hold) {
        // turn a chosen skill to face you
        const k = Math.min(1, dt * 5.5);
        s.ay += (s.target.ay - s.ay) * k;
        s.ax += (s.target.ax - s.ax) * k;
        s.vy = 0;
        s.vx = 0;
        if (Math.abs(s.target.ay - s.ay) < 0.004 && Math.abs(s.target.ax - s.ax) < 0.004) {
          const done = s.target.done;
          s.target = null;
          done?.();
        }
      } else if (!s.drag) {
        // ease back toward a slow idle spin, slower still while you look
        const idle = s.hover !== null || s.band !== null ? AUTO * 0.25 : AUTO;
        s.vy += (idle - s.vy) * Math.min(1, dt * 1.2);
        s.ay += s.vy * dt;
        if (s.target?.hold) {
          // a lit band tilts to face you while the globe keeps turning
          s.vx = 0;
          s.ax += (s.target.ax - s.ax) * Math.min(1, dt * 4);
        } else {
          s.vx += (0 - s.vx) * Math.min(1, dt * 2);
          s.ax = Math.max(-1.1, Math.min(1.1, s.ax + s.vx * dt));
        }
      }
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, reduce, size, accent.bright]);

  // the angles that bring a point to the centre of the near side, taking the shortest turn
  const faceTo = (x, y, z) => {
    const s = st.current;
    const r = Math.hypot(x, z);
    let ay = Math.atan2(-x, z);
    ay += Math.round((s.ay - ay) / TAU) * TAU;
    return { ay, ax: Math.max(-1.1, Math.min(1.1, Math.atan2(y, r))) };
  };

  const pick = (i) => {
    if (st.current.moved > 6) return;
    setPicked(i);
    st.current.target = {
      ...faceTo(...POINTS[i]),
      done: () => {
        setTimeout(() => {
          setPicked(null);
          onPick(ITEMS[i].group, ITEMS[i].name);
        }, 380);
      },
    };
  };

  const lightBand = (gi) => {
    setBand(gi);
    if (gi === null) {
      if (st.current.target?.hold) st.current.target = null;
      return;
    }
    const s = st.current;
    s.target = { ax: Math.max(-1.1, Math.min(1.1, Math.asin(GROUP_Y[gi]))), hold: true };
  };

  const onDown = (e) => {
    const s = st.current;
    s.drag = { x: e.clientX, y: e.clientY, t: performance.now() };
    s.moved = 0;
    if (!s.target?.hold) s.target = null;
  };
  const onMove = (e) => {
    const s = st.current;
    const r = box.current.getBoundingClientRect();
    if (fine && !reduce) {
      s.tlx = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
      s.tly = -((e.clientY - r.top) / r.height - 0.5) * 0.4;
    }
    const d = s.drag;
    if (!d) return;
    const now = performance.now();
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const dt = Math.max(1, now - d.t) / 1000;
    s.moved += Math.abs(dx) + Math.abs(dy);
    if (s.moved > 6 && !d.captured) {
      d.captured = true;
      s.target = null;
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    if (!d.captured) return;
    const k = 3 / size;
    s.ay += dx * k;
    s.ax = Math.max(-1.1, Math.min(1.1, s.ax - dy * k));
    s.vy = (dx * k) / dt;
    s.vx = (-dy * k) / dt;
    Object.assign(d, { x: e.clientX, y: e.clientY, t: now });
  };
  const onUp = () => {
    const s = st.current;
    s.drag = null;
    s.vy = Math.max(-7, Math.min(7, s.vy));
    s.vx = Math.max(-4, Math.min(4, s.vx));
  };
  const onLeave = () => {
    st.current.tlx = 0;
    st.current.tly = 0;
    setHover(null);
  };

  const iconSize = Math.round(Math.max(28, Math.min(44, size * 0.1)));
  const shown = picked ?? hover;
  const label = shown !== null ? ITEMS[shown] : band !== null ? { name: foundations[band].title, groupTitle: `${foundations[band].items.length} skills` } : null;

  return (
    <div className="relative mx-auto w-full max-w-[34rem]">
      <div
        ref={box}
        className="relative aspect-square w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onLeave}
        role="group"
        aria-label="All skills on a globe. Drag to spin; choose a skill to jump to it."
      >
        {/* the globe's body: an inner glow, a rim of light, and its shadow below */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[14%] rounded-full"
          style={{
            background: `radial-gradient(circle at 36% 30%, rgb(var(--accent-rgb) / 0.22), transparent 58%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03), transparent 70%)`,
            boxShadow: "inset 0 0 60px rgba(255,255,255,0.04), inset -18px -24px 60px rgba(0,0,0,0.5), 0 0 90px -20px rgb(var(--accent-rgb) / 0.45)",
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[20%] bottom-[3%] h-[7%] rounded-full" style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.85), transparent)" }} />
        <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />

        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          {ITEMS.map((item, i) => (
            <button
              key={item.name}
              ref={(el) => (nodes.current[i] = el)}
              type="button"
              aria-label={`${item.name} (${item.groupTitle})`}
              onClick={() => pick(i)}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              onFocus={() => setHover(i)}
              onBlur={() => setHover((h) => (h === i ? null : h))}
              className="absolute block will-change-transform"
              style={{ left: -iconSize / 2, top: -iconSize / 2, width: iconSize, height: iconSize }}
            >
              <span className="relative block h-full w-full">
                {(hover === i || picked === i) && (
                  <span
                    aria-hidden="true"
                    className="absolute -inset-[45%] rounded-full"
                    style={{ background: `radial-gradient(closest-side, ${tintFor(item)}88, transparent)` }}
                  />
                )}
                {picked === i && <span aria-hidden="true" className="sphere-ping absolute -inset-[20%] rounded-[30%] border-2" style={{ borderColor: tintFor(item) }} />}
                <MiniIcon item={item} size={iconSize} className="relative" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* what you are pointing at */}
      <div className="mt-1 flex h-10 items-center justify-center" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={label ? label.name : "hint"}
            className="label text-center"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {label ? (
              <>
                <span className="text-[0.8rem] text-paper">{label.name}</span> <span className="text-dim">· {label.groupTitle}</span>
              </>
            ) : (
              <span className="text-dim">{fine ? "Drag to spin · point at a skill · click to go to it" : "Swipe to spin · tap a skill"}</span>
            )}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* the groups as bands: point at one to light it up and turn it toward you */}
      <div className="mt-1 flex flex-wrap justify-center gap-1.5" onPointerLeave={() => fine && lightBand(null)}>
        {foundations.map((g, gi) => (
          <button
            key={g.key}
            type="button"
            onPointerEnter={() => fine && lightBand(gi)}
            onFocus={() => lightBand(gi)}
            onBlur={() => lightBand(null)}
            onClick={() => (fine ? onPick(g.key) : lightBand(band === gi ? null : gi))}
            aria-pressed={band === gi}
            className={`label rounded-full border px-2.5 py-1.5 text-[0.58rem] transition-colors duration-300 ${
              band === gi ? "border-accent-strong/70 bg-accent-strong/10 text-paper" : "border-white/10 text-dim hover:text-mute"
            }`}
          >
            {g.title}
          </button>
        ))}
      </div>
    </div>
  );
}

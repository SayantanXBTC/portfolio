import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { foundations, projects } from "../../data/portfolio";
import { useAccent } from "../../context/AccentContext";
import { useFinePointer } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { jumpToProject } from "../../lib/scroll";
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
// the sun, fixed in the room (x right, y down, z toward you): the globe turns through its light
const LIGHT = (() => {
  const v = [-0.45, -0.55, 0.7];
  const n = Math.hypot(...v);
  return v.map((c) => c / n);
})();

const hexToRgb = (hex) => {
  const v = parseInt(hex.slice(1), 16);
  return `${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}`;
};

// Which skills each Work project shipped with: its stack, matched to the globe
// by name ("React 18" is React, "Express.js" is Express). A few need saying outright.
const ALIAS = { Claude: "Claude API", "Claude Sonnet 4.6": "Claude API", InsightFace: "Computer vision", WebSockets: "Socket.io" };
const itemOf = (tech) => {
  const name = ALIAS[tech] ?? tech;
  let i = ITEMS.findIndex((it) => it.name === name);
  if (i < 0) i = ITEMS.findIndex((it) => name.startsWith(it.name) && /^[\s./]/.test(name.slice(it.name.length)));
  return i;
};
const ROUTES = projects.map((p) => ({
  slug: p.slug,
  title: p.title,
  color: p.color,
  rgb: hexToRgb(p.color),
  items: [...new Set(p.tech.map(itemOf).filter((i) => i >= 0))],
}));
const USED_IN = ITEMS.map((_, i) => ROUTES.map((r, k) => (r.items.includes(i) ? k : -1)).filter((k) => k >= 0));

// a quieter wireframe: three latitudes and four meridians, sampled once
const SEG = 48;
const WIRE = [
  ...[-0.5, 0, 0.5].map((y) => {
    const r = Math.sqrt(1 - y * y);
    return Array.from({ length: SEG + 1 }, (_, k) => [Math.cos((k / SEG) * TAU) * r, y, Math.sin((k / SEG) * TAU) * r]);
  }),
  ...Array.from({ length: 4 }, (_, m) => {
    const a = (m / 4) * Math.PI;
    return Array.from({ length: SEG + 1 }, (_, k) => {
      const t = (k / SEG) * TAU;
      return [Math.cos(t) * Math.cos(a), Math.sin(t), Math.cos(t) * Math.sin(a)];
    });
  }),
];

// A route between two skills: the great circle between them, lifted off the
// surface in the middle so it reads as a flight path rather than a seam.
const ARC_N = 36;
function arc(a, b, lift) {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const om = Math.acos(dot);
  const so = Math.sin(om) || 1;
  return Array.from({ length: ARC_N + 1 }, (_, k) => {
    const t = k / ARC_N;
    const wa = Math.sin((1 - t) * om) / so;
    const wb = Math.sin(t * om) / so;
    const h = 1 + lift * Math.sin(Math.PI * t);
    return [(a[0] * wa + b[0] * wb) * h, (a[1] * wa + b[1] * wb) * h, (a[2] * wa + b[2] * wb) * h];
  });
}
const ease3 = (t) => 1 - Math.pow(1 - t, 3);

/**
 * All the skills as a globe you can handle, lit by one fixed light so it has
 * a day side and a night side as it turns. Drag it (or swipe) to spin it
 * with inertia; it leans toward the pointer. The skills of a group form a
 * band. Point at a skill and routes fly to the skills it shipped with, each
 * in the colour of the Work project they built; point at a project and its
 * whole stack lights up as one route. Click a skill and the globe turns it to
 * face you, then takes you to it; click a project and you fly to its scene.
 */
export default function SkillSphere({ onPick }) {
  const box = useRef(null);
  const canvas = useRef(null);
  const tag = useRef(null);
  const nodes = useRef([]);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { accent } = useAccent();
  const visible = useInView(box, { margin: "100px 0px 100px 0px" });
  const [size, setSize] = useState(380);
  const [hover, setHover] = useState(null); // index of the skill pointed at
  const [band, setBand] = useState(null); // group lit up
  const [route, setRoute] = useState(null); // project lit up
  const [picked, setPicked] = useState(null);
  const st = useRef({ ax: -0.3, ay: 0, vx: 0, vy: AUTO, drag: null, moved: 0, target: null, lx: 0, ly: 0, tlx: 0, tly: 0, hover: null, band: null, route: null, links: [], arcs: [], arcT: 1, t: 0 });
  const proj = useRef(POINTS.map(() => [0, 0, 0]));

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setSize(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // what is lit, and the routes to draw for it
  useEffect(() => {
    const s = st.current;
    s.hover = hover;
    s.route = route;
    s.band = route !== null ? null : band ?? (hover !== null ? ITEMS[hover].gi : null);
    let arcs = [];
    let links = [];
    if (route !== null) {
      const r = ROUTES[route];
      links = r.items;
      arcs = r.items.slice(1).map((b, n) => ({ a: r.items[n], b, rgb: r.rgb, lift: 0.1 }));
    } else if (hover !== null) {
      USED_IN[hover].forEach((k, n) => {
        const r = ROUTES[k];
        r.items.forEach((b) => {
          if (b === hover) return;
          if (!links.includes(b)) links.push(b);
          arcs.push({ a: hover, b, rgb: r.rgb, lift: 0.08 + n * 0.035 });
        });
      });
    }
    s.links = links;
    s.arcs = arcs;
    s.arcT = 0;
  }, [hover, band, route]);

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
      return [c + x1 * R * k, c + y2 * R * k, z2, k, x1, y2];
    };
    const trace = (pts, near, ax, ay) => {
      let pen = false;
      for (const [x, y, z] of pts) {
        const [px, py, pz] = project(x, y, z, ax, ay);
        if (pz >= 0 === near) {
          if (pen) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
          pen = true;
        } else pen = false;
      }
    };

    const draw = (ax, ay, t) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const s = st.current;

      // wireframe: the far half faint, the near half a little brighter
      for (const near of [false, true]) {
        ctx.beginPath();
        WIRE.forEach((line) => trace(line, near, ax, ay));
        ctx.strokeStyle = near ? "rgba(255,255,255,0.075)" : "rgba(255,255,255,0.025)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // the lit group's band, a ring at its latitude
      if (s.band !== null) {
        const y = GROUP_Y[s.band];
        const r = Math.sqrt(1 - y * y);
        const ring = Array.from({ length: SEG + 1 }, (_, k) => [Math.cos((k / SEG) * TAU) * r, y, Math.sin((k / SEG) * TAU) * r]);
        for (const near of [false, true]) {
          ctx.beginPath();
          trace(ring, near, ax, ay);
          ctx.strokeStyle = `rgba(${glow}, ${near ? 0.7 : 0.18})`;
          ctx.lineWidth = near ? 1.6 : 1;
          ctx.stroke();
        }
      }

      // the routes: each draws itself in from its start, then a pulse of light travels it
      const prog = reduce ? 1 : ease3(s.arcT);
      s.arcs.forEach((ar, n) => {
        const pts = arc(POINTS[ar.a], POINTS[ar.b], ar.lift);
        const upto = Math.max(1, Math.round(prog * ARC_N));
        const seg = pts.slice(0, upto + 1);
        for (const near of [false, true]) {
          ctx.beginPath();
          trace(seg, near, ax, ay);
          ctx.strokeStyle = `rgba(${ar.rgb}, ${near ? 0.85 : 0.2})`;
          ctx.lineWidth = near ? 1.4 : 1;
          ctx.stroke();
        }
        // the head of the line while it draws; a pulse along it once it is there
        const at = prog < 1 ? upto : Math.round((((t * 0.28 + n * 0.17) % 1) + 1) % 1 * ARC_N);
        const [hx, hy, hz, hk] = project(...pts[at], ax, ay);
        if (hz >= 0 || prog < 1) {
          const rad = (prog < 1 ? 3 : 2.2) * hk;
          const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, rad * 4);
          g.addColorStop(0, `rgba(${ar.rgb}, 0.95)`);
          g.addColorStop(0.35, `rgba(${ar.rgb}, 0.45)`);
          g.addColorStop(1, `rgba(${ar.rgb}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(hx, hy, rad * 4, 0, TAU);
          ctx.fill();
        }
      });
    };

    const place = () => {
      const s = st.current;
      const ax = s.ax + s.ly;
      const ay = s.ay + s.lx;
      const focused = s.route !== null || s.band !== null || (s.hover !== null && s.links.length > 0);
      let hoverAt = null;
      POINTS.forEach(([x, y, z], i) => {
        const [px, py, pz, k, nx, ny] = project(x, y, z, ax, ay);
        proj.current[i] = [px, py, pz];
        const el = nodes.current[i];
        if (!el) return;
        const near = (pz + 1) / 2; // 0 far .. 1 near
        // day or night: how squarely this skill faces the light
        const lam = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + pz * LIGHT[2]);
        const light = 0.3 + 0.7 * Math.pow(lam, 0.8);
        const on = s.hover === i;
        const inFocus =
          s.route !== null ? ROUTES[s.route].items.includes(i) : s.band !== null ? ITEMS[i].gi === s.band : s.hover !== null ? on || s.links.includes(i) : true;
        const big = on ? 1.4 : focused && inFocus ? 1.12 : 1;
        el.style.transform = `translate3d(${px - c}px, ${py - c}px, 0) scale(${(0.62 + 0.38 * near) * k * big})`;
        el.style.opacity = String(on ? 1 : (focused && !inFocus ? 0.08 + 0.3 * near * near : 0.16 + 0.84 * near * near) * light);
        // ten depth bands, not a hundred: a stacking change makes the browser re-sort the whole globe
        const zi = String(on ? 200 : Math.round(near * 10));
        if (el.style.zIndex !== zi) el.style.zIndex = zi;
        if (on) hoverAt = [px, py, k];
      });
      // the name tag rides on the surface with the skill it names
      if (tag.current) {
        if (hoverAt) {
          tag.current.style.transform = `translate3d(${hoverAt[0]}px, ${hoverAt[1] - iconSize * 0.72 * hoverAt[2]}px, 0) translate(-50%, -100%)`;
          tag.current.style.opacity = "1";
        } else tag.current.style.opacity = "0";
      }
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
      s.arcT = Math.min(1, s.arcT + dt / 0.75);
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
        if (s.target?.hold === "face") {
          // a lit route turns to face you and holds still while you look
          s.vy = 0;
          s.vx = 0;
          s.ay += (s.target.ay - s.ay) * Math.min(1, dt * 4);
          s.ax += (s.target.ax - s.ax) * Math.min(1, dt * 4);
        } else {
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
      }
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, reduce, size, accent.bright]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const s = st.current;
    if (gi === null) {
      if (s.target?.hold === true) s.target = null;
      return;
    }
    s.target = { ax: Math.max(-1.1, Math.min(1.1, Math.asin(GROUP_Y[gi]))), hold: true };
  };

  // a project's stack turns to face you: the globe looks at the middle of its skills
  const lightRoute = (k) => {
    setRoute(k);
    const s = st.current;
    if (k === null) {
      if (s.target?.hold === "face") s.target = null;
      return;
    }
    const pts = ROUTES[k].items.map((i) => POINTS[i]);
    const m = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
    const len = Math.hypot(...m) || 1;
    s.target = { ...faceTo(m[0] / len, m[1] / len, m[2] / len), hold: "face" };
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
  const hovered = shown !== null ? ITEMS[shown] : null;
  const usedIn = useMemo(() => (shown !== null ? USED_IN[shown].map((k) => ROUTES[k]) : []), [shown]);
  const litProjects = route !== null ? [route] : shown !== null ? USED_IN[shown] : [];

  // the caption under the globe: the route, the skill and where it shipped, the band, or the hint
  let caption;
  if (route !== null) {
    const r = ROUTES[route];
    caption = (
      <>
        <span className="text-[0.8rem] text-paper">{r.title}</span>{" "}
        <span className="text-dim">
          · {r.items.length} of its stack here ·{" "}
          {fine ? (
            "click to open it in Work"
          ) : (
            <button type="button" onClick={() => jumpToProject(r.slug)} className="text-paper underline decoration-dotted underline-offset-4">
              open it in Work
            </button>
          )}
        </span>
      </>
    );
  } else if (hovered) {
    caption = (
      <>
        <span className="text-[0.8rem] text-paper">{hovered.name}</span>{" "}
        <span className="text-dim">{usedIn.length ? `· shipped in ${usedIn.map((r) => r.title).join(", ")}` : `· ${hovered.groupTitle}`}</span>
      </>
    );
  } else if (band !== null) {
    caption = (
      <>
        <span className="text-[0.8rem] text-paper">{foundations[band].title}</span> <span className="text-dim">· {foundations[band].items.length} skills</span>
      </>
    );
  } else {
    caption = <span className="text-dim">{fine ? "Drag to spin · point at a skill · click to go to it" : "Swipe to spin · tap a skill"}</span>;
  }
  const captionKey = route !== null ? `r${route}` : hovered ? hovered.name : band !== null ? `b${band}` : "hint";

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
        {/* the planet: lit from the upper left, dark on the far side, a limb of accent light where the sun catches its edge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[14%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 34% 28%, rgb(var(--accent-rgb) / 0.3), rgba(255,255,255,0.05) 38%, rgba(0,0,0,0) 60%), radial-gradient(circle at 74% 80%, rgba(0,0,0,0.8), transparent 62%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.025), transparent 70%)",
            boxShadow:
              "inset 8px 10px 50px rgba(255,255,255,0.05), inset -28px -34px 90px rgba(0,0,0,0.85), inset 0 0 36px rgb(var(--accent-rgb) / 0.22), 0 0 120px -24px rgb(var(--accent-rgb) / 0.55)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[14%] rounded-full border border-accent-strong/50"
          style={{ WebkitMaskImage: "linear-gradient(135deg, black 18%, transparent 62%)", maskImage: "linear-gradient(135deg, black 18%, transparent 62%)" }}
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

        {/* the name, pinned to the surface beside the skill pointed at */}
        <div
          ref={tag}
          aria-hidden="true"
          className="label pointer-events-none absolute left-0 top-0 z-[300] whitespace-nowrap rounded-full border border-white/10 bg-ink-800/90 px-2.5 py-1 text-[0.58rem] text-paper shadow-[0_10px_24px_-10px_rgba(0,0,0,0.9)] transition-opacity duration-200"
          style={{ opacity: 0 }}
        >
          {hovered ? hovered.name : ""}
        </div>
      </div>

      {/* what you are pointing at */}
      <div className="mt-1 flex h-10 items-center justify-center text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p key={captionKey} className="label" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease: EASE }}>
            {caption}
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

      {/* the projects as routes: point at one and its whole stack lights up; click to fly to it in Work */}
      <div className="mt-3 flex flex-wrap justify-center gap-1.5" onPointerLeave={() => fine && lightRoute(null)}>
        {ROUTES.map((r, k) => {
          const lit = litProjects.includes(k);
          return (
            <button
              key={r.slug}
              type="button"
              onPointerEnter={() => fine && lightRoute(k)}
              onFocus={() => lightRoute(k)}
              onBlur={() => lightRoute(null)}
              onClick={() => (fine ? jumpToProject(r.slug) : lightRoute(route === k ? null : k))}
              aria-pressed={route === k}
              aria-label={`${r.title}: light up its stack; open it in Work`}
              className={`label flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[0.58rem] transition-colors duration-300 ${lit ? "text-paper" : "border-white/10 text-dim hover:text-mute"}`}
              style={lit ? { borderColor: `${r.color}99`, background: `${r.color}1a` } : undefined}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.color, boxShadow: lit ? `0 0 10px ${r.color}` : "none" }} />
              {r.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

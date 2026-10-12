import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { achievements } from "../../data/portfolio";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { ClipReveal } from "../kit/Reveal";
import { useLightbox } from "../kit/Lightbox";

const pad = (n) => String(n).padStart(2, "0");

// Every photo from every achievement, in order, tagged with who it belongs to.
const SLIDES = achievements.flatMap((a, owner) =>
  a.images.map((img, k) => ({ ...img, owner, k, caption: { title: a.title, meta: `${a.badge} · Photo ${k + 1} of ${a.images.length}` } }))
);
const FIRST_OF = achievements.map((_, o) => SLIDES.findIndex((s) => s.owner === o));
const GAP = 36;
const FLOOR = 0.56; // the floor sits this many card-heights below the ring's centre
const SLAB_DEPTHS = [2, 4, 6, 8]; // a print's thickness, in px behind its face
const norm = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rand = (i, n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;

// Ring geometry from the viewport: card height, radius, perspective, angles.
function measure() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const cardH = Math.round(Math.max(110, Math.min(H * 0.25, W * (W < 640 ? 0.3 : 0.36), 280)));
  const widths = SLIDES.map((s) => (cardH * s.w) / s.h);
  const total = widths.reduce((sum, w) => sum + w + GAP, 0);
  const R = total / (2 * Math.PI);
  let acc = 0;
  const angles = widths.map((w) => {
    const a = ((acc + (w + GAP) / 2) / total) * 360;
    acc += w + GAP;
    return a;
  });
  // how far the front print steps out: less on small screens, and less for wide prints
  const reach = W < 640 ? 0.35 : W < 1024 ? 0.7 : 1;
  const steps = widths.map((w) => reach * clamp(1.2 - (w / cardH) * 0.4, 0.3, 1));
  return { cardH, widths, R, P: Math.max(1100, R * 3.1), angles, steps };
}

// Deterministic dust so every visit looks the same.
const DUST = Array.from({ length: 42 }, (_, i) => {
  const r = (n) => rand(i, n);
  return { left: r(1) * 100, top: 45 + r(2) * 55, size: 1 + r(3) * 2.4, dur: 9 + r(4) * 12, delay: -r(5) * 20, o: 0.25 + r(6) * 0.5 };
});

// Where each print flies when the archive scatters between achievements.
const SCATTER = SLIDES.map((_, i) => ({
  x: (rand(i, 11) - 0.5) * 1.8,
  y: -0.2 - rand(i, 12) * 1.6,
  z: (rand(i, 13) - 0.3) * 1.6,
  rx: (rand(i, 14) - 0.5) * 140,
  rz: (rand(i, 15) - 0.5) * 80,
}));

// Speed lines trailing a print: [top, thickness, length] (top and length in %).
const STREAKS = [
  [10, 1, 100],
  [27, 2, 70],
  [46, 1, 92],
  [63, 2, 58],
  [81, 1, 84],
];

/**
 * The colour of the light a photo gives off: an average that favours its
 * saturated, bright pixels, lifted to a usable brightness. Computed once.
 */
function lightOf(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = 24;
        c.height = 24;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, 24, 24);
        const d = ctx.getImageData(0, 0, 24, 24).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let w = 0;
        for (let i = 0; i < d.length; i += 4) {
          const max = Math.max(d[i], d[i + 1], d[i + 2]);
          const min = Math.min(d[i], d[i + 1], d[i + 2]);
          const sat = max ? (max - min) / max : 0;
          const wt = sat * sat * (max / 255) + 0.02;
          r += d[i] * wt;
          g += d[i + 1] * wt;
          b += d[i + 2] * wt;
          w += wt;
        }
        const k = 225 / Math.max(r / w, g / w, b / w, 1);
        resolve([(r / w) * k, (g / w) * k, (b / w) * k]);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Recognition, staged. Every photo is a printed card standing on one slowly
 * turning ring above a polished floor that mirrors it.
 *
 * - The ring answers speed: spin it hard and it stretches outward, the prints
 *   lean back against the turn and leave streaks of light; let go and it
 *   springs back with a wobble.
 * - The stage takes its light from the photo in front: the glow, the spotlight
 *   and the pool on the floor all shift to that photo's own colour.
 * - When the ring comes to rest, the front print steps out toward you and
 *   turns with the pointer. Choosing another achievement scatters the archive
 *   and gathers it again around the new one.
 *
 * Scrolling turns it, dragging spins it (with inertia), clicking a photo brings
 * it to the front, clicking the front photo opens it. The details of whichever
 * achievement is in front are always set out underneath.
 */
function Carousel() {
  const outer = useRef(null);
  const stage = useRef(null);
  const ring = useRef(null);
  const floor = useRef(null);
  const cards = useRef([]);
  const shades = useRef([]);
  const streaks = useRef([]);
  const mirrors = useRef([]);
  const { open: openLightbox } = useLightbox();
  const [geo, setGeo] = useState(measure);
  const [front, setFront] = useState(0);
  const seen = useInView(stage, { once: true, amount: 0.45 });
  const active = useInView(stage, { amount: 0 });

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const scroll = useSpring(scrollYProgress, { stiffness: 60, damping: 22, mass: 0.6 });
  const opening = useMotionValue(0);

  // mutable animation state, kept out of React to avoid re-rendering every frame
  const st = useRef({
    extra: 0,
    vel: 0,
    dragging: false,
    moved: 0,
    lastX: 0,
    tilt: -6,
    px: 0,
    py: 0,
    hover: false,
    front: 0,
    jump: null,
    lastRot: null,
    speed: 0, // deg/s, smoothed
    lean: 0, // springs, so they overshoot and wobble when the ring stops
    leanV: 0,
    flex: 0,
    flexV: 0,
    calm: 0, // seconds the ring has been (nearly) still
    lifts: SLIDES.map(() => 0),
    scatter: { v: 0 },
    colors: [],
    spill: null,
    ripple: { owner: 0, at: -1e9 },
  });

  useEffect(() => {
    const onResize = () => setGeo(measure());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // the entrance: cards fly out from the centre while the ring spins down
  useEffect(() => {
    if (!seen) return undefined;
    const c = animate(opening, 1, { duration: 2.6, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [seen, opening]);

  // each photo's light, worked out once the stage is first seen
  useEffect(() => {
    if (!seen) return undefined;
    let alive = true;
    Promise.all(SLIDES.map((s) => lightOf(s.src))).then((list) => {
      if (alive) st.current.colors = list;
    });
    return () => {
      alive = false;
    };
  }, [seen]);

  const rotation = useCallback(() => {
    const o = opening.get();
    return -scroll.get() * 360 + st.current.extra + Math.pow(1 - o, 3) * 480;
  }, [opening, scroll]);

  // the frame loop (only while the stage is on screen)
  useEffect(() => {
    if (!active) return undefined;
    let raf;
    let last = performance.now();
    // until the photos' own colours are known, the light is the site accent
    const accent = getComputedStyle(stage.current).getPropertyValue("--accent-rgb").trim().split(/\s+/).map(Number);

    const advance = (from) => {
      const i = (from + 1) % SLIDES.length;
      const delta = norm(-(geo.angles[i] + rotation()));
      st.current.jump = animate(0, 1, {
        duration: 1.6,
        ease: EASE,
        onUpdate: ((start) => (v) => (st.current.extra = start + delta * v))(st.current.extra),
        onComplete: () => (st.current.jump = null),
      });
    };

    const tick = (now) => {
      const dt = Math.max(0.001, Math.min(64, now - last) / 1000);
      last = now;
      const s = st.current;
      if (!s.dragging && !s.jump) {
        s.extra += s.vel * dt;
        s.vel *= Math.pow(0.04, dt); // inertia
      }
      s.tilt += (-6 + s.py * 5 - s.tilt) * Math.min(1, dt * 4);

      let rot = rotation();
      const o = opening.get();

      // once the throw has spent itself, the nearest print settles into the centre
      if (!s.dragging && !s.jump && Math.abs(s.vel) < 25 && Math.abs(scroll.getVelocity() * 360) < 4 && s.scatter.v < 0.01 && o > 0.98) {
        let near = 999;
        geo.angles.forEach((a) => {
          const r = norm(a + rot);
          if (Math.abs(r) < Math.abs(near)) near = r;
        });
        const pull = near * Math.min(1, dt * 3.2);
        s.extra -= pull;
        rot -= pull;
      }

      // how fast the ring is really turning, whatever is turning it
      const raw = s.lastRot === null ? 0 : (rot - s.lastRot) / dt;
      s.lastRot = rot;
      s.speed += (clamp(raw, -2400, 2400) - s.speed) * Math.min(1, dt * 10);
      const mag = Math.abs(s.speed);

      // springy lean and stretch: underdamped, so they settle with a wobble
      const spring = (key, target) => {
        const v = `${key}V`;
        s[v] += ((target - s[key]) * 90 - s[v] * 7) * dt;
        s[key] += s[v] * dt;
      };
      spring("lean", clamp(-s.speed * 0.03, -26, 26));
      spring("flex", Math.min(0.2, mag / 1500));

      const still = mag < 9 && !s.dragging && !s.jump && s.scatter.v < 0.01;
      s.calm = still ? s.calm + dt : 0;

      if (ring.current) ring.current.style.transform = `rotateX(${s.tilt}deg) rotateY(${rot}deg)`;
      if (floor.current) floor.current.style.transform = `rotateX(${s.tilt}deg)`;

      let best = 0;
      let bestAbs = 999;
      geo.angles.forEach((a, i) => {
        const abs = Math.abs(norm(a + rot));
        if (abs < bestAbs) {
          bestAbs = abs;
          best = i;
        }
      });

      const trail = clamp((mag - 50) / 450, 0, 1);
      const dir = s.speed >= 0 ? 1 : -1;
      const sc = s.scatter.v;
      const { owner: rOwner, at: rAt } = s.ripple;

      geo.angles.forEach((a, i) => {
        const el = cards.current[i];
        if (!el) return;
        const slide = SLIDES[i];
        const rel = norm(a + rot);
        const abs = Math.abs(rel);
        const oi = clamp(o * 1.6 - i * 0.05, 0, 1);
        const e = 1 - Math.pow(1 - oi, 3);
        const facing = Math.max(0, Math.cos((rel * Math.PI) / 180));
        const boost = Math.max(0, 1 - abs / 22);

        // the front print steps out once the ring is at rest
        const lift = (s.lifts[i] += ((i === best && s.calm > 0.35 ? 1 : 0) - s.lifts[i]) * Math.min(1, dt * 4.5));
        const out = lift * geo.steps[i];

        // a hop through the prints of an achievement as it arrives in front
        const t = (now - rAt) / 1000 - slide.k * 0.07;
        const hop = slide.owner === rOwner && t > 0 && t < 0.7 ? Math.sin((Math.PI * t) / 0.7) : 0;

        const v = SCATTER[i];
        const R = geo.R * e * (1 + s.flex);
        el.style.transform =
          `rotateY(${a}deg) translateZ(${R + boost * 70 + out * geo.cardH * 0.55}px) ` +
          `translateY(${-(hop * 0.1 + out * 0.06) * geo.cardH}px) ` +
          `rotateY(${s.lean + lift * s.px * 14}deg) rotateX(${-lift * s.py * 7}deg) ` +
          `translate3d(${v.x * geo.R * sc}px, ${v.y * geo.cardH * sc}px, ${v.z * geo.R * sc}px) ` +
          `rotateX(${v.rx * sc}deg) rotateZ(${v.rz * sc}deg) ` +
          `scale(${(0.55 + 0.45 * e + boost * 0.06) * (1 + out * 0.08)})`;
        el.style.opacity = String(e);
        el.style.setProperty("--lift", lift.toFixed(3));

        // light falls off away from the front (an overlay, cheaper than a filter)
        const shade = shades.current[i];
        if (shade) shade.style.opacity = String(clamp(0.8 * (1 - Math.pow(facing, 1.6)) + sc * 0.35, 0, 0.92));
        const mirror = mirrors.current[i];
        if (mirror) mirror.style.opacity = String(0.08 + 0.32 * Math.pow(facing, 2));

        const streak = streaks.current[i];
        if (streak) {
          const len = 0.25 + 1.3 * trail;
          streak.style.opacity = String(trail * (0.15 + 0.6 * facing));
          streak.style.transform = dir > 0 ? `translateZ(-1px) scaleX(${-len})` : `translateZ(-1px) translateX(${geo.widths[i]}px) scaleX(${len})`;
        }
      });

      // the stage light drifts to the colour of the photo in front
      const target = s.colors[best] ?? accent;
      if (!s.spill) s.spill = [...target];
      let moving = false;
      for (let c = 0; c < 3; c += 1) {
        const d = target[c] - s.spill[c];
        if (Math.abs(d) > 0.5) moving = true;
        s.spill[c] += d * Math.min(1, dt * 2.5);
      }
      if (moving || !s.spillSet) {
        stage.current?.style.setProperty("--spill", s.spill.map(Math.round).join(" "));
        s.spillSet = true;
      }

      // left alone, it shows the next print every few seconds
      if (!s.hover && s.calm > 4.5 && o > 0.98) {
        s.calm = 0;
        advance(best);
      }

      if (best !== s.front) {
        if (SLIDES[best].owner !== SLIDES[s.front].owner) s.ripple = { owner: SLIDES[best].owner, at: now };
        s.front = best;
        setFront(best);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, geo, rotation, opening, scroll]);

  // bring photo i to the front with a smooth spin
  const bringToFront = (i, duration = 1.2) => {
    const s = st.current;
    const delta = norm(-(geo.angles[i] + rotation()));
    s.vel = 0;
    s.jump?.stop();
    const from = s.extra;
    s.jump = animate(0, 1, {
      duration,
      ease: EASE,
      onUpdate: (v) => (s.extra = from + delta * v),
      onComplete: () => (s.jump = null),
    });
  };

  // another achievement: the prints scatter, the ring turns, they gather again
  const goTo = (o) => {
    const s = st.current;
    if (SLIDES[s.front].owner === o) {
      bringToFront(FIRST_OF[o]);
      return;
    }
    s.scatterAnim?.stop();
    s.scatterAnim = animate(s.scatter.v, [s.scatter.v, 1, 0], {
      duration: 1.7,
      times: [0, 0.42, 1],
      ease: [EASE, [0.34, 1.3, 0.64, 1]],
      onUpdate: (v) => (s.scatter.v = v),
    });
    bringToFront(FIRST_OF[o], 1.5);
  };

  // drag to spin
  const onDown = (e) => {
    const s = st.current;
    s.dragging = true;
    s.moved = 0;
    s.lastX = e.clientX;
    s.vel = 0;
    s.jump?.stop();
    s.jump = null;
  };
  const onMove = (e) => {
    const s = st.current;
    const r = stage.current.getBoundingClientRect();
    s.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    s.py = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    s.moved += Math.abs(dx);
    s.extra += dx * 0.22;
    s.vel = dx * 0.22 * 60;
  };
  const onUp = () => {
    st.current.dragging = false;
  };

  const onCardClick = (i) => {
    if (st.current.moved > 6) return; // it was a drag
    if (i === front) openLightbox(SLIDES, i);
    else bringToFront(i);
  };

  const slide = SLIDES[front];
  const owner = slide.owner;
  const item = achievements[owner];
  const own = SLIDES.map((s, i) => ({ ...s, i })).filter((s) => s.owner === owner);
  const floorY = geo.cardH * FLOOR;
  const spill = (a) => `rgb(var(--spill, var(--accent-rgb)) / ${a})`;

  return (
    <div ref={outer} style={{ height: "330vh" }}>
      <div
        ref={stage}
        className="carousel-stage touch-pan-y select-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={(e) => {
          onUp(e);
          st.current.hover = false;
          st.current.px = 0;
        }}
        onPointerEnter={() => (st.current.hover = true)}
      >
        {/* ---------- atmosphere ---------- */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {/* the glow behind the ring, in the colour of the photo in front */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(44% 38% at 50% 42%, ${spill(0.3)}, transparent 70%)`,
              animation: "glow-breathe 7s ease-in-out infinite",
            }}
          />
          <div
            className="absolute left-[2%] top-[6%] h-[52vmax] w-[52vmax] opacity-30"
            style={{ background: "radial-gradient(closest-side, rgb(var(--accent-soft-rgb) / 0.55), transparent)", animation: "orb-a 18s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[-4%] right-[0%] h-[44vmax] w-[44vmax] opacity-25"
            style={{ background: "radial-gradient(closest-side, rgb(var(--accent-rgb) / 0.45), transparent)", animation: "orb-b 22s ease-in-out infinite" }}
          />
          {/* spotlight from above, tinted by the same light */}
          <div
            className="absolute left-1/2 top-0 h-[72%] w-[46vmax] -translate-x-1/2"
            style={{
              clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
              background: `linear-gradient(to bottom, ${spill(0.22)}, ${spill(0.05)} 60%, transparent)`,
            }}
          />
          {/* rising dust */}
          {DUST.map((d, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-paper"
              style={{
                left: `${d.left}%`,
                top: `${d.top}%`,
                width: d.size,
                height: d.size,
                "--o": d.o,
                animation: `rise-dust ${d.dur}s linear ${d.delay}s infinite`,
              }}
            />
          ))}
          {/* the active entry's numeral, huge and hollow */}
          <AnimatePresence mode="wait">
            <motion.span
              key={owner}
              className="stroke-text display absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 select-none text-[34vmin] leading-none"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.09)" }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {pad(owner + 1)}
            </motion.span>
          </AnimatePresence>
          <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 42%, transparent 55%, rgba(0,0,0,0.85) 100%)" }} />
        </div>

        {/* ---------- the stage ---------- */}
        <div className="absolute inset-x-0 top-[33%] flex justify-center md:top-[37%]" style={{ perspective: geo.P, perspectiveOrigin: "50% 40%" }}>
          {/* the polished floor: it tilts with the ring but does not turn, so its light stays in front */}
          <div ref={floor} aria-hidden="true" className="pointer-events-none absolute h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
            <div
              className="absolute rounded-full"
              style={{
                width: geo.R * 4,
                height: geo.R * 4,
                left: -geo.R * 2,
                top: -geo.R * 2,
                transform: `translateY(${floorY}px) rotateX(90deg)`,
                background:
                  "radial-gradient(closest-side, rgba(255,255,255,0.06), rgba(255,255,255,0.025) 45%, transparent 75%), repeating-radial-gradient(circle, transparent 0 38px, rgba(255,255,255,0.025) 38px 39px)",
                opacity: seen ? 1 : 0,
                transition: "opacity 2s",
              }}
            />
            {/* the pool of light the front photo throws on the floor */}
            <div
              className="absolute rounded-full"
              style={{
                width: geo.cardH * 4.2,
                height: geo.R * 1.3,
                left: -geo.cardH * 2.1,
                top: -geo.R * 0.65,
                transform: `translate3d(0, ${floorY}px, ${geo.R * 0.9}px) rotateX(90deg)`,
                background: `radial-gradient(closest-side, ${spill(0.5)}, ${spill(0.14)} 55%, transparent)`,
                opacity: seen ? 1 : 0,
                transition: "opacity 2s",
              }}
            />
          </div>

          <div ref={ring} className="relative h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
            {/* orbit lines, drawn on the floor under the prints */}
            {[1.12, 1.32, 1.55].map((k, i) => (
              <div
                key={k}
                aria-hidden="true"
                className="absolute left-0 top-0"
                style={{ transform: `translateY(${floorY}px) rotateX(90deg)`, transformStyle: "preserve-3d" }}
              >
                <motion.div
                  className="rounded-full"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: seen ? 1 : 0, scale: seen ? 1 : 0.4 }}
                  transition={{ duration: 2, delay: 0.3 + i * 0.2, ease: EASE }}
                  style={{
                    width: geo.R * 2 * k,
                    height: geo.R * 2 * k,
                    marginLeft: -geo.R * k,
                    marginTop: -geo.R * k,
                    border: `1px ${i === 1 ? "dashed" : "solid"} rgb(var(--accent-strong-rgb) / ${0.32 - i * 0.08})`,
                    boxShadow: i === 0 ? "0 0 60px rgb(var(--accent-rgb) / 0.25), inset 0 0 60px rgb(var(--accent-rgb) / 0.18)" : "none",
                    animation: `orbit-spin ${60 + i * 30}s linear infinite ${i % 2 ? "reverse" : ""}`,
                  }}
                />
              </div>
            ))}

            {SLIDES.map((s, i) => {
              const W = geo.widths[i];
              const H = geo.cardH;
              const isFront = i === front;
              return (
                <div
                  key={s.src}
                  ref={(el) => (cards.current[i] = el)}
                  className="absolute"
                  style={{ width: W, height: H, left: -W / 2, top: -H / 2, opacity: 0, transformStyle: "preserve-3d", willChange: "transform" }}
                >
                  {/* speed lines trailing the print */}
                  <span
                    ref={(el) => (streaks.current[i] = el)}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 h-full"
                    style={{ width: W, transformOrigin: "0 50%", opacity: 0 }}
                  >
                    <span className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.07), transparent)" }} />
                    {STREAKS.map(([top, h, len]) => (
                      <span
                        key={top}
                        className="absolute left-0 rounded-full"
                        style={{ top: `${top}%`, height: h, width: `${len}%`, background: `linear-gradient(to right, ${spill(0.95)}, transparent)` }}
                      />
                    ))}
                  </span>

                  {/* the print's thickness */}
                  {SLAB_DEPTHS.map((d) => (
                    <span
                      key={d}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-[4px] border border-white/[0.07]"
                      style={{ transform: `translateZ(${-d}px)`, background: d === 8 ? "#0d0d0d" : "#1b1b1b" }}
                    />
                  ))}

                  {/* its reflection in the floor (moves down as the print lifts up) */}
                  <span
                    ref={(el) => (mirrors.current[i] = el)}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 w-full overflow-hidden rounded-[3px]"
                    style={{
                      top: H + 2 * (floorY - H / 2),
                      height: H,
                      opacity: 0,
                      transform: `translateY(calc(var(--lift, 0) * ${H * 0.12}px)) scaleY(-1)`,
                      WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 55%)",
                      maskImage: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 55%)",
                    }}
                  >
                    <img src={s.src} alt="" draggable={false} decoding="async" className="h-full w-full object-cover" />
                  </span>

                  {/* a small plaque that rises above the print when it steps out */}
                  <span
                    aria-hidden="true"
                    className="label pointer-events-none absolute bottom-full left-0 mb-2 hidden items-center sm:flex gap-1.5 whitespace-nowrap text-[0.42rem] text-paper/80"
                    style={{ opacity: "var(--lift, 0)", transform: "translateY(calc((1 - var(--lift, 0)) * 10px))" }}
                  >
                    <span className="h-1 w-1 rounded-full" style={{ background: spill(1) }} />
                    {pad(s.k + 1)} / {pad(achievements[s.owner].images.length)} · {achievements[s.owner].short}
                  </span>

                  <button
                    type="button"
                    onClick={() => onCardClick(i)}
                    aria-label={isFront ? `Open photo: ${s.alt}` : `Bring to front: ${s.alt}`}
                    className="group relative block h-full w-full overflow-hidden rounded-[3px] transition-shadow duration-700"
                    style={{
                      boxShadow: isFront
                        ? `0 0 0 1px rgba(255,255,255,0.28), 0 50px 100px -24px ${spill(0.6)}`
                        : "0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                  >
                    <img src={s.src} alt={s.alt} draggable={false} decoding="async" className="h-full w-full object-cover" />
                    {/* light from the stage along the top edge */}
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3" style={{ background: `linear-gradient(to bottom, ${spill(0.25)}, transparent)` }} />
                    {/* glass sheen */}
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-60" />
                    <span ref={(el) => (shades.current[i] = el)} className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0.8 }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- interface ---------- */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%] bg-gradient-to-t from-ink via-ink/85 to-transparent" />
        <div className="pointer-events-none absolute inset-0">
          <div className="container-x flex h-full flex-col justify-between pb-7 pt-24 md:pb-9 md:pt-28">
            {/* top row: index + counter */}
            <motion.div
              className="pointer-events-auto flex items-start justify-between gap-6"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: seen ? 1 : 0, y: seen ? 0 : -16 }}
              transition={{ duration: 1, delay: 1.2, ease: EASE }}
            >
              <ol className="flex flex-wrap gap-2">
                {achievements.map((a, o) => (
                  <li key={a.title}>
                    <button
                      type="button"
                      onClick={() => goTo(o)}
                      aria-current={o === owner ? "true" : undefined}
                      className={`label rounded-full border px-3.5 py-2 transition-colors duration-500 ${
                        o === owner ? "border-paper/60 bg-paper/10 text-paper" : "border-white/10 text-dim hover:text-mute"
                      }`}
                    >
                      {pad(o + 1)} <span className="ml-1 hidden md:inline">{a.short}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="label hidden text-right text-dim sm:block">
                <p className="text-paper">
                  Photo {pad(front + 1)} <span className="text-dim">/ {pad(SLIDES.length)}</span>
                </p>
                <p className="mt-2">Scroll · drag · click</p>
              </div>
            </motion.div>

            {/* bottom: the full record of the achievement in front, always on screen */}
            <div className="pointer-events-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={owner}
                  className="grid gap-4 md:grid-cols-12 md:items-end md:gap-10"
                  initial="hidden"
                  animate={seen ? "show" : "hidden"}
                  exit="exit"
                  variants={{
                    show: { transition: { staggerChildren: 0.07, delayChildren: seen ? 0.1 : 1.4 } },
                    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
                  }}
                >
                  <div className="md:col-span-5">
                    <motion.p
                      className="label flex items-center gap-3"
                      variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } } }}
                    >
                      <span className="h-2 w-2 rounded-full transition-colors duration-700" style={{ background: spill(1), boxShadow: `0 0 12px ${spill(0.9)}` }} />
                      <span className="text-accent-strong">{item.badge}</span>
                    </motion.p>
                    <span className="mt-3 block overflow-hidden pb-[0.1em]">
                      <motion.h3
                        className="display text-[clamp(1.6rem,3.2vw,3.2rem)]"
                        variants={{ hidden: { y: "110%" }, show: { y: 0, transition: { duration: 1, ease: EASE } } }}
                      >
                        {item.title}
                      </motion.h3>
                    </span>
                    {/* the facts, set out like a placard */}
                    <motion.dl
                      className="mt-4 grid grid-cols-3 border-t border-white/10 pt-3"
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}
                    >
                      {[
                        ["Year", item.year],
                        ["Role", item.role],
                        ["Where", item.where],
                      ].map(([k, v], n) => (
                        <div key={k} className={n ? "border-l border-white/10 pl-3 md:pl-4" : "pr-3"}>
                          <dt className="label text-[0.58rem] text-dim">{k}</dt>
                          <dd className="mt-1.5 text-[0.78rem] leading-snug text-paper/90 md:text-[0.85rem]">{v}</dd>
                        </div>
                      ))}
                    </motion.dl>
                  </div>
                  <div className="md:col-span-6 md:col-start-7">
                    <motion.p
                      className="line-clamp-3 text-[0.8rem] leading-[1.6] text-mute md:line-clamp-none md:text-[0.92rem]"
                      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}
                    >
                      {item.detail}
                    </motion.p>
                    <motion.p
                      className="mt-3 hidden border-l pl-4 text-[0.9rem] text-paper/85 sm:block"
                      style={{ borderColor: spill(0.9) }}
                      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}
                    >
                      {item.impact}
                    </motion.p>
                    {/* this achievement's photos: the one in front is lit, any other comes forward on click */}
                    <motion.ul
                      className="mt-4 flex gap-2 [@media(max-height:760px)]:hidden"
                      aria-label={`${item.short} photos`}
                      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}
                    >
                      {own.map((p) => (
                        <li key={p.src}>
                          <button
                            type="button"
                            onClick={() => (p.i === front ? openLightbox(SLIDES, p.i) : bringToFront(p.i))}
                            aria-label={p.i === front ? `Open photo ${p.k + 1}` : `Bring photo ${p.k + 1} to the front`}
                            aria-current={p.i === front ? "true" : undefined}
                            className={`block h-11 overflow-hidden rounded-[3px] transition-all duration-500 ease-cine md:h-12 ${
                              p.i === front ? "-translate-y-1 opacity-100" : "opacity-40 hover:opacity-80"
                            }`}
                            style={{
                              aspectRatio: `${p.w} / ${p.h}`,
                              boxShadow: p.i === front ? `0 0 0 1px ${spill(1)}, 0 10px 24px -8px ${spill(0.8)}` : "0 0 0 1px rgba(255,255,255,0.1)",
                            }}
                          >
                            <img src={p.src} alt="" draggable={false} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* progress through the whole archive */}
              <div className="mt-5 flex items-center gap-4 md:mt-6">
                <span className="label text-dim">{pad(owner + 1)}</span>
                <span className="relative h-px flex-1 bg-white/10">
                  <motion.span style={{ scaleX: scroll, background: spill(1) }} className="absolute inset-0 origin-left" />
                </span>
                <span className="label text-dim">{pad(achievements.length)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Reduced motion: the same records as a calm list, photos uncropped. */
function ArchiveList() {
  const { open } = useLightbox();
  return (
    <div className="container-x space-y-28 pb-36 md:space-y-36 md:pb-52">
      {achievements.map((a, i) => (
        <article key={a.title} className="border-t border-white/[0.08] pt-8">
          <p className="label flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-paper">{pad(i + 1)}</span>
            <span className="text-accent-strong">{a.badge}</span>
            <span className="ml-auto text-dim">{a.year}</span>
          </p>
          <h3 className="display mt-6 text-[clamp(2rem,7vw,3.6rem)]">{a.title}</h3>
          <p className="label mt-3 text-dim">
            {a.role} · {a.where}
          </p>
          <ClipReveal from="up" className="mt-8 overflow-hidden bg-ink-800" innerClassName="w-full">
            <button type="button" onClick={() => open(a.images, 0)} aria-label={`Open ${a.title} photo gallery`} className="block w-full">
              <img
                src={a.images[0].src}
                alt={a.images[0].alt}
                loading="lazy"
                decoding="async"
                className="block max-h-[80vh] w-full object-contain"
                style={{ aspectRatio: `${a.images[0].w} / ${a.images[0].h}` }}
              />
            </button>
          </ClipReveal>
          {a.images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2.5">
              {a.images.slice(1).map((img, k) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => open(a.images, k + 1)}
                  aria-label={`Open photo ${k + 2} of ${a.images.length}`}
                  className="block h-16 overflow-hidden"
                  style={{ aspectRatio: `${img.w} / ${img.h}` }}
                >
                  <img src={img.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <p className="mt-8 body-copy">{a.detail}</p>
          <p className="mt-5 border-l border-accent pl-4 text-paper/85">{a.impact}</p>
        </article>
      ))}
    </div>
  );
}

export default function Achievements() {
  const sectionRef = useRef(null);
  const live = useInView(sectionRef, { margin: "150px 0px 150px 0px" });
  const reduce = useReducedMotion();
  const slides = useMemo(() => SLIDES.length, []);

  return (
    <section ref={sectionRef} data-live={live} id="achievements" aria-labelledby="achievements-title" className="relative z-10 bg-ink">
      <div className="container-x overflow-x-clip pb-10 pt-36 md:pt-52">
        <SectionHeader id="achievements" label="Recognition" note={`An archive — ${slides} photographs`} />
      </div>
      {reduce ? <ArchiveList /> : <Carousel />}
    </section>
  );
}

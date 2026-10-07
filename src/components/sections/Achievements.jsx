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
const norm = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;

// Ring geometry from the viewport: card height, radius, perspective, angles.
function measure() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const cardH = Math.round(Math.max(140, Math.min(H * 0.26, W * 0.36, 290)));
  const widths = SLIDES.map((s) => (cardH * s.w) / s.h);
  const total = widths.reduce((sum, w) => sum + w + GAP, 0);
  const R = total / (2 * Math.PI);
  let acc = 0;
  const angles = widths.map((w) => {
    const a = ((acc + (w + GAP) / 2) / total) * 360;
    acc += w + GAP;
    return a;
  });
  return { cardH, widths, R, P: Math.max(1100, R * 3.1), angles };
}

// Deterministic dust so the server/first render and every visit look the same.
const DUST = Array.from({ length: 42 }, (_, i) => {
  const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { left: r(1) * 100, top: 45 + r(2) * 55, size: 1 + r(3) * 2.4, dur: 9 + r(4) * 12, delay: -r(5) * 20, o: 0.25 + r(6) * 0.5 };
});

/**
 * Recognition, staged. Every photo stands on one slowly turning ring of light.
 * Scrolling turns it, dragging spins it (with inertia), clicking a photo brings
 * it to the front, clicking the front photo opens it. Whichever achievement the
 * front photo belongs to tells its story underneath.
 */
function Carousel() {
  const outer = useRef(null);
  const stage = useRef(null);
  const ring = useRef(null);
  const cards = useRef([]);
  const { open: openLightbox } = useLightbox();
  const [geo, setGeo] = useState(measure);
    const [front, setFront] = useState(0);
  const seen = useInView(stage, { once: true, amount: 0.45 });
  const active = useInView(stage, { amount: 0 });

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const scroll = useSpring(scrollYProgress, { stiffness: 60, damping: 22, mass: 0.6 });
  const opening = useMotionValue(0);

  // mutable animation state, kept out of React to avoid re-rendering every frame
  const st = useRef({ extra: 0, vel: 0, dragging: false, moved: 0, lastX: 0, tilt: -6, py: 0, hover: false, front: 0, jump: null });

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

  const rotation = useCallback(() => {
    const o = opening.get();
    return -scroll.get() * 360 + st.current.extra + Math.pow(1 - o, 3) * 480;
  }, [opening, scroll]);

  // the frame loop (only while the stage is on screen)
  useEffect(() => {
    if (!active) return undefined;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const s = st.current;
      if (!s.dragging && !s.jump) {
        s.extra += s.vel * dt;
        s.vel *= Math.pow(0.04, dt); // inertia
        if (Math.abs(s.vel) < 2 && !s.hover) s.extra -= 4 * dt; // idle drift
      }
      s.tilt += (-6 + s.py * 5 - s.tilt) * Math.min(1, dt * 4);

      const rot = rotation();
      const o = opening.get();
      if (ring.current) ring.current.style.transform = `rotateX(${s.tilt}deg) rotateY(${rot}deg)`;

      let best = 0;
      let bestAbs = 999;
      geo.angles.forEach((a, i) => {
        const el = cards.current[i];
        if (!el) return;
        const rel = norm(a + rot);
        const abs = Math.abs(rel);
        if (abs < bestAbs) {
          bestAbs = abs;
          best = i;
        }
        const oi = Math.min(1, Math.max(0, o * 1.6 - i * 0.05));
        const e = 1 - Math.pow(1 - oi, 3);
        const facing = Math.max(0, Math.cos((rel * Math.PI) / 180));
        const boost = Math.max(0, 1 - abs / 22);
        el.style.transform = `rotateY(${a}deg) translateZ(${geo.R * e + boost * 70}px) scale(${0.55 + 0.45 * e + boost * 0.06})`;
        el.style.opacity = String(e);
        el.style.filter = `brightness(${0.2 + 0.8 * Math.pow(facing, 1.6)}) saturate(${0.4 + 0.6 * facing})`;
      });
      if (best !== s.front) {
        s.front = best;
        setFront(best);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, geo, rotation, opening]);

  // bring photo i to the front with a smooth spin
  const bringToFront = (i) => {
    const s = st.current;
    const delta = norm(-(geo.angles[i] + rotation()));
    s.vel = 0;
    s.jump?.stop();
    const from = s.extra;
    s.jump = animate(0, 1, {
      duration: 1.2,
      ease: EASE,
      onUpdate: (v) => (s.extra = from + delta * v),
      onComplete: () => (s.jump = null),
    });
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
  const glowX = [44, 56, 50][owner] ?? 50;

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
        }}
        onPointerEnter={() => (st.current.hover = true)}
      >
        {/* ---------- atmosphere ---------- */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 transition-[background-position] duration-1000"
            style={{
              background: `radial-gradient(42% 36% at ${glowX}% 42%, rgb(var(--accent-rgb) / 0.30), transparent 70%)`,
              animation: "glow-breathe 7s ease-in-out infinite",
            }}
          />
          <div
            className="absolute left-[2%] top-[6%] h-[52vmax] w-[52vmax] opacity-40"
            style={{ background: "radial-gradient(closest-side, rgb(var(--accent-soft-rgb) / 0.55), transparent)", animation: "orb-a 18s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[-4%] right-[0%] h-[44vmax] w-[44vmax] opacity-30"
            style={{ background: "radial-gradient(closest-side, rgb(var(--accent-rgb) / 0.45), transparent)", animation: "orb-b 22s ease-in-out infinite" }}
          />
          {/* spotlight from above */}
          <div
            className="absolute left-1/2 top-0 h-[70%] w-[46vmax] -translate-x-1/2 opacity-60"
            style={{
              clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 60%, transparent)",
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
              className="stroke-text display absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 select-none text-[34vmin] leading-none"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.09)" }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {pad(owner + 1)}
            </motion.span>
          </AnimatePresence>
          <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.85) 100%)" }} />
        </div>

        {/* ---------- the ring ---------- */}
        <div className="absolute inset-x-0 top-[38%] flex justify-center" style={{ perspective: geo.P, perspectiveOrigin: "50% 40%" }}>
          <div ref={ring} className="relative h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
            {/* orbit floor: concentric rings lying under the photos */}
            {[1.12, 1.32, 1.55].map((k, i) => (
              <div
                key={k}
                aria-hidden="true"
                className="absolute left-0 top-0"
                style={{ transform: `translateY(${geo.cardH * 0.62}px) rotateX(90deg)`, transformStyle: "preserve-3d" }}
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

            {SLIDES.map((s, i) => (
              <div
                key={s.src}
                ref={(el) => (cards.current[i] = el)}
                className="absolute"
                style={{
                  width: geo.widths[i],
                  height: geo.cardH,
                  left: -geo.widths[i] / 2,
                  top: -geo.cardH / 2,
                  opacity: 0,
                  willChange: "transform, filter",
                }}
              >
                <button
                  type="button"
                  onClick={() => onCardClick(i)}
                  aria-label={i === front ? `Open photo: ${s.alt}` : `Bring to front: ${s.alt}`}
                  className={`group relative block h-full w-full overflow-hidden rounded-[3px] transition-shadow duration-700 ${
                    i === front
                      ? "shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_40px_90px_-20px_rgb(var(--accent-rgb)/0.55)]"
                      : "shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                  }`}
                  style={{ WebkitBoxReflect: "below 10px linear-gradient(transparent 62%, rgba(255,255,255,0.16))" }}
                >
                  <img src={s.src} alt={s.alt} draggable={false} decoding="async" className="h-full w-full object-cover" />
                  {/* glass sheen */}
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent opacity-60" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- interface ---------- */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-ink via-ink/80 to-transparent" />
        <div className="pointer-events-none absolute inset-0">
          <div className="container-x flex h-full flex-col justify-between pb-8 pt-24 md:pb-10 md:pt-28">
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
                      onClick={() => bringToFront(FIRST_OF[o])}
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

            {/* bottom band: the record of the active achievement */}
            <div className="pointer-events-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={owner}
                  className="grid gap-5 md:grid-cols-12 md:items-end md:gap-10"
                  initial="hidden"
                  animate={seen ? "show" : "hidden"}
                  exit="exit"
                  variants={{
                    show: { transition: { staggerChildren: 0.08, delayChildren: seen ? 0.1 : 1.4 } },
                    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
                  }}
                >
                  <div className="md:col-span-5">
                    <motion.p
                      className="label flex flex-wrap gap-x-3 gap-y-1"
                      variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } } }}
                    >
                      <span className="text-accent-strong">{item.badge}</span>
                      <span className="text-dim">·</span>
                      <span className="text-paper/80">{item.role}</span>
                      <span className="text-dim">·</span>
                      <span className="text-mute">{item.where}</span>
                    </motion.p>
                    <span className="mt-3 block overflow-hidden pb-[0.1em]">
                      <motion.h3
                        className="display text-[clamp(1.7rem,3.6vw,3.6rem)]"
                        variants={{ hidden: { y: "110%" }, show: { y: 0, transition: { duration: 1, ease: EASE } } }}
                      >
                        {item.title}
                      </motion.h3>
                    </span>
                  </div>
                  <div className="md:col-span-6 md:col-start-7">
                    <motion.p
                      className="text-[0.82rem] leading-[1.65] text-mute md:text-[0.95rem]"
                      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}
                    >
                      {item.detail}
                    </motion.p>
                    <motion.p
                      className="mt-3 hidden border-l border-accent pl-4 text-[0.92rem] text-paper/85 sm:block"
                      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}
                    >
                      {item.impact}
                    </motion.p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* progress through the whole archive */}
              <div className="mt-6 flex items-center gap-4 md:mt-8">
                <span className="label text-dim">{pad(owner + 1)}</span>
                <span className="relative h-px flex-1 bg-white/10">
                  <motion.span style={{ scaleX: scroll }} className="absolute inset-0 origin-left bg-accent-strong" />
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

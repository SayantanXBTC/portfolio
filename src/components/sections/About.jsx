import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { about } from "../../data/portfolio";
import { useFinePointer, usePinnedLayout } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { focusSkill, scrollToId } from "../../lib/scroll";
import { MiniIcon } from "../kit/SkillIcon";
import { SectionHeader } from "../kit/SectionHeader";
import { WordReveal } from "../kit/Text";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ease3 = (t) => 1 - Math.pow(1 - t, 3);
const rand = (i, n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;

// Scroll budget of the pinned frame: the statement lights up, then the three
// paragraphs take the stage one after another, each in its own scene.
const INTRO = 0.1;
const ACTS = [
  [0.1, 0.4],
  [0.4, 0.7],
  [0.7, 1],
];
// the words of the statement each scene lights up
const KEYS = [
  ["software", "engineering,", "testing", "automation,"],
  ["experimental", "rigor."],
  ["building", "reliable", "systems"],
];
const actOf = (p) => (p < ACTS[1][0] ? 0 : p < ACTS[2][0] ? 1 : 2);

/* ------------------------------------------------------------------ */
/* The three scenes behind the words                                   */
/* ------------------------------------------------------------------ */

// A plan of a building, drawn line by line: walls, rooms, doors, columns, dimensions.
const PLAN = [
  "M940 170 H1500 V720 H940 Z",
  "M940 420 H1180 M1180 170 V560 M1180 560 H1500 M1320 170 V420 M1320 420 H1500",
  "M1040 420 A60 60 0 0 1 1100 360 M1180 640 A60 60 0 0 0 1240 580 M1320 300 A50 50 0 0 1 1370 250",
  "M1000 230 h40 v40 h-40 Z M1440 230 h-40 v40 h40 Z M1000 660 h40 v-40 h-40 Z M1440 660 h-40 v-40 h40 Z",
  "M940 120 H1500 M940 110 V130 M1500 110 V130 M1550 170 V720 M1540 170 H1560 M1540 720 H1560",
  "M1220 600 H1470 V700 H1220 Z M1220 630 H1470 M1300 630 V700",
];

function Blueprint({ p, opacity }) {
  const draw = PLAN.map((_, i) => useTransform(p, [0.02 + i * 0.07, 0.4 + i * 0.07], [0, 1], { clamp: true })); // eslint-disable-line react-hooks/rules-of-hooks
  const y = useTransform(p, [0, 1], [20, -20]);
  return (
    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity }}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="bp-minor" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgba(150,180,255,0.05)" strokeWidth="1" />
          </pattern>
          <pattern id="bp-major" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#bp-minor)" />
            <path d="M200 0H0V200" fill="none" stroke="rgba(150,180,255,0.09)" strokeWidth="1" />
          </pattern>
          <radialGradient id="bp-fade" cx="70%" cy="50%" r="70%">
            <stop offset="0" stopColor="white" stopOpacity="1" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="bp-mask">
            <rect width="1600" height="900" fill="url(#bp-fade)" />
          </mask>
        </defs>
        <rect width="1600" height="900" fill="#060a14" opacity="0.55" />
        <rect width="1600" height="900" fill="url(#bp-major)" mask="url(#bp-mask)" />
        <motion.g style={{ y }} fill="none" stroke="rgba(170,200,255,0.32)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          {PLAN.map((d, i) => (
            <motion.path key={i} d={d} style={{ pathLength: draw[i] }} strokeDasharray={i === 2 ? "6 6" : undefined} />
          ))}
          <motion.text x="1230" y="688" className="font-mono text-[13px] uppercase tracking-[0.3em]" fill="rgba(170,200,255,0.5)" stroke="none" style={{ opacity: draw[5] }}>
            B.Tech · CSE
          </motion.text>
        </motion.g>
      </svg>
    </motion.div>
  );
}

/** A night sky, drawn once into a canvas, with a few stars that breathe. */
function Sky() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return undefined;
    const paint = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const { width, height } = cv.getBoundingClientRect();
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      const ctx = cv.getContext("2d");
      ctx.scale(dpr, dpr);
      const count = Math.round((width * height) / 3800);
      for (let i = 0; i < count; i += 1) {
        const x = rand(i, 1) * width;
        const y = rand(i, 2) * height;
        const r = rand(i, 3) < 0.94 ? 0.4 + rand(i, 4) * 0.8 : 1.2 + rand(i, 5) * 1.1;
        ctx.globalAlpha = 0.25 + rand(i, 6) * 0.7;
        ctx.fillStyle = rand(i, 7) < 0.15 ? "#cfe0ff" : "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(cv);
    return () => ro.disconnect();
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

const TWINKLES = Array.from({ length: 14 }, (_, i) => ({ left: rand(i, 11) * 100, top: rand(i, 12) * 80, d: 2 + rand(i, 13) * 3, delay: -rand(i, 14) * 4 }));

function Starfield({ p, opacity }) {
  const trailRef = useRef(null);
  const headRef = useRef(null);
  const drift = useTransform(p, [0, 1], [30, -50]);
  const trail = useTransform(p, [0.12, 0.78], [0, 1], { clamp: true });
  const label = useTransform(p, [0.7, 0.85], [0, 1], { clamp: true });

  // the rocket rides the tip of its own trail
  useMotionValueEvent(trail, "change", (t) => {
    const path = trailRef.current;
    const head = headRef.current;
    if (!path || !head) return;
    const len = path.getTotalLength();
    const pt = path.getPointAtLength(len * t);
    const ahead = path.getPointAtLength(Math.min(len, len * t + 2));
    const a = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
    head.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${a})`);
    head.setAttribute("opacity", t > 0.01 && t < 0.995 ? "1" : "0");
  });

  return (
    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[#03040a]" style={{ opacity }}>
      <motion.div className="absolute -inset-y-16 inset-x-0" style={{ y: drift }}>
        <Sky />
        {TWINKLES.map((t, i) => (
          <span key={i} className="twinkle absolute h-[3px] w-[3px] rounded-full bg-white" style={{ left: `${t.left}%`, top: `${t.top}%`, animationDuration: `${t.d}s`, animationDelay: `${t.delay}s` }} />
        ))}
      </motion.div>
      {/* the horizon glow, low and wide */}
      <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "radial-gradient(70% 60% at 70% 110%, rgb(var(--accent-rgb) / 0.25), transparent 70%)" }} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="trail" x1="0" y1="1" x2="0.3" y2="0">
            <stop offset="0" stopColor="rgb(255,255,255)" stopOpacity="0" />
            <stop offset="0.6" stopColor="rgb(255,214,170)" stopOpacity="0.5" />
            <stop offset="1" stopColor="rgb(255,240,220)" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <motion.path
          ref={trailRef}
          d="M1520 940 C1460 700 1420 520 1300 360 S1180 170 1230 90"
          fill="none"
          stroke="url(#trail)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength: trail }}
        />
        <g ref={headRef} opacity="0">
          <circle r="18" fill="rgba(255,200,140,0.18)" />
          <circle r="7" fill="rgba(255,220,180,0.55)" />
          <circle r="3" fill="#fff" />
        </g>
        <motion.g style={{ opacity: label }}>
          <circle cx="1230" cy="90" r="10" fill="none" stroke="rgba(255,255,255,0.6)" />
          <circle cx="1230" cy="90" r="22" fill="none" stroke="rgba(255,255,255,0.25)" />
          <text x="1262" y="95" fill="rgba(255,255,255,0.85)" className="font-mono text-[14px] uppercase tracking-[0.32em]">
            ISRO Sriharikota
          </text>
        </motion.g>
      </svg>
    </motion.div>
  );
}

const MOTES = Array.from({ length: 18 }, (_, i) => ({ left: 30 + rand(i, 21) * 40, top: 40 + rand(i, 22) * 55, size: 1 + rand(i, 23) * 2, dur: 7 + rand(i, 24) * 8, delay: -rand(i, 25) * 12, o: 0.2 + rand(i, 26) * 0.5 }));

function Stage({ p, opacity, x = "70%" }) {
  const fall = useTransform(p, [0.02, 0.28], [0, 1], { clamp: true });
  const slide = useTransform(p, [0.18, 0.38], [0, 1], { clamp: true });
  return (
    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[#050404]" style={{ opacity }}>
      {/* the talk slide, projected on the back wall */}
      <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: slide }}>
        <div
          className="projector relative flex aspect-[16/9] w-[min(62vw,58rem)] flex-col justify-end p-[3%]"
          style={{ transform: "perspective(1600px) rotateY(-6deg)", left: `calc(${x} - 50%)`, background: "linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))", boxShadow: "0 0 120px rgba(255,240,220,0.06)" }}
        >
          <p className="label text-[clamp(0.55rem,0.8vw,0.75rem)] text-white/30">National Youth Festival 2025 · Representing Tripura</p>
          <p className="display mt-3 text-[clamp(2.2rem,5.2vw,5.6rem)] leading-[0.92] text-white/[0.13]">
            Tech for
            <br />
            Viksit Bharat 2047
          </p>
        </div>
      </motion.div>
      {/* the spotlight falling from above, and the pool it makes */}
      <motion.div className="absolute top-0 h-full w-[min(60vw,56rem)] origin-top" style={{ left: x, x: "-50%", scaleY: fall, opacity: fall }}>
        <div
          className="absolute inset-0"
          style={{ clipPath: "polygon(44% 0, 56% 0, 100% 100%, 0 100%)", background: "linear-gradient(to bottom, rgba(255,244,226,0.2), rgba(255,244,226,0.05) 65%, transparent)" }}
        />
        {MOTES.map((m, i) => (
          <span key={i} className="absolute rounded-full bg-[#fff4e2]" style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size, "--o": m.o, animation: `rise-dust ${m.dur}s linear ${m.delay}s infinite` }} />
        ))}
      </motion.div>
      <motion.div
        className="absolute bottom-[6%] h-[16%] w-[min(54vw,48rem)] -translate-x-1/2 rounded-[50%]"
        style={{ left: x, opacity: fall, background: "radial-gradient(closest-side, rgba(255,240,220,0.18), transparent)" }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* What sits in front of each scene                                    */
/* ------------------------------------------------------------------ */

const CHIPS = about.snapshot.flatMap((row, r) => row.items.map((it, k) => ({ ...it, row: r, k })));

function Chip({ item, i, t }) {
  const dx = (rand(i, 31) - 0.5) * 360;
  const dy = (rand(i, 32) - 0.5) * 220 - 40;
  const rot = (rand(i, 33) - 0.5) * 70;
  const e = useTransform(t, (v) => ease3(clamp((v - (i % 5) * 0.03) / 0.85, 0, 1)));
  const x = useTransform(e, (v) => (1 - v) * dx);
  const y = useTransform(e, (v) => (1 - v) * dy);
  const rotate = useTransform(e, (v) => (1 - v) * rot);
  // the moment it lands, it clicks into place
  const scale = useTransform(e, (v) => 1 + Math.sin(clamp((v - 0.86) / 0.14, 0, 1) * Math.PI) * 0.12);
  const opacity = useTransform(t, [0, 0.15], [0.55, 1]);
  return (
    <motion.button
      type="button"
      onClick={() => focusSkill(item.group, item.skill)}
      aria-label={`${item.name}: see it in Skills`}
      style={{ x, y, rotate, scale, opacity }}
      className="group/chip inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0b0f18]/90 py-[3px] pl-[3px] pr-2.5 text-[0.74rem] text-paper/85 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.9)] transition-[border-color,color] duration-300 hover:border-white/30 hover:text-paper"
    >
      <MiniIcon item={item} size={20} />
      {item.name}
    </motion.button>
  );
}

/** The everyday toolkit, scattered across the plan, then assembling into place. */
function Workbench({ p }) {
  const t = useTransform(p, [0.22, 0.72], [0, 1], { clamp: true });
  const labels = useTransform(t, [0.8, 1], [0, 1]);
  let i = -1;
  return (
    <dl className="grid grid-cols-2 gap-x-5 gap-y-3">
      {about.snapshot.map((row) => (
        <div key={row.label}>
          <motion.dt className="label mb-2 text-[0.6rem] text-[#9fb6e8]" style={{ opacity: labels }}>
            {row.label}
          </motion.dt>
          <dd className="flex flex-wrap gap-1.5">
            {row.items.map((it) => {
              i += 1;
              return <Chip key={it.name} item={it} i={i} t={t} />;
            })}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** From everyone who took part, down to the top hundred. */
function Countdown({ p }) {
  const t = useTransform(p, [0.12, 0.72], [0, 1], { clamp: true });
  const count = useTransform(t, (v) => Math.round(65000 - (65000 - 100) * ease3(v)).toLocaleString("en-IN"));
  const [done, setDone] = useState(false);
  useMotionValueEvent(t, "change", (v) => setDone(v > 0.999));
  return (
    <div className="flex items-end gap-5">
      <div>
        <p className="display text-[clamp(2.8rem,5vw,4.6rem)] leading-none tabular-nums text-paper">
          <motion.span>{count}</motion.span>
        </p>
        <p className="label mt-3 text-[0.62rem] text-dim">of 65,000+ participants · National Space Day Quiz 2025</p>
      </div>
      <AnimatePresence>
        {done && (
          <motion.span
            className="label mb-6 rounded-full bg-accent-strong px-3 py-1.5 text-[0.62rem] text-white shadow-[0_0_30px_rgb(var(--accent-strong-rgb)/0.6)]"
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
          >
            Top 100
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* The frame                                                           */
/* ------------------------------------------------------------------ */

function Word({ progress, range, hot, dim, children }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.26em] inline-block">
      <span className={`transition-[color,opacity] duration-700 ${hot ? "text-accent-strong" : dim ? "opacity-45" : ""}`}>{children}</span>
    </motion.span>
  );
}

/** The statement: lit word by word, then each scene lights its own words in it. */
function Statement({ progress, act }) {
  const words = about.statement.split(" ");
  return (
    <p aria-label={about.statement} className="editorial text-[clamp(1.9rem,3.2vw,3.3rem)] text-paper">
      {words.map((w, i) => {
        const s = (INTRO * i) / words.length;
        const hot = act >= 0 && KEYS[act].includes(w.toLowerCase());
        return (
          <Word key={i} progress={progress} range={[s, s + INTRO / words.length]} hot={hot} dim={act >= 0 && !hot}>
            <span aria-hidden="true">{w}</span>
          </Word>
        );
      })}
    </p>
  );
}

/** Three quiet marks that fill as the scenes go by. */
function Marks({ progress }) {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      {ACTS.map(([a, b], i) => (
        <Mark key={i} progress={progress} range={[a, b]} n={i + 1} />
      ))}
    </div>
  );
}
function Mark({ progress, range, n }) {
  const fill = useTransform(progress, range, [0, 1], { clamp: true });
  const lit = useTransform(progress, [range[0] - 0.01, range[0]], [0.35, 1], { clamp: true });
  return (
    <motion.span className="flex items-center gap-2" style={{ opacity: lit }}>
      <span className="label text-[0.6rem] text-paper">{String(n).padStart(2, "0")}</span>
      <span className="relative h-px w-10 bg-white/15">
        <motion.span className="absolute inset-0 origin-left bg-accent-strong" style={{ scaleX: fill }} />
      </span>
    </motion.span>
  );
}

/** Split a paragraph around its proof phrases. */
function withProofs(text) {
  const out = [];
  let rest = text;
  for (;;) {
    let best = null;
    about.proofs.forEach((p) => {
      const at = rest.indexOf(p.phrase);
      if (at >= 0 && (!best || at < best.at)) best = { at, p };
    });
    if (!best) {
      out.push(rest);
      return out;
    }
    out.push(rest.slice(0, best.at), best.p);
    rest = rest.slice(best.at + best.p.phrase.length);
  }
}

/**
 * A phrase with the proof behind it. Point at it (or tap it) and a small card
 * rises with the photo and the facts, and a way to go and see the whole thing.
 * The card is drawn above the page (a portal), so it never fades with the
 * paragraph or slips under its neighbours; it closes when the page scrolls.
 */
function Proof({ proof }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const timer = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);

  const show = (e) => {
    clearTimeout(timer.current);
    // anchor to the line actually pointed at (a phrase can wrap onto two lines)
    const rects = [...ref.current.getClientRects()];
    const r = (e?.clientY != null && rects.find((q) => e.clientY >= q.top - 2 && e.clientY <= q.bottom + 2)) || rects[0];
    const W = Math.min(280, window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.left, window.innerWidth - W - 12));
    const above = r.top > 330;
    setPos({ left, width: W, above, top: above ? undefined : r.bottom + 12, bottom: above ? window.innerHeight - r.top + 12 : undefined });
    setOpen(true);
  };
  const hide = (delay = 140) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), delay);
  };
  const go = () => {
    setOpen(false);
    scrollToId(proof.to);
  };

  // the page moving away closes it; on touch, so does a tap anywhere else
  useEffect(() => {
    if (!open) return undefined;
    const onScroll = () => setOpen(false);
    const onDown = (e) => !fine && !ref.current?.contains(e.target) && !e.target.closest?.("[data-proof-card]") && setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, fine]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      <span
        ref={ref}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onPointerEnter={(e) => fine && show(e)}
        onPointerLeave={() => fine && hide()}
        onFocus={() => show()}
        onBlur={() => hide(250)}
        onClick={(e) => (fine ? go() : open ? setOpen(false) : show(e))}
        onKeyDown={(e) => e.key === "Enter" && go()}
        className="cursor-pointer text-paper underline decoration-[rgb(var(--accent-strong-rgb)/0.75)] decoration-dotted decoration-[1.5px] underline-offset-[5px] transition-colors duration-300 hover:decoration-solid"
      >
        {proof.phrase}
      </span>
      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.div
              data-proof-card
              role="dialog"
              aria-label={proof.title}
              onPointerEnter={() => fine && clearTimeout(timer.current)}
              onPointerLeave={() => fine && hide()}
              className="fixed z-[80]"
              style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, transformPerspective: 900, transformOrigin: pos.above ? "30% 100%" : "30% 0%" }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: pos.above ? -24 : 24, y: pos.above ? 14 : -14, scale: 0.94 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.above ? 8 : -8, scale: 0.97, transition: { duration: 0.18 } }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.95)]">
                <div className="relative h-36 overflow-hidden">
                  <motion.img
                    src={proof.image}
                    alt=""
                    decoding="async"
                    className="h-full w-full object-cover"
                    initial={reduce ? false : { scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: EASE }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                </div>
                <div className="px-4 pb-4 pt-1">
                  <p className="text-[0.95rem] font-medium leading-snug text-paper">{proof.title}</p>
                  <p className="mt-1 text-[0.78rem] leading-snug text-mute">{proof.meta}</p>
                  <button type="button" onClick={go} className="label mt-3 inline-flex items-center gap-2 text-[0.6rem] text-accent-strong">
                    {proof.cta} →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/** A paragraph with its proof phrases live. */
function Rich({ text }) {
  return withProofs(text).map((part, i) => (typeof part === "string" ? <span key={i}>{part}</span> : <Proof key={i} proof={part} />));
}


const SCENES = [Blueprint, Starfield, Stage];
const FRONT = [Workbench, Countdown, null];

/** One paragraph's turn on the stage (pinned frame). */
function Act({ index, opacity, p, text }) {
  const y = useTransform(opacity, [0, 1], [24, 0]);
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? "auto" : "none"));
  const Front = FRONT[index];
  return (
    <motion.div className="[grid-area:1/1]" style={{ opacity, y, pointerEvents }} aria-hidden={undefined}>
      <p className="text-[clamp(1rem,1.2vw,1.2rem)] leading-[1.75] text-paper/90 [@media(max-height:760px)]:text-[0.95rem]">
        <Rich text={text} />
      </p>
      {Front && (
        <div className="mt-8 [@media(max-height:760px)]:mt-5">
          <Front p={p} />
        </div>
      )}
    </motion.div>
  );
}

/** One paragraph as its own scene, in the flow of the page (small screens). */
function FlowAct({ index, text }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useTransform(scrollYProgress, [0.18, 0.62], [0, 1], { clamp: true });
  const Scene = SCENES[index];
  const Front = FRONT[index];
  return (
    <div ref={ref} className="relative isolate overflow-hidden">
      <Scene p={p} opacity={1} x="50%" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
      <div className="container-x relative flex min-h-[92svh] flex-col justify-center py-24">
        <p className="label mb-6 text-paper/70">{String(index + 1).padStart(2, "0")}</p>
        <p className="text-[clamp(1.02rem,2.8vw,1.2rem)] leading-[1.75] text-paper/90">
          <Rich text={text} />
        </p>
        {Front && (
          <div className="mt-10">
            <Front p={p} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * About, told as three scenes. On large screens the frame holds still: the
 * statement lights up word by word, then each paragraph takes the stage in a
 * world of its own (a plan being drawn while the toolkit assembles on it; a
 * night sky with a rocket climbing toward Sriharikota while 65,000 narrows to
 * a hundred; a spotlight and a projected talk slide), and the statement lights
 * the words that scene is about. Elsewhere the scenes follow one another down
 * the page.
 */
export default function About() {
  const reduce = useReducedMotion();
  const pinned = usePinnedLayout() && !reduce;
  const outer = useRef(null);
  const sectionRef = useRef(null);
  const live = useInView(sectionRef, { margin: "150px 0px 150px 0px" });
  const { scrollYProgress: p } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const [act, setAct] = useState(-1);
  useMotionValueEvent(p, "change", (v) => pinned && setAct(v < INTRO ? -1 : actOf(v)));

  const actP = [
    useTransform(p, ACTS[0], [0, 1], { clamp: true }),
    useTransform(p, ACTS[1], [0, 1], { clamp: true }),
    useTransform(p, ACTS[2], [0, 1], { clamp: true }),
  ];
  const scene = [
    useTransform(p, [0, 0.08, 0.37, 0.43], [0.5, 1, 1, 0]),
    useTransform(p, [0.37, 0.43, 0.67, 0.73], [0, 1, 1, 0]),
    useTransform(p, [0.67, 0.73], [0, 1]),
  ];
  const words = [
    useTransform(p, [0.08, 0.13, 0.37, 0.41], [0, 1, 1, 0]),
    useTransform(p, [0.4, 0.45, 0.67, 0.71], [0, 1, 1, 0]),
    useTransform(p, [0.7, 0.76], [0, 1]),
  ];

  if (!pinned) {
    return (
      <section ref={sectionRef} data-live={live} id="about" aria-labelledby="about-title" className="relative z-10 overflow-x-clip bg-ink pb-20">
        <div className="container-x pt-28 md:pt-36">
          <SectionHeader id="about" label="About" note="Engineer · Builder · Explorer" />
          <WordReveal text={about.statement} highlight={["reliable", "rigor."]} className="editorial text-[clamp(1.9rem,6vw,3.4rem)] text-paper" />
        </div>
        <div className="mt-10">
          {about.paragraphs.map((text, i) => (
            <FlowAct key={i} index={i} text={text} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} data-live={live} id="about" aria-labelledby="about-title" className="relative z-10 bg-ink">
      <div className="container-x overflow-x-clip pt-28 md:pt-36">
        <SectionHeader id="about" label="About" note="Engineer · Builder · Explorer" />
      </div>
      <div ref={outer} className="relative" style={{ height: "430vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {/* the scenes */}
          {SCENES.map((Scene, i) => (
            <Scene key={i} p={actP[i]} opacity={scene[i]} />
          ))}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.5) 38%, transparent 60%), linear-gradient(to bottom, #050505 0%, transparent 14%, transparent 86%, #050505 100%)" }} />

          <div className="container-x relative grid h-full items-center gap-16 pb-8 pt-24 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Statement progress={p} act={act} />
              <div className="mt-10">
                <Marks progress={p} />
              </div>
            </div>
            <div className="grid lg:col-span-6 lg:col-start-7">
              {about.paragraphs.map((text, i) => (
                <Act key={i} index={i} opacity={words[i]} p={actP[i]} text={text} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

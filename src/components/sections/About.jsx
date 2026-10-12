import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { about } from "../../data/portfolio";
import { useFinePointer, usePinnedLayout } from "../../hooks/useMedia";
import { EASE, asset } from "../../lib/asset";
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

/** A drafting room: a cool tint and a fine grid that fades toward the edges. */
function Blueprint({ p, opacity }) {
  const y = useTransform(p, [0, 1], [16, -16]);
  return (
    <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity }}>
      <div className="absolute inset-0 bg-[#060a14]/60" />
      <motion.div
        className="absolute -inset-y-8 inset-x-0"
        style={{
          y,
          backgroundImage:
            "linear-gradient(rgba(150,180,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(150,180,255,0.07) 1px, transparent 1px), linear-gradient(rgba(150,180,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(150,180,255,0.035) 1px, transparent 1px)",
          backgroundSize: "200px 200px, 200px 200px, 40px 40px, 40px 40px",
          WebkitMaskImage: "radial-gradient(75% 70% at 68% 50%, black, transparent 80%)",
          maskImage: "radial-gradient(75% 70% at 68% 50%, black, transparent 80%)",
        }}
      />
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

const MOTES = Array.from({ length: 26 }, (_, i) => ({ left: 22 + rand(i, 21) * 56, top: 18 + rand(i, 22) * 78, size: 1 + rand(i, 23) * 2.2, dur: 7 + rand(i, 24) * 9, delay: -rand(i, 25) * 14, o: 0.2 + rand(i, 26) * 0.55 }));

/*
 * Three figures on the stage, cut from real photographs of Sayantan (with
 * Apple Vision person masks), head to shoes: standing at a debate desk,
 * speaking at the National Youth Festival lectern, and at a quiz buzzer.
 * Each is a solid silhouette with a matching rim of light along its real
 * outline. `ratio` is the cut-out's width / height.
 */
const SIL = (name) => ({ body: asset(`images/sil-${name}-body.webp`), rim: asset(`images/sil-${name}-rim.webp`) });
const FIGURES = [
  { ...SIL("debate"), ratio: 259 / 900, prop: "desk" },
  { ...SIL("speak"), ratio: 505 / 900 },
  { ...SIL("quiz"), ratio: 298 / 900, prop: "buzzer" },
];
const RIM = "rgb(255 226 184)";

/** The debate desk beside the debater: a nameplate, papers and a gooseneck microphone on a table, its edges catching the light. */
function DebateDesk({ lit }) {
  const rim = useTransform(lit, [0, 1], [0.15, 1]);
  return (
    <svg viewBox="0 0 160 150" className="absolute bottom-0 right-[56%] h-[40%] w-auto overflow-visible" style={{ aspectRatio: "160 / 150" }} aria-hidden="true">
      <motion.g style={{ opacity: rim }} fill="none" stroke={RIM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 62 H158" />
        <path d="M112 60 V40 Q112 26 98 22" strokeOpacity="0.8" />
        <path d="M30 60 l6 -16 h40 l-6 16" strokeOpacity="0.7" />
      </motion.g>
      {/* microphone on its gooseneck */}
      <path d="M112 60 V40 Q112 26 98 22" fill="none" stroke="#070605" strokeWidth="3" />
      <path d="M93 16 q5 -4 10 2 l-4 8 q-6 1 -8 -4 Z" fill="#070605" />
      <path d="M104 58 h16 v4 h-16 Z" fill="#070605" />
      {/* nameplate */}
      <path d="M30 60 l6 -16 h40 l-6 16 Z" fill="#070605" />
      {/* papers */}
      <path d="M118 59 l26 -3 l2 3 Z" fill="#070605" />
      {/* the table: top, front skirt, legs */}
      <path d="M0 60 H160 V68 H0 Z M8 68 H152 V96 H8 Z M10 96 H20 V150 H10 Z M140 96 H150 V150 H140 Z" fill="#070605" />
    </svg>
  );
}

/** A quiz buzzer on its stand beside the quizzer: it lights up red when the beam finds him, and a question rises above. */
function BuzzerStand({ lit }) {
  const glow = useTransform(lit, [0, 1], [0, 1]);
  const rim = useTransform(lit, [0, 1], [0.15, 1]);
  const q = useTransform(lit, [0.4, 1], [12, 0]);
  return (
    <>
      <svg viewBox="0 0 60 160" className="absolute bottom-0 left-[84%] h-[56%] w-auto overflow-visible" style={{ aspectRatio: "60 / 160" }} aria-hidden="true">
        <motion.g style={{ opacity: rim }} fill="none" stroke={RIM} strokeWidth="2" strokeLinecap="round">
          <path d="M8 26 H52" />
          <path d="M14 158 H46" strokeOpacity="0.6" />
        </motion.g>
        <path d="M6 26 H54 V40 H6 Z M27 40 H33 V150 H27 Z M12 150 H48 V160 H12 Z" fill="#070605" />
        <path d="M18 26 Q18 12 30 12 Q42 12 42 26 Z" fill="#070605" />
        {/* the buzzer lights up red */}
        <defs>
          <radialGradient id="buzz-glow">
            <stop offset="0" stopColor="rgb(var(--accent-strong-rgb))" stopOpacity="0.7" />
            <stop offset="1" stopColor="rgb(var(--accent-strong-rgb))" stopOpacity="0" />
          </radialGradient>
        </defs>
        <motion.g style={{ opacity: glow }}>
          <circle cx="30" cy="20" r="24" fill="url(#buzz-glow)" />
          <path d="M18 26 Q18 12 30 12 Q42 12 42 26 Z" fill="rgb(var(--accent-strong-rgb))" />
          <path d="M22 18 Q26 14 31 14" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" />
        </motion.g>
      </svg>
      <motion.span
        aria-hidden="true"
        className="absolute -top-[13%] left-1/2 -translate-x-1/2 text-[clamp(1.4rem,2.4vw,2.2rem)] font-semibold"
        style={{ opacity: glow, y: q, color: RIM, textShadow: "0 0 18px rgba(255,214,150,0.8)" }}
      >
        ?
      </motion.span>
    </>
  );
}

function Figure({ fig, lit, show }) {
  const rim = useTransform(lit, [0, 1], [0.12, 1]);
  const glow = useTransform(lit, [0, 1], [0, 0.9]);
  const y = useTransform(show, [0, 1], [24, 0]);
  return (
    <motion.div className="relative h-full w-full" style={{ opacity: show, y }}>
      {/* the light behind the figure, which makes it read as a silhouette */}
      <motion.div
        className="absolute -inset-x-[115%] bottom-[-4%] top-[2%] rounded-[50%]"
        style={{ opacity: glow, background: "radial-gradient(closest-side, rgba(255,232,196,0.36), rgba(255,220,170,0.09) 60%, transparent)" }}
      />
      {fig.prop === "desk" && <DebateDesk lit={lit} />}
      <motion.img src={fig.rim} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain object-bottom" style={{ opacity: rim }} />
      <img src={fig.body} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain object-bottom" />
      {fig.prop === "buzzer" && <BuzzerStand lit={lit} />}
    </motion.div>
  );
}

/**
 * A stage light rigged above the words. It starts dark and aimed off to the
 * side; it warms up, then sweeps the stage and stops on three figures in
 * turn (a debater at a lectern, a speaker at a standing microphone, a
 * quizzer searching with a magnifying glass), each lit from behind as the
 * beam finds it. All driven by the scroll, so it plays forward and back.
 */
function Stage({ p, opacity, x = "70%" }) {
  const ref = useRef(null);
  const [box, setBox] = useState({ w: 1200, h: 800 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = box.w < 700;
  const figH = Math.round(Math.min(box.h * (narrow ? 0.3 : 0.38), 340));
  const gap = narrow ? Math.min(box.w * 0.27, 120) : Math.min(box.w * 0.13, 230);
  const spots = [-gap, 0, gap];
  const floor = box.h * (narrow ? 0.94 : 0.93);
  const angleTo = (dx) => (-Math.atan(dx / (floor - 34)) * 180) / Math.PI;

  // where the beam points: swings in, then rests on each figure in turn
  const T = [0, 0.16, 0.36, 0.46, 0.64, 0.74, 1];
  const A = [-34, angleTo(spots[0]), angleTo(spots[0]), angleTo(spots[1]), angleTo(spots[1]), angleTo(spots[2]), angleTo(spots[2])];
  const aimRaw = useTransform(p, T, A, { clamp: true });
  const aim = useSpring(aimRaw, { stiffness: 55, damping: 17, mass: 0.9 });
  // power: one soft flutter as it warms up, then it holds
  const powerRaw = useTransform(p, [0.02, 0.07, 0.1, 0.18], [0, 0.6, 0.45, 1], { clamp: true });
  const power = useSpring(powerRaw, { stiffness: 70, damping: 20 });
  const lamp = useTransform(power, [0, 1], [0.15, 1]);
  const poolX = useTransform(aim, (a) => -Math.tan((a * Math.PI) / 180) * (floor - 34));

  // each figure: appears as the beam first reaches it, glows while it is lit
  const show = [
    useTransform(p, [0.1, 0.18], [0, 1], { clamp: true }),
    useTransform(p, [0.38, 0.46], [0, 1], { clamp: true }),
    useTransform(p, [0.66, 0.74], [0, 1], { clamp: true }),
  ];
  const near = (i) => (a) => Math.max(0, 1 - Math.abs(a - angleTo(spots[i])) / 7);
  const lit = [useTransform(aim, near(0)), useTransform(aim, near(1)), useTransform(aim, near(2))];

  return (
    <motion.div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[#040303]" style={{ opacity }}>
      {/* haze in the room, lit faintly by the beam */}
      <motion.div className="absolute inset-0" style={{ opacity: power, background: "radial-gradient(60% 70% at 70% 45%, rgba(255,236,210,0.05), transparent 70%)" }} />
      {/* the stage floor, catching a little stray light */}
      <motion.div className="absolute inset-x-0 bottom-0 h-[16%]" style={{ opacity: power, background: "linear-gradient(to top, rgba(255,236,206,0.045), transparent)" }} />
      <div className="absolute inset-x-0 bottom-[7%] h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      {/* the floor pool: an ellipse lying flat, a hot centre and a crisp rim */}
      <motion.div className="absolute h-[12%] w-[min(34vw,30rem)]" style={{ left: x, x: "-50%", top: floor - box.h * 0.06, opacity: power }}>
        <motion.div className="absolute inset-0" style={{ x: poolX }}>
          <div className="absolute inset-0 rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgba(255,240,214,0.42), rgba(255,226,186,0.16) 62%, rgba(255,226,186,0.04) 92%, transparent)" }} />
          <div className="absolute inset-[2%] rounded-[50%] border border-[rgba(255,236,206,0.16)]" />
        </motion.div>
      </motion.div>

      {/* the three figures, standing on the stage */}
      {FIGURES.map((fig, i) => (
        <div key={i} className="absolute" style={{ left: `calc(${x} + ${spots[i]}px)`, top: floor - figH, height: figH, width: figH * fig.ratio, transform: "translateX(-50%)" }}>
          <Figure fig={fig} lit={lit[i]} show={show[i]} />
        </div>
      ))}

      {/* the beam, pivoting at the lamp */}
      <motion.div className="absolute top-[34px] w-[min(40vw,34rem)] origin-top" style={{ left: x, x: "-50%", height: floor - 34, rotate: aim, opacity: power }}>
        {/* the soft outer cone */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(47% 0, 53% 0, 100% 100%, 0 100%)",
            background: "linear-gradient(to bottom, rgba(255,242,220,0.22), rgba(255,236,206,0.08) 55%, rgba(255,236,206,0.03))",
            WebkitMaskImage: "linear-gradient(90deg, transparent, black 22%, black 78%, transparent)",
            maskImage: "linear-gradient(90deg, transparent, black 22%, black 78%, transparent)",
          }}
        />
        {/* the brighter core */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(48.5% 0, 51.5% 0, 74% 100%, 26% 100%)",
            background: "linear-gradient(to bottom, rgba(255,250,236,0.28), rgba(255,244,222,0.06) 70%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, black 30%, black 70%, transparent)",
            maskImage: "linear-gradient(90deg, transparent, black 30%, black 70%, transparent)",
          }}
        />
        {/* dust drifting through the light */}
        <div className="absolute inset-0" style={{ clipPath: "polygon(47% 0, 53% 0, 100% 100%, 0 100%)" }}>
          {MOTES.map((m, i) => (
            <span key={i} className="absolute rounded-full bg-[#fff6e6]" style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size, "--o": m.o, animation: `rise-dust ${m.dur}s linear ${m.delay}s infinite` }} />
          ))}
        </div>
      </motion.div>

      {/* the lamp itself, on its rig */}
      <motion.div className="absolute top-0 h-[54px] w-[80px]" style={{ left: x, x: "-50%", rotate: aim, transformOrigin: "50% 38px" }}>
        <svg viewBox="0 0 80 54" className="h-full w-full">
          <defs>
            <linearGradient id="can" x1="0" x2="1">
              <stop offset="0" stopColor="#1a1a1c" />
              <stop offset="0.5" stopColor="#3a3a3e" />
              <stop offset="1" stopColor="#141416" />
            </linearGradient>
            <radialGradient id="lens">
              <stop offset="0" stopColor="#fffaf0" />
              <stop offset="0.6" stopColor="rgba(255,226,170,0.8)" />
              <stop offset="1" stopColor="rgba(255,200,120,0)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="80" height="6" fill="#151517" />
          <path d="M40 6 V14" stroke="#2a2a2d" strokeWidth="3" />
          <path d="M22 14 H58 L54 38 H26 Z" fill="url(#can)" />
          <path d="M16 36 L26 38 M64 36 L54 38" stroke="#26262a" strokeWidth="3" strokeLinecap="round" />
          <motion.ellipse cx="40" cy="38" rx="15" ry="5" fill="url(#lens)" style={{ opacity: lamp }} />
        </svg>
      </motion.div>
      <motion.div className="absolute top-[18px] h-24 w-24 rounded-full" style={{ left: x, x: "-50%", opacity: power, background: "radial-gradient(closest-side, rgba(255,232,190,0.55), transparent)" }} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* What sits in front of each scene                                    */
/* ------------------------------------------------------------------ */

const CHIPS = about.snapshot.flatMap((row, r) => row.items.map((it, k) => ({ ...it, row: r, k })));

function Chip({ item, i, t }) {
  const dx = (rand(i, 31) - 0.5) * 240;
  const dy = (rand(i, 32) - 0.5) * 140;
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

/** The everyday toolkit: scattered, then assembling into place on a drafting board that draws itself around it. */
function Workbench({ p }) {
  const t = useTransform(p, [0.22, 0.72], [0, 1], { clamp: true });
  const frame = useTransform(p, [0.04, 0.3], [0, 1], { clamp: true });
  const ticks = useTransform(p, [0.2, 0.42], [0, 1], { clamp: true });
  const labels = useTransform(t, [0.8, 1], [0, 1]);
  let i = -1;
  return (
    <div className="relative px-5 pb-5 pt-7">
      {/* the board: its edge draws in, then the dimension lines and corner marks */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <motion.rect x="0.3" y="0.5" width="99.4" height="99" rx="1.2" fill="rgba(10,16,32,0.55)" stroke="rgba(160,190,255,0.35)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ pathLength: frame }} />
      </svg>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: ticks }}>
        {/* corner marks */}
        {["left-0 top-0", "right-0 top-0 rotate-90", "right-0 bottom-0 rotate-180", "left-0 bottom-0 -rotate-90"].map((c) => (
          <span key={c} className={`absolute h-3 w-3 border-l border-t border-[#9fb6e8] ${c}`} style={{ margin: -5 }} />
        ))}
        {/* a dimension line across the top, with its label */}
        <span className="absolute -top-4 left-0 right-0 flex items-center gap-2">
          <span className="h-2 w-px bg-[#9fb6e8]/60" />
          <span className="h-px flex-1 bg-[#9fb6e8]/35" />
          <span className="label text-[0.52rem] text-[#9fb6e8]/80">Toolkit</span>
          <span className="h-px flex-1 bg-[#9fb6e8]/35" />
          <span className="h-2 w-px bg-[#9fb6e8]/60" />
        </span>
      </motion.div>

      <dl className="relative grid grid-cols-2 gap-x-5 gap-y-3">
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
    </div>
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
  if (index === 2) return <PinnedStage text={text} />;
  return <ScrollAct index={index} text={text} />;
}

function ScrollAct({ index, text }) {
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

/** The stage on small screens: it holds still while the light finds each figure in turn. */
function PinnedStage({ text }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} className="relative overflow-clip" style={{ height: "260svh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <Stage p={scrollYProgress} opacity={1} x="50%" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink to-transparent" />
        <div className="container-x relative pt-24">
          <p className="label mb-5 text-paper/70">03</p>
          <p className="text-[clamp(0.98rem,2.7vw,1.15rem)] leading-[1.7] text-paper/90">
            <Rich text={text} />
          </p>
        </div>
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

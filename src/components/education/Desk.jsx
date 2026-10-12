import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, useTransform } from "framer-motion";
import { education } from "../../data/portfolio";

const u = education.university;
const [senior, matric] = education.schools;

/* ------------------------------------------------------------------ */
/* The things on the desk. Each is drawn at 220px wide and scaled.     */
/* ------------------------------------------------------------------ */

function IdCard() {
  return (
    <div className="relative w-[220px]">
      {/* the lanyard running off the top of the desk */}
      <span className="absolute -top-28 left-1/2 h-32 w-5 -translate-x-1/2 bg-gradient-to-b from-transparent via-[#1f3d8a] to-[#24479e]" />
      <div className="relative overflow-hidden rounded-xl bg-[#f5f3ee] shadow-[0_18px_30px_-12px_rgba(0,0,0,0.85)]">
        {/* the school itself across the top of the card */}
        <div className="relative h-[46px] overflow-hidden">
          <img src={matric.image} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_35%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1d3c8f] via-[#24479e]/80 to-[#24479e]/30" />
          <div className="relative flex h-full items-center gap-2 px-3">
            <span className="h-5 w-5 rounded-full border-2 border-white/85" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white">Holy Cross School</span>
          </div>
        </div>
        <div className="flex gap-3 p-3">
          {/* the student, cropped like an ID photo */}
          <div
            className="h-[76px] w-[60px] shrink-0 rounded-[3px] bg-[#ddd] shadow-inner"
            style={{ backgroundImage: `url(${matric.photo})`, backgroundSize: "300%", backgroundPosition: "44% 6%" }}
          />
          <div className="min-w-0 text-[#1c1a17]">
            <p className="text-[8px] uppercase tracking-[0.2em] text-[#6f695f]">Student</p>
            <p className="mt-0.5 text-[12px] font-semibold leading-tight">Sayantan Bhattacharjee</p>
            <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-[#6f695f]">Session</p>
            <p className="text-[11px]">{matric.years}</p>
          </div>
        </div>
        <span className="absolute left-1/2 top-[3px] h-1.5 w-8 -translate-x-1/2 rounded-full bg-black/30" />
      </div>
    </div>
  );
}

function ReportCard() {
  return (
    <div className="relative w-[220px] rounded-[3px] bg-[#efe9dc] p-4 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.85)]" style={{ backgroundImage: "repeating-linear-gradient(transparent 0 17px, rgba(60,80,140,0.13) 17px 18px)" }}>
      <p className="text-[8px] uppercase tracking-[0.2em] text-[#6f695f]">Report card</p>
      <p className="mt-1 text-[13px] font-semibold text-[#1c1a17]">Matriculation · 2020</p>
      <div className="mt-3 space-y-[10px]">
        {[78, 64, 86, 58, 72].map((w, i) => (
          <span key={i} className="block h-[3px] rounded-full bg-[#1c1a17]/15" style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* the stamp */}
      <div className="absolute -bottom-3 right-3 grid h-[78px] w-[78px] rotate-[-14deg] place-items-center rounded-full border-[3px] border-[rgb(var(--accent-rgb))] text-[rgb(var(--accent-rgb))] opacity-90">
        <div className="text-center leading-none">
          <p className="text-[22px] font-bold">{matric.score}</p>
          <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.2em]">percent</p>
        </div>
      </div>
    </div>
  );
}

function Certificate() {
  return (
    <div className="relative w-[230px]">
      <div className="relative rounded-[2px] bg-[#f3eedf] p-2 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.85)]">
        <div className="relative overflow-hidden rounded-[2px] border-2 border-double border-[#b89a5e] px-4 pb-3 pt-3 text-center text-[#1c1a17]">
          {/* the school, faint, like an engraving behind the text */}
          <img src={senior.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.12] grayscale" />
          <div className="relative">
            <p className="font-serif text-[15px] italic">Certificate</p>
            <p className="mt-1 text-[7px] uppercase tracking-[0.24em] text-[#6f695f]">Senior Secondary · {senior.years.split(" — ")[1]}</p>
            <p className="mt-2 text-[10px] leading-snug">{senior.place.split(",")[0]}</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="h-px w-14 bg-[#1c1a17]/30" />
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#d9b56a] to-[#9c7a35] text-[8px] font-bold text-white shadow-inner">{senior.score}</span>
              <span className="h-px w-14 bg-[#1c1a17]/30" />
            </div>
          </div>
        </div>
      </div>
      {/* a print of the day, paper-clipped to the corner */}
      <div className="absolute -left-6 -top-10 w-[92px] rotate-[-9deg] bg-white p-1.5 pb-5 shadow-[0_14px_22px_-10px_rgba(0,0,0,0.85)]">
        <img src={senior.photo} alt="" className="aspect-[4/5] w-full object-cover object-[52%_30%]" />
        <p className="absolute inset-x-0 bottom-1 text-center font-serif text-[8px] italic text-[#4a463f]">HHSS, 2022</p>
        <svg viewBox="0 0 14 40" className="absolute -top-3 left-4 h-9 w-3.5" aria-hidden="true">
          <path d="M4 38 V8 a3 3 0 0 1 6 0 V30 a2 2 0 0 1 -4 0 V12" fill="none" stroke="#b9bcc2" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function Pen() {
  return (
    <svg viewBox="0 0 220 30" className="w-[220px] drop-shadow-[0_10px_8px_rgba(0,0,0,0.7)]" aria-hidden="true">
      <defs>
        <linearGradient id="pen-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a3e" />
          <stop offset="0.45" stopColor="#141416" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
        <linearGradient id="pen-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3d998" />
          <stop offset="1" stopColor="#9c7a35" />
        </linearGradient>
      </defs>
      <path d="M8 15 L34 8 L34 22 Z" fill="url(#pen-gold)" />
      <rect x="34" y="7" width="150" height="16" rx="7" fill="url(#pen-body)" />
      <rect x="94" y="7" width="6" height="16" fill="url(#pen-gold)" />
      <rect x="184" y="8" width="30" height="14" rx="7" fill="url(#pen-body)" />
      <rect x="120" y="3" width="70" height="4" rx="2" fill="url(#pen-gold)" />
    </svg>
  );
}

const SLIDES = [
  { src: u.photo, pos: "50% 22%", caption: "Sayantan · B.Tech CSE" },
  { src: u.image, pos: "50% 50%", caption: `${u.name}` },
];

/** The screen: a photo viewer that slides from one picture to the next, slowly zooming as it rests. */
function Slideshow() {
  const ref = useRef(null);
  const live = useInView(ref, { margin: "100px" });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!live || reduce) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 3400);
    return () => clearInterval(t);
  }, [live, reduce]);
  const s = SLIDES[i];
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={{ x: "100%" }}
          animate={{ x: "0%" }}
          exit={{ x: "-35%", opacity: 0.4 }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        >
          <motion.img
            src={s.src}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: s.pos }}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 4.2, ease: "linear" }}
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 to-transparent" />
          <p className="absolute bottom-[9px] left-2.5 text-[6.5px] font-semibold uppercase tracking-[0.18em] text-white/90">{s.caption}</p>
        </motion.div>
      </AnimatePresence>
      {/* the viewer's bar and the dots that follow along */}
      <div className="absolute inset-x-0 top-0 flex h-[11px] items-center gap-[3px] bg-black/45 px-1.5">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="h-[4px] w-[4px] rounded-full" style={{ background: c }} />
        ))}
        <span className="mx-auto text-[5px] uppercase tracking-[0.2em] text-white/70">{u.short} · {u.years}</span>
      </div>
      <div className="absolute bottom-[4px] right-2 flex gap-[3px]">
        {SLIDES.map((_, k) => (
          <span key={k} className={`h-[3px] rounded-full transition-all duration-500 ${k === i ? "w-[9px] bg-white" : "w-[3px] bg-white/45"}`} />
        ))}
      </div>
      {/* the glass */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.14)_0%,transparent_35%,transparent_70%,rgba(255,255,255,0.05)_100%)]" />
    </div>
  );
}

/** A laptop seen from the front and a little above: thin bezel, aluminium lid edge, keyboard deck, trackpad. */
function Laptop() {
  return (
    <div className="w-[240px]" style={{ perspective: 700 }}>
      {/* the lid */}
      <div className="relative mx-auto w-[214px] rounded-t-[9px] bg-gradient-to-b from-[#c9cacf] to-[#9a9ba1] p-[2px] shadow-[0_-1px_0_rgba(255,255,255,0.3)_inset]" style={{ transform: "rotateX(-6deg)", transformOrigin: "50% 100%" }}>
        <div className="relative rounded-t-[7px] bg-[#0b0b0c] p-[6px] pb-[7px]">
          <span className="absolute left-1/2 top-[2px] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#2a2d36]" />
          <div className="aspect-[16/10] overflow-hidden rounded-[2px]">
            <Slideshow />
          </div>
        </div>
      </div>
      {/* the hinge and the deck, tilted away like a real keyboard */}
      <div className="relative h-[3px] bg-gradient-to-b from-[#3b3c40] to-[#6c6d72]" style={{ marginInline: "13px" }} />
      <div
        className="relative mx-auto h-[62px] w-[240px] rounded-b-[10px] bg-gradient-to-b from-[#d4d5da] via-[#bcbdc2] to-[#9d9ea4] shadow-[0_22px_26px_-14px_rgba(0,0,0,0.95)]"
        style={{ transform: "rotateX(58deg)", transformOrigin: "50% 0", marginTop: "-1px" }}
      >
        <div
          className="absolute left-[16px] right-[16px] top-[6px] h-[30px] rounded-[2px]"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, #2b2c30 0 13px, transparent 13px 15px), repeating-linear-gradient(0deg, transparent 0 5px, #b3b4b9 5px 7px)", backgroundColor: "#2b2c30", opacity: 0.85 }}
        />
        <div className="absolute bottom-[5px] left-1/2 h-[18px] w-[70px] -translate-x-1/2 rounded-[3px] bg-[#c6c7cc] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]" />
      </div>
    </div>
  );
}

const NOTE_TINT = ["#f6e7a6", "#f7c6c9", "#bfe0f2", "#c8eac0"];
function Notes() {
  return (
    <div className="relative h-[150px] w-[220px]">
      {u.coursework.map((k, i) => (
        <div
          key={k}
          className="absolute grid h-[88px] w-[96px] place-items-center p-2 text-center font-serif text-[12px] italic leading-tight text-[#1c1a17] shadow-[0_10px_16px_-8px_rgba(0,0,0,0.8)]"
          style={{ background: NOTE_TINT[i], left: `${(i % 2) * 112 + (i > 1 ? 10 : 0)}px`, top: `${Math.floor(i / 2) * 58}px`, transform: `rotate(${[-6, 4, 3, -5][i]}deg)` }}
        >
          {k}
        </div>
      ))}
    </div>
  );
}

// Which chapter brings each thing, where it rests beside the book, and how it lies.
export const PROPS = [
  { key: "id", chapter: 1, side: -1, top: "4%", rot: -8, Draw: IdCard },
  { key: "report", chapter: 1, side: -1, top: "37%", rot: 5, Draw: ReportCard },
  { key: "cert", chapter: 2, side: 1, top: "8%", rot: 5, Draw: Certificate },
  { key: "pen", chapter: 2, side: 1, top: "43%", rot: -22, Draw: Pen },
  { key: "laptop", chapter: 3, side: 1, top: "58%", rot: -3, Draw: Laptop },
  { key: "notes", chapter: 3, side: -1, top: "72%", rot: 0, Draw: Notes },
];

/**
 * The props, beside the book. Each arrives with its chapter, sliding onto the
 * desk and settling at its own angle; it leaves again if you go back.
 */
export function DeskProps({ spread, size, gap = 28 }) {
  const reduce = useReducedMotion();
  if (size < 110) return null;
  const k = size / 230;
  return PROPS.map(({ key, chapter, side, top, rot, Draw }, i) => {
    const here = spread >= chapter;
    const old = spread > chapter && spread < 4;
    return (
      <div
        key={key}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ top, [side < 0 ? "right" : "left"]: `calc(100% + ${gap}px)`, width: 230 * k, zIndex: 0 }}
      >
        <motion.div
          style={{ transformOrigin: side < 0 ? "100% 0" : "0 0", scale: k, width: 230 }}
          initial={false}
          animate={
            here
              ? { opacity: old ? 0.82 : 1, x: 0, y: 0, rotate: rot }
              : { opacity: 0, x: side * 220, y: -30, rotate: rot + side * 24 }
          }
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 15, delay: here ? 0.25 + (i % 2) * 0.18 : 0 }}
        >
          <Draw />
        </motion.div>
      </div>
    );
  });
}

/** On narrow screens: the current chapter's two things, small, in a row under the book. */
export function DeskStrip({ spread }) {
  const items = PROPS.filter((p) => p.chapter === Math.min(spread, 3));
  return (
    <div className="mt-8 flex h-[118px] items-start justify-center gap-4" aria-hidden="true">
      {items.map(({ key, rot, Draw }, i) => (
        <motion.div
          key={`${spread}-${key}`}
          className="origin-top"
          style={{ width: 230 * 0.5 }}
          initial={{ opacity: 0, y: 30, rotate: rot * 2 }}
          animate={{ opacity: 1, y: 0, rotate: rot * 0.6 }}
          transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.3 + i * 0.12 }}
        >
          <div style={{ transform: "scale(0.5)", transformOrigin: "0 0", width: 230 }}>
            <Draw />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** The surface itself: dark wood, lit from the middle. */
export function DeskSurface() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={{ background: "radial-gradient(80% 70% at 50% 48%, #1b1511 0%, #0e0b09 55%, #050505 100%)" }} />
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "repeating-linear-gradient(91deg, rgba(255,235,210,0.018) 0 2px, transparent 2px 11px), repeating-linear-gradient(89deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 23px)" }} />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#050505] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050505] to-transparent" />
    </div>
  );
}

/**
 * The light of the day moving across the desk: morning through the window
 * while at school, warm afternoon, then evening under a desk lamp at
 * university. `t` runs 0..1 through the book.
 */
export function DayLight({ t }) {
  const morning = useTransform(t, [0, 0.3, 0.48], [1, 1, 0]);
  const afternoon = useTransform(t, [0.3, 0.48, 0.6, 0.74], [0, 1, 1, 0]);
  const evening = useTransform(t, [0.6, 0.78], [0, 1]);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
      {/* morning: cool light through a window, its bars falling across the desk */}
      <motion.div className="absolute inset-0" style={{ opacity: morning }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 12% 0%, rgba(235,244,255,0.13), transparent 70%)" }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(118deg, transparent 0 150px, rgba(0,0,0,0.16) 150px 168px)",
            WebkitMaskImage: "radial-gradient(70% 70% at 15% 10%, black, transparent 75%)",
            maskImage: "radial-gradient(70% 70% at 15% 10%, black, transparent 75%)",
          }}
        />
      </motion.div>
      {/* afternoon: low and golden, from the side */}
      <motion.div className="absolute inset-0" style={{ opacity: afternoon, background: "radial-gradient(75% 65% at -5% 62%, rgba(255,176,84,0.16), transparent 70%), linear-gradient(90deg, rgba(255,160,70,0.05), transparent 60%)" }} />
      {/* evening: the room darkens, a lamp throws a warm pool */}
      <motion.div className="absolute inset-0" style={{ opacity: evening }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 40%, rgba(3,5,14,0.6) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(42% 48% at 84% 12%, rgba(255,178,90,0.22), rgba(255,160,70,0.06) 60%, transparent 75%)" }} />
        <Lamp />
      </motion.div>
    </div>
  );
}

function Lamp() {
  return (
    <svg viewBox="0 0 160 120" className="absolute right-[4%] top-[2%] w-[clamp(90px,10vw,160px)]">
      <defs>
        <radialGradient id="lamp-bulb">
          <stop offset="0" stopColor="#fff6dd" />
          <stop offset="0.4" stopColor="rgba(255,206,130,0.7)" />
          <stop offset="1" stopColor="rgba(255,180,90,0)" />
        </radialGradient>
      </defs>
      <circle cx="70" cy="78" r="46" fill="url(#lamp-bulb)" />
      <path d="M40 70 Q70 30 100 70 Z" fill="#23201c" stroke="rgba(255,255,255,0.08)" />
      <path d="M100 52 L150 8" stroke="#2c2925" strokeWidth="5" strokeLinecap="round" />
      <circle cx="70" cy="72" r="6" fill="#fff3d0" />
    </svg>
  );
}

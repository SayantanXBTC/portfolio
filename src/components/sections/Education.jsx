import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, motionValue, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { education, profile } from "../../data/portfolio";
import { useFinePointer, useMedia, usePinnedLayout } from "../../hooks/useMedia";
import { scrollToY } from "../../lib/scroll";
import { DayLight, DeskProps, DeskStrip, DeskSurface } from "../education/Desk";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { Arrow } from "../kit/Button";
import { Decode } from "../kit/Decode";

const u = education.university;
const [senior, matric] = education.schools;

// The yearbook reads in time order: where it started, through to now.
const CHAPTERS = [
  { key: "matric", stage: matric.title, name: "Holy Cross School", place: "Agartala, Tripura", years: matric.years, image: matric.image, w: 1200, h: 1444, score: matric.score, unit: "%", scoreLabel: "Score", tilt: -2.2 },
  { key: "senior", stage: senior.title, name: "Hindi Higher Secondary School", place: "Agartala, Tripura", years: senior.years, image: senior.image, w: 1188, h: 761, score: senior.score, unit: "%", scoreLabel: "Score", tilt: 1.8 },
  { key: "lpu", stage: "University", name: u.name, years: u.years, image: u.image, w: 1200, h: 1587, score: u.cgpa, unit: `/ ${u.scale}`, scoreLabel: "CGPA", tilt: -1.4, current: true },
];
// Leaves: the cover, then one per chapter. Each leaf's back is the next photo; the last one's back is the back cover.
const N = CHAPTERS.length + 1;
const SPREADS = ["Cover", ...CHAPTERS.map((c) => c.stage), "Back cover"];

const INK = "text-[#1c1a17]";
const FADED = "text-[#6f695f]";
const toward = { left: "to right", right: "to left", top: "to bottom", bottom: "to top" };

/** A score that decodes into place once its page has landed. */
function Score({ value, run }) {
  return <Decode value={value} start={run} />;
}

/** Paper, darkening into the spine on the bound side. */
function Paper({ spine, children }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f2eee6]">
      <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(${toward[spine]}, rgba(0,0,0,0.16), rgba(0,0,0,0.03) 9%, transparent 22%)` }} />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

function Cover({ spine, back, glow }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2px] bg-[#16110f]">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: `linear-gradient(${toward[spine]}, rgb(var(--accent-soft-rgb) / 0.6), rgb(var(--accent-soft-rgb) / 0.28) 12%, rgb(var(--accent-rgb) / 0.12) 60%, transparent)` }}
      />
      <div aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-60 mix-blend-overlay" />
      <div aria-hidden="true" className="absolute inset-[6%] rounded-[2px] border border-[#c9a96e]/30" />
      <div aria-hidden="true" className="absolute inset-[7.2%] rounded-[2px] border border-[#c9a96e]/15" />
      {/* gold foil catching the light where the pointer is */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at var(--sx, 30%) var(--sy, 20%), rgba(255, 226, 160, 0.16), transparent 42%)" }}
      />
      {back && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-[1600ms] ${glow ? "opacity-100" : "opacity-0"}`}
          style={{ background: "radial-gradient(48% 34% at 50% 50%, rgba(255,214,140,0.3), transparent 72%)", animation: "glow-breathe 4s ease-in-out infinite" }}
        />
      )}
      {back ? (
        <div className="relative flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="label text-[#c9a96e]/70">B.Tech CSE · {u.short}</p>
          <p className="foil display text-[clamp(1.6rem,3vw,2.6rem)] leading-[1.05]">
            Graduating
            <br />
            2027
          </p>
        </div>
      ) : (
        <div className="relative flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
          <p className="label text-[#c9a96e]/80">Yearbook</p>
          <p className="foil display text-[clamp(2rem,4.4vw,4rem)] leading-[0.95]">
            2019
            <br />
            <span className="opacity-60">—</span>
            <br />
            2027
          </p>
          <p className="mt-2 text-sm tracking-wide text-[#e9d9b4]/80">{profile.name}</p>
          <p className="label mt-4 max-w-[24ch] leading-relaxed text-[#c9a96e]/70">Now: B.Tech CSE · LPU · CGPA {u.cgpa}</p>
        </div>
      )}
    </div>
  );
}

/** The left page of a spread: the school's photo, taped in, whole. */
function PhotoPage({ c, spine, folio, notes = true }) {
  return (
    <Paper spine={spine}>
      <div className="flex h-full flex-col items-center justify-center gap-[5%] px-[9%] pb-[10%] pt-[9%]">
        {/* the photo is sized to whatever room the page has left (container units), never cropped */}
        <div className="relative min-h-0 w-full flex-1 [container-type:size]">
          <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ transform: `rotate(${c.tilt}deg)` }}>
            <img
              src={c.image}
              alt={`${c.name} campus`}
              width={c.w}
              height={c.h}
              draggable={false}
              loading="lazy"
              decoding="async"
              className="block h-auto w-auto border-[5px] border-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] md:border-[7px]"
              style={{ maxHeight: "calc(100cqh - 12px)", maxWidth: "calc(100cqw - 12px)" }}
            />
            <span aria-hidden="true" className="absolute -top-2.5 left-[10%] h-5 w-12 -rotate-6 bg-[#ece2c0]/85 shadow-sm md:w-16" />
            <span aria-hidden="true" className="absolute -top-2.5 right-[10%] h-5 w-12 rotate-6 bg-[#ece2c0]/85 shadow-sm md:w-16" />
          </div>
          </div>
        </div>
        <p className={`text-center font-serif text-[clamp(0.8rem,1.15vw,1.02rem)] italic ${FADED}`}>
          {c.name}, {c.years}
        </p>
      </div>
      {c.current && notes && (
        <div
          className="absolute bottom-[14%] right-[5%] w-[40%] rotate-[3.5deg] bg-[#f6e7a6] px-[4%] pb-[4%] pt-[3.5%] shadow-[0_8px_18px_-8px_rgba(0,0,0,0.55)]"
          style={{ backgroundImage: "linear-gradient(transparent 0 92%, rgba(0,0,0,0.06) 92%)" }}
        >
          <span aria-hidden="true" className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 -rotate-3 bg-white/60 shadow-sm" />
          <p className={`label mb-1 text-[0.5rem] md:text-[0.55rem] ${FADED}`}>Coursework</p>
          <ul className={`font-serif text-[clamp(0.58rem,0.85vw,0.8rem)] italic leading-snug ${INK}`}>
            {u.coursework.map((k) => (
              <li key={k}>— {k}</li>
            ))}
          </ul>
        </div>
      )}
      <p className={`label absolute bottom-[1.8%] left-0 right-0 text-center text-[0.58rem] md:bottom-[3.5%] ${FADED}`}>{folio}</p>
    </Paper>
  );
}

/** The university's seal, pressed onto the page once it lands. */
function Stamp({ shown }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className="h-auto w-[clamp(4.2rem,7vw,6.6rem)] shrink-0 text-[rgb(var(--accent-rgb))]"
      initial={reduce ? false : { opacity: 0, scale: 1.7, rotate: -28 }}
      animate={shown || reduce ? { opacity: 0.88, scale: 1, rotate: -11 } : { opacity: 0, scale: 1.7, rotate: -28 }}
      transition={{ type: "spring", stiffness: 260, damping: 16, delay: shown ? 0.55 : 0 }}
    >
      <defs>
        <path id="stamp-ring" d="M60 60 m-43 0 a43 43 0 1 1 86 0 a43 43 0 1 1 -86 0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
      <text className="fill-current font-mono text-[8.5px] uppercase tracking-[0.2em]">
        <textPath href="#stamp-ring">{u.short} · B.Tech CSE · {u.years} ·</textPath>
      </text>
      <text x="60" y="54" textAnchor="middle" className="fill-current font-mono text-[8px] uppercase tracking-[0.2em]">
        CGPA
      </text>
      <text x="60" y="73" textAnchor="middle" className="fill-current text-[20px] font-semibold">
        {u.cgpa}
      </text>
    </motion.svg>
  );
}

/** The right page of a spread: the record. */
function RecordPage({ c, index, spine, folio, shown }) {
  return (
    <Paper spine={spine}>
      <div className={`flex h-full flex-col justify-center gap-[3.5%] px-[9%] pb-[10%] pt-[6%] md:gap-[5%] md:px-[11%] md:py-[9%] ${INK}`}>
        <p className={`label flex items-center gap-2 ${FADED}`}>
          {c.current && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-strong" />}
          Chapter {String(index + 1).padStart(2, "0")} · {c.current ? "Current" : c.stage}
        </p>
        <div>
          <h3 className="display text-[clamp(1.35rem,2.5vw,2.5rem)] leading-[1.02]">{c.name}</h3>
          <p className={`mt-2 text-[clamp(0.78rem,1vw,0.95rem)] ${FADED}`}>
            {c.place ? `${c.place} · ` : ""}
            {c.years}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-[4%] md:pt-[5%]">
          <div>
            <p className={`label mb-1 ${FADED}`}>{c.scoreLabel}</p>
            <p className="display text-[clamp(2.2rem,4.4vw,4.4rem)] leading-none">
              <Score value={c.score} run={shown} />
              <span className={`editorial ml-1.5 text-[0.4em] ${FADED}`}>{c.unit}</span>
            </p>
          </div>
          {c.current && <Stamp shown={shown} />}
        </div>
        {c.current && (
          <dl className="grid grid-cols-2 gap-x-5 gap-y-2 border-t border-black/10 pt-[4%] md:gap-y-3 md:pt-[5%] text-[clamp(0.74rem,0.95vw,0.92rem)] leading-snug">
            <div className="col-span-2">
              <dt className={`label mb-1 ${FADED}`}>Degree</dt>
              <dd>{u.degree}</dd>
            </div>
            <div>
              <dt className={`label mb-1 ${FADED}`}>Minor</dt>
              <dd>{u.minor}</dd>
            </div>
            <div>
              <dt className={`label mb-1 ${FADED}`}>Open minor</dt>
              <dd>{u.openMinor}</dd>
            </div>
          </dl>
        )}
      </div>
      <p className={`label absolute bottom-[1.8%] left-0 right-0 text-center text-[0.58rem] md:bottom-[3.5%] ${FADED}`}>{folio}</p>
    </Paper>
  );
}

/**
 * One leaf: a front (on the right while unturned) and a back (on the left once
 * turned). It turns about the spine; a shadow sweeps across it as it lifts, and
 * it rises above the others while it is in the air.
 */
function Leaf({ i, angle, vertical, front, back }) {
  const axis = vertical ? "rotateX" : "rotateY";
  const rest = vertical ? 180 : -180;
  const transform = useTransform(angle, (a) => `${axis}(${a}deg)`);
  const zIndex = useTransform(angle, (a) => {
    const t = Math.abs(a) / 180;
    if (t > 0.001 && t < 0.999) return 50;
    return t >= 0.5 ? i + 1 : N - i;
  });
  const shade = useTransform(angle, (a) => Math.sin((Math.abs(a) * Math.PI) / 180) * 0.45);
  const sheen = useTransform(angle, (a) => Math.sin((Math.abs(a) * Math.PI) / 180) * 0.55);

  return (
    <motion.div
      className={`absolute ${vertical ? "inset-x-0 bottom-0 h-1/2" : "inset-y-0 right-0 w-1/2"}`}
      style={{ transform, zIndex, transformOrigin: vertical ? "50% 0%" : "0% 50%", transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0 [backface-visibility:hidden]">
        {front}
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: shade }} />
        {/* the curve of the lifting page catches the light */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ opacity: sheen, background: `linear-gradient(${vertical ? "to bottom" : "to right"}, transparent 30%, rgba(255,255,255,0.5) 62%, transparent 85%)` }}
        />
      </div>
      <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: `${axis}(${rest}deg)` }}>
        {back}
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: shade }} />
      </div>
    </motion.div>
  );
}

/**
 * Education as a yearbook. Turn the pages by dragging a page across the spine,
 * clicking either page, the arrows, the arrow keys or the bookmarks above.
 * On narrow screens the book stands upright and its pages flip upward.
 */
// Scroll budget of the pinned desk: a moment with the book closed, then one
// stretch for each spread, ending on the closed back cover.
const OPEN_AT = 0.1;
const bandOf = (p) => (p < OPEN_AT ? 0 : Math.min(N, 1 + Math.floor(((p - OPEN_AT) / (1 - OPEN_AT)) * N)));
const middleOf = (s) => (s === 0 ? OPEN_AT / 2 : OPEN_AT + ((s - 0.5) / N) * (1 - OPEN_AT));

/**
 * Education as a yearbook on a desk. On large screens the desk holds still
 * while you scroll: the cover lifts, each chapter brings its things onto the
 * desk beside the book (an ID card and a stamped report card, a certificate
 * and a pen, a laptop and the coursework notes), the light moves from
 * morning to evening, and at the end the book closes with "Graduating 2027"
 * glowing on its cover. The pages still turn by hand: drag, click, the arrows,
 * the keys or the bookmarks. Elsewhere the book sits in the page as before,
 * with each chapter's things beneath it.
 */
export default function Education() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const vertical = useMedia("(max-width: 767px)");
  const pinned = usePinnedLayout() && !reduce;
  const rest = vertical ? 180 : -180;
  const [spread, setSpread] = useState(0);
  const spreadRef = useRef(0);
  const [settled, setSettled] = useState(0);
  const angles = useRef(null);
  if (!angles.current) angles.current = Array.from({ length: N }, () => motionValue(0));
  const bookRef = useRef(null);
  const sizer = useRef(null);
  const outer = useRef(null);
  const seen = useInView(bookRef, { once: true, amount: 0.45 });
  const drag = useRef(null);
  const tiltX = useSpring(0, { stiffness: 80, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 80, damping: 18 });
  const [side, setSide] = useState(0);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  // the light of the day: the scroll itself when pinned, otherwise the page you are on
  const dayFree = useMotionValue(0);
  const day = pinned ? scrollYProgress : dayFree;

  const turnTo = (s, { quick = false } = {}) => {
    const target = Math.max(0, Math.min(N, s));
    const from = spreadRef.current;
    const moving = angles.current.map((a, i) => ({ a, to: i < target ? rest : 0 })).filter(({ a, to }) => a.get() !== to);
    const order = target >= from ? moving : [...moving].reverse();
    order.forEach(({ a, to }, k) =>
      animate(a, to, reduce ? { duration: 0 } : { duration: quick ? 0.55 : 0.95, ease: [0.45, 0.05, 0.25, 1], delay: k * 0.14 })
    );
    spreadRef.current = target;
    setSpread(target);
    if (!pinned) animate(dayFree, target / N, { duration: 1.2, ease: EASE });
  };

  // pinned: the scroll decides the spread; anything else asks the scroll to get there
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!pinned) return;
    const s = bandOf(p);
    if (s !== spreadRef.current) turnTo(s);
  });
  const go = (s) => {
    const target = Math.max(0, Math.min(N, s));
    if (!pinned) return turnTo(target);
    const el = outer.current;
    if (!el) return undefined;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + middleOf(target) * (el.offsetHeight - window.innerHeight), { duration: 1.2 });
    return undefined;
  };

  // room on either side of the book for the things on the desk
  useLayoutEffect(() => {
    const el = sizer.current;
    if (!el || !pinned) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSide(Math.min(230, Math.min(r.left, window.innerWidth - r.right) - 70));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  // if the layout switches between wide and narrow, re-seat every leaf on its new axis
  useEffect(() => {
    angles.current.forEach((a, i) => a.set(i < spreadRef.current ? rest : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vertical]);

  // not pinned: the first time the book is seen, it opens itself
  useEffect(() => {
    if (pinned || !seen || spreadRef.current !== 0) return undefined;
    const t = setTimeout(() => turnTo(1), reduce ? 0 : 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, pinned]);

  // a page's score counts once the page has landed
  useEffect(() => {
    const t = setTimeout(() => setSettled(spread), reduce ? 0 : 800);
    return () => clearTimeout(t);
  }, [spread, reduce]);

  // dragging: pick up the top page on the side you press and carry it across the spine
  const onDown = (e) => {
    const r = bookRef.current.getBoundingClientRect();
    const along = vertical ? e.clientY - (r.top + r.height / 2) : e.clientX - (r.left + r.width / 2);
    const forward = along > 0;
    const leaf = forward ? spread : spread - 1;
    if (leaf < 0 || leaf >= N) return;
    drag.current = { forward, leaf, start: vertical ? e.clientY : e.clientX, moved: false, size: vertical ? r.height / 2 : r.width / 2 };
    if (fine) e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d || !fine) return;
    const pos = vertical ? e.clientY : e.clientX;
    const delta = d.forward ? d.start - pos : pos - d.start;
    if (Math.abs(delta) > 6) d.moved = true;
    if (!d.moved) return;
    const t = Math.min(1, Math.max(0, delta / (d.size * 1.4)));
    angles.current[d.leaf].stop();
    angles.current[d.leaf].set(rest * (d.forward ? t : 1 - t));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return undefined;
    if (!d.moved) return go(spread + (d.forward ? 1 : -1));
    const t = Math.abs(angles.current[d.leaf].get()) / 180;
    if (d.forward ? t > 0.3 : t < 0.7) {
      if (pinned) {
        // finish the turn now, and bring the scroll along to the same page
        animate(angles.current[d.leaf], d.forward ? rest : 0, { duration: 0.45, ease: EASE });
        spreadRef.current = spread + (d.forward ? 1 : -1);
        setSpread(spreadRef.current);
        return go(spreadRef.current);
      }
      return turnTo(spread + (d.forward ? 1 : -1), { quick: true });
    }
    animate(angles.current[d.leaf], d.forward ? 0 : rest, { duration: 0.45, ease: EASE });
    return undefined;
  };
  const onCancel = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) animate(angles.current[d.leaf], d.forward ? 0 : rest, { duration: 0.45, ease: EASE });
  };

  // a closed book sits centred: it shifts by half a page at either end
  const shift = spread === 0 ? "-25%" : spread === N ? "25%" : "0%";
  const front = vertical ? "top" : "left";
  const backSide = vertical ? "bottom" : "right";

  const leaves = [
    { front: <Cover spine={front} />, back: <PhotoPage c={CHAPTERS[0]} spine={backSide} folio="— 1 —" notes={!pinned} /> },
    ...CHAPTERS.map((c, i) => ({
      front: <RecordPage c={c} index={i} spine={front} folio={`— ${i * 2 + 2} —`} shown={settled === i + 1} />,
      back:
        i + 1 < CHAPTERS.length ? (
          <PhotoPage c={CHAPTERS[i + 1]} spine={backSide} folio={`— ${i * 2 + 3} —`} notes={!pinned} />
        ) : (
          <Cover spine={backSide} back glow={spread === N} />
        ),
    })),
  ];

  const nav =
    "grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-ink/50 text-paper transition-[color,background-color,border-color,opacity] duration-300 hover:border-paper hover:bg-paper hover:text-ink disabled:pointer-events-none disabled:opacity-30";

  const bookSize = vertical
    ? "aspect-[1/1.66] w-full max-w-[25rem] max-[380px]:aspect-[1/1.82]"
    : pinned
      ? "aspect-[1.52] w-[min(100%,58rem,calc((100svh-17rem)*1.52))]"
      : "aspect-[1.52] w-[min(100%,64rem,calc(min(70vh,660px)*1.52))]";

  const desk = (
    <>
      {/* bookmarks */}
      <div className="relative z-10 mb-6 flex flex-wrap justify-center gap-x-1 gap-y-2 md:mb-8" role="tablist" aria-label="Yearbook pages">
        {SPREADS.map((label, s) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={spread === s}
            onClick={() => go(s)}
            className={`label relative rounded-full px-3 py-2 transition-colors duration-500 md:px-3.5 ${spread === s ? "text-paper" : "text-dim hover:text-mute"}`}
          >
            {spread === s && (
              <motion.span layoutId="yearbook-tab" className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.04]" transition={{ duration: 0.5, ease: EASE }} />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <div
        className="relative z-10 flex justify-center"
        onPointerMove={(e) => {
          const el = bookRef.current;
          if (!el || !fine || reduce) return;
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          el.style.setProperty("--sx", `${x * 100}%`);
          el.style.setProperty("--sy", `${y * 100}%`);
          tiltX.set((0.5 - y) * 5);
          tiltY.set((x - 0.5) * 7);
        }}
        onPointerLeave={() => {
          tiltX.set(0);
          tiltY.set(0);
        }}
      >
        <motion.div className="flex w-full justify-center" style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1800 }}>
          <div ref={sizer} className={`relative ${bookSize}`}>
            {pinned && <DeskProps spread={spread} size={side} />}
            <motion.div
              ref={bookRef}
              className={`absolute inset-0 select-none ${fine ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
              style={{ touchAction: "pan-y", perspective: 2400 }}
              animate={vertical ? { y: shift } : { x: shift }}
              transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onCancel}
              tabIndex={0}
              role="group"
              aria-roledescription="yearbook"
              aria-label={`Yearbook, ${SPREADS[spread]}. Use the arrow keys to turn the pages.`}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), go(spread + 1));
                if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), go(spread - 1));
              }}
            >
              <div aria-hidden="true" className="pointer-events-none absolute -inset-x-[6%] -bottom-[9%] h-[22%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.85),transparent)]" />
              {/* the boards under the pages */}
              <div
                aria-hidden="true"
                className={`absolute ${vertical ? "inset-x-0 top-0 h-1/2" : "inset-y-0 left-0 w-1/2"} rounded-[2px] bg-[#16110f] transition-opacity duration-500 ${spread === 0 ? "opacity-0" : "opacity-100"}`}
              />
              <div
                aria-hidden="true"
                className={`absolute ${vertical ? "inset-x-0 bottom-0 h-1/2" : "inset-y-0 right-0 w-1/2"} rounded-[2px] bg-[#16110f] transition-opacity duration-500 ${spread === N ? "opacity-0" : "opacity-100"}`}
              />

              {leaves.map((l, i) => (
                <Leaf key={i} i={i} angle={angles.current[i]} vertical={vertical} front={l.front} back={l.back} />
              ))}

              {/* a lifted corner on the page that turns next */}
              {spread > 0 && spread < N && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 right-0 z-[60] h-7 w-7 bg-[linear-gradient(315deg,#16110f_48%,rgba(0,0,0,0.25)_50%,#e4ded2_56%)] md:h-9 md:w-9"
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {!pinned && spread > 0 && <DeskStrip spread={spread} />}

      <div className={`relative z-10 mx-auto flex max-w-[64rem] items-center justify-center gap-4 ${pinned ? "mt-8" : "mt-10"}`}>
        <button type="button" onClick={() => go(spread - 1)} disabled={spread === 0} aria-label="Previous page" className={nav}>
          <Arrow dir="left" />
        </button>
        <p className="label min-w-[11rem] text-center text-paper" aria-live="polite">
          {SPREADS[spread]}
        </p>
        <button type="button" onClick={() => go(spread + 1)} disabled={spread === N} aria-label="Next page" className={nav}>
          <Arrow />
        </button>
      </div>
      <p className="label relative z-10 mt-4 text-center text-dim">
        {pinned ? "Scroll to turn the pages · or drag, click or use the arrows" : fine ? "Drag a page across the spine · or click a page to turn it" : "Tap a page to turn it"}
      </p>
    </>
  );

  if (pinned) {
    return (
      <section id="education" aria-labelledby="education-title" className="relative z-10 bg-ink">
        <div className="container-x pt-28 md:pt-36">
          <SectionHeader id="education" label="Education" note="2019 — 2027" />
        </div>
        <div ref={outer} className="relative" style={{ height: `${100 + (N + 1) * 60}vh` }}>
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            <DeskSurface />
            <div className="container-x relative flex h-full flex-col justify-center pb-4 pt-20">{desk}</div>
            <DayLight t={day} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="education" aria-labelledby="education-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x">
        <SectionHeader id="education" label="Education" note="2019 — 2027" />
      </div>
      <div className="relative py-10">
        <DeskSurface />
        <div className="container-x relative">{desk}</div>
        <DayLight t={day} />
      </div>
    </section>
  );
}

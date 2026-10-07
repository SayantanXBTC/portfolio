import { useEffect, useRef, useState } from "react";
import { animate, motion, motionValue, useInView, useReducedMotion, useTransform } from "framer-motion";
import { education, profile } from "../../data/portfolio";
import { useFinePointer, useMedia } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { Arrow } from "../kit/Button";

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

/** A score that counts up when its page comes into view, keeping its decimals. */
function Score({ value, run }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const decimals = (value.split(".")[1] || "").length;
  useEffect(() => {
    if (reduce || !run || !ref.current) return undefined;
    const el = ref.current;
    const c = animate(0, Number(value), { duration: 1.3, ease: EASE, onUpdate: (v) => (el.textContent = v.toFixed(decimals)) });
    return () => c.stop();
  }, [run, reduce, value, decimals]);
  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

/** Paper, darkening into the spine on the bound side. */
function Paper({ spine, children }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f2eee6]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(${toward[spine]}, rgba(0,0,0,0.16), rgba(0,0,0,0.03) 9%, transparent 22%)` }} />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

function Cover({ spine, back }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2px] bg-[#16110f]">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: `linear-gradient(${toward[spine]}, rgb(var(--accent-soft-rgb) / 0.6), rgb(var(--accent-soft-rgb) / 0.28) 12%, rgb(var(--accent-rgb) / 0.12) 60%, transparent)` }}
      />
      <div aria-hidden="true" className="absolute inset-[6%] rounded-[2px] border border-[#c9a96e]/30" />
      {back ? (
        <div className="relative flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="label text-[#c9a96e]/70">To be continued</p>
          <p className="display text-[clamp(1.6rem,3vw,2.6rem)] text-[#e9d9b4]">2027 →</p>
        </div>
      ) : (
        <div className="relative flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
          <p className="label text-[#c9a96e]/80">Yearbook</p>
          <p className="display text-[clamp(2rem,4.4vw,4rem)] leading-[0.95] text-[#efe0bd]">
            2019
            <br />
            <span className="text-[#c9a96e]/60">—</span>
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
function PhotoPage({ c, spine, folio }) {
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
      <p className={`label absolute bottom-[1.8%] left-0 right-0 text-center text-[0.58rem] md:bottom-[3.5%] ${FADED}`}>{folio}</p>
    </Paper>
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
        <div className="border-t border-black/10 pt-[4%] md:pt-[5%]">
          <p className={`label mb-1 ${FADED}`}>{c.scoreLabel}</p>
          <p className="display text-[clamp(2.2rem,4.4vw,4.4rem)] leading-none">
            <Score value={c.score} run={shown} />
            <span className={`editorial ml-1.5 text-[0.4em] ${FADED}`}>{c.unit}</span>
          </p>
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

  return (
    <motion.div
      className={`absolute ${vertical ? "inset-x-0 bottom-0 h-1/2" : "inset-y-0 right-0 w-1/2"}`}
      style={{ transform, zIndex, transformOrigin: vertical ? "50% 0%" : "0% 50%", transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0 [backface-visibility:hidden]">
        {front}
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: shade }} />
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
export default function Education() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const vertical = useMedia("(max-width: 767px)");
  const rest = vertical ? 180 : -180;
  const [spread, setSpread] = useState(0);
  const [settled, setSettled] = useState(0);
  const angles = useRef(null);
  if (!angles.current) angles.current = Array.from({ length: N }, () => motionValue(0));
  const bookRef = useRef(null);
  const seen = useInView(bookRef, { once: true, amount: 0.45 });
  const drag = useRef(null);

  const turnTo = (s, { quick = false } = {}) => {
    const target = Math.max(0, Math.min(N, s));
    const moving = angles.current.map((a, i) => ({ a, to: i < target ? rest : 0 })).filter(({ a, to }) => a.get() !== to);
    const order = target >= spread ? moving : [...moving].reverse();
    order.forEach(({ a, to }, k) =>
      animate(a, to, reduce ? { duration: 0 } : { duration: quick ? 0.55 : 0.95, ease: [0.45, 0.05, 0.25, 1], delay: k * 0.14 })
    );
    setSpread(target);
  };

  // if the layout switches between wide and narrow, re-seat every leaf on its new axis
  useEffect(() => {
    angles.current.forEach((a, i) => a.set(i < spread ? rest : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vertical]);

  // the first time the book is seen, it opens itself
  useEffect(() => {
    if (!seen || spread !== 0) return undefined;
    const t = setTimeout(() => turnTo(1), reduce ? 0 : 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);

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
    if (!d) return;
    if (!d.moved) return turnTo(spread + (d.forward ? 1 : -1));
    const t = Math.abs(angles.current[d.leaf].get()) / 180;
    if (d.forward ? t > 0.3 : t < 0.7) turnTo(spread + (d.forward ? 1 : -1), { quick: true });
    else animate(angles.current[d.leaf], d.forward ? 0 : rest, { duration: 0.45, ease: EASE });
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
    { front: <Cover spine={front} />, back: <PhotoPage c={CHAPTERS[0]} spine={backSide} folio="— 1 —" /> },
    ...CHAPTERS.map((c, i) => ({
      front: <RecordPage c={c} index={i} spine={front} folio={`— ${i * 2 + 2} —`} shown={settled === i + 1} />,
      back:
        i + 1 < CHAPTERS.length ? <PhotoPage c={CHAPTERS[i + 1]} spine={backSide} folio={`— ${i * 2 + 3} —`} /> : <Cover spine={backSide} back />,
    })),
  ];

  const nav =
    "grid h-10 w-10 place-items-center rounded-full border border-white/15 text-paper transition-[color,background-color,border-color,opacity] duration-300 hover:border-paper hover:bg-paper hover:text-ink disabled:pointer-events-none disabled:opacity-30";

  return (
    <section id="education" aria-labelledby="education-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x">
        <SectionHeader id="education" label="Education" note="2019 — 2027" />

        {/* bookmarks */}
        <div className="mb-8 flex flex-wrap justify-center gap-x-1 gap-y-2 md:mb-12" role="tablist" aria-label="Yearbook pages">
          {SPREADS.map((label, s) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={spread === s}
              onClick={() => turnTo(s)}
              className={`label relative rounded-full px-3 py-2 transition-colors duration-500 md:px-3.5 ${spread === s ? "text-paper" : "text-dim hover:text-mute"}`}
            >
              {spread === s && (
                <motion.span layoutId="yearbook-tab" className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.04]" transition={{ duration: 0.5, ease: EASE }} />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.div
            ref={bookRef}
            className={`relative select-none ${
              vertical
                ? "aspect-[1/1.66] w-full max-w-[25rem] max-[380px]:aspect-[1/1.82]"
                : "aspect-[1.52] w-[min(100%,64rem,calc(min(70vh,660px)*1.52))]"
            } ${fine ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
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
              if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), turnTo(spread + 1));
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), turnTo(spread - 1));
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

        <div className="mx-auto mt-12 flex max-w-[64rem] items-center justify-center gap-4">
          <button type="button" onClick={() => turnTo(spread - 1)} disabled={spread === 0} aria-label="Previous page" className={nav}>
            <Arrow dir="left" />
          </button>
          <p className="label min-w-[11rem] text-center text-paper" aria-live="polite">
            {SPREADS[spread]}
          </p>
          <button type="button" onClick={() => turnTo(spread + 1)} disabled={spread === N} aria-label="Next page" className={nav}>
            <Arrow />
          </button>
        </div>
        <p className="label mt-5 text-center text-dim">{fine ? "Drag a page across the spine · or click a page to turn it" : "Tap a page to turn it"}</p>
      </div>
    </section>
  );
}

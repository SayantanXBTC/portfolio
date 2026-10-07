import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { education } from "../../data/portfolio";
import { useFinePointer } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";

const u = education.university;
const [senior, matric] = education.schools;
const tiny = (src) => src.replace(/\.webp$/, "-tiny.webp");

// The journey, oldest first, laid out on a 2019 → 2027 track.
const MIN = 2019;
const MAX = 2027;
const span = (y) => (y - MIN) / (MAX - MIN);
const CHAPTERS = [
  { key: "matric", from: 2019, to: 2020, stage: matric.title, name: "Holy Cross School", place: "Agartala, Tripura", image: matric.image, w: 1200, h: 1444, score: matric.score, unit: "%", scoreLabel: "Score", tilt: -2 },
  { key: "senior", from: 2020, to: 2022, stage: senior.title, name: "Hindi Higher Secondary School", place: "Agartala, Tripura", image: senior.image, w: 1188, h: 761, score: senior.score, unit: "%", scoreLabel: "Score", tilt: 1.6 },
  { key: "lpu", from: 2023, to: 2027, stage: "University", name: u.name, image: u.image, w: 1200, h: 1587, score: u.cgpa, unit: `/ ${u.scale}`, scoreLabel: "CGPA", tilt: -1.2, current: true },
];
const center = (c) => span((c.from + c.to) / 2);
const chapterAt = (p) => {
  const y = MIN + p * (MAX - MIN);
  return y < 2020 ? 0 : y < 2022.5 ? 1 : 2;
};
const NOW = (() => {
  const d = new Date();
  return Math.min(1, Math.max(0, span(d.getFullYear() + d.getMonth() / 12)));
})();

/** A score that counts up each time its chapter comes round, keeping its decimals. */
function Score({ value }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const decimals = (value.split(".")[1] || "").length;
  useEffect(() => {
    if (reduce || !ref.current) return undefined;
    const el = ref.current;
    const c = animate(0, Number(value), { duration: 1.2, ease: EASE, onUpdate: (v) => (el.textContent = v.toFixed(decimals)) });
    return () => c.stop();
  }, [reduce, value, decimals]);
  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

/** The photo, whole and uncropped, as a print that leans toward the pointer. */
// direction comes in through AnimatePresence's `custom`, so a print on its way
// out still leaves the right way after the direction has changed
const slide = {
  enter: ({ dir, tilt }) => ({ opacity: 0, x: dir * 90, rotate: tilt + dir * 6, scale: 0.92 }),
  center: ({ tilt }) => ({ opacity: 1, x: 0, rotate: tilt, scale: 1, transition: { duration: 0.75, ease: EASE } }),
  exit: ({ dir, tilt }) => ({ opacity: 0, x: dir * -90, rotate: tilt - dir * 6, scale: 0.92, transition: { duration: 0.6, ease: EASE } }),
};

function Print({ c, dir }) {
  const reduce = useReducedMotion();
  return (
    <motion.figure
      className="absolute inset-0 flex items-center justify-center"
      custom={{ dir, tilt: c.tilt }}
      variants={slide}
      initial={reduce ? false : "enter"}
      animate="center"
      exit={reduce ? { opacity: 0 } : "exit"}
    >
      <div className="rounded-[4px] bg-paper p-2 shadow-[0_50px_90px_-35px_rgba(0,0,0,0.95)] md:p-2.5">
        <img
          src={c.image}
          alt={`${c.name} campus`}
          width={c.w}
          height={c.h}
          decoding="async"
          draggable={false}
          className="block h-auto max-h-[calc(min(46svh,560px)-1.25rem)] lg:max-h-[calc(min(58vh,560px)-1.25rem)] w-auto max-w-[min(100%,46rem)] rounded-[2px]"
        />
      </div>
    </motion.figure>
  );
}

/**
 * The year track. Drag the handle (or click anywhere on the track, or use the
 * arrow keys) to travel through the years; it settles on the chapter you stop in.
 */
function Track({ p, active, go }) {
  const ref = useRef(null);
  const dragging = useRef(false);
  const [year, setYear] = useState(() => Math.min(MAX, Math.floor(MIN + p.get() * (MAX - MIN))));
  useMotionValueEvent(p, "change", (v) => setYear(Math.min(MAX, Math.floor(MIN + v * (MAX - MIN)))));
  const left = useTransform(p, (v) => `${v * 100}%`);
  const fill = useTransform(p, (v) => v);

  const at = (e) => {
    const r = ref.current.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };
  const down = (e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    p.stop();
    p.set(at(e));
  };
  const move = (e) => dragging.current && p.set(at(e));
  const up = () => {
    if (!dragging.current) return;
    dragging.current = false;
    go(chapterAt(p.get()));
  };

  return (
    <div className="select-none pt-2 lg:pt-6">
      {/* the chapters, as bands over the years they cover */}
      <div className="relative mb-3 h-6">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.key}
            type="button"
            onClick={() => go(i)}
            className={`label absolute top-0 truncate text-left transition-colors duration-500 ${i === active ? "text-paper" : "text-dim hover:text-mute"}`}
            style={{ left: `${span(c.from) * 100}%`, width: `${(span(c.to) - span(c.from)) * 100}%` }}
          >
            <span className="hidden sm:inline">{c.stage}</span>
            <span className="sm:hidden">
              {String(i + 1).padStart(2, "0")}
              {c.current ? " · University" : ""}
            </span>
          </button>
        ))}
      </div>

      <div
        ref={ref}
        className="relative h-10 cursor-pointer touch-none"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
        {CHAPTERS.map((c, i) => (
          <span
            key={c.key}
            className={`absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full transition-colors duration-500 ${i === active ? "bg-paper/40" : "bg-white/[0.14]"}`}
            style={{ left: `${span(c.from) * 100}%`, width: `${(span(c.to) - span(c.from)) * 100}%` }}
          />
        ))}
        <motion.span className="absolute left-0 top-1/2 h-[3px] w-full origin-left -translate-y-1/2 rounded-full bg-accent-strong" style={{ scaleX: fill }} />
        {/* today */}
        <span className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-paper/50" style={{ left: `${NOW * 100}%` }} />

        <motion.div
          role="slider"
          tabIndex={0}
          aria-label="Year"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={year}
          aria-valuetext={`${year}, ${CHAPTERS[active].stage}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") (e.preventDefault(), go(Math.min(CHAPTERS.length - 1, active + 1)));
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") (e.preventDefault(), go(Math.max(0, active - 1)));
          }}
          className="group absolute top-1/2 -ml-4 -mt-4 grid h-8 w-8 cursor-grab place-items-center rounded-full outline-none active:cursor-grabbing"
          style={{ left }}
        >
          <span className="h-4 w-4 rounded-full border-2 border-paper bg-accent-strong shadow-[0_0_0_6px_rgb(var(--accent-rgb)/0.18)] transition-transform duration-300 group-hover:scale-125 group-focus-visible:scale-125" />
          <span className="label absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-paper px-2 py-1 text-[0.62rem] tabular-nums text-ink">{year}</span>
        </motion.div>
      </div>

      <div className="relative mt-2 h-4">
        {Array.from({ length: MAX - MIN + 1 }, (_, k) => MIN + k).map((y) => (
          <span key={y} className={`label absolute -translate-x-1/2 text-[0.6rem] ${y % 2 ? "hidden sm:block" : ""} text-dim`} style={{ left: `${span(y) * 100}%` }}>
            {y}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Education: a journey you can scrub. The handle runs along the years; the
 * print of each school slides in as you reach it, and its record changes with it.
 * The first time the section is seen, the journey plays through once on its own.
 */
export default function Education() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const stage = useRef(null);
  const seen = useInView(stage, { once: true, amount: 0.3 });
  const p = useMotionValue(reduce ? center(CHAPTERS[2]) : 0);
  const [active, setActive] = useState(reduce ? 2 : 0);
  const last = useRef(active);
  const [dir, setDir] = useState(1);

  useMotionValueEvent(p, "change", (v) => {
    const c = chapterAt(v);
    if (c !== last.current) {
      setDir(c > last.current ? 1 : -1);
      last.current = c;
      setActive(c);
    }
  });

  const go = (i) => animate(p, center(CHAPTERS[i]), reduce ? { duration: 0 } : { duration: 0.9, ease: EASE });

  // first visit: travel 2019 → today, then rest on the university
  useEffect(() => {
    if (!seen || reduce) return undefined;
    const c = animate(p, center(CHAPTERS[2]), { duration: 3.2, ease: [0.6, 0, 0.3, 1], delay: 0.3 });
    return () => c.stop();
  }, [seen, reduce, p]);

  // the print leans toward the pointer
  const rx = useSpring(0, { stiffness: 120, damping: 16 });
  const ry = useSpring(0, { stiffness: 120, damping: 16 });
  const lean = (e) => {
    if (!fine || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };

  const c = CHAPTERS[active];

  return (
    <section id="education" aria-labelledby="education-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      {/* the place's colours, washed across the section */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <AnimatePresence>
          <motion.img
            key={c.key}
            src={tiny(c.image)}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.16 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/40 to-ink" />
      </div>

      <div className="container-x relative">
        <SectionHeader id="education" label="Education" note={`${MIN} — ${MAX}`} />

        <div ref={stage} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div
            className="relative order-1 h-[min(46svh,560px)] [perspective:1400px] lg:col-span-7 lg:h-[min(58vh,560px)]"
            onPointerMove={lean}
            onPointerLeave={() => (rx.set(0), ry.set(0))}
          >
            <motion.div className="absolute inset-0" style={{ rotateX: rx, rotateY: ry }}>
              <AnimatePresence initial={false} custom={{ dir, tilt: c.tilt }}>
                <Print key={c.key} c={c} dir={dir} />
              </AnimatePresence>
            </motion.div>
          </div>

          {/* on phones the track sits right under the photo it drives */}
          <div className="order-2 lg:order-3 lg:col-span-12">
            <Track p={p} active={active} go={go} />
          </div>

          <div className="order-3 lg:order-2 lg:col-span-5" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={c.key}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }}
                exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
              >
                <p className="label flex items-center gap-3 text-mute">
                  {c.current && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-strong" />}
                  <span className="text-paper">{String(active + 1).padStart(2, "0")}</span>
                  <span>{c.current ? "Current" : c.stage}</span>
                  <span className="text-dim">—</span>
                  <span>
                    {c.from} — {c.to}
                  </span>
                </p>
                <h3 className="display mt-5 text-[clamp(2.1rem,3.6vw,3.6rem)]">{c.name}</h3>
                {c.place && <p className="mt-3 text-mute">{c.place}</p>}

                <div className="mt-8 border-t border-white/[0.08] pt-6">
                  <p className="label mb-2 text-dim">{c.scoreLabel}</p>
                  <p className="display text-[clamp(3rem,5.4vw,5rem)] leading-none">
                    <Score value={c.score} />
                    <span className="editorial ml-2 text-[0.4em] text-mute">{c.unit}</span>
                  </p>
                </div>

                {c.current && (
                  <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-white/[0.08] pt-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="label mb-1.5 text-dim">Degree</dt>
                      <dd className="text-paper/90">{u.degree}</dd>
                    </div>
                    <div>
                      <dt className="label mb-1.5 text-dim">Minor</dt>
                      <dd className="text-paper/90">{u.minor}</dd>
                    </div>
                    <div>
                      <dt className="label mb-1.5 text-dim">Open minor</dt>
                      <dd className="text-paper/90">{u.openMinor}</dd>
                    </div>
                  </dl>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="label mt-6 text-dim">{fine ? "Drag through the years · or pick a chapter" : "Drag through the years · or tap a chapter"}</p>
      </div>
    </section>
  );
}

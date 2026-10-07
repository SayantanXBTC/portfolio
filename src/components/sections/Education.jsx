import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "framer-motion";
import { education } from "../../data/portfolio";
import { useFinePointer } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";

const u = education.university;

// University first, then the schools: newest to oldest.
const CHAPTERS = [
  {
    key: "lpu",
    years: u.years,
    stage: "University",
    name: u.name,
    image: u.image,
    score: u.cgpa,
    unit: `/ ${u.scale}`,
    scoreLabel: "CGPA",
    current: true,
  },
  ...education.schools.map((s) => ({
    key: s.title,
    years: s.years,
    stage: s.title,
    name: s.place.split(",")[0],
    place: s.place.split(",").slice(1).join(",").trim(),
    image: s.image,
    score: s.score,
    unit: "%",
    scoreLabel: "Score",
  })),
];

/** A score that counts up once it is on screen, keeping its decimals. */
function Score({ value, run }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const decimals = (value.split(".")[1] || "").length;
  useEffect(() => {
    if (reduce || !run || !ref.current) return undefined;
    const el = ref.current;
    const c = animate(0, Number(value), {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = v.toFixed(decimals);
      },
    });
    return () => c.stop();
  }, [run, reduce, value, decimals]);
  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

/** What an open panel says: years, name, score, and for the university the degree and minors. */
function Details({ c, open }) {
  const rise = (d) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: EASE } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  });
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="d" className="relative flex h-full flex-col justify-end p-6 md:p-10">
          <motion.p {...rise(0.2)} className="label flex items-center gap-3 text-paper/80">
            {c.current && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-strong" />}
            {c.current ? "Current" : c.stage} <span className="text-paper/40">—</span> {c.years}
          </motion.p>
          <motion.h3 {...rise(0.28)} className="display mt-4 max-w-[16ch] text-[clamp(1.9rem,3.6vw,3.6rem)]">
            {c.name}
          </motion.h3>
          {c.place && (
            <motion.p {...rise(0.34)} className="mt-3 text-paper/70">
              {c.place}
            </motion.p>
          )}

          <motion.div {...rise(0.4)} className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-5">
            <div>
              <p className="label mb-2 text-paper/60">{c.scoreLabel}</p>
              <p className="display text-[clamp(2.6rem,4.6vw,4.4rem)] leading-none">
                <Score value={c.score} run={open} />
                <span className="editorial ml-1.5 text-[0.42em] text-paper/60">{c.unit}</span>
              </p>
            </div>
            {c.current && (
              <dl className="grid max-w-md gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="label mb-1 text-paper/50">Degree</dt>
                  <dd className="text-paper/90">{u.degree}</dd>
                </div>
                <div>
                  <dt className="label mb-1 text-paper/50">Minor</dt>
                  <dd className="text-paper/90">{u.minor}</dd>
                </div>
                <div>
                  <dt className="label mb-1 text-paper/50">Open minor</dt>
                  <dd className="text-paper/90">{u.openMinor}</dd>
                </div>
              </dl>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * One chapter as a window onto the place. Closed, it is a narrow slice of the
 * photo with its stage and score running down the side; open, the window
 * widens, the photo settles and the details rise in.
 */
function Panel({ c, index, open, onOpen, onHover }) {
  return (
    <motion.li
      className="relative min-h-0 min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-800 transition-[flex-grow] duration-[900ms] ease-cine"
      style={{ flexGrow: open ? 5 : 1, flexBasis: 0 }}
      variants={{
        hidden: { opacity: 0, y: 60 },
        show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE } },
      }}
      onPointerEnter={onHover}
    >
      {/* the photo is sized to the open window, so opening reveals it rather than stretching it */}
      <img
        src={c.image}
        alt={`${c.name} campus`}
        loading="lazy"
        decoding="async"
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[62svh] w-full max-w-none -translate-x-1/2 -translate-y-1/2 object-cover transition-[transform,filter] duration-[1400ms] ease-cine lg:h-full lg:w-[min(64vw,60rem)] ${
          open ? "scale-100 brightness-100 saturate-100" : "scale-110 brightness-[0.55] saturate-[0.6]"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 transition-opacity duration-700 ${open ? "opacity-100" : "opacity-60"}`}
      />

      <button
        type="button"
        onClick={onOpen}
        aria-expanded={open}
        aria-label={`${c.stage}: ${c.name}, ${c.scoreLabel} ${c.score}${c.unit === "%" ? "%" : ` out of ${u.scale}`}`}
        className={`absolute inset-0 z-10 ${open ? "pointer-events-none" : "cursor-pointer"}`}
      />

      {/* closed: the slice is labelled along its length */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex items-center justify-between gap-4 px-5 transition-opacity duration-500 lg:flex-col-reverse lg:items-center lg:justify-between lg:px-0 lg:py-8 ${
          open ? "opacity-0" : "opacity-100 delay-300"
        }`}
      >
        <span className="label text-paper/70 lg:[writing-mode:vertical-rl] lg:rotate-180">
          {String(index + 1).padStart(2, "0")} · {c.stage}
        </span>
        <span className="display text-[1.6rem] tabular-nums text-paper lg:[writing-mode:vertical-rl] lg:rotate-180">
          {c.score}
          <span className="text-[0.6em] text-paper/60">{c.unit === "%" ? "%" : ""}</span>
        </span>
      </div>

      <Details c={c} open={open} />
    </motion.li>
  );
}

/**
 * Education: three windows, newest first. One is open at a time; point at
 * (or tap) another and it widens while the rest close down to slices.
 */
export default function Education() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const [open, setOpen] = useState(0);
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.25 });
  const intent = useRef(null);

  // a short pause before a hover opens a window, so sweeping across them doesn't flicker
  const hover = (i) => {
    if (!fine) return;
    clearTimeout(intent.current);
    intent.current = setTimeout(() => setOpen(i), 140);
  };
  useEffect(() => () => clearTimeout(intent.current), []);

  return (
    <section id="education" aria-labelledby="education-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x">
        <SectionHeader id="education" label="Education" note="2019 — 2027" />

        <motion.ol
          ref={ref}
          className="flex h-[88svh] max-h-[860px] min-h-[560px] flex-col gap-3 lg:h-[78svh] lg:max-h-[760px] lg:flex-row"
          initial={reduce ? false : "hidden"}
          animate={seen ? "show" : "hidden"}
          variants={{ show: { transition: { staggerChildren: 0.14 } } }}
          onPointerLeave={() => clearTimeout(intent.current)}
        >
          {CHAPTERS.map((c, i) => (
            <Panel key={c.key} c={c} index={i} open={open === i && (seen || reduce)} onOpen={() => setOpen(i)} onHover={() => hover(i)} />
          ))}
        </motion.ol>

        <p className="label mt-6 text-dim">{fine ? "Point at a chapter to open it" : "Tap a chapter to open it"}</p>
      </div>
    </section>
  );
}

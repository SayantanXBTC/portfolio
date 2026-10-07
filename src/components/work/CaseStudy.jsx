import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { projects } from "../../data/portfolio";
import { lockScroll, unlockScroll } from "../../lib/scroll";
import { EASE } from "../../lib/asset";
import { Arrow } from "../kit/Button";
import { CountUp, ProjectLinks, WindowBar } from "./parts";

const pad = (n) => String(n).padStart(2, "0");

const up = {
  hidden: { opacity: 0, y: 36 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, delay: d, ease: EASE } }),
};

/**
 * The full case study: the recording large, the whole story, and the facts
 * beside it. Opens like a curtain rising; the next case is one click away.
 */
export default function CaseStudy({ index, setIndex, close }) {
  const reduce = useReducedMotion();
  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const closeRef = useRef(null);
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const go = (d) => setIndex((i) => (i + d + projects.length) % projects.length);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    lockScroll();
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && dialogRef.current) {
        const f = [...dialogRef.current.querySelectorAll("button, a[href], video[controls]")];
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
      previouslyFocused?.focus?.();
    };
  }, [close]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [index]);

  const navBtn =
    "grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-ink/80 text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink";

  return createPortal(
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
      className="fixed inset-0 z-[90]"
      initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
      animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
      exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 0.9, ease: EASE }}
      data-lenis-prevent
    >
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto overscroll-contain bg-ink transition-[background-image] duration-700"
        style={{ backgroundImage: `radial-gradient(70% 50% at 50% 0%, ${p.color}24, transparent 70%)` }}
      >
        {/* top bar */}
        <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-ink/[0.92]">
          <div className="container-x flex items-center gap-4 py-3.5">
            <p className="label flex min-w-0 items-center gap-3">
              <span className="text-paper">Case {pad(index + 1)}</span>
              <span className="text-dim">/ {pad(projects.length)}</span>
              <span className="hidden h-px w-8 sm:block" style={{ background: p.color }} />
              <span className="hidden truncate sm:inline">{p.chapter}</span>
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous project" className={navBtn}>
                <Arrow dir="left" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next project" className={navBtn}>
                <Arrow />
              </button>
              <button ref={closeRef} type="button" onClick={close} aria-label="Close case study" className={`${navBtn} ml-2`}>
                <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round">
                  <path d="M3 3l10 10M13 3L3 13" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={p.slug}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -24, transition: { duration: 0.35, ease: EASE } }}
            className="container-x pb-24 pt-14 md:pt-20"
          >
            <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8">
                <h2 id="case-study-title" className="display text-[clamp(3rem,10vw,9.5rem)]">
                  <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
                    <motion.span
                      className="block"
                      variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 1.2, delay: 0.25, ease: EASE } } }}
                    >
                      {p.title}
                    </motion.span>
                  </span>
                </h2>
                <motion.p variants={up} custom={0.45} className="mt-5 text-lg font-medium md:text-xl" style={{ color: p.color }}>
                  {p.descriptor}
                </motion.p>
              </div>
              <motion.div variants={up} custom={0.55} className="lg:col-span-4 lg:justify-self-end">
                <ProjectLinks project={p} />
              </motion.div>
            </header>

            <motion.figure
              variants={{
                hidden: { opacity: 0, y: 60, rotateX: 18, scale: 0.94 },
                show: { opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { duration: 1.3, delay: 0.5, ease: EASE } },
              }}
              style={{ transformPerspective: 1600 }}
              className="relative mt-12 md:mt-16"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-[10%] opacity-50"
                style={{ background: `radial-gradient(closest-side, ${p.color}, transparent)` }}
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-ink-800 shadow-[0_80px_160px_-60px_rgba(0,0,0,0.95)]">
                <WindowBar project={p} />
                <video
                  key={p.video}
                  src={p.video}
                  poster={p.poster}
                  width={p.w}
                  height={p.h}
                  controls
                  autoPlay={!reduce}
                  muted
                  loop
                  playsInline
                  aria-label={`${p.title}: screen recording of the live product`}
                  className="block h-auto w-full"
                />
              </div>
            </motion.figure>

            <div className="mt-16 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <motion.blockquote variants={up} custom={0.6} className="editorial text-[clamp(1.5rem,2.6vw,2.4rem)] text-paper">
                  <span aria-hidden="true" className="mr-1" style={{ color: p.color }}>
                    “
                  </span>
                  {p.core}
                </motion.blockquote>

                <div className="mt-12 space-y-6">
                  {p.story.map((para, i) => (
                    <motion.p key={i} variants={up} custom={0.7 + i * 0.1} className="body-copy">
                      {para}
                    </motion.p>
                  ))}
                </div>
              </div>

              <aside className="lg:col-span-5">
                <div className="lg:sticky lg:top-24">
                  <motion.dl variants={up} custom={0.7} className="grid grid-cols-3 gap-4 border-y border-white/[0.08] py-6">
                    {p.stats.map((s) => (
                      <div key={s.label}>
                        <dt className="sr-only">{s.label}</dt>
                        <dd className="text-[clamp(1.2rem,2vw,1.7rem)] font-semibold leading-none tracking-tight">
                          <CountUp value={s.value} />
                        </dd>
                        <dd aria-hidden="true" className="mt-2 text-[0.75rem] leading-snug text-dim">
                          {s.label}
                        </dd>
                      </div>
                    ))}
                  </motion.dl>

                  <motion.div variants={up} custom={0.8} className="mt-10">
                    <p className="label mb-5 text-dim">Key facts</p>
                    <ul className="space-y-3 text-[0.95rem] leading-relaxed text-paper/80">
                      {p.facts.map((f) => (
                        <li key={f} className="flex gap-3">
                          <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <motion.div variants={up} custom={0.9} className="mt-10">
                    <p className="label mb-4 text-dim">Technologies</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {p.tech.map((t) => (
                        <li key={t} className="rounded-full border border-white/15 px-3 py-1 text-[0.8rem] text-paper/80">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </aside>
            </div>

            {/* next case */}
            <motion.button
              type="button"
              variants={up}
              custom={1}
              onClick={() => go(1)}
              className="group relative mt-24 block w-full overflow-hidden rounded-2xl border border-white/[0.08] text-left md:mt-32"
            >
              <img
                src={next.poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-25 transition-all duration-[1400ms] ease-cine group-hover:scale-105 group-hover:opacity-40"
              />
              <span className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-transparent" />
              <span className="relative flex flex-wrap items-end justify-between gap-6 p-8 md:p-12">
                <span>
                  <span className="label block text-dim">Next case — {next.chapter}</span>
                  <span className="display mt-4 block text-[clamp(2.2rem,6vw,5rem)]">{next.title}</span>
                  <span className="mt-3 block text-sm" style={{ color: next.color }}>
                    {next.descriptor}
                  </span>
                </span>
                <span
                  className="grid h-14 w-14 place-items-center rounded-full text-ink transition-transform duration-700 ease-cine group-hover:translate-x-2"
                  style={{ background: next.color }}
                >
                  <Arrow />
                </span>
              </span>
            </motion.button>
          </motion.article>
        </AnimatePresence>
      </div>
    </motion.div>,
    document.body
  );
}

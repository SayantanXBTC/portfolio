import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { experience } from "../../data/portfolio";
import { useFinePointer } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";
import { MaskLines } from "../kit/Text";
import { useLightbox } from "../kit/Lightbox";
import { Stagger, Item } from "../kit/Stagger";
import { CountUp } from "../work/parts";

const pad = (n) => String(n).padStart(2, "0");

function Tags({ tech }) {
  return (
    <Stagger className="flex flex-wrap gap-2" gap={0.05}>
      {tech.map((t) => (
        <Item key={t} kind="pop" as="span" className="rounded-full border border-white/15 px-3 py-1 text-[0.8rem] text-mute transition-colors duration-500 hover:border-paper/50 hover:text-paper">
          {t}
        </Item>
      ))}
    </Stagger>
  );
}

function Heading({ item, index, total }) {
  return (
    <>
      <Reveal from="none" className="label flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-paper">
          {pad(index + 1)} / {pad(total)}
        </span>
        <span className="h-px w-8 bg-accent-strong" />
        <span>{item.kind}</span>
        <span className="text-dim">· {item.year}</span>
      </Reveal>
      <MaskLines as="h3" lines={[item.role]} className="display mt-6 text-[clamp(2.4rem,4.8vw,4.6rem)]" />
      <Reveal from="left" distance={0.3} delay={0.15} className="editorial mt-2 text-[clamp(1.25rem,2vw,1.9rem)] text-paper/55">
        {item.org}
      </Reveal>
    </>
  );
}

/**
 * Two photographs lying on top of each other. They fan apart when you point
 * at them (or tap); the one you point at comes forward; click to see it full size.
 */
function PhotoFan({ photos }) {
  const { open } = useLightbox();
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const [spread, setSpread] = useState(false);
  const [front, setFront] = useState(1);
  const ref = useRef(null);
  const entered = useInView(ref, { once: true, amount: 0.4 });
  const slides = photos.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption ? { title: p.caption, meta: "" } : undefined }));
  const rest = [
    { x: "-4%", y: "-4%", rotate: -5 },
    { x: "4%", y: "6%", rotate: 4 },
  ];
  const fanned = [
    { x: "-16%", y: "-8%", rotate: -9 },
    { x: "16%", y: "8%", rotate: 8 },
  ];

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-[1.25] w-full max-w-[34rem]"
      onPointerEnter={() => fine && setSpread(true)}
      onPointerLeave={() => fine && setSpread(false)}
    >
      {photos.map((p, i) => (
        <motion.button
          key={p.src}
          type="button"
          aria-label={`Open photo: ${p.alt}`}
          className="absolute left-[14%] top-[14%] w-[72%] origin-center"
          style={{ zIndex: front === i ? 2 : 1 }}
          initial={reduce ? false : { opacity: 0, x: "0%", y: "12%", rotate: 0 }}
          animate={reduce ? rest[i] : entered ? { opacity: 1, ...(spread ? fanned[i] : rest[i]) } : { opacity: 0, x: "0%", y: "12%", rotate: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 18, delay: entered && !spread ? i * 0.12 : 0 }}
          onPointerEnter={() => setFront(i)}
          onClick={() => {
            if (!fine && !spread) {
              setSpread(true);
              return;
            }
            open(slides, i);
          }}
        >
          <span className="block bg-paper p-1.5 shadow-[0_40px_70px_-30px_rgba(0,0,0,0.95)] transition-transform duration-500 ease-cine hover:-translate-y-1 md:p-2">
            <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" decoding="async" draggable={false} className="block h-auto w-full" />
          </span>
        </motion.button>
      ))}
      <p className="label absolute -bottom-2 left-0 right-0 text-center text-dim">{fine ? "Point to spread · click to open" : "Tap to spread · tap again to open"}</p>
    </div>
  );
}

/** A ring that fills to its value when it comes into view. */
function Gauge({ g }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const r = 34;
  return (
    <div ref={ref} className="flex items-center gap-4">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="rgb(var(--accent-strong-rgb))"
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? g.value / 100 : 0 }}
          animate={{ pathLength: seen || reduce ? g.value / 100 : 0 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
        />
      </svg>
      <div>
        <p className="display text-[clamp(1.6rem,2.4vw,2.2rem)] leading-none">
          <CountUp value={g.display} start={seen} />
        </p>
        <p className="mt-1.5 max-w-[14rem] text-sm leading-snug text-mute">{g.label}</p>
      </div>
    </div>
  );
}

/**
 * The internship, replayed as a test run: each piece of work passes in turn,
 * then the numbers it moved. "Run again" replays it.
 */
function Terminal({ item }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [shown, setShown] = useState(0);
  const lines = [
    ...item.points.map((p) => ({ ok: true, text: p })),
    { meta: true, text: "coverage 88% · avg request time −25%" },
    { done: true, text: "BUILD SUCCESS" },
  ];

  useEffect(() => {
    if (!seen) return undefined;
    if (reduce) {
      setShown(lines.length);
      return undefined;
    }
    setShown(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= lines.length) clearInterval(t);
    }, 520);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, run, reduce]);

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0b0b0b] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)]">
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#111] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto font-mono text-[0.68rem] text-paper/50">techvanto — internship</span>
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="label rounded-full border border-white/15 px-2.5 py-1 text-[0.6rem] text-paper/70 transition-colors hover:border-paper hover:text-paper"
        >
          Run again ↻
        </button>
      </div>
      <div className="min-h-[17rem] space-y-2.5 p-5 font-mono text-[0.78rem] leading-relaxed md:p-6 md:text-[0.82rem]" aria-live="polite">
        <p className="text-paper/50">
          <span className="text-accent-strong">$</span> mvn test
        </p>
        <AnimatePresence initial={false}>
          {lines.slice(0, shown).map((l, i) => (
            <motion.p
              key={`${run}-${i}`}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className={l.done ? "pt-2 font-semibold text-[#4ade80]" : l.meta ? "pt-2 text-paper/70" : "flex gap-3 text-paper/85"}
            >
              {l.ok && <span className="shrink-0 text-[#4ade80]">✓</span>}
              <span>{l.text}</span>
            </motion.p>
          ))}
        </AnimatePresence>
        {shown < lines.length && <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-paper/70" aria-hidden="true" />}
      </div>
    </div>
  );
}

function CertificateLink({ doc }) {
  const { open } = useLightbox();
  return (
    <button
      type="button"
      onClick={() => open([{ src: doc.src, alt: doc.alt, caption: doc.caption }], 0)}
      className="group mt-5 flex w-full items-center gap-4 rounded-xl border border-white/[0.08] p-3 text-left transition-colors duration-500 hover:border-white/20 hover:bg-white/[0.02]"
    >
      <img src={doc.preview} alt="" loading="lazy" className="h-14 w-auto rounded-[3px] transition-transform duration-500 ease-cine group-hover:-rotate-3 group-hover:scale-105" />
      <span className="flex-1">
        <span className="block text-sm text-paper">{doc.caption.title}</span>
        <span className="label mt-1 block text-dim">{doc.caption.meta}</span>
      </span>
      <span className="label pr-2 text-mute transition-colors group-hover:text-paper">View ↗</span>
    </button>
  );
}

function Leadership({ item, index, total }) {
  return (
    <article className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-6">
        <Heading item={item} index={index} total={total} />
        <Reveal from="none" duration={1.4} className="mt-8 text-[clamp(1rem,1.3vw,1.18rem)] leading-[1.7] text-paper/85">
          {item.summary}
        </Reveal>
        <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/[0.08] pt-8">
          {item.stats.map((s) => (
            <div key={s.label}>
              <dd className="display text-[clamp(2.4rem,4vw,3.6rem)] leading-none">
                <CountUp value={s.value} />
              </dd>
              <dt className="mt-2 text-sm leading-snug text-mute">{s.label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm text-paper/70">
          <span className="label mr-3 text-dim">Outcome</span>
          {item.impact}
        </p>
        <div className="mt-6">
          <Tags tech={item.tech} />
        </div>
      </div>
      <div className="lg:col-span-6">
        <PhotoFan photos={item.photos} />
      </div>
    </article>
  );
}

function Internship({ item, index, total }) {
  return (
    <article className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-6">
        <Heading item={item} index={index} total={total} />
        <Reveal from="none" duration={1.4} className="mt-8 text-[clamp(1rem,1.3vw,1.18rem)] leading-[1.7] text-paper/85">
          {item.summary}
        </Reveal>
        <div className="mt-10 grid gap-8 border-t border-white/[0.08] pt-8 sm:grid-cols-2">
          {item.gauges.map((g) => (
            <Gauge key={g.label} g={g} />
          ))}
        </div>
        <div className="mt-8">
          <Tags tech={item.tech} />
        </div>
      </div>
      <div className="lg:col-span-6 lg:pt-4">
        <Reveal from="up" distance={0.4}>
          <Terminal item={item} />
          {item.document && <CertificateLink doc={item.document} />}
        </Reveal>
      </div>
    </article>
  );
}

/** Experience: leadership, then engineering. Each one shows its work its own way. */
export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div className="container-x">
        <SectionHeader id="experience" label="Experience" note="Leadership · Engineering" />
        <div className="space-y-32 md:space-y-44">
          {experience.map((item, i) =>
            item.photos ? (
              <Leadership key={item.role} item={item} index={i} total={experience.length} />
            ) : (
              <div key={item.role} className="border-t border-white/[0.08] pt-16 md:pt-24">
                <Internship item={item} index={i} total={experience.length} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

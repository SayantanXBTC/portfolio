import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { certificates } from "../../data/portfolio";
import { useFinePointer } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { MaskLines } from "../kit/Text";
import { Reveal } from "../kit/Reveal";
import { Arrow } from "../kit/Button";
import { useLightbox } from "../kit/Lightbox";

const pad = (n) => String(n).padStart(2, "0");
const N = certificates.length;
// each sheet lies at its own slight angle, like real paper dropped on a pile
const TILT = [-2.6, 1.9, -1.3, 2.4, -2, 1.2];
const SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };

const slides = certificates.map((c) => ({
  src: c.image,
  alt: `${c.title} certificate`,
  caption: { title: c.title, meta: `${c.org} · ${c.date}`, points: c.points, link: c.link },
}));

const years = certificates.map((c) => Number(c.date.slice(-4)));
const span = `${Math.min(...years)} — ${Math.max(...years)}`;

/** Where a sheet sits in the pile: depth 0 is on top. */
function pose(depth, i, peeked, reduce) {
  if (depth === 0) return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
  const shown = depth <= 3;
  return {
    x: depth * 14 + (peeked ? 46 : 0),
    y: -depth * 16 - (peeked ? 10 : 0),
    rotate: reduce ? 0 : TILT[i % TILT.length] * (peeked ? 1.8 : 1),
    scale: 1 - depth * 0.045,
    opacity: shown || peeked ? 1 : 0,
  };
}

/**
 * The pile: every certificate is a sheet of paper. The top one can be dragged
 * off (it slides to the bottom of the pile) or clicked to read at full size.
 */
function Pile({ active, setActive, peek, onOpen }) {
  const reduce = useReducedMotion();
  const dragged = useRef(false);
  const step = (d) => setActive((a) => (a + d + N) % N);

  return (
    <div
      className="relative mx-auto w-full max-w-[40rem] select-none pr-8 pt-10 md:pr-12 md:pt-14"
      tabIndex={0}
      role="group"
      aria-roledescription="certificate pile"
      aria-label={`Certificate ${active + 1} of ${N}: ${certificates[active].title}. Use the arrow keys to go through the pile, Enter to open.`}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), step(1));
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), step(-1));
        if (e.key === "Enter" || e.key === " ") (e.preventDefault(), onOpen(active));
      }}
    >
      {/* registration marks: the pile sits on a printer's proof */}
      <span aria-hidden="true" className="pointer-events-none absolute -inset-3 md:-inset-5">
        {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((c) => (
          <span key={c} className={`absolute h-4 w-4 border-white/25 ${c}`} />
        ))}
      </span>

      <div className="relative aspect-[1.36]">
        {certificates.map((c, i) => {
          const depth = (i - active + N) % N;
          const top = depth === 0;
          return (
            <motion.div
              key={c.title}
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: N - depth, transformOrigin: "50% 60%" }}
              initial={false}
              animate={pose(depth, i, peek === i && !top, reduce)}
              transition={reduce ? { duration: 0 } : SPRING}
              drag={top ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.85}
              onDragStart={() => {
                dragged.current = true;
              }}
              onDragEnd={(_, info) => {
                const flung = Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 600;
                if (flung) step(info.offset.x < 0 ? 1 : -1);
              }}
              whileHover={top && !reduce ? { y: -6, rotate: -0.6 } : undefined}
              whileDrag={{ rotate: 0, scale: 1.02, cursor: "grabbing" }}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-hidden={!top}
                onClick={() => {
                  if (dragged.current) {
                    dragged.current = false;
                    return;
                  }
                  if (top) onOpen(i);
                  else setActive(i);
                }}
                className={`relative block w-full overflow-hidden rounded-[3px] bg-white shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.05)] ${
                  top ? "cursor-grab" : "cursor-pointer"
                }`}
              >
                <img
                  src={c.preview}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none block h-auto w-full"
                />
                {/* sheets further down the pile sit in shadow */}
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-black"
                  initial={false}
                  animate={{ opacity: top ? 0 : peek === i ? 0.15 : 0.35 + depth * 0.1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/** One line of the index. The selected line opens up to show what the course covered. */
function Entry({ cert, index, active, onSelect, onPeek, onOpen }) {
  const reduce = useReducedMotion();
  const on = index === active;
  return (
    <li className="border-b border-white/[0.08]">
      <button
        type="button"
        onClick={() => onSelect(index)}
        onPointerEnter={() => onPeek(index)}
        onPointerLeave={() => onPeek(null)}
        aria-expanded={on}
        aria-controls={`cert-${index}`}
        className="group relative grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-5 text-left md:py-6"
      >
        <span
          aria-hidden="true"
          className="absolute -left-4 top-0 h-full w-px origin-top bg-accent-strong transition-transform duration-700 ease-cine md:-left-6"
          style={{ transform: `scaleY(${on ? 1 : 0})` }}
        />
        <span className={`label transition-colors duration-500 ${on ? "text-accent-strong" : "text-dim"}`}>{pad(index + 1)}</span>
        <span
          className={`text-[clamp(1.02rem,1.5vw,1.3rem)] leading-snug tracking-tight transition-colors duration-500 ${
            on ? "text-paper" : "text-paper/55 group-hover:text-paper/90"
          }`}
        >
          {cert.title}
        </span>
        <span className="label hidden text-dim sm:block">{cert.date.slice(-4)}</span>
      </button>

      <AnimatePresence initial={false}>
        {on && (
          <motion.div
            id={`cert-${index}`}
            key="detail"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-7 pl-[calc(2.25rem+0.75rem)]">
              <p className="label flex flex-wrap items-center gap-x-3 gap-y-2 text-mute">
                <span>{cert.org}</span>
                <span className="text-dim">·</span>
                <span>{cert.date}</span>
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-paper/70">{cert.topic}</span>
              </p>
              <ul className="mt-4 space-y-1.5 text-[0.92rem] leading-relaxed text-mute">
                {cert.points.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-white/30" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <button type="button" onClick={() => onOpen(index)} className="link-underline pb-0.5 text-paper">
                  View full size
                </button>
                <a href={cert.link} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1.5 pb-0.5 text-mute hover:text-paper">
                  Open PDF <Arrow dir="up" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** Certifications: an index on one side, the pile of paper on the other. */
export default function Certifications() {
  const { open } = useLightbox();
  const fine = useFinePointer();
  const [active, setActive] = useState(0);
  const [peek, setPeek] = useState(null);
  const onOpen = (i) => open(slides, i);
  const step = (d) => setActive((a) => (a + d + N) % N);
  const nav =
    "grid h-10 w-10 place-items-center rounded-full border border-white/15 text-paper transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-ink";

  return (
    <div className="mt-40 md:mt-56">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6 md:mb-20">
        <MaskLines as="h3" lines={["Certifications"]} className="display text-[clamp(2rem,4.2vw,3.8rem)]" />
        <p className="label pb-2 text-dim">
          {N} certificates · {span}
        </p>
      </div>

      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal from="up" distance={0.5} className="lg:order-2 lg:col-span-7">
          <Pile active={active} setActive={setActive} peek={fine ? peek : null} onOpen={onOpen} />
          <div className="mx-auto mt-8 flex max-w-[40rem] items-center gap-4 pr-8 md:pr-12">
            <button type="button" onClick={() => step(-1)} aria-label="Previous certificate" className={nav}>
              <Arrow dir="left" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next certificate" className={nav}>
              <Arrow />
            </button>
            <p className="label tabular-nums text-paper">
              {pad(active + 1)} <span className="text-dim">/ {pad(N)}</span>
            </p>
            <p className="label ml-auto hidden text-right text-dim sm:block">
              {fine ? "Drag the top sheet · click to read" : "Swipe the top sheet · tap to read"}
            </p>
          </div>
        </Reveal>

        <div className="lg:order-1 lg:col-span-5">
          <ul className="border-t border-white/[0.08] pl-4 md:pl-6">
            {certificates.map((c, i) => (
              <Entry key={c.title} cert={c} index={i} active={active} onSelect={setActive} onPeek={setPeek} onOpen={onOpen} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

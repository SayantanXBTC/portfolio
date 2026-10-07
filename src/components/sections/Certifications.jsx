import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
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
const SPRING = { type: "spring", stiffness: 200, damping: 26, mass: 0.9 };

const slides = certificates.map((c) => ({
  src: c.image,
  alt: `${c.title} certificate`,
  caption: { title: c.title, meta: `${c.org} · ${c.date}`, points: c.points, link: c.link },
}));

const years = certificates.map((c) => Number(c.date.slice(-4)));
const span = `${Math.min(...years)} — ${Math.max(...years)}`;

/** Where a sheet rests in the pile: depth 0 is on top; lower sheets sit further back in space. */
function pose(depth, i, peeked = false, reduce = false) {
  if (depth === 0) return { x: 0, y: 0, z: 0, rotate: 0, rotateX: 0, rotateY: 0, opacity: 1 };
  return {
    x: depth * 12 + (peeked ? 70 : 0),
    y: -depth * 12 - (peeked ? 18 : 0),
    z: -depth * 42 + (peeked ? 36 : 0),
    rotate: reduce ? 0 : TILT[i % TILT.length] * (peeked ? 1.7 : 1),
    rotateX: 0,
    rotateY: peeked ? -8 : 0,
    opacity: depth <= 4 || peeked ? 1 : 0,
  };
}

// before the pile is seen, every sheet hangs above it, ready to drop
const DROP = { x: 0, y: -260, z: 320, rotate: 0, rotateX: -55, rotateY: 0, opacity: 0 };

/**
 * One certificate. It drops onto the pile when the pile first comes into view;
 * when it is sent to the bottom (or pulled back to the top) it swings out to the
 * side and comes round, instead of just changing places.
 */
function Sheet({ cert, i, depth, move, entered, peeked, onPick, onOpen, onFling }) {
  const reduce = useReducedMotion();
  const controls = useAnimationControls();
  const prev = useRef(depth);
  const landed = useRef(false);
  const busy = useRef(false);
  const dragged = useRef(false);
  const top = depth === 0;

  const run = (target) => {
    busy.current = true;
    return controls.start(target).then(() => {
      busy.current = false;
    });
  };

  // drop in, bottom sheet first
  useEffect(() => {
    if (!entered || landed.current) return;
    landed.current = true;
    prev.current = depth;
    const t = pose(depth, i, false, reduce);
    if (reduce) controls.set(t);
    else run({ ...t, transition: { type: "spring", stiffness: 120, damping: 17, mass: 1.1, delay: 0.2 + (N - 1 - depth) * 0.13 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered]);

  // the pile moved
  useEffect(() => {
    if (!landed.current) return;
    const from = prev.current;
    prev.current = depth;
    if (from === depth) return;
    const t = pose(depth, i, false, reduce);
    if (reduce) {
      controls.set(t);
      return;
    }
    const { k, forward, dir } = move;
    const wrapped = forward ? from < k : from >= k;
    if (!wrapped) {
      run({ ...t, transition: { ...SPRING, delay: 0.12 } });
      return;
    }
    const order = forward ? from : N - 1 - from;
    run({
      x: [null, dir * 360, t.x],
      y: [null, -46, t.y],
      z: [null, 140, t.z],
      rotate: [null, dir * 12, t.rotate],
      rotateY: [null, dir * 32, 0],
      rotateX: [null, -10, 0],
      opacity: [null, 1, t.opacity],
      transition: { duration: 1.05, times: [0, 0.45, 1], ease: [0.42, 0, 0.18, 1], delay: order * 0.08 },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depth]);

  // a line in the index is pointing at this sheet
  useEffect(() => {
    if (!landed.current || busy.current) return;
    controls.start({ ...pose(depth, i, peeked, reduce), transition: SPRING });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peeked]);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ transformOrigin: "50% 60%" }}
      initial={reduce ? pose(depth, i, false, true) : DROP}
      animate={controls}
      drag={top ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragStart={() => {
        dragged.current = true;
      }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 550) onFling(info.offset.x < 0 ? 1 : -1);
      }}
      whileHover={top && !reduce ? { z: 34, y: -10, transition: { type: "spring", stiffness: 220, damping: 20 } } : undefined}
      whileDrag={{ z: 70, rotateY: 0, cursor: "grabbing" }}
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
          else onPick(i);
        }}
        className={`relative block w-full overflow-hidden rounded-[3px] bg-white shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9),0_0_0_1px_rgba(0,0,0,0.25)] ${
          top ? "cursor-grab" : "cursor-pointer"
        }`}
      >
        <img src={cert.preview} alt="" draggable={false} loading="lazy" decoding="async" className="pointer-events-none block h-auto w-full" />
        {/* light falls on the top sheet; the ones beneath sit in its shadow */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black"
          initial={false}
          animate={{ opacity: top ? 0 : peeked ? 0.12 : 0.3 + depth * 0.1 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
        {top && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10 mix-blend-soft-light"
          />
        )}
      </button>
    </motion.div>
  );
}

/**
 * The pile, lying on a desk seen at an angle. It breathes slowly, leans toward
 * the pointer, and the top sheet can be thrown aside or clicked to read.
 */
function Pile({ active, setActive, peek, onOpen }) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const ref = useRef(null);
  const entered = useInView(ref, { once: true, amount: 0.35 });
  const step = (d) => setActive((a) => (a + d + N) % N);

  // which way the pile last moved, so sheets know which side to swing out on
  // (away from the index on the left, unless the sheet was thrown by hand)
  const last = useRef(active);
  const thrown = useRef(null);
  const move = useRef({ k: 1, forward: true, dir: 1 });
  if (last.current !== active) {
    const k = (active - last.current + N) % N;
    move.current = { k, forward: k <= N / 2, dir: thrown.current ?? 1 };
    thrown.current = null;
    last.current = active;
  }
  const fling = (d) => {
    thrown.current = d > 0 ? -1 : 1;
    step(d);
  };

  const lean = reduce ? 0 : 1;
  const tx = useSpring(useMotionValue(14 * lean), { stiffness: 80, damping: 18 });
  const ty = useSpring(useMotionValue(-12 * lean), { stiffness: 80, damping: 18 });
  const onMove = (e) => {
    if (!fine || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    ty.set(-12 + ((e.clientX - r.left) / r.width - 0.5) * 14);
    tx.set(14 - ((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const onLeave = () => {
    tx.set(14 * lean);
    ty.set(-12 * lean);
  };

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[40rem] select-none pb-6 pr-10 pt-12 md:pr-16 md:pt-16"
      tabIndex={0}
      role="group"
      aria-roledescription="certificate pile"
      aria-label={`Certificate ${active + 1} of ${N}: ${certificates[active].title}. Use the arrow keys to go through the pile, Enter to open.`}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), step(1));
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), step(-1));
        if (e.key === "Enter" || e.key === " ") (e.preventDefault(), onOpen(active));
      }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {/* registration marks: the pile sits on a printer's proof */}
      <span aria-hidden="true" className="pointer-events-none absolute -inset-3 md:-inset-5">
        {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((c) => (
          <span key={c} className={`absolute h-4 w-4 border-white/25 ${c}`} />
        ))}
      </span>

      <div className="relative aspect-[1.36]" style={{ perspective: 1500 }}>
        <div className={`absolute inset-0 [transform-style:preserve-3d] ${reduce ? "" : "pile-sway"}`}>
          <motion.div className="absolute inset-0" style={{ rotateX: tx, rotateY: ty, transformStyle: "preserve-3d" }}>
            {/* the pile's shadow on the desk */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[6%] bottom-[-4%] top-[18%] rounded-[50%] bg-black blur-2xl"
              style={{ z: -N * 42 - 30 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: entered ? 0.8 : 0 }}
              transition={{ duration: 1.6, delay: 0.4 }}
            />
            {certificates.map((c, i) => (
              <Sheet
                key={c.title}
                cert={c}
                i={i}
                depth={(i - active + N) % N}
                move={move.current}
                entered={entered || reduce}
                peeked={peek === i && i !== active}
                onPick={setActive}
                onOpen={onOpen}
                onFling={fling}
              />
            ))}
          </motion.div>
        </div>
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
          <div className="mx-auto mt-6 flex max-w-[40rem] items-center gap-4 pr-10 md:pr-16">
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

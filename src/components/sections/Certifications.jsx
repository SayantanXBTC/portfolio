import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { certificates } from "../../data/portfolio";
import { useFinePointer, usePinnedLayout } from "../../hooks/useMedia";
import { scrollToY } from "../../lib/scroll";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";
import { Reveal } from "../kit/Reveal";
import { Arrow } from "../kit/Button";
import { useLightbox } from "../kit/Lightbox";

const pad = (n) => String(n).padStart(2, "0");
const N = certificates.length;

const slides = certificates.map((c) => ({
  src: c.image,
  alt: `${c.title} certificate`,
  caption: { title: c.title, meta: `${c.org} · ${c.date}`, points: c.points, link: c.link },
}));

const years = certificates.map((c) => Number(c.date.slice(-4)));
const span = `${Math.min(...years)} — ${Math.max(...years)}`;

/**
 * Where a card rests in the stack. Everything lives in one plane and is layered
 * by z-index (no depth in space), so cards can never cut through each other;
 * the cards behind peek out above the one on top, each a little smaller and darker.
 */
function pose(depth, peeked = false) {
  return {
    x: peeked ? 56 : 0,
    y: depth * -24 - (peeked ? 10 : 0),
    scale: 1 - depth * 0.055,
    rotate: peeked ? 2.5 : 0,
    opacity: depth <= 3 || peeked ? 1 : 0,
    zIndex: N - depth,
  };
}

/**
 * One certificate card. It rises into place when the stack is first seen.
 * When it leaves the top it slides down and fades, then settles in at the back;
 * when it comes back to the top it does the reverse.
 */
function Sheet({ cert, depth, move, entered, peeked, onPick, onOpen, onFling }) {
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

  // rise in, back card first
  useEffect(() => {
    if (!entered || landed.current) return;
    landed.current = true;
    prev.current = depth;
    const t = pose(depth);
    if (reduce) controls.set(t);
    else run({ ...t, transition: { duration: 1.1, ease: EASE, delay: 0.15 + (N - 1 - depth) * 0.09 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered]);

  // the stack moved
  useEffect(() => {
    if (!landed.current) return;
    const from = prev.current;
    prev.current = depth;
    if (from === depth) return;
    const t = pose(depth);
    if (reduce) {
      controls.set(t);
      return;
    }
    const { k, forward, dir } = move;
    const wrapped = forward ? from < k : from >= k;
    if (!wrapped) {
      run({ ...t, transition: { duration: 0.8, ease: EASE, delay: 0.1 } });
      return;
    }
    const order = forward ? from : N - 1 - from;
    const timing = { duration: 0.9, times: [0, 0.4, 1], ease: EASE, delay: order * 0.07 };
    if (forward) {
      // leaves the top: drops away in front, then reappears at the back
      run({
        x: [null, dir * 40, t.x],
        y: [null, 120, t.y],
        scale: [null, 0.96, t.scale],
        rotate: [null, dir * 3, 0],
        opacity: [null, 0, t.opacity],
        zIndex: [N + 1, N + 1, t.zIndex],
        transition: timing,
      });
    } else {
      // comes back to the top: fades from the back, rises in front
      run({
        x: [null, 0, t.x],
        y: [null, 120, t.y],
        scale: [null, 0.96, t.scale],
        rotate: [null, 0, 0],
        opacity: [null, 0, 1],
        zIndex: [t.zIndex, N + 1, N + 1],
        transition: timing,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depth]);

  // a line in the index is pointing at this card
  useEffect(() => {
    if (!landed.current || busy.current) return;
    controls.start({ ...pose(depth, peeked), transition: { duration: 0.6, ease: EASE } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peeked]);

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0"
      style={{ transformOrigin: "50% 0%" }}
      initial={reduce ? pose(depth) : { ...pose(depth), y: 80, opacity: 0 }}
      animate={controls}
      drag={top ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragStart={() => {
        dragged.current = true;
      }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) onFling(info.offset.x < 0 ? 1 : -1);
      }}
    >
      {/* the hit area stays still; only the card inside lifts on hover, so it never jitters */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden={!top}
        onClick={() => {
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          if (top) onOpen(certificates.indexOf(cert));
          else onPick(certificates.indexOf(cert));
        }}
        className={`group block w-full ${top ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      >
        <span
          className={`relative block overflow-hidden rounded-xl bg-white ring-1 ring-black/10 transition-[transform,box-shadow] duration-500 ease-cine ${
            top
              ? "shadow-[0_30px_60px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] group-hover:-translate-y-1.5 group-hover:shadow-[0_45px_80px_-25px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] motion-reduce:group-hover:translate-y-0"
              : "shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]"
          }`}
        >
          <img
            src={cert.image}
            alt=""
            width={2000}
            draggable={false}
            loading="lazy"
            decoding="async"
            className="pointer-events-none block aspect-[1.36] h-auto w-full object-cover"
          />
          {/* cards further back sit in shadow */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-ink"
            initial={false}
            animate={{ opacity: top ? 0 : peeked ? 0.15 : 0.35 + depth * 0.12 }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        </span>
      </button>
    </motion.div>
  );
}

/**
 * The stack, seen at a slight angle and leaning gently toward the pointer.
 * The top card can be thrown aside or clicked to read.
 */
function Pile({ active, step, goTo, peek, onOpen }) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const ref = useRef(null);
  const entered = useInView(ref, { once: true, amount: 0.35 });

  // which way the stack last moved, and whether a card was thrown by hand
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

  const base = reduce ? { x: 0, y: 0 } : { x: 6, y: -7 };
  const tx = useSpring(base.x, { stiffness: 60, damping: 20 });
  const ty = useSpring(base.y, { stiffness: 60, damping: 20 });
  const onMove = (e) => {
    if (!fine || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    ty.set(base.y + ((e.clientX - r.left) / r.width - 0.5) * 6);
    tx.set(base.x - ((e.clientY - r.top) / r.height - 0.5) * 5);
  };
  const onLeave = () => {
    tx.set(base.x);
    ty.set(base.y);
  };

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[40rem] select-none px-2 pb-4 pt-6"
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
      <div style={{ perspective: 1800 }}>
        {/* the cards are flat inside this plane; only the plane itself is tilted */}
        <motion.div className="relative" style={{ rotateX: tx, rotateY: ty }}>
          {/* room above for the cards peeking out behind */}
          <div className="relative pt-[4.5rem]">
            <div className="relative aspect-[1.36]">
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[8%] -bottom-8 h-16 rounded-[50%] bg-black blur-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: entered ? 0.9 : 0 }}
                transition={{ duration: 1.4, delay: 0.3 }}
              />
              {certificates.map((c, i) => (
                <Sheet
                  key={c.title}
                  cert={c}
                  depth={(i - active + N) % N}
                  move={move.current}
                  entered={entered || reduce}
                  peeked={peek === i && i !== active}
                  onPick={goTo}
                  onOpen={onOpen}
                  onFling={fling}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** One line of the index. The selected line opens up to show what the course covered. */
function Entry({ cert, index, active, compact, onSelect, onPeek, onOpen }) {
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
        className={`group relative grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 text-left ${compact ? "py-4" : "py-5 md:py-6"}`}
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
            <div className={`pl-[calc(2.25rem+0.75rem)] ${compact ? "pb-5" : "pb-7"}`}>
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

/** The index and the pile, side by side. */
function Desk({ active, step, goTo, onOpen, compact, pinned }) {
  const fine = useFinePointer();
  const [peek, setPeek] = useState(null);
  const nav =
    "grid h-10 w-10 place-items-center rounded-full border border-white/15 text-paper transition-[color,background-color,border-color,opacity] duration-300 hover:border-paper hover:bg-paper hover:text-ink disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="grid w-full items-center gap-14 lg:grid-cols-12 lg:gap-16">
      <Reveal from="up" distance={0.5} className="lg:order-2 lg:col-span-7">
        <Pile active={active} step={step} goTo={goTo} peek={fine ? peek : null} onOpen={onOpen} />
        <div className="mx-auto mt-8 flex max-w-[40rem] items-center gap-4 px-2">
          <button type="button" onClick={() => step(-1)} disabled={pinned && active === 0} aria-label="Previous certificate" className={nav}>
            <Arrow dir="left" />
          </button>
          <button type="button" onClick={() => step(1)} disabled={pinned && active === N - 1} aria-label="Next certificate" className={nav}>
            <Arrow />
          </button>
          <p className="label tabular-nums text-paper">
            {pad(active + 1)} <span className="text-dim">/ {pad(N)}</span>
          </p>
          <p className="label ml-auto hidden text-right text-dim sm:block">
            {pinned ? "Scroll or drag through the pile" : fine ? "Drag the top sheet · click to read" : "Swipe the top sheet · tap to read"}
          </p>
        </div>
      </Reveal>

      <div className="lg:order-1 lg:col-span-5">
        <ul className="border-t border-white/[0.08] pl-4 md:pl-6">
          {certificates.map((c, i) => (
            <Entry key={c.title} cert={c} index={i} active={active} compact={compact} onSelect={goTo} onPeek={setPeek} onOpen={onOpen} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Certificates. On large screens the section holds still while you scroll and
 * the scroll itself deals the pile, one sheet at a time, with the index
 * following along. Picking a line, the arrows or a drag scroll you to it.
 */
export default function Certifications() {
  const { open } = useLightbox();
  const reduce = useReducedMotion();
  const pinned = usePinnedLayout() && !reduce;
  const outer = useRef(null);
  const [active, setActive] = useState(0);
  const onOpen = (i) => open(slides, i);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (pinned) setActive(Math.min(N - 1, Math.max(0, Math.floor(p * N))));
  });

  const goTo = (i) => {
    if (!pinned) {
      setActive(((i % N) + N) % N);
      return;
    }
    const el = outer.current;
    if (!el || i < 0 || i >= N) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + ((i + 0.5) / N) * (el.offsetHeight - window.innerHeight));
  };
  const step = (d) => goTo(active + d);

  return (
    <section id="certifications" aria-labelledby="certifications-title" className="relative z-10 bg-ink">
      <div className="container-x pt-36 md:pt-52">
        <SectionHeader id="certifications" label="Certificates" note={`${N} certificates · ${span}`} />
      </div>

      {pinned ? (
        <div ref={outer} className="relative" style={{ height: `${100 + N * 60}vh` }}>
          <div className="sticky top-0 flex h-[100svh] items-center pb-6 pt-20">
            <div className="container-x">
              <Desk active={active} step={step} goTo={goTo} onOpen={onOpen} compact pinned />
            </div>
          </div>
        </div>
      ) : (
        <div className="container-x pb-36 md:pb-52">
          <Desk active={active} step={step} goTo={goTo} onOpen={onOpen} />
        </div>
      )}
    </section>
  );
}

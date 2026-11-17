import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { about } from "../../data/portfolio";
import { useFinePointer, usePinnedLayout } from "../../hooks/useMedia";
import { EASE, asset } from "../../lib/asset";
import { focusSkill, scrollToId } from "../../lib/scroll";
import { MiniIcon } from "../kit/SkillIcon";
import { SectionHeader } from "../kit/SectionHeader";
import { WordReveal } from "../kit/Text";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ease3 = (t) => 1 - Math.pow(1 - t, 3);

// Scroll budget of the pinned frame: the statement lights up, then the three
// paragraphs take their turn, each with its own photograph behind it.
const INTRO = 0.1;
const ACTS = [
  [0.1, 0.4],
  [0.4, 0.7],
  [0.7, 1],
];
// once the statement is lit, these words stay in the accent colour
const HOT = ["software", "engineering,", "testing", "automation."];
const actOf = (p) => (p < ACTS[1][0] ? 0 : p < ACTS[2][0] ? 1 : 2);

/* ------------------------------------------------------------------ */
/* The photograph behind each paragraph                                */
/* ------------------------------------------------------------------ */

// Real pictures, the same ones the proof cards open: the campus, a quiz
// trophy, the National Youth Festival lectern. `pos` keeps the subject in
// frame when the picture is cropped to the panel; `dim` holds a busy one back.
const EVIDENCE = [
  { src: asset("images/lpu.webp"), pos: "50% 50%", dim: 1 },
  { src: asset("images/CPE3.webp"), pos: "50% 30%", dim: 1 },
  { src: asset("images/NYF1.webp"), pos: "50% 45%", dim: 0.8 },
];

/**
 * One photograph, darkened to a backdrop and drifting a little as its scene
 * plays, so the words always sit on something real. `full` spreads it across
 * the frame (small screens); otherwise it is a panel on the left, behind the
 * statement, that fades into the black before the paragraphs begin.
 */
function Evidence({ index, p, opacity, full = false }) {
  const photo = EVIDENCE[index];
  const o = useTransform(opacity, (v) => v * (full ? 0.3 : 0.42) * photo.dim);
  const scale = useTransform(p, [0, 1], [1.04, 1.1]);
  const y = useTransform(p, [0, 1], ["1.5%", "-1.5%"]);
  return (
    <motion.div aria-hidden="true" className={`pointer-events-none absolute inset-y-0 overflow-hidden ${full ? "inset-x-0" : "left-0 w-[60%]"}`} style={{ opacity: o }}>
      <motion.img
        src={photo.src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        style={{ objectPosition: photo.pos, scale, y, filter: "saturate(0.8)" }}
      />
      {/* the accent, as a wash of light over the picture */}
      <div className="absolute inset-0 bg-accent/20" />
      {/* into the black: right edge (panel), top and bottom */}
      {!full && <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-ink via-ink/60 to-transparent" />}
      <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-ink to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-ink to-transparent" />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* What sits in front of each photograph                               */
/* ------------------------------------------------------------------ */

function Chip({ item, i, t }) {
  const e = useTransform(t, (v) => ease3(clamp((v - i * 0.03) / 0.45, 0, 1)));
  const y = useTransform(e, (v) => (1 - v) * 16);
  return (
    <motion.button
      type="button"
      onClick={() => focusSkill(item.group, item.skill)}
      aria-label={`${item.name}: see it in Skills`}
      style={{ y, opacity: e }}
      className="group/chip inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-800/90 py-[3px] pl-[3px] pr-2.5 text-[0.74rem] text-paper/85 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.9)] transition-[border-color,color] duration-300 hover:border-white/30 hover:text-paper"
    >
      <MiniIcon item={item} size={20} />
      {item.name}
    </motion.button>
  );
}

/** The everyday toolkit, set out on a drafting board that draws itself first; the tools rise into place one after another. */
function Workbench({ p }) {
  const frame = useTransform(p, [0.04, 0.3], [0, 1], { clamp: true });
  const ticks = useTransform(p, [0.18, 0.36], [0, 1], { clamp: true });
  const t = useTransform(p, [0.2, 0.7], [0, 1], { clamp: true });
  let i = -1;
  return (
    <div className="relative px-5 pb-5 pt-7">
      {/* the board: its edge draws in, then the dimension line and corner marks */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <motion.rect x="0.3" y="0.5" width="99.4" height="99" rx="1.2" fill="rgb(5 5 5 / 0.55)" stroke="rgb(var(--accent-strong-rgb) / 0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ pathLength: frame }} />
      </svg>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: ticks }}>
        {["left-0 top-0", "right-0 top-0 rotate-90", "right-0 bottom-0 rotate-180", "left-0 bottom-0 -rotate-90"].map((c) => (
          <span key={c} className={`absolute h-3 w-3 border-l border-t border-accent-strong ${c}`} style={{ margin: -5 }} />
        ))}
        <span className="absolute -top-4 left-0 right-0 flex items-center gap-2">
          <span className="h-2 w-px bg-accent-strong/60" />
          <span className="h-px flex-1 bg-accent-strong/35" />
          <span className="label text-[0.52rem] text-accent-strong/80">Toolkit</span>
          <span className="h-px flex-1 bg-accent-strong/35" />
          <span className="h-2 w-px bg-accent-strong/60" />
        </span>
      </motion.div>

      <dl className="relative grid grid-cols-2 gap-x-5 gap-y-3">
        {about.snapshot.map((row) => (
          <div key={row.label}>
            <motion.dt className="label mb-2 text-[0.6rem] text-accent-strong" style={{ opacity: ticks }}>
              {row.label}
            </motion.dt>
            <dd className="flex flex-wrap gap-1.5">
              {row.items.map((it) => {
                i += 1;
                return <Chip key={it.name} item={it} i={i} t={t} />;
              })}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** From everyone who took part, down to the top hundred. */
function Countdown({ p }) {
  const t = useTransform(p, [0.12, 0.72], [0, 1], { clamp: true });
  const count = useTransform(t, (v) => Math.round(65000 - (65000 - 100) * ease3(v)).toLocaleString("en-IN"));
  const [done, setDone] = useState(false);
  useMotionValueEvent(t, "change", (v) => setDone(v > 0.999));
  return (
    <div className="flex items-end gap-5">
      <div>
        <p className="display text-[clamp(2.8rem,5vw,4.6rem)] leading-none tabular-nums text-paper">
          <motion.span>{count}</motion.span>
        </p>
        <p className="label mt-3 text-[0.62rem] text-dim">of 65,000+ participants · National Space Day Quiz 2025</p>
      </div>
      <AnimatePresence>
        {done && (
          <motion.span
            className="label mb-6 rounded-full bg-accent-strong px-3 py-1.5 text-[0.62rem] text-white shadow-[0_0_30px_rgb(var(--accent-strong-rgb)/0.6)]"
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
          >
            Top 100
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The frame                                                           */
/* ------------------------------------------------------------------ */

function Word({ progress, range, hot, children }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.26em] inline-block">
      <span className={`transition-colors duration-700 ${hot ? "text-accent-strong" : ""}`}>{children}</span>
    </motion.span>
  );
}

/** The statement: lit word by word; once it is lit, the words that matter keep the accent. */
function Statement({ progress, act }) {
  const words = about.statement.split(" ");
  return (
    <p aria-label={about.statement} className="editorial text-[clamp(1.9rem,3.2vw,3.3rem)] text-paper [text-shadow:0_2px_28px_rgba(0,0,0,0.7)]">
      {words.map((w, i) => {
        const s = (INTRO * i) / words.length;
        return (
          <Word key={i} progress={progress} range={[s, s + INTRO / words.length]} hot={act >= 0 && HOT.includes(w.toLowerCase())}>
            <span aria-hidden="true">{w}</span>
          </Word>
        );
      })}
    </p>
  );
}

/** Three quiet marks that fill as the paragraphs go by. */
function Marks({ progress }) {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      {ACTS.map(([a, b], i) => (
        <Mark key={i} progress={progress} range={[a, b]} n={i + 1} />
      ))}
    </div>
  );
}
function Mark({ progress, range, n }) {
  const fill = useTransform(progress, range, [0, 1], { clamp: true });
  const lit = useTransform(progress, [range[0] - 0.01, range[0]], [0.35, 1], { clamp: true });
  return (
    <motion.span className="flex items-center gap-2" style={{ opacity: lit }}>
      <span className="label text-[0.6rem] text-paper">{String(n).padStart(2, "0")}</span>
      <span className="relative h-px w-10 bg-white/15">
        <motion.span className="absolute inset-0 origin-left bg-accent-strong" style={{ scaleX: fill }} />
      </span>
    </motion.span>
  );
}

/** Split a paragraph around its proof phrases. */
function withProofs(text) {
  const out = [];
  let rest = text;
  for (;;) {
    let best = null;
    about.proofs.forEach((p) => {
      const at = rest.indexOf(p.phrase);
      if (at >= 0 && (!best || at < best.at)) best = { at, p };
    });
    if (!best) {
      out.push(rest);
      return out;
    }
    out.push(rest.slice(0, best.at), best.p);
    rest = rest.slice(best.at + best.p.phrase.length);
  }
}

/**
 * A phrase with the proof behind it. Point at it (or tap it) and a small card
 * rises with the photo and the facts, and a way to go and see the whole thing.
 * The card is drawn above the page (a portal), so it never fades with the
 * paragraph or slips under its neighbours; it closes when the page scrolls.
 */
function Proof({ proof }) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const timer = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);

  const show = (e) => {
    clearTimeout(timer.current);
    // anchor to the line actually pointed at (a phrase can wrap onto two lines)
    const rects = [...ref.current.getClientRects()];
    const r = (e?.clientY != null && rects.find((q) => e.clientY >= q.top - 2 && e.clientY <= q.bottom + 2)) || rects[0];
    const W = Math.min(280, window.innerWidth - 24);
    const left = Math.max(12, Math.min(r.left, window.innerWidth - W - 12));
    const above = r.top > 330;
    setPos({ left, width: W, above, top: above ? undefined : r.bottom + 12, bottom: above ? window.innerHeight - r.top + 12 : undefined });
    setOpen(true);
  };
  const hide = (delay = 140) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), delay);
  };
  const go = () => {
    setOpen(false);
    scrollToId(proof.to);
  };

  // the page moving away closes it; on touch, so does a tap anywhere else
  useEffect(() => {
    if (!open) return undefined;
    const onScroll = () => setOpen(false);
    const onDown = (e) => !fine && !ref.current?.contains(e.target) && !e.target.closest?.("[data-proof-card]") && setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, fine]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      <span
        ref={ref}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onPointerEnter={(e) => fine && show(e)}
        onPointerLeave={() => fine && hide()}
        onFocus={() => show()}
        onBlur={() => hide(250)}
        onClick={(e) => (fine ? go() : open ? setOpen(false) : show(e))}
        onKeyDown={(e) => e.key === "Enter" && go()}
        className="cursor-pointer text-paper underline decoration-[rgb(var(--accent-strong-rgb)/0.75)] decoration-dotted decoration-[1.5px] underline-offset-[5px] transition-colors duration-300 hover:decoration-solid"
      >
        {proof.phrase}
      </span>
      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.div
              data-proof-card
              role="dialog"
              aria-label={proof.title}
              onPointerEnter={() => fine && clearTimeout(timer.current)}
              onPointerLeave={() => fine && hide()}
              className="fixed z-[80]"
              style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, transformPerspective: 900, transformOrigin: pos.above ? "30% 100%" : "30% 0%" }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: pos.above ? -24 : 24, y: pos.above ? 14 : -14, scale: 0.94 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.above ? 8 : -8, scale: 0.97, transition: { duration: 0.18 } }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.95)]">
                <div className="relative h-36 overflow-hidden">
                  <motion.img
                    src={proof.image}
                    alt=""
                    decoding="async"
                    className="h-full w-full object-cover"
                    initial={reduce ? false : { scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: EASE }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                </div>
                <div className="px-4 pb-4 pt-1">
                  <p className="text-[0.95rem] font-medium leading-snug text-paper">{proof.title}</p>
                  <p className="mt-1 text-[0.78rem] leading-snug text-mute">{proof.meta}</p>
                  <button type="button" onClick={go} className="label mt-3 inline-flex items-center gap-2 text-[0.6rem] text-accent-strong">
                    {proof.cta} →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/** A paragraph with its proof phrases live. */
function Rich({ text }) {
  return withProofs(text).map((part, i) => (typeof part === "string" ? <span key={i}>{part}</span> : <Proof key={i} proof={part} />));
}

const FRONT = [Workbench, Countdown, null];

/** One paragraph's turn (pinned frame). */
function Act({ index, opacity, p, text }) {
  const y = useTransform(opacity, [0, 1], [24, 0]);
  const pointerEvents = useTransform(opacity, (v) => (v > 0.5 ? "auto" : "none"));
  const Front = FRONT[index];
  return (
    <motion.div className="[grid-area:1/1]" style={{ opacity, y, pointerEvents }}>
      <p className="text-[clamp(1rem,1.2vw,1.2rem)] leading-[1.75] text-paper/90 [@media(max-height:760px)]:text-[0.95rem]">
        <Rich text={text} />
      </p>
      {Front && (
        <div className="mt-8 [@media(max-height:760px)]:mt-5">
          <Front p={p} />
        </div>
      )}
    </motion.div>
  );
}

/** One paragraph in the flow of the page (small screens), its photograph behind it. */
function ScrollAct({ index, text }) {
  const ref = useRef(null);
  const one = useMotionValue(1);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useTransform(scrollYProgress, [0.18, 0.62], [0, 1], { clamp: true });
  const Front = FRONT[index];
  return (
    <div ref={ref} className="relative isolate overflow-hidden">
      <Evidence index={index} p={scrollYProgress} opacity={one} full />
      <div className="container-x relative flex min-h-[92svh] flex-col justify-center py-24">
        <p className="label mb-6 text-paper/70">{String(index + 1).padStart(2, "0")}</p>
        <p className="text-[clamp(1.02rem,2.8vw,1.2rem)] leading-[1.75] text-paper/90">
          <Rich text={text} />
        </p>
        {Front && (
          <div className="mt-10">
            <Front p={p} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * About. On large screens the frame holds still: the statement lights up word
 * by word, then each paragraph takes its turn on the right with a real
 * photograph behind it (the campus, a quiz trophy, the festival stage), the
 * toolkit assembling under the first and 65,000 narrowing to a hundred under
 * the second. Elsewhere the paragraphs follow one another down the page.
 */
export default function About() {
  const reduce = useReducedMotion();
  const pinned = usePinnedLayout() && !reduce;
  const outer = useRef(null);
  const sectionRef = useRef(null);
  const live = useInView(sectionRef, { margin: "150px 0px 150px 0px" });
  const { scrollYProgress: p } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const [act, setAct] = useState(-1);
  useMotionValueEvent(p, "change", (v) => pinned && setAct(v < INTRO ? -1 : actOf(v)));

  const actP = [
    useTransform(p, ACTS[0], [0, 1], { clamp: true }),
    useTransform(p, ACTS[1], [0, 1], { clamp: true }),
    useTransform(p, ACTS[2], [0, 1], { clamp: true }),
  ];
  const scene = [
    useTransform(p, [0, 0.08, 0.37, 0.43], [0.5, 1, 1, 0]),
    useTransform(p, [0.37, 0.43, 0.67, 0.73], [0, 1, 1, 0]),
    useTransform(p, [0.67, 0.73], [0, 1]),
  ];
  const words = [
    useTransform(p, [0.08, 0.13, 0.37, 0.41], [0, 1, 1, 0]),
    useTransform(p, [0.4, 0.45, 0.67, 0.71], [0, 1, 1, 0]),
    useTransform(p, [0.7, 0.76], [0, 1]),
  ];

  if (!pinned) {
    return (
      <section ref={sectionRef} data-live={live} id="about" aria-labelledby="about-title" className="relative z-10 overflow-x-clip bg-ink pb-20">
        <div className="container-x pt-28 md:pt-36">
          <SectionHeader id="about" label="About" note="Engineer · Builder · Explorer" />
          <WordReveal text={about.statement} highlight={["testing", "automation."]} className="editorial text-[clamp(1.9rem,6vw,3.4rem)] text-paper" />
        </div>
        <div className="mt-10">
          {about.paragraphs.map((text, i) => (
            <ScrollAct key={i} index={i} text={text} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} data-live={live} id="about" aria-labelledby="about-title" className="relative z-10 bg-ink">
      <div className="container-x overflow-x-clip pt-28 md:pt-36">
        <SectionHeader id="about" label="About" note="Engineer · Builder · Explorer" />
      </div>
      <div ref={outer} className="relative" style={{ height: "320vh" }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {EVIDENCE.map((_, i) => (
            <Evidence key={i} index={i} p={actP[i]} opacity={scene[i]} />
          ))}

          <div className="container-x relative grid h-full items-center gap-16 pb-8 pt-24 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Statement progress={p} act={act} />
              <div className="mt-10">
                <Marks progress={p} />
              </div>
            </div>
            <div className="grid lg:col-span-6 lg:col-start-7">
              {about.paragraphs.map((text, i) => (
                <Act key={i} index={i} opacity={words[i]} p={actP[i]} text={text} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

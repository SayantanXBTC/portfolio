import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { about } from "../../data/portfolio";
import { useFinePointer, usePinnedLayout } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { focusSkill, scrollToId } from "../../lib/scroll";
import { MiniIcon } from "../kit/SkillIcon";
import { SectionHeader } from "../kit/SectionHeader";
import { WordReveal } from "../kit/Text";
import { Stagger, Item } from "../kit/Stagger";

// Scroll budget of the pinned frame: the statement lights up first, then each
// paragraph takes its turn in focus.
const STATEMENT = [0, 0.28];
const PARAS = [
  [0.28, 0.52],
  [0.52, 0.76],
  [0.76, 1],
];
const HOT = ["reliable", "rigor."];

function Word({ progress, range, hot, children }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={`mr-[0.26em] inline-block ${hot ? "text-accent-strong" : ""}`}>
      {children}
    </motion.span>
  );
}

/** The statement, lit word by word by the frame's own scroll. */
function Statement({ progress }) {
  const words = about.statement.split(" ");
  const [a, b] = STATEMENT;
  return (
    <p aria-label={about.statement} className="editorial text-[clamp(1.9rem,3.3vw,3.4rem)] text-paper">
      {words.map((w, i) => {
        const s = a + ((b - a) * i) / words.length;
        return (
          <Word key={i} progress={progress} range={[s, s + (b - a) / words.length]} hot={HOT.some((h) => w.toLowerCase().includes(h))}>
            <span aria-hidden="true">{w}</span>
          </Word>
        );
      })}
    </p>
  );
}

/** A paragraph that comes into focus in its stretch of the scroll, then rests half-lit. */
function Paragraph({ progress, range, last, children }) {
  const [a, b] = range;
  const opacity = useTransform(progress, last ? [a - 0.06, a] : [a - 0.06, a, b - 0.02, b + 0.04], last ? [0.22, 1] : [0.22, 1, 1, 0.5]);
  const x = useTransform(progress, [a - 0.06, a], [14, 0]);
  const bar = useTransform(progress, [a, b], [0, 1]);
  return (
    <motion.div style={{ opacity, x }} className="relative pl-6 hover:z-10 focus-within:z-10">
      <span aria-hidden="true" className="absolute bottom-1 left-0 top-1 w-px bg-white/10">
        <motion.span style={{ scaleY: bar }} className="absolute inset-0 origin-top bg-accent-strong" />
      </span>
      <p className="text-[clamp(0.95rem,1.1vw,1.1rem)] leading-[1.7] text-paper/90 [@media(max-height:760px)]:text-[0.9rem] [@media(max-height:760px)]:leading-[1.6]">{children}</p>
    </motion.div>
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

/** The everyday toolkit as small plates; each one jumps to its place in Skills. */
function Snapshot() {
  return (
    <Stagger gap={0.08}>
      <Item as="p" kind="fade" className="label mb-4 text-paper">
        Technical snapshot
      </Item>
      <dl className="grid grid-cols-2 border-t border-white/[0.08]">
        {about.snapshot.map((row, i) => (
          <Item key={row.label} kind="left" className={`border-b border-white/[0.08] py-3.5 ${i % 2 ? "pl-4" : "pr-4"}`}>
            <dt className="label mb-2.5 text-dim">{row.label}</dt>
            <dd className="flex flex-wrap gap-1.5">
              {row.items.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => focusSkill(t.group, t.skill)}
                  aria-label={`${t.name}: see it in Skills`}
                  className="group/chip inline-flex items-center gap-1.5 rounded-full border border-white/10 py-[3px] pl-[3px] pr-2.5 text-[0.74rem] text-paper/80 transition-[border-color,color,transform] duration-300 ease-cine hover:-translate-y-0.5 hover:border-white/30 hover:text-paper"
                >
                  <span className="transition-transform duration-500 ease-cine group-hover/chip:rotate-[-8deg] group-hover/chip:scale-110">
                    <MiniIcon item={t} size={20} />
                  </span>
                  {t.name}
                </button>
              ))}
            </dd>
          </Item>
        ))}
      </dl>
    </Stagger>
  );
}

/**
 * About is one frame, read in place. On large screens the frame holds still:
 * scrolling lights the statement word by word, then brings each paragraph
 * into focus in turn. Elsewhere it reads as a single, ordinary page.
 */
export default function About() {
  const reduce = useReducedMotion();
  const pinned = usePinnedLayout() && !reduce;
  const outer = useRef(null);
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });

  if (!pinned) {
    return (
      <section id="about" aria-labelledby="about-title" className="section-y relative z-10 overflow-x-clip bg-ink">
        <div className="container-x">
          <SectionHeader id="about" label="About" note="Engineer · Builder · Explorer" />
          <WordReveal text={about.statement} highlight={HOT} className="editorial text-[clamp(1.9rem,6vw,3.4rem)] text-paper" />
          <Stagger className="mt-14 space-y-8" gap={0.15}>
            {about.paragraphs.map((p, i) => (
              <Item key={i} as="p" className="relative text-[clamp(1rem,2.6vw,1.18rem)] leading-[1.75] text-paper/85 hover:z-10 focus-within:z-10">
                <Rich text={p} />
              </Item>
            ))}
          </Stagger>
          <div className="mt-14">
            <Snapshot />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" aria-labelledby="about-title" className="relative z-10 bg-ink">
      <div className="container-x overflow-x-clip pt-28 md:pt-36">
        <SectionHeader id="about" label="About" note="Engineer · Builder · Explorer" />
      </div>
      <div ref={outer} className="relative" style={{ height: "290vh" }}>
        <div className="sticky top-0 flex h-[100svh] items-center pb-8 pt-24">
          <div className="container-x grid items-center gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Statement progress={scrollYProgress} />
              <div className="mt-12 [@media(max-height:760px)]:mt-8">
                <Snapshot />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-6 lg:col-start-7 [@media(max-height:760px)]:space-y-4">
              {about.paragraphs.map((p, i) => (
                <Paragraph key={i} progress={scrollYProgress} range={PARAS[i]} last={i === PARAS.length - 1}>
                  <Rich text={p} />
                </Paragraph>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

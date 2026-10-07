import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { about } from "../../data/portfolio";
import { usePinnedLayout } from "../../hooks/useMedia";
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
    <motion.div style={{ opacity, x }} className="relative pl-6">
      <span aria-hidden="true" className="absolute bottom-1 left-0 top-1 w-px bg-white/10">
        <motion.span style={{ scaleY: bar }} className="absolute inset-0 origin-top bg-accent-strong" />
      </span>
      <p className="text-[clamp(0.95rem,1.1vw,1.1rem)] leading-[1.7] text-paper/90 [@media(max-height:760px)]:text-[0.9rem] [@media(max-height:760px)]:leading-[1.6]">{children}</p>
    </motion.div>
  );
}

function Snapshot() {
  return (
    <Stagger gap={0.08}>
      <Item as="p" kind="fade" className="label mb-4 text-paper">
        Technical snapshot
      </Item>
      <dl className="grid grid-cols-2 border-t border-white/[0.08]">
        {about.snapshot.map((row, i) => (
          <Item
            key={row.label}
            kind="left"
            className={`group border-b border-white/[0.08] py-4 transition-colors duration-500 hover:bg-white/[0.02] ${i % 2 ? "pl-5" : "pr-5"}`}
          >
            <dt className="label mb-2 text-dim transition-colors duration-500 group-hover:text-accent-strong">{row.label}</dt>
            <dd className="text-[0.95rem] leading-snug text-paper/85">{row.value}</dd>
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
              <Item key={i} as="p" className="text-[clamp(1rem,2.6vw,1.18rem)] leading-[1.75] text-paper/85">
                {p}
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
      <div className="container-x overflow-x-clip pt-36 md:pt-52">
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
                  {p}
                </Paragraph>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Component, Suspense, lazy, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import {
  siApachemaven,
  siDocker,
  siGithubactions,
  siJavascript,
  siJenkins,
  siJunit5,
  siMongodb,
  siMysql,
  siNodedotjs,
  siPostman,
  siPython,
  siReact,
  siSelenium,
  siThreedotjs,
} from "simple-icons";
import { Atom, BrainCircuit, Coffee, Glasses, ListChecks, Network, ScrollText, ShieldCheck, Trophy, Workflow } from "lucide-react";
import { foundations } from "../../data/portfolio";
import { useAccent } from "../../context/AccentContext";
import { useFinePointer } from "../../hooks/useMedia";
import { EASE } from "../../lib/asset";
import { SectionHeader } from "../kit/SectionHeader";

const NetworkScene = lazy(() => import("../effects/NetworkScene"));

// Brand logos (Simple Icons, CC0) and drawn concept icons (Lucide) for the rest.
const BRAND = {
  siApachemaven,
  siDocker,
  siGithubactions,
  siJavascript,
  siJenkins,
  siJunit5,
  siMongodb,
  siMysql,
  siNodedotjs,
  siPostman,
  siPython,
  siReact,
  siSelenium,
  siThreedotjs,
};
const DRAWN = { Atom, BrainCircuit, Coffee, Glasses, ListChecks, Network, ScrollText, ShieldCheck, Trophy, Workflow };

// Near-black brand colours would vanish on the page; fall back to paper.
const tintFor = (item) => {
  const hex = item.tint ?? (BRAND[item.icon] ? `#${BRAND[item.icon].hex}` : "#efede9");
  const v = parseInt(hex.slice(1), 16);
  const lum = 0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255);
  return lum < 60 ? "#efede9" : hex;
};

function Glyph({ item, className }) {
  const brand = BRAND[item.icon];
  if (brand)
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d={brand.path} />
      </svg>
    );
  const Drawn = DRAWN[item.icon];
  return Drawn ? <Drawn className={className} strokeWidth={1.5} aria-hidden="true" /> : null;
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * One skill as a small physical object: it flips up into place, tilts toward the
 * pointer, the logo floats above the face, a sheen follows the cursor and the
 * logo takes its own colour while you look at it.
 */
function Tile({ item }) {
  const ref = useRef(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const [hot, setHot] = useState(false);
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const tint = tintFor(item);
  const tilt = fine && !reduce;

  const move = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty("--mx", `${px * 100}%`);
    ref.current.style.setProperty("--my", `${py * 100}%`);
    if (!tilt) return;
    ry.set((px - 0.5) * 26);
    rx.set((0.5 - py) * 26);
  };
  const leave = () => {
    setHot(false);
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.li
      className="[perspective:700px]"
      variants={{
        hidden: { opacity: 0, rotateX: -75, y: 30 },
        show: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 1, ease: EASE } },
      }}
    >
      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerEnter={() => setHot(true)}
        onPointerLeave={leave}
        whileTap={{ scale: 0.94 }}
        style={{
          rotateX: rx,
          rotateY: ry,
          transformStyle: "preserve-3d",
          borderColor: hot ? `${tint}66` : undefined,
          boxShadow: hot ? `0 30px 60px -30px ${tint}` : undefined,
        }}
        className="group relative flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-3 transition-[border-color,box-shadow] duration-500"
      >
        {/* sheen that follows the pointer */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(120px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.12), transparent 70%)" }}
        />
        {/* coloured glow under the logo */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[40%] h-12 w-12 rounded-full blur-2xl transition-opacity duration-500"
          style={{ background: tint, opacity: hot ? 0.55 : 0, transform: "translate(-50%,-50%) translateZ(10px)" }}
        />
        <span
          style={{ transform: "translateZ(38px)", color: hot ? tint : "rgba(239,237,233,0.82)" }}
          className="relative transition-colors duration-500"
        >
          <Glyph item={item} className="h-8 w-8 transition-transform duration-500 ease-cine group-hover:scale-110 md:h-9 md:w-9" />
        </span>
        <span
          style={{ transform: "translateZ(22px)" }}
          className="relative text-center text-[0.72rem] leading-tight tracking-wide text-paper/70 transition-colors duration-500 group-hover:text-paper md:text-[0.78rem]"
        >
          {item.name}
        </span>
      </motion.div>
    </motion.li>
  );
}

/**
 * Skills: Engineering -> Systems -> Exploration, each skill a tile.
 * The network visualization stays behind, turning toward the column in focus.
 */
export default function Skills() {
  const [focus, setFocus] = useState(null);
  const sceneRef = useRef(null);
  const visible = useInView(sceneRef, { margin: "200px 0px 200px 0px" });
  const reduce = useReducedMotion();
  const { accent } = useAccent();
  const turn = focus === null ? 0 : focus - 1;

  return (
    <section id="skills" aria-labelledby="skills-title" className="section-y relative z-10 overflow-x-clip bg-ink">
      <div
        ref={sceneRef}
        aria-hidden="true"
        className="pointer-events-none absolute right-[-12%] top-[6%] hidden h-[70%] w-[60%] opacity-40 lg:block"
      >
        {!reduce && visible && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <NetworkScene color={accent.bright} active={visible} turn={turn} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>

      <div className="container-x relative">
        <SectionHeader id="skills" label="Skills" note="Foundations — know · build · explore" />

        <div className="grid gap-16 lg:grid-cols-3 lg:gap-10" onPointerLeave={() => setFocus(null)}>
          {foundations.map((col, i) => (
            <div key={col.key} onPointerEnter={() => setFocus(i)} className="border-t border-white/[0.08] pt-8">
              <p className="label flex items-center justify-between">
                <span className={focus === i ? "text-accent-strong" : "text-paper"}>{String(i + 1).padStart(2, "0")}</span>
                <span className="text-dim">{col.items.length} entries</span>
              </p>
              <h3 className="display mt-6 text-[clamp(2rem,3.4vw,3.2rem)]">{col.title}</h3>
              <p className="label mt-3 text-dim">{col.line}</p>

              <motion.ul
                className="mt-10 grid grid-cols-3 gap-3"
                initial={reduce ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: i * 0.15 } } }}
              >
                {col.items.map((item) => (
                  <Tile key={item.name} item={item} />
                ))}
              </motion.ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

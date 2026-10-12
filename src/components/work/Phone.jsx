import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "../../lib/asset";
import { Arrow } from "../kit/Button";
import { PreviewVideo } from "./PreviewVideo";
import { useSwing } from "./swing";

/*
 * An iPhone 17 built from layers, so it is a solid object you can turn:
 * glass front with the Dynamic Island, an aluminium band (stacked slabs give
 * it thickness), the buttons on both sides, and the back with its camera.
 * Every size is in `em`, and the root's font size is 1% of its width, so
 * 1em is 1% of the phone's width (71.5 mm). Height is 207.8em (149.6 mm).
 */
const H = 207.8; // body height, in % of width
const T = 9; // thickness
const BEZEL = 4; // band + black border around the screen
const R = 15; // corner radius
const SLABS = 10;

// [top, length] in em of the body height; from Apple's iPhone 17 drawings.
const LEFT = [
  [41, 9.8], // Action button
  [58, 15.4], // volume up
  [78, 15.4], // volume down
];
const RIGHT = [
  [58, 22], // side button
  [118, 18], // Camera Control
];

function Buttons({ at, items }) {
  return items.map(([top, len]) => (
    <span
      key={top}
      className="absolute w-[1.1em] rounded-[0.5em] bg-gradient-to-b from-[#58585c] via-[#2c2c2f] to-[#4a4a4e]"
      style={{ top: `${top}em`, height: `${len}em`, [at]: "-0.7em" }}
    />
  ));
}

function StatusBar() {
  return (
    <span className="absolute inset-x-0 top-0 z-10 flex h-[13em] items-start justify-between bg-black px-[9em] pt-[4.3em] text-white">
      <span className="text-[4.2em] font-semibold leading-none tracking-tight">9:41</span>
      <span className="flex items-center gap-[1.4em]">
        <svg viewBox="0 0 18 12" className="h-[3.4em]" fill="currentColor" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="0.8" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
          <rect x="10" y="3" width="3" height="9" rx="0.8" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-[3.4em]" fill="currentColor" aria-hidden="true">
          <path d="M8 2.2c2.4 0 4.6.9 6.2 2.5l1.3-1.4A10.6 10.6 0 008 .3 10.6 10.6 0 00.5 3.3l1.3 1.4A8.7 8.7 0 018 2.2zm0 3.7c1.4 0 2.7.5 3.6 1.4l1.3-1.4A7 7 0 008 4a7 7 0 00-4.9 1.9l1.3 1.4C5.3 6.4 6.6 5.9 8 5.9zm0 3.6c.5 0 .9.2 1.2.5L8 11.6 6.8 10c.3-.3.7-.5 1.2-.5z" />
        </svg>
        <svg viewBox="0 0 27 12" className="h-[3.4em]" fill="none" aria-hidden="true">
          <rect x="0.5" y="0.5" width="23" height="11" rx="3.2" stroke="currentColor" strokeOpacity="0.45" />
          <rect x="2" y="2" width="16.5" height="8" rx="1.8" fill="currentColor" />
          <path d="M25 4v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2z" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </span>
    </span>
  );
}

/** The back: glass, the raised camera plateau with two lenses and the flash, the logo. */
function Back({ project }) {
  const lens = (top) => (
    <span
      className="absolute left-1/2 h-[11.5em] w-[11.5em] -translate-x-1/2 rounded-full bg-[#0c0c0d] shadow-[0_0_0_0.9em_#2a2a2d,0_0.4em_0.8em_rgba(0,0,0,0.6)]"
      style={{ top: `${top}em` }}
    >
      <span className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle_at_35%_35%,#3d4a66,#0a0b10_60%)]" />
      <span className="absolute left-[30%] top-[26%] h-[18%] w-[18%] rounded-full bg-white/40" />
    </span>
  );
  return (
    <div
      className="absolute inset-0 overflow-hidden border-[0.6em] border-[#3a3a3d]"
      style={{
        borderRadius: `${R}em`,
        transform: `translateZ(${-T / 2}em) rotateY(180deg)`,
        backfaceVisibility: "hidden",
        background: `radial-gradient(90% 60% at 30% 10%, ${project.color}33, transparent 70%), linear-gradient(160deg, #2a2a2d, #141416)`,
      }}
    >
      {/* camera plateau, top left as you look at the back */}
      <span className="absolute left-[6em] top-[6em] h-[36em] w-[22em] rounded-[8em] border border-white/10 bg-gradient-to-br from-[#323236] to-[#1c1c1f] shadow-[0_0.6em_1.4em_rgba(0,0,0,0.55)]">
        {lens(3.2)}
        {lens(20.6)}
      </span>
      <span className="absolute left-[31em] top-[10em] h-[4.6em] w-[4.6em] rounded-full bg-[radial-gradient(circle,#f3e6c4,#8b7f63)]" />
      <span className="absolute left-[32.4em] top-[18em] h-[1.6em] w-[1.6em] rounded-full bg-black/70" />
      {/* the apple, as a plain mark */}
      <svg viewBox="0 0 17 20" className="absolute left-1/2 top-[44%] h-[16em] -translate-x-1/2 text-white/[0.18]" fill="currentColor" aria-hidden="true">
        <path d="M14.1 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM11.5 3c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.1 1.1.1 2.3-.6 3-1.5z" />
      </svg>
    </div>
  );
}

/**
 * The phone: the same live product, filmed on a phone, playing on its screen.
 * Click to explore the project; drag sideways to turn it round.
 */
export function Phone({ project, playing = true, onOpen, beat = 3, className = "" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [unit, setUnit] = useState(null);
  const { rotateX, rotateY, bind } = useSwing({ spin: true, lean: [18, 10] });

  // 1em = 1% of the phone's width
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setUnit(e.contentRect.width / 100));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const Screen = onOpen ? "button" : "div";

  return (
    <div
      ref={ref}
      {...bind}
      className={`relative cursor-grab touch-pan-y select-none active:cursor-grabbing ${className}`}
      style={{ fontSize: unit ? `${unit}px` : "2px", transformStyle: "preserve-3d" }}
    >
      {/* the shadow it casts, which stays put while the phone turns */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[10em] left-1/2 h-[16em] w-[110%] -translate-x-1/2"
        style={{ background: "radial-gradient(closest-side, rgba(0,0,0,0.75), transparent)" }}
      />
      <motion.div
        className="relative w-full"
        style={{ height: `${H}em`, rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* the aluminium band: stacked slabs, with the buttons on the middle ones */}
        {Array.from({ length: SLABS }, (_, i) => {
          const z = -T / 2 + (T * (i + 0.5)) / SLABS;
          const mid = i > 1 && i < SLABS - 2;
          return (
            <div
              key={i}
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                borderRadius: `${R}em`,
                transform: `translateZ(${z}em)`,
                transformStyle: "preserve-3d",
                background: `linear-gradient(90deg, #5c5c60, #2a2a2d 8%, #1d1d20 50%, #2a2a2d 92%, #5c5c60)`,
                boxShadow: "inset 0 0 0 0.35em rgba(255,255,255,0.06)",
              }}
            >
              {mid && <Buttons at="left" items={LEFT} />}
              {mid && <Buttons at="right" items={RIGHT} />}
            </div>
          );
        })}

        <Back project={project} />

        {/* front: band, black border, screen */}
        <div
          className="absolute inset-0 bg-[#060606]"
          style={{
            borderRadius: `${R}em`,
            transform: `translateZ(${T / 2}em)`,
            backfaceVisibility: "hidden",
            boxShadow: "inset 0 0 0 0.6em #3b3b3f, inset 0 0 0 0.9em #111",
          }}
        >
          <Screen
            {...(onOpen ? { type: "button", onClick: onOpen, "aria-label": `Explore ${project.title} (phone view)` } : {})}
            className="group absolute block overflow-hidden bg-ink-800 text-left"
            style={{ inset: `${BEZEL}em`, borderRadius: `${R - BEZEL}em` }}
          >
            {/* the page starts below the status bar, as it does in the browser */}
            <span className="absolute inset-x-0 bottom-0 top-[13em] block">
              <PreviewVideo
                project={project}
                media={project.mobile}
                label="screen recording on a phone"
                playing={playing}
                className="!h-full object-cover object-top"
              />
            </span>
            <StatusBar />
            {/* Dynamic Island */}
            <span className="absolute left-1/2 top-[2.8em] z-10 h-[9.2em] w-[30em] -translate-x-1/2 rounded-full bg-black">
              <span className="absolute right-[4.2em] top-1/2 h-[3.4em] w-[3.4em] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_40%,#1d2742,#050505_65%)]" />
            </span>
            <span className="absolute bottom-[2em] left-1/2 z-10 h-[1.3em] w-[34em] -translate-x-1/2 rounded-full bg-white/80" />
            {onOpen && (
              <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/0 transition-colors duration-500 group-hover:bg-black/40">
                <span className="label flex translate-y-3 items-center gap-2 rounded-full bg-paper px-3 py-2 text-[0.6rem] text-ink opacity-0 transition-all duration-500 ease-cine group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                  Explore <Arrow />
                </span>
              </span>
            )}
            {/* glass: a fixed reflection, and one pass of light when the scene lands */}
            <span className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(115deg,rgba(255,255,255,0.13)_0%,transparent_32%,transparent_70%,rgba(255,255,255,0.05)_100%)]" />
            {!reduce && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-full z-10 w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.16] to-transparent"
                initial={{ x: "0%" }}
                animate={beat >= 1 ? { x: "300%" } : { x: "0%" }}
                transition={{ duration: beat >= 1 ? 1.8 : 0, delay: 0.5, ease: EASE }}
              />
            )}
          </Screen>
        </div>
      </motion.div>
    </div>
  );
}

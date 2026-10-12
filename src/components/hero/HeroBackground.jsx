import { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { profile } from "../../data/portfolio";
import { clamp } from "../../lib/asset";
import { useFinePointer } from "../../hooks/useMedia";

// Page and viewport heights, measured when they change rather than on every
// scroll frame (reading scrollHeight mid-scroll can force a layout).
const size = { page: 0, vh: 0 };
if (typeof window !== "undefined") {
  const measure = () => {
    size.page = document.documentElement.scrollHeight;
    size.vh = window.innerHeight;
  };
  measure();
  new ResizeObserver(measure).observe(document.documentElement);
  window.addEventListener("resize", measure);
}

const openingOf = (y) => 1 - y / ((size.vh || window.innerHeight) * 0.9);
const closingOf = (y) => {
  const vh = size.vh || window.innerHeight;
  return 1 - (size.page - (y + vh)) / (vh * 1.1);
};

// Visible at the top (opening shot) and again at the very end (closing frame).
function plateOpacity(y) {
  return clamp(Math.max(openingOf(y), closingOf(y)), 0, 1);
}

const { fg, bg, mono } = profile.portraitLayers;
const layer = "absolute inset-0 h-full w-full object-cover";
const framing = { objectPosition: "45% 22%" };

/**
 * Fixed photographic plate behind the opening and closing frames, built in two
 * layers: the subject, lifted out, in front of the scene. The layers move
 * apart a little with the pointer (or, on touch screens, a slow drift) and
 * with the scroll, so the photo has depth; a soft light follows the pointer.
 * In the closing frame the scene falls to black and white while the subject
 * keeps his colour.
 *
 * Landscape: a full-height portrait panel on the right, fading into the black
 * on its left edge, so the type on the left never touches the face.
 * Portrait screens: the photo becomes a framed top panel, type below it.
 */
export default function HeroBackground() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, plateOpacity);
  const visibility = useTransform(opacity, (o) => (o <= 0.01 ? "hidden" : "visible"));

  // where the pointer is, -1..1, eased
  const px = useSpring(0, { stiffness: 40, damping: 18 });
  const py = useSpring(0, { stiffness: 40, damping: 18 });
  const lx = useMotionValue(70);
  const ly = useMotionValue(35);

  useEffect(() => {
    if (reduce) return undefined;
    if (fine) {
      const onMove = (e) => {
        px.set((e.clientX / window.innerWidth) * 2 - 1);
        py.set((e.clientY / window.innerHeight) * 2 - 1);
        lx.set((e.clientX / window.innerWidth) * 100);
        ly.set((e.clientY / window.innerHeight) * 100);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    }
    // touch: no pointer to follow, so the layers drift slowly on their own (only while the plate shows)
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      if (opacity.get() > 0.01) {
        const t = (now - t0) / 1000;
        px.set(Math.sin(t * 0.35) * 0.7);
        py.set(Math.sin(t * 0.23 + 1) * 0.5);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, fine, px, py, lx, ly, opacity]);

  // the scene moves against the pointer, the subject with it: depth without any 3D engine
  const sink = useTransform(scrollY, (y) => -Math.min(y, size.vh || 800) * 0.05);
  const bgX = useTransform(px, (v) => v * -9);
  const bgY = useTransform(py, (v) => v * -6);
  const fgX = useTransform(px, (v) => v * 14);
  const fgY = useTransform([py, sink], ([v, s]) => v * 9 + s);
  const light = useMotionTemplate`radial-gradient(28rem circle at ${lx}% ${ly}%, rgba(255, 236, 214, 0.09), transparent 60%)`;
  // only ever in the closing frame: zero while any of the opening shot is still showing
  const monoOpacity = useTransform(scrollY, (y) => (openingOf(y) > 0 ? 0 : clamp((closingOf(y) - 0.2) / 0.7, 0, 1)));
  const settle = reduce ? {} : { initial: { opacity: 0, scale: 1.12 }, animate: { opacity: 1, scale: 1.06 }, transition: { duration: 2.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] } };

  return (
    <motion.div aria-hidden="true" style={{ opacity, visibility }} className="fixed inset-0 z-0 overflow-hidden bg-ink">
      <div className="hero-plate overflow-hidden">
        {/* the scene, in colour and (for the closing frame) in black and white */}
        <motion.div className="absolute inset-0 will-change-transform" style={reduce ? undefined : { x: bgX, y: bgY }} {...settle}>
          <img src={bg} alt="" decoding="async" fetchpriority="high" className={layer} style={framing} />
          <motion.img src={mono} alt="" decoding="async" className={layer} style={{ ...framing, opacity: monoOpacity }} />
        </motion.div>
        {/* the subject, lifted off the scene */}
        <motion.div className="absolute inset-0 will-change-transform" style={reduce ? undefined : { x: fgX, y: fgY }} {...settle}>
          <img src={fg} alt="" decoding="async" fetchpriority="high" className={layer} style={framing} />
        </motion.div>

        {/* a soft light that follows the pointer */}
        {fine && !reduce && <motion.div className="absolute inset-0" style={{ background: light }} />}

        {/* blend the panel into the page: left edge (landscape), bottom, top */}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-ink via-ink/50 to-transparent portrait:hidden" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-ink via-ink/50 to-transparent portrait:h-[45%]" />
        <div className="absolute inset-0 bg-accent-soft/10 mix-blend-multiply" />
      </div>
    </motion.div>
  );
}

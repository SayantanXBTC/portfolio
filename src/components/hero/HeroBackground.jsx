import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { profile } from "../../data/portfolio";
import { clamp } from "../../lib/asset";

// Visible at the top (opening shot) and again at the very end (closing frame).
function plateOpacity(y) {
  const vh = window.innerHeight;
  const opening = 1 - y / (vh * 0.9);
  const toEnd = document.documentElement.scrollHeight - (y + vh);
  const closing = 1 - toEnd / (vh * 1.1);
  return clamp(Math.max(opening, closing), 0, 1);
}

/**
 * Fixed photographic plate behind the opening and closing frames.
 * Landscape: a full-height portrait panel on the right, fading into the black
 * on its left edge, so the type on the left never touches the face.
 * Portrait screens: the photo becomes a framed top panel, type below it.
 */
export default function HeroBackground() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, plateOpacity);
  const visibility = useTransform(opacity, (o) => (o <= 0.01 ? "hidden" : "visible"));

  return (
    <motion.div aria-hidden="true" style={{ opacity, visibility }} className="fixed inset-0 z-0 overflow-hidden bg-ink">
      <div className="hero-plate overflow-hidden">
        <motion.img
          src={profile.portrait}
          alt=""
          decoding="async"
          fetchpriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "45% 22%", filter: "saturate(0.82) contrast(1.05) brightness(0.92)" }}
          initial={reduce ? false : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* blend the panel into the page: left edge (landscape), bottom, top */}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-ink via-ink/50 to-transparent portrait:hidden" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-ink via-ink/50 to-transparent portrait:h-[45%]" />
        <div className="absolute inset-0 bg-accent-soft/10 mix-blend-multiply" />
      </div>
    </motion.div>
  );
}

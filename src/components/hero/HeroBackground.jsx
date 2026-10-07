import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { videoSrc } from "../../data/portfolio";
import { clamp } from "../../lib/asset";

const SENSITIVITY = 0.8;

/**
 * Fixed full-screen film plate behind the whole page.
 * The video never plays: horizontal pointer movement scrubs it, so the
 * visitor "drives" time. On touch screens a horizontal drag (and the scroll
 * itself while the hero is on screen) does the same.
 */
export default function HeroBackground() {
  const videoRef = useRef(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // The plate belongs to the hero: it fades out as the next section slides over it,
  // then stops being painted at all.
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, (y) => clamp(1 - y / (window.innerHeight * 0.9), 0, 1));
  const visibility = useTransform(opacity, (o) => (o <= 0.01 ? "hidden" : "visible"));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let target = 0;
    let seeking = false;
    let prevX = null;
    let prevTouchX = null;

    const duration = () => (Number.isFinite(video.duration) ? video.duration : 0);
    const heroVisible = () => window.scrollY < window.innerHeight * 1.1;

    const publish = () => {
      const d = duration();
      document.documentElement.style.setProperty("--scrub", d ? String(video.currentTime / d) : "0");
    };

    // One seek in flight at a time; if the target moved meanwhile, onseeked queues the next one.
    const seek = () => {
      const d = duration();
      if (!d || seeking) return;
      if (Math.abs(video.currentTime - target) < 0.02) return;
      seeking = true;
      video.currentTime = target;
    };

    const onSeeked = () => {
      seeking = false;
      publish();
      if (Math.abs(video.currentTime - target) > 0.03) seek();
    };

    const nudge = (deltaPx) => {
      const d = duration();
      if (!d) return;
      target = clamp(target + (deltaPx / window.innerWidth) * SENSITIVITY * d, 0, d);
      seek();
    };

    const onMouseMove = (e) => {
      if (!heroVisible()) {
        prevX = e.clientX;
        return;
      }
      if (prevX !== null) nudge(e.clientX - prevX);
      prevX = e.clientX;
    };

    const onTouchMove = (e) => {
      const x = e.touches[0].clientX;
      if (heroVisible() && prevTouchX !== null) nudge((x - prevTouchX) * 1.6);
      prevTouchX = x;
    };
    const onTouchEnd = () => {
      prevTouchX = null;
    };

    // Touch fallback #2: vertical scroll also advances the film while the hero is in view.
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < window.innerHeight && "ontouchstart" in window) nudge((y - lastY) * 0.9);
      lastY = y;
    };

    const onMeta = () => {
      video.currentTime = 0.01; // forces the first frame to paint without playing
      setReady(true);
    };

    video.addEventListener("seeked", onSeeked);
    video.addEventListener("loadedmetadata", onMeta);
    if (video.readyState >= 1) onMeta();

    if (!reduce) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("loadedmetadata", onMeta);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduce]);

  return (
    <motion.div aria-hidden="true" style={{ opacity, visibility }} className="fixed inset-0 z-0 overflow-hidden bg-ink">
      {!failed && (
        <motion.video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "70% center" }}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 1.08 }}
          transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      {/* grade: darken, red atmosphere, vignette. The text always wins. */}
      <div className="absolute inset-0 bg-ink/55" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 78% 45%, rgb(var(--accent-rgb) / 0.22), transparent 70%), radial-gradient(45% 40% at 12% 92%, rgb(var(--accent-soft-rgb) / 0.25), transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)" }}
      />
    </motion.div>
  );
}

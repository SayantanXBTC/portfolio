import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useFinePointer } from "../../hooks/useMedia";

const INTERACTIVE = "a, button, [role='button'], summary, input, textarea, [data-cursor]";

/**
 * Two small desktop-only touches:
 *  - a soft ring that trails the pointer and swells over interactive elements
 *  - an accent ripple where you click
 * The native cursor stays visible; nothing here blocks input.
 */
export default function CursorEffects() {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 300, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 300, damping: 30, mass: 0.5 });
  const [hot, setHot] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [pulses, setPulses] = useState([]);

  useEffect(() => {
    if (reduce) return undefined;
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHot(Boolean(e.target.closest?.(INTERACTIVE)));
    };
    const onDown = (e) => {
      setPressed(true);
      const id = performance.now() + Math.random();
      setPulses((p) => [...p.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setPulses((p) => p.filter((q) => q.id !== id)), 750);
    };
    const onUp = () => setPressed(false);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [reduce, x, y]);

  if (reduce) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
      {fine && (
        <motion.div
          style={{ x: sx, y: sy }}
          className="absolute left-0 top-0 -ml-4 -mt-4 h-8 w-8 rounded-full border border-accent-strong/70"
          animate={{
            scale: pressed ? 0.7 : hot ? 1.9 : 1,
            backgroundColor: hot ? "rgb(var(--accent-rgb) / 0.16)" : "rgb(var(--accent-rgb) / 0)",
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
      {pulses.map((p) => (
        <span
          key={p.id}
          className="absolute h-24 w-24 rounded-full border border-accent-strong"
          style={{ left: p.x, top: p.y, animation: "pulse-ring 0.7s cubic-bezier(0.16,1,0.3,1) forwards" }}
        />
      ))}
    </div>
  );
}

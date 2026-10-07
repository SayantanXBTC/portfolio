import { useEffect } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useFinePointer } from "./useMedia";

/**
 * Normalised pointer position (-1..1) over `ref`, eased with a spring.
 * Stays at 0 on touch screens and for reduced-motion visitors.
 */
export function usePointerParallax(ref) {
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const x = useSpring(rx, { stiffness: 70, damping: 20, mass: 0.6 });
  const y = useSpring(ry, { stiffness: 70, damping: 20, mass: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !fine) return undefined;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      rx.set(((e.clientX - r.left) / r.width) * 2 - 1);
      ry.set(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => {
      rx.set(0);
      ry.set(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, reduce, fine, rx, ry]);

  return { x, y };
}

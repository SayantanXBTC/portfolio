import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useFinePointer } from "../../hooks/useMedia";

/** Pulls its child a few pixels toward the pointer. Desktop, motion-enabled only. */
export function Magnetic({ children, strength = 0.22, className }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  if (reduce || !fine) return <div className={className}>{children}</div>;

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset} className={className}>
      {children}
    </motion.div>
  );
}

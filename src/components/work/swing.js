import { useRef } from "react";
import { useReducedMotion, useSpring } from "framer-motion";
import { useFinePointer } from "../../hooks/useMedia";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Lets a device be handled: it leans toward the pointer, and a drag swings it
 * around (a phone can spin all the way round). On release it springs back to
 * face you. A drag never counts as a click, so the device stays clickable.
 * Touch keeps vertical page scrolling (`pan-y`); a sideways drag swings.
 */
export function useSwing({ spin = false, lean = [12, 9] } = {}) {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const rx = useSpring(0, { stiffness: 120, damping: 16 });
  const ry = useSpring(0, { stiffness: 120, damping: 16 });
  const drag = useRef(null);
  const moved = useRef(false);
  const base = useRef(0); // whole turns a spun phone has made, so it settles without unwinding

  const onPointerDown = (e) => {
    moved.current = false;
    if (reduce || e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, rx: rx.get(), ry: ry.get() };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (d) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!moved.current && Math.hypot(dx, dy) > 6) {
        moved.current = true;
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }
      if (moved.current) {
        ry.set(spin ? d.ry + dx * 0.7 : clamp(d.ry + dx * 0.3, -38, 38));
        rx.set(clamp(d.rx - dy * 0.25, -24, 24));
      }
      return;
    }
    if (!fine || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(base.current + ((e.clientX - r.left) / r.width - 0.5) * lean[0]);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * lean[1]);
  };
  const release = () => {
    if (!drag.current) return;
    drag.current = null;
    if (spin) base.current = Math.round(ry.get() / 360) * 360;
    ry.set(base.current);
    rx.set(0);
  };
  const onPointerLeave = () => {
    if (drag.current) return;
    ry.set(base.current);
    rx.set(0);
  };
  // swallow the click that ends a drag
  const onClickCapture = (e) => {
    if (!moved.current) return;
    e.preventDefault();
    e.stopPropagation();
    moved.current = false;
  };

  return {
    rotateX: rx,
    rotateY: ry,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerCancel: release,
      onPointerLeave,
      onClickCapture,
      onDragStart: (e) => e.preventDefault(),
    },
  };
}

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const isDigit = (c) => c >= "0" && c <= "9";

/**
 * A figure that decodes into place instead of counting up. Counting up from
 * zero shows smaller numbers on the way (a CGPA of 5.58, 251 tests), and a
 * glance or a screenshot at that moment would read them as real. Here the
 * digits scramble dimly, clearly unsettled, then lock in from the left, so
 * the only crisp figure on screen is ever the true one.
 */
export function Decode({ value, start = true, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const chars = [...String(value)];
  const slots = chars.map((c, i) => (isDigit(c) ? i : -1)).filter((i) => i >= 0);
  // -1: waiting; then how many digits have locked; Infinity: finished
  const [locked, setLocked] = useState(reduce || !slots.length ? Infinity : -1);
  const [noise, setNoise] = useState(() => chars.map(() => 0));

  useEffect(() => {
    if (reduce || !slots.length) {
      setLocked(Infinity);
      return undefined;
    }
    if (!seen || !start || locked !== -1) return undefined;
    let raf;
    let last = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const t = now - t0;
      const n = Math.max(0, Math.floor((t - 220) / 120) + 1);
      if (n >= slots.length) {
        setLocked(Infinity);
        return;
      }
      if (now - last > 55) {
        last = now;
        setNoise(chars.map(() => Math.floor(Math.random() * 10)));
        setLocked(n);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, start, reduce, value]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`} aria-label={value}>
      <span aria-hidden="true">
        {chars.map((c, i) => {
          if (!isDigit(c)) return <span key={i}>{c}</span>;
          const k = slots.indexOf(i);
          if (locked === Infinity || k < locked) return <span key={i}>{c}</span>;
          // unsettled: dim, so it never reads as a real figure
          return (
            <span key={i} className="opacity-25">
              {locked === -1 ? c : noise[i]}
            </span>
          );
        })}
      </span>
    </span>
  );
}

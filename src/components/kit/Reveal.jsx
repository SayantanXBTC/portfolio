import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { EASE } from "../../lib/asset";

const OFFSETS = {
  left: { x: -110 },
  right: { x: 110 },
  up: { y: 70 },
  down: { y: -70 },
  scale: { scale: 0.9 },
  none: {},
};

/**
 * Directional scroll reveal. Content slides in from a side (or rises / scales)
 * the first time it enters the viewport.
 */
export function Reveal({
  from = "up",
  delay = 0,
  duration = 1.2,
  distance = 1,
  amount = 0.2,
  margin = "0px 0px -8% 0px",
  once = true,
  as = "div",
  className,
  children,
  ...rest
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  const o = OFFSETS[from] ?? OFFSETS.up;
  const hidden = {
    opacity: 0,
    x: (o.x ?? 0) * distance,
    y: (o.y ?? 0) * distance,
    scale: o.scale ?? 1,
  };

  if (reduce) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      initial={hidden}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount, margin }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Image / block reveal that wipes in from a side, with the content settling in.
 * The wrapper (which has no clip) is what gets observed: Chrome treats a fully
 * clip-path'd element as not intersecting, so it could never trigger itself.
 */
export function ClipReveal({
  from = "left",
  delay = 0,
  duration = 1.5,
  amount = 0.15,
  scaleFrom = 1.25,
  className,
  innerClassName,
  children,
}) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount, margin: "0px 0px -6% 0px" });
  const hidden = {
    left: "inset(0 100% 0 0)",
    right: "inset(0 0 0 100%)",
    up: "inset(100% 0 0 0)",
    down: "inset(0 0 100% 0)",
  }[from];

  if (reduce)
    return (
      <div className={className}>
        <div className={innerClassName}>{children}</div>
      </div>
    );

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full w-full"
        initial={{ clipPath: hidden }}
        animate={{ clipPath: seen ? "inset(0 0% 0% 0%)" : hidden }}
        transition={{ duration, delay, ease: EASE }}
      >
        <motion.div
          className={innerClassName}
          initial={{ scale: scaleFrom }}
          animate={{ scale: seen ? 1 : scaleFrom }}
          transition={{ duration: duration + 0.6, delay, ease: EASE }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

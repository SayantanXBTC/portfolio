import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "../../lib/asset";

// A soft landing with a touch of overshoot, for things that "pop" into place.
const POP = [0.34, 1.32, 0.64, 1];

const ITEM = {
  rise: {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
  },
  left: {
    hidden: { opacity: 0, x: -40 },
    show: { opacity: 1, x: 0, transition: { duration: 1, ease: EASE } },
  },
  pop: {
    hidden: { opacity: 0, y: 40, scale: 0.86 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.95, ease: POP } },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 1.2, ease: EASE } },
  },
};

/**
 * Children marked with <Item> appear one after another the first time the
 * group scrolls into view. One grammar for every list on the page.
 */
export function Stagger({ as = "div", className, children, delay = 0, gap = 0.08, amount = 0.2, ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount, margin: "0px 0px -6% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Item({ as = "div", kind = "rise", className, children, ...rest }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag className={className} variants={ITEM[kind]} {...rest}>
      {children}
    </Tag>
  );
}

import { useReducedMotion } from "framer-motion";

// Very low-opacity film grain. The element is moved with steps() in CSS, which is
// cheap (compositor only) and never reads as TV static.
export default function Grain() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return <div aria-hidden="true" className="grain" />;
}

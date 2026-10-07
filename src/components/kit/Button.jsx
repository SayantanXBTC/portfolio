import { motion } from "framer-motion";
import { scrollToId } from "../../lib/scroll";

export function Arrow({ className = "", dir = "right" }) {
  const rotate = { right: 0, up: -45, down: 90, ur: -45 }[dir] ?? 0;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 shrink-0 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  );
}

const base =
  "group relative inline-flex items-center gap-3 overflow-hidden rounded-full border px-6 py-3 text-[0.8rem] font-medium tracking-wide transition-colors duration-500 ease-cine select-none";
const variants = {
  primary: "border-accent bg-accent text-white hover:bg-accent-strong hover:border-accent-strong",
  ghost: "border-white/15 text-paper hover:border-accent-strong hover:text-white",
};

/**
 * Pill button / link. Internal "#id" links glide through the page with Lenis
 * and keep the URL hash in sync.
 */
export function Button({ href, variant = "ghost", children, arrow = true, onClick, className = "", ...rest }) {
  const isHash = href?.startsWith("#");
  const Comp = href ? motion.a : motion.button;

  const handle = (e) => {
    if (isHash) {
      e.preventDefault();
      const id = href.slice(1);
      scrollToId(id);
      window.history.replaceState(null, "", id === "home" ? window.location.pathname : href);
    }
    onClick?.(e);
  };

  return (
    <Comp
      href={href}
      onClick={handle}
      whileTap={{ scale: 0.96 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...(href && !isHash && !href.startsWith("mailto:") && !href.startsWith("tel:")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...rest}
    >
      {/* fill sweep on hover for the ghost variant */}
      {variant === "ghost" && (
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-0 origin-left scale-x-0 bg-accent/90 transition-transform duration-700 ease-cine group-hover:scale-x-100"
        />
      )}
      <span className="relative z-10">{children}</span>
      {arrow && (
        <span className="relative z-10 transition-transform duration-500 ease-cine group-hover:translate-x-1">
          <Arrow />
        </span>
      )}
    </Comp>
  );
}

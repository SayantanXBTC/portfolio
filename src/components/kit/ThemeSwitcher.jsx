import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccent } from "../../context/AccentContext";
import { EASE } from "../../lib/asset";

/** Small palette control. Only the accent colour changes; the rest of the design stays put. */
export function ThemeSwitcher({ align = "right" }) {
  const { accent, accents, setAccent } = useAccent();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrap.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-label={`Accent colour: ${accent.label}. Change colour`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition-colors duration-300 hover:border-accent-strong"
      >
        <motion.span
          className="block h-3.5 w-3.5 rounded-full"
          style={{ background: accent.bright }}
          whileTap={{ scale: 0.7 }}
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="group"
            aria-label="Accent colours"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={`absolute top-12 z-50 flex gap-2.5 rounded-full border border-white/10 bg-ink/90 p-2.5 backdrop-blur-xl ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {accents.map((a, i) => (
              <motion.button
                key={a.id}
                type="button"
                aria-label={a.label}
                aria-pressed={a.id === accent.id}
                title={a.label}
                onClick={() => setAccent(a.id)}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: EASE }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                className="relative h-6 w-6 rounded-full"
                style={{ background: a.bright }}
              >
                {a.id === accent.id && (
                  <motion.span
                    layoutId="accent-ring"
                    className="absolute -inset-1 rounded-full border border-white/70"
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

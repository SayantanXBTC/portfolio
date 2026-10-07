import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAccent } from "../../context/AccentContext";
import { EASE } from "../../lib/asset";

/**
 * Accent control, styled like a design-system token picker. Only the accent
 * variables change; hierarchy, type and greys stay exactly where they are.
 */
export function ThemeSwitcher() {
  const { accent, accents, setAccent } = useAccent();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const options = useRef([]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrap.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    // move focus to the selected option when the panel opens
    const i = accents.findIndex((a) => a.id === accent.id);
    requestAnimationFrame(() => options.current[i]?.focus());
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // arrow keys move through the radio group, as a native radio group would
  const onKeyDown = (e, i) => {
    const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const n = (i + step + accents.length) % accents.length;
    setAccent(accents[n].id);
    options.current[n]?.focus();
  };

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-label={`Accent colour: ${accent.label}. Change accent`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="group flex h-9 items-center gap-2.5 rounded-full border border-white/10 pl-2.5 pr-3 transition-colors duration-500 hover:border-white/30"
      >
        <span className="relative block h-3 w-3 rounded-full" style={{ background: accent.bright }}>
          <span className="absolute -inset-[3px] rounded-full border border-white/0 transition-colors duration-500 group-hover:border-white/30" />
        </span>
        <span className="label hidden text-[0.62rem] text-mute md:inline">Accent</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute right-0 top-12 z-50 w-56 origin-top-right rounded-md border border-white/10 bg-ink-800/95 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <p id="accent-label" className="label px-2.5 pb-2.5 pt-1.5 text-[0.6rem] text-dim">
              Accent token
            </p>
            <div role="radiogroup" aria-labelledby="accent-label">
              {accents.map((a, i) => {
                const on = a.id === accent.id;
                return (
                  <button
                    key={a.id}
                    ref={(el) => (options.current[i] = el)}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setAccent(a.id)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className={`flex w-full items-center gap-3 rounded px-2.5 py-2 text-left text-[0.8rem] transition-colors duration-300 ${
                      on ? "bg-white/[0.06] text-paper" : "text-mute hover:bg-white/[0.03] hover:text-paper"
                    }`}
                  >
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: a.bright }} />
                    <span className="flex-1">{a.label}</span>
                    <span className="label text-[0.58rem] text-dim">{a.hex.toUpperCase()}</span>
                    <span className="w-3 text-paper" aria-hidden="true">
                      {on && (
                        <motion.svg layoutId="accent-check" viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 6.5l2.5 2.5L10 3.5" />
                        </motion.svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

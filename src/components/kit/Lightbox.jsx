import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { lockScroll, unlockScroll } from "../../lib/scroll";
import { EASE } from "../../lib/asset";

const LightboxContext = createContext(null);
export const useLightbox = () => useContext(LightboxContext);

function Overlay({ images, index, setIndex, close }) {
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const count = images.length;
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count, setIndex]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count, setIndex]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    lockScroll();
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      // keep keyboard focus inside the dialog
      if (e.key === "Tab" && dialogRef.current) {
        const f = [...dialogRef.current.querySelectorAll("button, a[href]")];
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
      previouslyFocused?.focus?.();
    };
  }, [close, next, prev]);

  const img = images[index];
  const btn =
    "grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/40 text-paper backdrop-blur transition-colors duration-300 hover:border-accent-strong hover:bg-accent";

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      onClick={close}
      data-lenis-prevent
    >
      <button ref={closeRef} onClick={close} aria-label="Close" className={`${btn} absolute right-5 top-5`}>
        <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>

      {count > 1 && (
        <>
          <button
            onClick={(e) => (e.stopPropagation(), prev())}
            aria-label="Previous image"
            className={`${btn} absolute left-3 md:left-8 top-1/2 -translate-y-1/2`}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>
          <button
            onClick={(e) => (e.stopPropagation(), next())}
            aria-label="Next image"
            className={`${btn} absolute right-3 md:right-8 top-1/2 -translate-y-1/2`}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.figure
          key={img.src}
          onClick={(e) => e.stopPropagation()}
          className="flex max-w-full flex-col items-center"
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <img
            src={img.src}
            alt={img.alt ?? ""}
            className={`max-w-full rounded-sm object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ${
              img.caption?.points ? "max-h-[62vh]" : img.caption ? "max-h-[72vh]" : "max-h-[84vh]"
            }`}
          />
          {img.caption && (
            <figcaption className="mt-6 flex w-full max-w-3xl flex-wrap items-end justify-between gap-4 text-left">
              <span>
                <span className="block text-lg font-medium tracking-tight text-paper">{img.caption.title}</span>
                <span className="label mt-2 block text-dim">{img.caption.meta}</span>
                {img.caption.points && (
                  <span className="mt-4 block space-y-1 text-sm text-mute">
                    {img.caption.points.map((p) => (
                      <span key={p} className="block">
                        — {p}
                      </span>
                    ))}
                  </span>
                )}
              </span>
              {img.caption.link && (
                <a
                  href={img.caption.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label link-underline pb-1 text-mute hover:text-paper"
                >
                  Open PDF ↗
                </a>
              )}
            </figcaption>
          )}
        </motion.figure>
      </AnimatePresence>

      {count > 1 && (
        <div className="label absolute bottom-6 left-1/2 -translate-x-1/2 text-paper/80">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </div>
      )}
    </motion.div>
  );
}

export function LightboxProvider({ children }) {
  const [state, setState] = useState(null); // { images, index }

  const open = useCallback((images, index = 0) => setState({ images, index }), []);
  const close = useCallback(() => setState(null), []);
  const setIndex = useCallback(
    (fn) => setState((s) => (s ? { ...s, index: typeof fn === "function" ? fn(s.index) : fn } : s)),
    []
  );

  const value = useMemo(() => ({ open }), [open]);

  return (
    <LightboxContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {state && <Overlay key="lb" images={state.images} index={state.index} setIndex={setIndex} close={close} />}
      </AnimatePresence>
    </LightboxContext.Provider>
  );
}

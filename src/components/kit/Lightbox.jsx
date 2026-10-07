import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { lockScroll, unlockScroll } from "../../lib/scroll";
import { EASE } from "../../lib/asset";

const LightboxContext = createContext(null);
export const useLightbox = () => useContext(LightboxContext);

function Overlay({ images, index, setIndex, close }) {
  const closeRef = useRef(null);
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
        <motion.img
          key={img.src}
          src={img.src}
          alt={img.alt ?? ""}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[86vh] max-w-full rounded-lg object-contain shadow-2xl"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.55, ease: EASE }}
        />
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

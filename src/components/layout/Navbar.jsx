import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { sections, profile, chapters } from "../../data/portfolio";
import { useActiveSection } from "../../hooks/useActiveSection";
import { deepLink, scrollToId, lockScroll, unlockScroll } from "../../lib/scroll";
import { EASE } from "../../lib/asset";
import { ThemeSwitcher } from "../kit/ThemeSwitcher";
import { Arrow } from "../kit/Button";

const CENTER = sections.filter((s) => s.nav !== false);
const IDS = sections.map((s) => s.id);

function go(id, e) {
  e?.preventDefault();
  scrollToId(id);
  window.history.replaceState(null, "", id === "home" ? window.location.pathname : `#${id}`);
}

function MobileMenu({ open, onClose, active }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-[70] flex flex-col bg-ink/[0.97] px-6 pb-8 pt-24 backdrop-blur-xl"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.8, ease: EASE }}
          data-lenis-prevent
        >
          <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-1">
            {sections.map((s, i) => (
              <div key={s.id} className="overflow-hidden">
                <motion.a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    onClose();
                    setTimeout(() => go(s.id, e), 450);
                    e.preventDefault();
                  }}
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { delay: 0.25 + i * 0.06, duration: 0.8, ease: EASE } }}
                  exit={{ x: -30, opacity: 0, transition: { duration: 0.25 } }}
                  aria-current={active === s.id ? "page" : undefined}
                  className="flex items-baseline gap-4 py-1.5"
                >
                  <span className="label w-6 text-dim">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={`display text-[clamp(2.2rem,11vw,3.6rem)] transition-colors ${
                      active === s.id ? "text-accent-strong" : "text-paper"
                    }`}
                  >
                    {s.label}
                  </span>
                </motion.a>
              </div>
            ))}
          </nav>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.8 } }}
            className="flex items-center justify-between border-t border-white/10 pt-5"
          >
            <a href={`mailto:${profile.email}`} className="label text-mute">
              {profile.email}
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(useMemo(() => IDS, []));
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  // keep the URL hash in step with the section in view
  useEffect(() => {
    if (deepLink.id && !deepLink.done) return; // let a pending #deep-link finish first
    if (active === "home") {
      if (window.location.hash) window.history.replaceState(null, "", window.location.pathname);
    } else if (scrollY.get() > 200) {
      window.history.replaceState(null, "", `#${active}`);
    }
  }, [active, scrollY]);

  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();
    return unlockScroll;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: deepLink.id ? 0.4 : 3.0, duration: 1.4, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-[75] transition-[background-color,border-color,backdrop-filter,padding] duration-700 ease-cine border-b ${
          scrolled || open
            ? "border-white/[0.07] bg-ink/70 backdrop-blur-xl py-3"
            : "border-transparent bg-transparent py-5 md:py-6"
        }`}
      >
        <div className="container-x flex items-center justify-between gap-6">
          <a
            href="#home"
            onClick={(e) => go("home", e)}
            className="group flex items-center gap-2.5 text-[0.95rem] font-semibold tracking-tight"
            aria-label={`${profile.name}, back to top`}
          >
            <span className="h-2 w-2 rounded-full bg-accent-strong transition-transform duration-500 ease-cine group-hover:scale-150" />
            <span>
              Sayantan<span className="text-mute font-normal">XBTC</span>
            </span>
          </a>

          {/* small screens: the current section name lives in the header */}
          <div aria-hidden="true" className="relative h-4 flex-1 overflow-hidden lg:hidden">
            <AnimatePresence mode="wait">
              {chapters.some((c) => c.id === active) && (
                <motion.span
                  key={active}
                  className="absolute inset-0 flex items-center justify-center whitespace-nowrap font-mono text-[0.6rem] uppercase tracking-[0.14em] text-mute"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <span className="hidden sm:inline">{String(chapters.findIndex((c) => c.id === active) + 1).padStart(2, "0")} ·&nbsp;</span>
                  {chapters.find((c) => c.id === active).label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {CENTER.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => go(s.id, e)}
                    aria-current={active === s.id ? "page" : undefined}
                    className={`relative block px-3.5 py-2 text-[0.78rem] tracking-wide transition-colors duration-500 ${
                      active === s.id ? "text-paper" : "text-mute hover:text-paper"
                    }`}
                  >
                    {s.label}
                    {active === s.id && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute inset-x-3.5 -bottom-px h-px bg-accent-strong"
                        transition={{ duration: 0.7, ease: EASE }}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <a
              href="#contact"
              onClick={(e) => go("contact", e)}
              className="group hidden items-center gap-2.5 rounded-full border border-white/15 px-5 py-2 text-[0.78rem] tracking-wide transition-colors duration-500 hover:border-paper hover:bg-paper hover:text-ink sm:inline-flex"
            >
              Contact
              <span className="transition-transform duration-500 ease-cine group-hover:translate-x-1">
                <Arrow />
              </span>
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((o) => !o)}
              className="relative grid h-9 w-9 place-items-center lg:hidden"
            >
              <span
                className={`absolute h-px w-5 bg-paper transition-transform duration-500 ease-cine ${
                  open ? "rotate-45" : "-translate-y-[3px]"
                }`}
              />
              <span
                className={`absolute h-px w-5 bg-paper transition-transform duration-500 ease-cine ${
                  open ? "-rotate-45" : "translate-y-[3px]"
                }`}
              />
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={open} onClose={() => setOpen(false)} active={active} />
    </>
  );
}

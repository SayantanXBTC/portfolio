// Tiny bridge so any component can scroll to a section through Lenis,
// falling back to native smooth scrolling when Lenis is not running
// (reduced motion, or before it has mounted).
let instance = null;

export const setLenis = (lenis) => {
  instance = lenis;
};
export const getLenis = () => instance;

export function scrollToId(id, { immediate = false, offset = 0 } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) {
    instance.scrollTo(el, { offset, duration: immediate ? 0 : 1.6, immediate });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
  }
}

export function scrollToY(y, { duration = 1.1 } = {}) {
  if (instance) instance.scrollTo(y, { duration });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

export function lockScroll() {
  if (instance) instance.stop();
  document.documentElement.style.overflow = "hidden";
}
export function unlockScroll() {
  if (instance) instance.start();
  document.documentElement.style.overflow = "";
}

// A "#section" in the URL when the page first loads. Captured at import time,
// before any component gets the chance to rewrite the hash.
export const deepLink = {
  id: typeof window === "undefined" ? "" : window.location.hash.slice(1),
  done: false,
};

// Wide and tall enough that Work scenes are pinned (same query as usePinnedLayout).
const pinnedQuery = "(min-width: 1024px) and (min-height: 720px)";

/** Scroll to a project's scene in Work, landing where its story has already arrived. */
export function jumpToProject(slug) {
  const pinned = window.matchMedia(pinnedQuery).matches;
  scrollToId(`work-${slug}`, { offset: pinned ? Math.round(window.innerHeight * 0.55) : -24 });
}

/** Scroll to a group in Skills and, once there, make one skill's tile call attention to itself. */
export function focusSkill(group, name) {
  scrollToId(`skills-${group}`, { offset: -130 });
  if (name) setTimeout(() => window.dispatchEvent(new CustomEvent("skill:focus", { detail: name })), 1300);
}
